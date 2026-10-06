let idCounter = 0;

/** Returns a unique id such as `scene-lx2k9a-3`. Safe to call many times in the same millisecond. */
export function createId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/** Turns a timestamp into a short, human label ("Just now", "5 min ago", "Yesterday", "Sep 29"). */
export function formatUpdated(project) {
  if (!project?.updatedAt) return project?.updated || 'Recently';
  const seconds = Math.round((Date.now() - project.updatedAt) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(project.updatedAt),
  );
}

/** Newest first, so the most recently edited project is shown at the top. */
export function sortByRecent(projects) {
  return [...projects].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/** The illustrated cover used for a project that has no image of its own. */
export function coverForStyle(style = '') {
  if (style.includes('3D')) return 'garden';
  if (style.includes('2D') || style === 'Anime') return 'fractions';
  return 'cinematic';
}

/**
 * Every project should have at least one episode. Older saved data may only have a flat
 * `scenes` list, so wrap it in a single episode with a stable id.
 */
export function getEpisodes(project) {
  if (project?.episodes?.length) return project.episodes;
  return [
    {
      id: `${project?.id || 'project'}-ep-1`,
      title: 'Episode 1',
      status: project?.status || 'Draft',
      scenes: project?.scenes?.length ? project.scenes : [],
    },
  ];
}

export function countScenes(project) {
  return getEpisodes(project).reduce((total, episode) => total + (episode.scenes?.length || 0), 0);
}

/** Share of scenes marked "ready", as a whole-number percentage. */
export function computeProgress(project) {
  const scenes = getEpisodes(project).flatMap((episode) => episode.scenes || []);
  if (!scenes.length) return 0;
  return Math.round(
    (scenes.filter((scene) => scene.status === 'ready').length / scenes.length) * 100,
  );
}

/** The first episode that still has unfinished scenes, used for "Continue creating". */
export function findCurrentEpisode(project) {
  const episodes = getEpisodes(project);
  const index = episodes.findIndex((episode) =>
    (episode.scenes || []).some((scene) => scene.status !== 'ready'),
  );
  const safeIndex = index === -1 ? episodes.length - 1 : index;
  return { episode: episodes[safeIndex], number: safeIndex + 1 };
}

export function makeScene(overrides = {}) {
  return {
    id: createId('scene'),
    title: 'New scene',
    description: 'Describe the visual action, character beat and feeling of this moment.',
    duration: 7,
    shot: 'Medium',
    status: 'draft',
    ...overrides,
  };
}

export function makeStarterScenes(prompt) {
  const shortPrompt = prompt?.trim().replace(/[.!?]+$/, '') || 'a new story';
  return [
    makeScene({
      title: 'A world opens up',
      description: `Set the scene for ${shortPrompt.charAt(0).toLowerCase()}${shortPrompt.slice(1)}. Establish a clear place, a feeling, and a reason to stay curious.`,
      shot: 'Establishing',
    }),
    makeScene({
      title: 'Meet the main character',
      description:
        'Introduce the central character through a small, specific action that shows who they are.',
      duration: 8,
    }),
    makeScene({
      title: 'Something changes',
      description:
        'A new question or challenge interrupts the ordinary rhythm and moves the story forward.',
      duration: 8,
      shot: 'Close-up',
    }),
    makeScene({
      title: 'A hopeful next step',
      description: 'End on a meaningful choice, a feeling of discovery, or an image that lingers.',
      shot: 'Wide',
    }),
  ];
}

/** Builds a short title from the first sentence of a prompt. */
export function cleanTitle(text) {
  const firstLine = (text || '')
    .split(/[.!?\n]/)[0]
    .replace(/^\s*(a|an|the)\s+/i, '')
    .trim();
  if (!firstLine) return 'Untitled story';
  const capitalised = firstLine.charAt(0).toUpperCase() + firstLine.slice(1);
  return capitalised.length > 38 ? `${capitalised.slice(0, 36).trim()}…` : capitalised;
}

/** Formats seconds as m:ss, e.g. 75 -> "1:15". */
export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Status shown in the UI. Once a project has scenes marked ready, the status follows
 * scene progress; until then it keeps its saved label (Draft / Outline).
 */
export function projectStatus(project) {
  const progress = computeProgress(project);
  if (progress === 100) return 'Ready to export';
  if (progress > 0) return 'In progress';
  return project?.status || 'Draft';
}

/** "Ada Okafor" -> "AO", "David" -> "D". */
export function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || '?'
  );
}
