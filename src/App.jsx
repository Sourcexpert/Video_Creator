import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { defaultStudioDraft } from './constants.js';
import { useStoredState } from './hooks/useStoredState.js';
import {
  cleanTitle,
  coverForStyle,
  createId,
  getEpisodes,
  makeScene,
  makeStarterScenes,
  sortByRecent,
} from './lib/projects.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { ProjectsPage } from './pages/ProjectsPage.jsx';
import { CharactersPage } from './pages/CharactersPage.jsx';
import { BookPage } from './pages/BookPage.jsx';
import { StudioPage } from './pages/StudioPage.jsx';
import { EditorPage } from './pages/EditorPage.jsx';
import { CharacterModal } from './modals/CharacterModal.jsx';
import { CastModal } from './modals/CastModal.jsx';
import { EngineModal } from './modals/EngineModal.jsx';
import { ExportModal } from './modals/ExportModal.jsx';
import { NotificationsModal } from './modals/NotificationsModal.jsx';
import { initialCharacters, initialProjects, sampleChapters } from './data.js';
import { analyzeSourceText, extractDocumentText } from './lib/documents.js';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const emptyBookFlow = {
  step: 'upload',
  analysis: null,
  selectedChapterIds: [],
  mode: 'faithful',
  seriesTitle: '',
  isAnalyzing: false,
  progress: '',
  error: '',
  createdProject: null,
  fileName: '',
};

