import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Volume2,
} from 'lucide-react';
import { formatTime, getEpisodes } from '../lib/projects.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { ProjectCover } from '../components/ProjectCover.jsx';
import { Badge } from '../components/Badge.jsx';
import { AvatarArt } from '../components/AvatarArt.jsx';

const SHOT_TYPES = ['Establishing', 'Wide', 'Medium', 'Close-up', 'Tracking', 'Overhead'];
const DURATIONS = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
const TICK_SECONDS = 0.1;
const NO_SCENES = [];

const pad = (number) => String(number).padStart(2, '0');
const sceneLength = (scene) => Number(scene?.duration) || 7;

export function EditorPage({
  project,
  characters,
  onBack,
  onExport,
  onGenerate,
  onSettings,
  onRenameProject,
  onDeleteProject,
  onUpdateScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onAddEpisode,
  onRenameEpisode,
  onEditCast,
  episodeId,
  onSelectEpisode,
  sceneId,
  setSceneId,
}) {
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);
  const [showSceneMenu, setShowSceneMenu] = useState(false);
  const episodeMenuRef = useRef(null);
  const sceneMenuRef = useRef(null);
  const closeEpisodeMenu = useCallback(() => setShowEpisodeMenu(false), []);
  const closeSceneMenu = useCallback(() => setShowSceneMenu(false), []);
  useClickOutside(episodeMenuRef, closeEpisodeMenu, showEpisodeMenu);
  useClickOutside(sceneMenuRef, closeSceneMenu, showSceneMenu);

  const episodes = getEpisodes(project);
  const activeEpisode = episodes.find((episode) => episode.id === episodeId) || episodes[0];
  const scenes = activeEpisode?.scenes ?? NO_SCENES;
  const activeIndex = Math.max(
    0,
    scenes.findIndex((scene) => scene.id === sceneId),
  );
  const activeScene = scenes[activeIndex];

  // ----- Storyboard playback: steps through each scene for its duration -----
  const starts = [];
  let totalDuration = 0;
  for (const scene of scenes) {
    starts.push(totalDuration);
    totalDuration += sceneLength(scene);
  }
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const activeStart = starts[activeIndex] || 0;
  const activeLength = sceneLength(activeScene);
  // If the selection changed (e.g. a scene was clicked) the playhead snaps to that scene's start.
  const position =
    elapsed >= activeStart && elapsed <= activeStart + activeLength ? elapsed : activeStart;
  const sceneFraction = activeLength ? (position - activeStart) / activeLength : 0;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(
      () => setElapsed((value) => value + TICK_SECONDS),
      TICK_SECONDS * 1000,
    );
    return () => clearInterval(timer);
  }, [playing]);

  // While playing, keep the selected scene in step with the playhead and stop at the end.
  const activeSceneId = activeScene?.id;
  useEffect(() => {
    if (!playing) return;
    if (elapsed >= totalDuration) {
      setPlaying(false);
      setElapsed(totalDuration);
      return;
    }
    let sceneEnd = 0;
    const current = scenes.find((scene) => {
      sceneEnd += sceneLength(scene);
      return elapsed < sceneEnd;
    });
    if (current && current.id !== activeSceneId) setSceneId(current.id);
  }, [playing, elapsed, totalDuration, scenes, activeSceneId, setSceneId]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    const atEnd = position >= totalDuration - TICK_SECONDS;
    if (atEnd && scenes[0]) setSceneId(scenes[0].id);
    setElapsed(atEnd ? 0 : position);
    setPlaying(true);
  };

  const selectScene = (id) => {
    setPlaying(false);
    setSceneId(id);
  };

  if (!project) {
    return (
      <div className="page-wrap empty-state">
        <div className="empty-state-icon">
          <FolderOpen size={24} />
        </div>
        <h3>No project selected</h3>
        <p>Open a project from your workspace to edit its scenes.</p>
        <button className="button button-primary" onClick={onBack}>
          Back to projects
        </button>
      </div>
    );
  }

  const cast = (project.cast || [])
    .map((id) => characters.find((character) => character.id === id))
    .filter(Boolean);
  const voice = project.settings?.voice || 'Warm storyteller';
  const language = project.settings?.language || 'English';

  return (
    <div className="page-wrap editor-page">
      <div className="editor-breadcrumb">
        <button className="editor-back" onClick={onBack}>
          <ArrowLeft size={15} /> Projects
        </button>
        <ChevronRight size={14} />
        <span>{project.title}</span>
        <ChevronRight size={14} />
        <span className="editor-crumb-active">Editor</span>
        <div className="editor-actions">
          <Badge tone="soft">
            <span className="status-dot" /> Saved locally
          </Badge>
          <button
            className="icon-button subtle-icon"
            onClick={onDeleteProject}
            aria-label="Delete project"
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
          <button className="button button-outline" onClick={onEditCast}>
            <Users size={15} /> Cast
          </button>
          <button className="button button-primary" onClick={onExport}>
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <div className="editor-title-row">
        <div className="editor-title-copy">
          <div className="eyebrow eyebrow-small">
            STORY EDITOR <span className="eyebrow-slash">/</span>{' '}
            {project.style?.toUpperCase() || 'STORYBOARD'}
          </div>
          <input
            className="editor-title-input"
            value={project.title}
            onChange={(event) => onRenameProject(event.target.value)}
            onBlur={(event) => !event.target.value.trim() && onRenameProject('Untitled project')}
            aria-label="Project title"
          />
          <p>Review the scene, refine the details, and keep your characters consistent.</p>
        </div>
        <div className="editor-title-right">
          <span>
            <span className="connection-dot" /> PREVIEW WORKSPACE
          </span>
          <button className="icon-button" onClick={onSettings} aria-label="Engine settings">
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      <div className="editor-workspace">
        {/* Left: episode picker and scene list */}
        <aside className="scene-sidebar">
          <div className="scene-sidebar-title">
            <span className="eyebrow eyebrow-small">STORYBOARD</span>
            <button className="icon-button subtle-icon" onClick={onAddScene} aria-label="Add scene">
              <Plus size={17} />
            </button>
          </div>
          <div className="episode-picker-wrap" ref={episodeMenuRef}>
            <span>EPISODE</span>
            <button
              className="episode-picker"
              onClick={() => setShowEpisodeMenu((value) => !value)}
              aria-expanded={showEpisodeMenu}
            >
              <span>{activeEpisode?.title}</span>
              <ChevronDown size={15} />
            </button>
            {showEpisodeMenu && (
              <div className="episode-menu">
                {episodes.map((episode, index) => (
                  <button
                    key={episode.id}
                    className={episode.id === activeEpisode?.id ? 'active' : ''}
                    onClick={() => {
                      setPlaying(false);
                      onSelectEpisode(episode.id);
                      setShowEpisodeMenu(false);
                    }}
                  >
                    <span>{pad(index + 1)}</span>
                    <span>{episode.title}</span>
                    {episode.id === activeEpisode?.id && <Check size={14} />}
                  </button>
                ))}
                <button
                  className="menu-add"
                  onClick={() => {
                    setPlaying(false);
                    onAddEpisode();
                    setShowEpisodeMenu(false);
                  }}
                >
                  <Plus size={14} /> Add episode
                </button>
              </div>
            )}
          </div>
          <div className="scene-list-heading" ref={sceneMenuRef}>
            <span>
              SCENES <i>{scenes.length}</i>
            </span>
            <button
              onClick={() => setShowSceneMenu((value) => !value)}
              aria-label="Scene options"
              aria-expanded={showSceneMenu}
            >
              <MoreHorizontal size={16} />
            </button>
            {showSceneMenu && (
              <div className="scene-menu">
                <button
                  onClick={() => {
                    onAddScene();
                    setShowSceneMenu(false);
                  }}
                >
                  <Plus size={14} /> Add scene
                </button>
                <button
                  disabled={!activeScene}
                  onClick={() => {
                    onDuplicateScene(activeScene.id);
                    setShowSceneMenu(false);
                  }}
                >
                  <Copy size={14} /> Duplicate selected
                </button>
                <button
                  disabled={!activeScene || scenes.length <= 1}
                  onClick={() => {
                    onDeleteScene(activeScene.id);
                    setShowSceneMenu(false);
                  }}
                >
                  <Trash2 size={14} /> Delete selected
                </button>
              </div>
            )}
          </div>
          <div className="scene-list">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                className={`scene-list-item ${scene.id === activeScene?.id ? 'selected' : ''}`}
                onClick={() => selectScene(scene.id)}
              >
                <span className="scene-thumb">
                  <ProjectCover project={project} />
                </span>
                <span className="scene-item-info">
                  <strong>{scene.title || 'Untitled scene'}</strong>
                  <small>
                    {sceneLength(scene)}s <i>·</i> {scene.shot || 'Medium'}
                  </small>
                </span>
                <span
                  className={`scene-item-status ${scene.status === 'ready' ? 'is-ready' : ''}`}
                  title={scene.status === 'ready' ? 'Ready' : 'Draft'}
                >
                  {scene.status === 'ready' ? <Check size={11} /> : <span />}
                </span>
              </button>
            ))}
          </div>
          <button className="add-scene-sidebar" onClick={onAddScene}>
            <Plus size={14} /> Add scene
          </button>
          <div className="sidebar-scene-note">
            <ShieldCheck size={14} />
            <span>Characters are linked to this project’s reference profiles.</span>
          </div>
        </aside>

        {/* Centre: preview frame and timeline */}
        <section className="editor-preview-column">
          <div className="preview-toolbar">
            <div>
              <span className="eyebrow eyebrow-small">SCENE PREVIEW</span>
              <span className="preview-scene-count">
                {pad(activeIndex + 1)} / {pad(scenes.length)}
              </span>
            </div>
          </div>
          <div className={`video-preview-frame ${playing ? 'is-playing' : ''}`}>
            <ProjectCover project={project} className="video-preview-art" showShade />
            <div className="preview-grade" />
            <div className="preview-overlay-top">
              <span className="preview-frame-badge">
                <Eye size={12} /> STORYBOARD STILL
              </span>
            </div>
            <div className="preview-caption">
              <span className="preview-episode-label">
                {activeEpisode?.title || 'Episode 1'} <i>·</i> Scene {pad(activeIndex + 1)}
              </span>
              <strong>{activeScene?.title || 'Your next scene'}</strong>
              <span>
                {activeScene?.description || 'Add a scene description to set the visual direction.'}
              </span>
            </div>
            <button
              className="preview-play"
              onClick={togglePlay}
              disabled={!scenes.length}
              aria-label={playing ? 'Pause storyboard preview' : 'Play storyboard preview'}
            >
              {playing ? (
                <Pause size={21} fill="currentColor" />
              ) : (
                <Play size={21} fill="currentColor" />
              )}
            </button>
            <div className="preview-frame-controls">
              <span>
                {formatTime(position)} / {formatTime(totalDuration)}
              </span>
              <div className="preview-progress" aria-hidden="true">
                <span
                  style={{ width: `${totalDuration ? (position / totalDuration) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="timeline-panel">
            <div className="timeline-head">
              <div>
                <strong>Scene timeline</strong>
                <span>{formatTime(totalDuration)} total</span>
              </div>
              <span>Click a clip to jump to it</span>
            </div>
            <div className="timeline-track">
              <div className="timeline-clips">
                {scenes.map((scene, index) => {
                  const isActive = scene.id === activeScene?.id;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => selectScene(scene.id)}
                      className={`timeline-clip ${isActive ? 'selected' : ''}`}
                      style={{ flex: `${sceneLength(scene)} 1 0` }}
                    >
                      <span className="clip-thumb">
                        <ProjectCover project={project} />
                      </span>
                      <span className="clip-text">
                        <small>
                          SCENE {pad(index + 1)} · {formatTime(starts[index])}
                        </small>
                        <strong>{scene.title || 'Untitled scene'}</strong>
                      </span>
                      <i>{sceneLength(scene)}s</i>
                      {isActive && (
                        <span
                          className="timeline-playhead"
                          style={{ left: `${Math.min(100, sceneFraction * 100)}%` }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Right: details of the selected scene */}
        <aside className="inspector-panel">
          <div className="inspector-head">
            <div>
              <span className="eyebrow eyebrow-small">SCENE DETAILS</span>
              <h2>Make it yours.</h2>
            </div>
            {activeScene && (
              <button
                className="icon-button subtle-icon"
                onClick={() => onDeleteScene(activeScene.id)}
                disabled={scenes.length <= 1}
                aria-label="Delete this scene"
                title="Delete this scene"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {activeScene ? (
            <>
              <label className="form-label inspector-label">
                Episode title
                <input
                  className="form-input"
                  value={activeEpisode.title}
                  onChange={(event) => onRenameEpisode(event.target.value)}
                />
              </label>
              <label className="form-label inspector-label">
                Scene title
                <input
                  className="form-input"
                  value={activeScene.title}
                  onChange={(event) => onUpdateScene(activeScene.id, 'title', event.target.value)}
                />
              </label>
              <label className="form-label inspector-label">
                Visual direction
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  value={activeScene.description}
                  onChange={(event) =>
                    onUpdateScene(activeScene.id, 'description', event.target.value)
                  }
                />
              </label>
              <div className="inspector-row">
                <label className="form-label">
                  Camera
                  <select
                    className="form-input"
                    value={activeScene.shot || 'Medium'}
                    onChange={(event) => onUpdateScene(activeScene.id, 'shot', event.target.value)}
                  >
                    {SHOT_TYPES.map((shot) => (
                      <option key={shot}>{shot}</option>
                    ))}
                  </select>
                </label>
                <label className="form-label">
                  Duration
                  <select
                    className="form-input"
                    value={sceneLength(activeScene)}
                    onChange={(event) =>
                      onUpdateScene(activeScene.id, 'duration', Number(event.target.value))
                    }
                  >
                    {/* Keep an unusual saved value selectable instead of silently changing it. */}
                    {[...new Set([...DURATIONS, sceneLength(activeScene)])]
                      .sort((a, b) => a - b)
                      .map((seconds) => (
                        <option key={seconds} value={seconds}>
                          {seconds} sec
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <label className="status-toggle">
                <input
                  type="checkbox"
                  checked={activeScene.status === 'ready'}
                  onChange={(event) =>
                    onUpdateScene(
                      activeScene.id,
                      'status',
                      event.target.checked ? 'ready' : 'draft',
                    )
                  }
                />
                <i />
                <span>
                  <strong>Scene approved</strong>
                  <small>Mark as ready once the direction is final.</small>
                </span>
              </label>
              <div className="inspector-section">
                <div className="inspector-subhead">
                  <span>CHARACTERS IN THIS PROJECT</span>
                  <button onClick={onEditCast} aria-label="Edit cast">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="inspector-cast">
                  {cast.length ? (
                    cast.map((character) => (
                      <div className="inspector-cast-person" key={character.id}>
                        <AvatarArt character={character} size="xs" />
                        <span>{character.name}</span>
                        <span className="cast-locked">
                          <Check size={11} /> consistent
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="inspector-no-cast">
                      No saved characters linked. <button onClick={onEditCast}>Add cast</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="inspector-section sound-section">
                <div className="inspector-subhead">
                  <span>AUDIO & VOICE</span>
                  <Music2 size={14} />
                </div>
                <div className="voice-track">
                  <span className="voice-icon">
                    <Volume2 size={15} />
                  </span>
                  <span>
                    <strong>{voice}</strong>
                    <small>{language} · Narration</small>
                  </span>
                </div>
              </div>
              <div className="inspector-footer">
                <button className="button button-dark button-block" onClick={onGenerate}>
                  <Sparkles size={15} /> Generate scene <ArrowRight size={15} />
                </button>
                <small>
                  <ShieldCheck size={12} /> Preview only · connect a provider to render
                </small>
              </div>
            </>
          ) : (
            <div className="inspector-empty">
              <ImageIcon size={23} />
              <p>Add a scene to start editing.</p>
              <button className="button button-outline button-small" onClick={onAddScene}>
                <Plus size={14} /> Add scene
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
