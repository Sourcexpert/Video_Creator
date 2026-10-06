// Reads an uploaded document in the browser and suggests chapters and character names.
// Everything here runs locally; nothing is sent to a server.

/** How many sections are pre-selected for a new series. Long books can have hundreds. */
const DEFAULT_SELECTED = 12;
/** Upper limit on suggested sections when a document has no chapter headings. */
const MAX_FALLBACK_SECTIONS = 40;
/** Sections shorter than this (e.g. table-of-contents lines) are merged into the next one. */
const MIN_SECTION_WORDS = 40;

/**
 * Extracts plain text from a PDF, DOCX, TXT or Markdown file.
 * `onProgress` receives short status messages such as "Reading page 3 of 120…".
 */
export async function extractDocumentText(file, onProgress = () => {}) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md' || extension === 'markdown') {
    return file.text();
  }

  if (extension === 'docx') {
    onProgress('Reading the Word document…');
    const mammoth = await import('mammoth/mammoth.browser.js');
    const result = await mammoth.default.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value || '';
  }

  if (extension === 'pdf') {
    return extractPdfText(file, onProgress);
  }

  throw new Error('Please choose a PDF, DOCX, TXT or Markdown file.');
}

async function extractPdfText(file, onProgress) {
  const [pdfjs, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  try {
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (pageNumber === 1 || pageNumber % 10 === 0) {
        onProgress(`Reading page ${pageNumber} of ${pdf.numPages}…`);
      }
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(pdfItemsToText(content.items));
      page.cleanup();
    }
    return pages.join('\n\n');
  } finally {
    pdf.destroy();
  }
}

/** Joins pdf.js text items, keeping the line breaks so chapter headings stay on their own line. */
export function pdfItemsToText(items) {
  let text = '';
  for (const item of items) {
    if (!('str' in item)) continue;
    text += item.str;
    if (item.hasEOL) text += '\n';
    else if (item.str && !item.str.endsWith(' ')) text += ' ';
  }
  return text;
}

const NUMBER_WORDS =
  'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty';
const HEADING_PREFIX = new RegExp(
  `^(?:chapter|part|book|episode|section|psalm)\\s+(?:\\d+|[ivxlcdm]+|${NUMBER_WORDS})\\b`,
  'i',
);
const HEADING_PATTERN = new RegExp(
  `${HEADING_PREFIX.source}(?:\\s*[:.\\-–—]\\s*|\\s+)?.{0,90}$`,
  'i',
);

/**
 * Splits the text into suggested sections and finds recurring names.
 * Sections come from chapter headings when there are any, otherwise from paragraph groups.
 */
export function analyzeSourceText(rawText, fileName = 'Untitled source') {
  const text = rawText
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
  if (!text) {
    throw new Error(
      'No selectable text was found. Try an OCR-ready PDF or a DOCX, TXT or Markdown file.',
    );
  }

  const wordCount = countWords(text);
  const headingChapters = splitByHeadings(text);
  const chapters = headingChapters.length >= 2 ? headingChapters : splitByParagraphs(text);
  chapters.forEach((chapter, index) => {
    chapter.id = `chapter-${index + 1}`;
    chapter.selected = index < DEFAULT_SELECTED;
  });

  const sourceTitle = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  const notes = [];
  if (headingChapters.length >= 2) {
    notes.push(
      `Found ${chapters.length} chapter or section heading${chapters.length === 1 ? '' : 's'}.`,
    );
  } else {
    notes.push('No chapter headings detected, so sections are suggested from the text.');
  }
  if (chapters.length > DEFAULT_SELECTED) {
    notes.push(`The first ${DEFAULT_SELECTED} are selected to start with.`);
  }

  return {
    title: sourceTitle || 'Untitled source',
    wordCount,
    chapterCount: chapters.length,
    chapters,
    characters: findCharacterNames(text).slice(0, 8),
    excerpt: text.slice(0, 1700).replace(/\s+/g, ' '),
    note: notes.join(' '),
  };
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function splitByHeadings(text) {
  // Find heading lines and their positions, walking forward so repeated headings
  // (e.g. in a table of contents) get their own positions instead of the first match.
  const headings = [];
  let offset = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 100 && HEADING_PATTERN.test(trimmed)) {
      headings.push({ heading: trimmed, index: offset });
    }
    offset += line.length + 1;
  }

  const sections = headings.map((entry, i) => {
    const bodyStart = entry.index + entry.heading.length;
    const end = headings[i + 1]?.index ?? text.length;
    const body = text.slice(bodyStart, end).trim();
    return {
      title: cleanHeading(entry.heading, i),
      excerpt: body.slice(0, 600).replace(/\s+/g, ' '),
      words: countWords(body),
    };
  });

  // Drop table-of-contents style entries that have almost no text under them.
  return sections.filter((section) => section.words >= MIN_SECTION_WORDS);
}