function App() {
  const [page, setPage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useStoredState('fable-projects-v1', initialProjects);
  const [characters, setCharacters] = useStoredState('fable-characters-v1', initialCharacters);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [modal, setModal] = useState(null);
  // { character, isNew } — `character` may be a pre-filled template for a new profile.
  const [characterDraft, setCharacterDraft] = useState(null);
  const [toast, setToast] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studioDraft, setStudioDraft] = useState(defaultStudioDraft);
  const [studioStep, setStudioStep] = useState('brief');
  const [isBuilding, setIsBuilding] = useState(false);
  const [bookFlow, setBookFlow] = useState(emptyBookFlow);
  const toastTimer = useRef(null);

  const activeProject = projects.find((project) => project.id === activeProjectId) || null;
  const activeEpisodes = getEpisodes(activeProject);
  // Fall back to the first episode if the stored selection no longer exists.
  const activeEpisodeId = activeEpisodes.some((episode) => episode.id === selectedEpisodeId)
    ? selectedEpisodeId
    : activeEpisodes[0]?.id;

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4200);
  }, []);

  // Ctrl/⌘ + K opens search from anywhere.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const closeModal = () => {
    // A character created from the cast picker returns to the cast picker.
    setModal(modal === 'character' && characterDraft?.returnTo ? characterDraft.returnTo : null);
    setCharacterDraft(null);
  };
  const openEngineModal = () => setModal('engines');

  const navigate = (nextPage) => {
    setPage(nextPage);
    setMobileOpen(false);
    setSearchQuery('');
    setSearchOpen(false);
    window.scrollTo({ top: 0 });
  };

  // ---------- Projects ----------

  /** Applies `updater` to one project and stamps it as just edited. */
  const updateProject = (projectId, updater) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...updater(project), updatedAt: Date.now() } : project,
      ),
    );
  };

  /** Applies `updater` to the scene list of the episode currently open in the editor. */
  const updateActiveScenes = (updater) => {
    if (!activeProject) return;
    updateProject(activeProject.id, (project) => ({
      ...project,
      episodes: getEpisodes(project).map((episode) =>
        episode.id === activeEpisodeId
          ? { ...episode, scenes: updater(episode.scenes || []) }
          : episode,
      ),
    }));
  };

  const openEditor = (projectId, episodeId = null) => {
    const project = projects.find((item) => item.id === projectId);
    const episodes = getEpisodes(project);
    const episode = episodes.find((item) => item.id === episodeId) || episodes[0];
    setActiveProjectId(projectId);
    setSelectedEpisodeId(episode?.id || null);
    setSelectedSceneId(episode?.scenes?.[0]?.id || null);
    navigate('editor');
  };

  const deleteProject = (projectId) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project || !window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    setProjects((prev) => prev.filter((item) => item.id !== projectId));
    if (studioDraft.projectId === projectId) {
      setStudioDraft(defaultStudioDraft);
      setStudioStep('brief');
    }
    navigate('projects');
    notify(`“${project.title}” was deleted.`);
  };

  const renameProject = (title) => {
    if (!activeProject) return;
    updateProject(activeProject.id, (project) => ({ ...project, title }));
  };

  const setProjectCast = (cast) => {
    if (!activeProject) return;
    updateProject(activeProject.id, (project) => ({ ...project, cast }));
    setModal(null);
    notify('Project cast updated.');
  };

  // ---------- Scenes & episodes (editor) ----------

  const updateScene = (sceneId, key, value) =>
    updateActiveScenes((scenes) =>
      scenes.map((scene) => (scene.id === sceneId ? { ...scene, [key]: value } : scene)),
    );

  const addScene = () => {
    const newScene = makeScene();
    updateActiveScenes((scenes) => [...scenes, newScene]);
    setSelectedSceneId(newScene.id);
    notify('Scene added to the storyboard.');
  };

  const duplicateScene = (sceneId) => {
    const copy = { id: createId('scene') };
    updateActiveScenes((scenes) => {
      const index = scenes.findIndex((scene) => scene.id === sceneId);
      if (index === -1) return scenes;
      const duplicate = { ...scenes[index], ...copy, title: `${scenes[index].title} (copy)` };
      return [...scenes.slice(0, index + 1), duplicate, ...scenes.slice(index + 1)];
    });
    setSelectedSceneId(copy.id);
    notify('Scene duplicated.');
  };

  const deleteScene = (sceneId) => {
    const scenes = activeEpisodes.find((episode) => episode.id === activeEpisodeId)?.scenes || [];
    if (scenes.length <= 1) {
      notify('Keep at least one scene in an episode.');
      return;
    }
    const index = scenes.findIndex((scene) => scene.id === sceneId);
    const remaining = scenes.filter((scene) => scene.id !== sceneId);
    updateActiveScenes(() => remaining);
    setSelectedSceneId(remaining[Math.max(0, index - 1)]?.id || null);
    notify('Scene removed from the storyboard.');
  };

  const addEpisode = () => {
    if (!activeProject) return;
    const scene = makeScene({ title: 'Opening image', shot: 'Establishing' });
    const episode = {
      id: createId('ep'),
      title: `Episode ${activeEpisodes.length + 1}`,
      status: 'Outline',
      scenes: [scene],
    };
    updateProject(activeProject.id, (project) => ({
      ...project,
      episodes: [...getEpisodes(project), episode],
    }));
    setSelectedEpisodeId(episode.id);
    setSelectedSceneId(scene.id);
    notify(`${episode.title} added.`);
  };

  const renameEpisode = (title) => {
    if (!activeProject) return;
    updateProject(activeProject.id, (project) => ({
      ...project,
      episodes: getEpisodes(project).map((episode) =>
        episode.id === activeEpisodeId ? { ...episode, title } : episode,
      ),
    }));
  };

  const selectEpisode = (episodeId) => {
    const episode = activeEpisodes.find((item) => item.id === episodeId);
    setSelectedEpisodeId(episodeId);
    setSelectedSceneId(episode?.scenes?.[0]?.id || null);
  };

  // ---------- Characters ----------

  const openCharacterModal = (character = null, isNew = !character, returnTo = null) => {
    setCharacterDraft({ character, isNew, returnTo });
    setModal('character');
  };

  const saveCharacter = (character) => {
    setCharacters((prev) =>
      prev.some((item) => item.id === character.id)
        ? prev.map((item) => (item.id === character.id ? character : item))
        : [character, ...prev],
    );
    closeModal();
    notify(`${character.name} saved to your character vault.`);
  };

  const deleteCharacter = (character) => {
    if (!window.confirm(`Remove ${character.name} from your character vault?`)) return;
    setCharacters((prev) => prev.filter((item) => item.id !== character.id));
    // Also unlink the character from any project or draft that used it.
    setProjects((prev) =>
      prev.map((project) =>
        project.cast?.includes(character.id)
          ? { ...project, cast: project.cast.filter((id) => id !== character.id) }
          : project,
      ),
    );
    setStudioDraft((prev) => ({
      ...prev,
      selectedCharacters: prev.selectedCharacters.filter((id) => id !== character.id),
    }));
    closeModal();
    notify(`${character.name} was removed.`);
  };

  // ---------- Story studio ----------

  const startNewStory = (prompt = '', style = 'Cinematic realism') => {
    setStudioDraft({ ...defaultStudioDraft, prompt, style });
    setStudioStep('brief');
    navigate('studio');
  };

  const buildStoryboard = () => {
    if (!studioDraft.prompt.trim()) {
      notify('Add a story idea before building a storyboard.');
      return;
    }
    // Rebuilding replaces the storyboard of the project made earlier instead of adding a duplicate.
    const existingId = projects.some((project) => project.id === studioDraft.projectId)
      ? studioDraft.projectId
      : null;
    if (
      existingId &&
      !window.confirm('Rebuild the storyboard? Your scene edits will be replaced.')
    ) {
      return;
    }
    setIsBuilding(true);
    // A short pause so the "building" state is visible; this is a local template, not an AI call.
    setTimeout(() => {
      const scenes = makeStarterScenes(studioDraft.prompt);
      const project = {
        id: existingId || createId('project'),
        title: cleanTitle(studioDraft.prompt),
        subtitle: studioDraft.prompt.trim().slice(0, 126),
        type: 'Story project',
        style: studioDraft.style,
        status: 'Draft',
        cover: coverForStyle(studioDraft.style),
        updatedAt: Date.now(),
        cast: studioDraft.selectedCharacters,
        source: 'original idea',
        settings: {
          aspect: studioDraft.aspect,
          duration: studioDraft.duration,
          language: studioDraft.language,
          voice: studioDraft.voice,
        },
        episodes: [
          { id: createId('ep'), title: 'Episode 1 · Story draft', status: 'Outline', scenes },
        ],
      };
      setProjects((prev) =>
        existingId
          ? prev.map((item) => (item.id === existingId ? project : item))
          : [project, ...prev],
      );
      setStudioDraft((prev) => ({ ...prev, scenes, projectId: project.id }));
      setStudioStep('storyboard');
      setIsBuilding(false);
      notify('Storyboard draft is ready to review. Nothing has been rendered.');
    }, 850);
  };

  const saveStoryboard = ({ silent = false } = {}) => {
    if (!studioDraft.projectId) return;
    updateProject(studioDraft.projectId, (project) => ({
      ...project,
      cast: studioDraft.selectedCharacters,
      style: studioDraft.style,
      settings: {
        aspect: studioDraft.aspect,
        duration: studioDraft.duration,
        language: studioDraft.language,
        voice: studioDraft.voice,
      },
      episodes: getEpisodes(project).map((episode, index) =>
        index === 0 ? { ...episode, scenes: studioDraft.scenes } : episode,
      ),
    }));
    if (!silent) notify('Storyboard changes saved locally.');
  };

  const openStoryboardInEditor = () => {
    saveStoryboard({ silent: true });
    setActiveProjectId(studioDraft.projectId);
    setSelectedEpisodeId(null);
    setSelectedSceneId(studioDraft.scenes[0]?.id || null);
    navigate('editor');
  };

  // ---------- Book to series ----------

  const openBookUpload = async (file, rightsConfirmed) => {
    if (!rightsConfirmed) {
      setBookFlow((prev) => ({
        ...prev,
        error: 'Please confirm that you have the rights to adapt this specific content.',
      }));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setBookFlow((prev) => ({
        ...prev,
        error: 'This file is larger than 50 MB. Choose a smaller source.',
      }));
      return;
    }
    setBookFlow((prev) => ({
      ...prev,
      isAnalyzing: true,
      progress: '',
      error: '',
      fileName: file.name,
    }));
    try {
      const text = await extractDocumentText(file, (progress) =>
        setBookFlow((prev) => ({ ...prev, progress })),
      );
      const analysis = analyzeSourceText(text, file.name);
      if (analysis.wordCount < 20) {
        throw new Error(
          'The source contains very little selectable text. Upload a fuller document or try an OCR-ready PDF.',
        );
      }
      setBookFlow((prev) => ({
        ...prev,
        isAnalyzing: false,
        progress: '',
        analysis,
        step: 'review',
        selectedChapterIds: analysis.chapters
          .filter((chapter) => chapter.selected)
          .map((chapter) => chapter.id),
        seriesTitle: analysis.title,
        createdProject: null,
        error: '',
      }));
      notify('Source text extracted locally. Review the suggested sections before making a plan.');
    } catch (error) {
      console.error(error);
      setBookFlow((prev) => ({
        ...prev,
        isAnalyzing: false,
        progress: '',
        error: error.message || 'Could not read this file. Try PDF, DOCX, TXT or Markdown.',
      }));
    }
  };

  const trySampleBook = () => {
    const chapters = sampleChapters.map((chapter) => ({ ...chapter }));
    const analysis = {
      title: 'The Shepherd King',
      wordCount: chapters.reduce((total, chapter) => total + chapter.words, 0),
      chapterCount: chapters.length,
      chapters,
      characters: ['David', 'Samuel', 'Goliath', 'Jonathan'],
      excerpt:
        'A young shepherd is called from the hills into a much larger story of courage, friendship and leadership.',
      note: 'Sample analysis preview. Chapter structure and character names are illustrative.',
    };
    setBookFlow({
      ...emptyBookFlow,
      step: 'review',
      analysis,
      selectedChapterIds: chapters
        .filter((chapter) => chapter.selected)
        .map((chapter) => chapter.id),
      seriesTitle: analysis.title,
      fileName: 'Sample source · The Shepherd King',
    });
  };

  const createBookSeries = ({ title, style, cast, mode, episodeLength, chapters, analysis }) => {
    if (!chapters?.length) {
      notify('Select at least one story or section first.');
      return;
    }
    const faithful = mode === 'faithful';
    const episodes = chapters.map((chapter) => ({
      id: createId('ep'),
      title: chapter.title,
      status: 'Outline',
      sourceExcerpt: chapter.excerpt,
      scenes: [
        makeScene({
          title: 'Opening image',
          description:
            chapter.excerpt ||
            `Set the context for “${chapter.title}” using the source as a guide.`,
          shot: 'Establishing',
        }),
        makeScene({
          title: 'A moment of change',
          description: faithful
            ? 'Identify the turning point in the source. Add only details required to visualize the scene.'
            : 'Build a connective moment that carries the source theme into the next beat.',
          duration: 8,
        }),
        makeScene({
          title: 'Closing beat',
          description: faithful
            ? 'Close on an image or action grounded in the selected section.'
            : 'End with a clear emotional beat and a thread into the next episode.',
          shot: 'Wide',
        }),
      ],
    }));
    const isShepherdSample =
      analysis?.title?.toLowerCase().includes('shepherd king') && style === 'Cinematic realism';
    const project = {
      id: createId('project-book'),
      title: title.trim() || analysis?.title || 'Untitled series',
      subtitle: `${chapters.length} selected ${chapters.length === 1 ? 'story' : 'stories'} · ${faithful ? 'faithful' : 'creative'} adaptation`,
      type: 'Book series',
      style,
      status: 'Outline',
      cover: coverForStyle(style),
      image: isShepherdSample ? '/shepherd-king.png' : undefined,
      updatedAt: Date.now(),
      cast,
      adaptationMode: mode,
      episodeLength,
      source: analysis?.title,
      sourceWordCount: analysis?.wordCount,
      episodes,
    };
    setProjects((prev) => [project, ...prev]);
    setBookFlow((prev) => ({
      ...prev,
      step: 'ready',
      seriesTitle: project.title,
      mode,
      createdProject: project,
    }));
    notify('Series plan created. Review and edit every episode before generation.');
  };

  // ---------- Search ----------

  const handleSearch = (query) => {
    if (query && page !== 'projects' && page !== 'characters') setPage('projects');
  };
  const activeQuery = searchOpen ? searchQuery : '';

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
        onNewStory={startNewStory}
        onOpenStudio={() => navigate('studio')}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onEngines={openEngineModal}
      />
      <div className="main-shell">
        <Topbar
          onSearch={handleSearch}
          onNotifications={() => setModal('notifications')}
          onEngines={openEngineModal}
          onMenu={() => setMobileOpen(true)}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <main className="main-content" key={page}>
          {page === 'overview' && (
            <OverviewPage
              projects={sortByRecent(projects)}
              characters={characters}
              onNewStory={startNewStory}
              onNavigate={navigate}
              onEditor={openEditor}
              onCharacter={(character) => openCharacterModal(character)}
              onAddCharacter={() => openCharacterModal()}
              onBook={() => navigate('books')}
              onEngines={openEngineModal}
            />
          )}
          {page === 'projects' && (
            <ProjectsPage
              projects={sortByRecent(projects)}
              characters={characters}
              onEditor={openEditor}
              onNewStory={startNewStory}
              onBook={() => navigate('books')}
              query={activeQuery}
            />
          )}
          {page === 'characters' && (
            <CharactersPage
              characters={characters}
              onAdd={() => openCharacterModal()}
              onEdit={(character) => openCharacterModal(character)}
              query={activeQuery}
            />
          )}
          {page === 'books' && (
            <BookPage
              bookFlow={bookFlow}
              setBookFlow={setBookFlow}
              onReset={() => setBookFlow(emptyBookFlow)}
              onUpload={openBookUpload}
              onTrySample={trySampleBook}
              onCreateSeries={createBookSeries}
              onOpenEditor={openEditor}
              characters={characters}
              onCreateCharacter={(name) =>
                openCharacterModal(
                  {
                    name,
                    role: 'Extracted from a source document',
                    presentation: 'Androgynous',
                    age: 'Young adult',
                    accent: 'Neutral English',
                    style: 'Cinematic realism',
                  },
                  true,
                )
              }
            />
          )}
          {page === 'studio' && (
            <StudioPage
              draft={studioDraft}
              setDraft={setStudioDraft}
              step={studioStep}
              setStep={setStudioStep}
              characters={characters}
              onCreateCharacter={() => openCharacterModal()}
              onBuild={buildStoryboard}
              onSave={() => saveStoryboard()}
              onEditor={openStoryboardInEditor}
              onEngines={openEngineModal}
              isBuilding={isBuilding}
              project={projects.find((project) => project.id === studioDraft.projectId)}
            />
          )}
          {page === 'editor' && (
            <EditorPage
              project={activeProject}
              characters={characters}
              onBack={() => navigate('projects')}
              onExport={() => setModal('export')}
              onGenerate={openEngineModal}
              onSettings={openEngineModal}
              onRenameProject={renameProject}
              onDeleteProject={() => deleteProject(activeProject.id)}
              onUpdateScene={updateScene}
              onAddScene={addScene}
              onDuplicateScene={duplicateScene}
              onDeleteScene={deleteScene}
              onAddEpisode={addEpisode}
              onRenameEpisode={renameEpisode}
              onEditCast={() => setModal('cast')}
              episodeId={activeEpisodeId}
              onSelectEpisode={selectEpisode}
              sceneId={selectedSceneId}
              setSceneId={setSelectedSceneId}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={15} />
          </span>
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {modal === 'character' && characterDraft && (
        <CharacterModal
          character={characterDraft.character}
          isNew={characterDraft.isNew}
          onClose={closeModal}
          onSave={saveCharacter}
          onDelete={deleteCharacter}
        />
      )}
      {modal === 'cast' && activeProject && (
        <CastModal
          characters={characters}
          selected={activeProject.cast || []}
          onClose={closeModal}
          onSave={setProjectCast}
          onCreateCharacter={() => openCharacterModal(null, true, 'cast')}
        />
      )}
      {modal === 'engines' && <EngineModal onClose={closeModal} onNotify={notify} />}
      {modal === 'export' && activeProject && (
        <ExportModal
          project={activeProject}
          onClose={closeModal}
          onSave={(exportSettings) => {
            updateProject(activeProject.id, (project) => ({ ...project, exportSettings }));
            closeModal();
            notify(
              'Export settings saved. Connect a video engine and render worker to make the MP4.',
            );
          }}
        />
      )}
      {modal === 'notifications' && (
        <NotificationsModal onClose={closeModal} onNavigate={navigate} />
      )}
    </div>
  );
}

export default App;
