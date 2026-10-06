export const styleOptions = [
  { label: 'Cinematic', value: 'Cinematic realism', glyph: '◒' },
  { label: '3D cartoon', value: '3D animation', glyph: '◉' },
  { label: '2D animation', value: '2D animation', glyph: '▧' },
  { label: 'Anime', value: 'Anime', glyph: '✳' },
];

export const defaultStudioDraft = {
  prompt: '',
  style: 'Cinematic realism',
  aspect: '16:9',
  duration: '60 seconds',
  language: 'English',
  voice: 'Warm storyteller',
  tone: 'Faithful adaptation',
  selectedCharacters: [],
  scenes: [],
  projectId: null,
};
