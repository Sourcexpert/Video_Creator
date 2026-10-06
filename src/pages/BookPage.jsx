import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  CloudUpload,
  FileText,
  Layers3,
  Lightbulb,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles,
} from 'lucide-react';
import { styleOptions } from '../constants.js';
import { AvatarArt } from '../components/AvatarArt.jsx';
import { Badge } from '../components/Badge.jsx';

const STEPS = [
  ['upload', 'Add a source'],
  ['review', 'Choose stories'],
  ['plan', 'Shape your series'],
  ['ready', 'Review the plan'],
];
const EPISODE_LENGTHS = ['1–2 minutes', '3–5 minutes', '6–8 minutes'];

export function BookPage({
  bookFlow,
  setBookFlow,
  onReset,
  onUpload,
  onTrySample,
  onCreateSeries,
  onOpenEditor,
  characters,
  onCreateCharacter,
}) {
  const fileInput = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [seriesTitle, setSeriesTitle] = useState(bookFlow.seriesTitle || '');
  const [style, setStyle] = useState('Cinematic realism');
  const [episodeLength, setEpisodeLength] = useState('3–5 minutes');
  const [cast, setCast] = useState([]);
  const selectedIds = bookFlow.selectedChapterIds || [];
  const allChapters = bookFlow.analysis?.chapters || [];
  const selectedChapters = allChapters.filter((chapter) => selectedIds.includes(chapter.id));
  const allSelected = allChapters.length > 0 && selectedChapters.length === allChapters.length;
  const stepIndex = STEPS.findIndex(([step]) => step === bookFlow.step);
  const createdEpisodes = bookFlow.createdProject?.episodes || [];
  const createdSceneCount = createdEpisodes.reduce(
    (count, episode) => count + (episode.scenes?.length || 0),
    0,
  );
  const words = bookFlow.analysis?.wordCount || 0;
  const formatWordCount = new Intl.NumberFormat('en').format(words);
  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onUpload(file, rightsConfirmed);
  };
  const toggleChapter = (id) =>
    setBookFlow((prev) => ({
      ...prev,
      selectedChapterIds: (prev.selectedChapterIds || []).includes(id)
        ? prev.selectedChapterIds.filter((item) => item !== id)
        : [...(prev.selectedChapterIds || []), id],
    }));
  const toggleCast = (id) =>
    setCast((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  return (
    <div className="page-wrap standard-page book-page">
      <div className="page-title-row book-title-row">
        <div>
          <div className="eyebrow eyebrow-small">BOOK-TO-SERIES ENGINE</div>
          <h1>Turn a book into a world.</h1>
          <p>
            Find the story inside your source, then shape it into a season—one episode at a time.
          </p>
        </div>
        <div className="privacy-chip">
          <ShieldCheck size={15} /> Your source stays yours
        </div>
      </div>
      <div className="book-stepper">
        {STEPS.map(([step, label], index) => (
          <div
            key={step}
            className={`book-step ${index === stepIndex ? 'active' : ''} ${index < stepIndex ? 'complete' : ''}`}
            aria-current={index === stepIndex ? 'step' : undefined}
          >
            <span className="book-step-number">
              {index < stepIndex ? <Check size={14} /> : String(index + 1).padStart(2, '0')}
            </span>
            <span>{label}</span>
            <i />
          </div>
        ))}
      </div>

      {bookFlow.step === 'upload' && (
        <div className="book-upload-grid">
          <div className="book-upload-main">
            {bookFlow.isAnalyzing ? (
              <div className="analysis-state">
                <div className="analysis-animation">
                  <BookOpen size={27} />
                </div>
                <span className="eyebrow eyebrow-small">READING YOUR SOURCE</span>
                <h2>Finding the chapters, characters and story threads…</h2>
                <p>{bookFlow.fileName} · processed in your browser</p>
                <div className="analysis-progress">
                  <span />
                </div>
                <small>{bookFlow.progress || 'This can take a moment for a long book.'}</small>
              </div>
            ) : (
              <>
                <button
                  className={`dropzone ${dragging ? 'dropzone-dragging' : ''}`}
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <span className="upload-cloud">
                    <CloudUpload size={25} />
                  </span>
                  <strong>Drop your book or document here</strong>
                  <span>
                    or <em>browse files</em> from your device
                  </span>
                  <small>PDF, DOCX, TXT or Markdown · Up to 50 MB</small>
                </button>
                <input
                  ref={fileInput}
                  className="visually-hidden"
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.markdown,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUpload(file, rightsConfirmed);
                    event.target.value = '';
                  }}
                />
                <div className="rights-check">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={rightsConfirmed}
                      onChange={(event) => {
                        setRightsConfirmed(event.target.checked);
                        setBookFlow((prev) => ({ ...prev, error: '' }));
                      }}
                    />
                    <span>
                      <Check size={12} />
                    </span>
                  </label>
                  <div>
                    <strong>I have the right to adapt this content.</strong>
                    <p>
                      I’m the author, have a licence, or this specific edition is public domain /
                      otherwise authorized.
                    </p>
                  </div>
                  <ShieldCheck size={17} className="rights-shield" />
                </div>
                {bookFlow.error && (
                  <div className="inline-error">
                    <span>!</span>
                    {bookFlow.error}
                  </div>
                )}
                <div className="upload-footnote">
                  <ShieldCheck size={14} /> The document is extracted locally in this preview. No
                  file is uploaded to a server.
                </div>
              </>
            )}
          </div>
          <aside className="book-side-panel">
            <div className="side-panel-kicker">
              <BookOpen size={15} /> START WITH A SAMPLE
            </div>
            <div className="book-side-illustration">
              <div className="sample-book sample-book-back" />
              <div className="sample-book sample-book-front">
                <span>
                  STORIES
                  <br />
                  TO TELL
                </span>
                <i />
              </div>
              <Sparkles className="sample-star" size={17} />
            </div>
            <h3>
              See the workflow
              <br />
              <em>before you begin.</em>
            </h3>
            <p>
              Explore a public-domain-inspired sample and preview how chapters become a series plan.
            </p>
            <button className="button button-outline button-block" onClick={onTrySample}>
              Try the sample project <ArrowRight size={15} />
            </button>
            <div className="sample-note">
              <Lightbulb size={14} /> Sample content is illustrative—not a source-text adaptation.
            </div>
          </aside>
        </div>
      )}

      {bookFlow.step === 'review' && bookFlow.analysis && (
        <div className="book-review-layout">
          <section className="book-analysis-card">
            <div className="analysis-card-head">
              <div className="source-file-icon">
                <FileText size={21} />
              </div>
              <div>
                <span className="eyebrow eyebrow-small">SOURCE ANALYSIS</span>
                <h2>{bookFlow.analysis.title}</h2>
                <p>
                  {bookFlow.fileName || 'Sample source'} · {formatWordCount} words
                </p>
              </div>
              <button className="quiet-link" onClick={onReset}>
                <ArrowLeft size={14} /> Replace
              </button>
            </div>
            <div className="analysis-stats">
              <div>
                <strong>{allChapters.length}</strong>
                <span>suggested sections</span>
              </div>
              <div>
                <strong>{bookFlow.analysis.characters?.length || 0}</strong>
                <span>name candidates</span>
              </div>
              <div>
                <strong>{Math.max(1, Math.ceil(words / 140))} min</strong>
                <span>estimated read</span>
              </div>
            </div>
            <div className="analysis-note">
              <Sparkles size={14} /> {bookFlow.analysis.note} Review each selection; extraction is a
              first pass.
            </div>
            <div className="chapter-list-heading">
              <strong>Stories and sections</strong>
              <span>{selectedChapters.length} selected</span>
            </div>
            <div className="chapter-list">
              {bookFlow.analysis.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  className={`chapter-row ${selectedIds.includes(chapter.id) ? 'chapter-selected' : ''}`}
                  onClick={() => toggleChapter(chapter.id)}
                  aria-pressed={selectedIds.includes(chapter.id)}
                >
                  <span className="chapter-check">
                    {selectedIds.includes(chapter.id) && <Check size={13} />}
                  </span>
                  <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="chapter-copy">
                    <strong>{chapter.title}</strong>
                    <small>{chapter.excerpt || 'No excerpt available.'}</small>
                  </span>
                  <span className="chapter-words">
                    {chapter.words ? `${chapter.words.toLocaleString('en')} words` : ''}
                  </span>
                </button>
              ))}
            </div>
            <div className="chapter-footer">
              <button
                className="text-link"
                onClick={() =>
                  setBookFlow((prev) => ({
                    ...prev,
                    selectedChapterIds: allSelected
                      ? []
                      : prev.analysis.chapters.map((chapter) => chapter.id),
                  }))
                }
              >
                {allSelected ? 'Clear selection' : 'Select all'}
              </button>
              <button
                className="button button-primary"
                disabled={!selectedChapters.length}
                onClick={() => {
                  setSeriesTitle(bookFlow.analysis.title);
                  setBookFlow((prev) => ({
                    ...prev,
                    step: 'plan',
                    seriesTitle: prev.analysis.title,
                  }));
                }}
              >
                Shape your series <ArrowRight size={15} />
              </button>
            </div>
          </section>
          <aside className="extracted-cast-card">
            <div className="extracted-head">
              <span className="eyebrow eyebrow-small">NAME CANDIDATES</span>
              <Users size={17} />
            </div>
            <h3>Characters to remember</h3>
            <p>These names are suggested from the text. Confirm who matters to your adaptation.</p>
            <div className="extracted-names">
              {(bookFlow.analysis.characters || []).slice(0, 8).map((name) => (
                <button key={name} className="name-chip" onClick={() => onCreateCharacter(name)}>
                  <span>{name.slice(0, 1)}</span>
                  {name}
                  <Plus size={13} />
                </button>
              ))}
              {!bookFlow.analysis.characters?.length && (
                <div className="no-names">
                  No recurring names surfaced in this text. You can add characters yourself.
                </div>
              )}
            </div>
            <div className="extracted-tip">
              <ShieldCheck size={14} /> The source says what it says. New visual details are
              creative choices to review.
            </div>
          </aside>
        </div>
      )}

      {bookFlow.step === 'plan' && (
        <div className="series-plan-layout">
          <section className="series-config-card">
            <div className="config-card-title">
              <div className="book-round-icon">
                <Layers3 size={18} />
              </div>
              <div>
                <span className="eyebrow eyebrow-small">SERIES SETUP</span>
                <h2>Choose how your story unfolds.</h2>
              </div>
            </div>
            <label className="form-label">
              Series title
              <input
                className="form-input"
                value={seriesTitle}
                onChange={(event) => setSeriesTitle(event.target.value)}
                placeholder="Name your series"
              />
            </label>
            <div className="form-label">
              Adaptation approach
              <div className="mode-switch-grid">
                <button
                  className={
                    (bookFlow.mode || 'faithful') === 'faithful'
                      ? 'mode-option selected'
                      : 'mode-option'
                  }
                  onClick={() => setBookFlow((prev) => ({ ...prev, mode: 'faithful' }))}
                >
                  <span className="mode-icon">
                    <BookOpen size={17} />
                  </span>
                  <strong>Faithful mode</strong>
                  <small>Stay close to the source. Flag creative additions.</small>
                  <span className="mode-radio" />
                </button>
                <button
                  className={bookFlow.mode === 'creative' ? 'mode-option selected' : 'mode-option'}
                  onClick={() => setBookFlow((prev) => ({ ...prev, mode: 'creative' }))}
                >
                  <span className="mode-icon">
                    <WandSparkles size={17} />
                  </span>
                  <strong>Creative mode</strong>
                  <small>Allow adaptation, dialogue and connective scenes.</small>
                  <span className="mode-radio" />
                </button>
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">
                Visual world
                <select
                  className="form-input"
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                >
                  {styleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-label">
                Episode length
                <select
                  className="form-input"
                  value={episodeLength}
                  onChange={(event) => setEpisodeLength(event.target.value)}
                >
                  {EPISODE_LENGTHS.map((length) => (
                    <option key={length}>{length}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-label cast-select-label">
              Bring in saved characters <span>optional</span>
            </div>
            <div className="cast-select-grid">
              {characters.map((character) => (
                <button
                  key={character.id}
                  className={`cast-select-option ${cast.includes(character.id) ? 'selected' : ''}`}
                  onClick={() => toggleCast(character.id)}
                  aria-pressed={cast.includes(character.id)}
                >
                  <AvatarArt character={character} size="xs" />
                  <span>{character.name}</span>
                  {cast.includes(character.id) && <Check size={14} />}
                </button>
              ))}
            </div>
            <div className="source-grounded-note">
              <ShieldCheck size={16} />
              <span>
                <strong>Keep fact and interpretation separate.</strong> Source-grounded mode labels
                creative additions for your review before any generation.
              </span>
            </div>
            <div className="series-config-actions">
              <button
                className="quiet-link"
                onClick={() => setBookFlow((prev) => ({ ...prev, step: 'review' }))}
              >
                <ArrowLeft size={14} /> Back to chapters
              </button>
              <button
                className="button button-primary"
                onClick={() =>
                  onCreateSeries({
                    title: seriesTitle,
                    style,
                    cast,
                    mode: bookFlow.mode || 'faithful',
                    episodeLength,
                    chapters: selectedChapters,
                    analysis: bookFlow.analysis,
                  })
                }
                disabled={!seriesTitle.trim() || !selectedChapters.length}
              >
                <Sparkles size={15} /> Create series plan
              </button>
            </div>
          </section>
          <aside className="plan-preview-card">
            <div className="plan-preview-top">
              <Badge tone="green" icon={CheckCircle2}>
                SOURCE READY
              </Badge>
              <span>YOUR PLAN</span>
            </div>
            <h3>{seriesTitle || 'Your new series'}</h3>
            <p>
              {selectedChapters.length} selected{' '}
              {selectedChapters.length === 1 ? 'story' : 'stories'} · {formatWordCount} words
            </p>
            <div className="mini-episode-list">
              {selectedChapters.slice(0, 5).map((chapter, index) => (
                <div key={chapter.id} className="mini-episode">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i />
                  <strong>{chapter.title}</strong>
                  <small>{episodeLength.replace('minutes', 'min')}</small>
                </div>
              ))}
              {selectedChapters.length > 5 && (
                <small className="more-episodes">
                  + {selectedChapters.length - 5} more episodes
                </small>
              )}
            </div>
            <div className="plan-preview-footer">
              <span>
                <Clock3 size={14} /> Human review before rendering
              </span>
              <span>
                <ShieldCheck size={14} /> Rights-aware workflow
              </span>
            </div>
          </aside>
        </div>
      )}

      {bookFlow.step === 'ready' && (
        <div className="series-ready-layout">
          <div className="ready-success">
            <div className="ready-check">
              <Check size={25} />
            </div>
            <span className="eyebrow eyebrow-small">SERIES PLAN READY FOR REVIEW</span>
            <h2>{bookFlow.seriesTitle || 'Your new series'}</h2>
            <p>
              Your source has been organised into {createdEpisodes.length} episode outline
              {createdEpisodes.length === 1 ? '' : 's'}. Edit every scene before connecting a video
              engine.
            </p>
            <div className="ready-summary">
              <span>
                <BookOpen size={15} /> {createdEpisodes.length} episode
                {createdEpisodes.length === 1 ? '' : 's'}
              </span>
              <span>
                <Layers3 size={15} /> {createdSceneCount} scene outlines
              </span>
              <span>
                <ShieldCheck size={15} />{' '}
                {bookFlow.mode === 'creative' ? 'Creative adaptation' : 'Faithful mode'}
              </span>
            </div>
            <div className="ready-actions">
              <button
                className="button button-primary"
                onClick={() => bookFlow.createdProject && onOpenEditor(bookFlow.createdProject.id)}
              >
                Open series editor <ArrowRight size={16} />
              </button>
              <button className="button button-outline" onClick={onReset}>
                Start another book
              </button>
            </div>
            <div className="preview-disclaimer">
              <Lightbulb size={15} /> These outlines are a locally structured first pass from
              extracted text—not AI-generated dialogue or finished video.
            </div>
          </div>
          <div className="ready-episodes">
            {createdEpisodes.map((episode, index) => (
              <button
                className="ready-episode"
                key={episode.id}
                onClick={() => onOpenEditor(bookFlow.createdProject.id, episode.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{episode.title}</strong>
                  <small>{episode.scenes.length} scene outlines · Source-grounded draft</small>
                </div>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