function splitByParagraphs(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const chunks = [];
  let current = '';
  for (const paragraph of paragraphs.length ? paragraphs : [text]) {
    if (current && countWords(current) + countWords(paragraph) > 450) {
      chunks.push(current);
      current = '';
    }
    current += `${current ? '\n\n' : ''}${paragraph}`;
  }
  if (current) chunks.push(current);

  return chunks.slice(0, MAX_FALLBACK_SECTIONS).map((chunk, index) => ({
    title: inferSectionTitle(chunk, index),
    excerpt: chunk.slice(0, 600).replace(/\s+/g, ' '),
    words: countWords(chunk),
  }));
}

function cleanHeading(heading, index) {
  const rest = heading
    .replace(HEADING_PREFIX, '')
    .replace(/^[:.\-–—\s]+/, '')
    .trim();
  // Keep "Chapter 3" as the title when the heading has no name of its own.
  return rest || heading.trim() || `Section ${index + 1}`;
}

function inferSectionTitle(chunk, index) {
  const firstLine =
    chunk
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) || '';
  if (
    firstLine.length > 4 &&
    firstLine.length < 68 &&
    firstLine.split(/\s+/).length < 10 &&
    !/[.!?]$/.test(firstLine)
  ) {
    return firstLine;
  }
  const words = firstLine
    .replace(/[^\p{L}\p{N}\s'-]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);
  return words.length ? `${words.join(' ')}…` : `Section ${index + 1}`;
}

// Capitalised words that are usually not names (sentence starters, pronouns, dates…).
const NOT_NAMES = new Set(
  `The This That These Those When Where While After Before Then There They Their Them Chapter Part Book Section
  In On At For With But And Or Nor So Yet As It Its He She We I You His Her Hers Our Ours Your Yours My Me Us
  One Two Three Four Five Six Seven Eight Nine Ten First Second Third Last Next
  If Now Thus Therefore Because Also Even Still Just Only Some Many All Each Every Both No Not Yes Oh
  What Who Whom Whose Which Why How Here Is Was Were Are Be Been Am Do Did Does Has Had Have Will Would
  Shall Should Can Could May Might Must Let Behold Unto Upon From To Of By Into Out Up Down Over Under
  A An Mr Mrs Ms Dr Sir Madam Lord Lady
  Monday Tuesday Wednesday Thursday Friday Saturday Sunday
  January February March April June July August September October November December`.split(/\s+/),
);

/** Returns capitalised names that appear at least twice, most frequent first. */
function findCharacterNames(text) {
  const counts = new Map();
  const matches = text.match(/\b\p{Lu}[\p{L}'’-]+(?:\s+\p{Lu}[\p{L}'’-]+){0,2}/gu) || [];
  for (const match of matches) {
    // "And David" -> "David": strip leading words that are not names.
    const parts = match.split(/\s+/).map((part) => part.replace(/['’]s$/, ''));
    while (parts.length && NOT_NAMES.has(parts[0])) parts.shift();
    if (!parts.length) continue;
    // ALL-CAPS words are usually headings or emphasis, not names.
    if (parts.every((part) => part.length > 1 && part === part.toUpperCase())) continue;
    const name = parts.join(' ');
    if (name.length < 2 || name.length > 38) continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}
