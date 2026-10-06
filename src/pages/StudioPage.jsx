import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Trash2,
} from 'lucide-react';
import { styleOptions } from '../constants.js';
import { cleanTitle, coverForStyle, makeScene } from '../lib/projects.js';
import { AvatarArt } from '../components/AvatarArt.jsx';
import { ProjectCover } from '../components/ProjectCover.jsx';
import { Badge } from '../components/Badge.jsx';

export function StudioPage({
  draft,
  setDraft,
  step,
  setStep,
  characters,
  onCreateCharacter,
  onBuild,
  onSave,
  onEditor,
  onEngines,
  isBuilding,
  project,
}) {
  const toggleCharacter = (id) =>
    setDraft((prev) => ({
      ...prev,
      selectedCharacters: prev.selectedCharacters.includes(id)
        ? prev.selectedCharacters.filter((item) => item !== id)
        : [...prev.selectedCharacters, id],
    }));
  const updateScene = (id, key, value) =>
    setDraft((prev) => ({
      ...prev,
      scenes: prev.scenes.map((scene) => (scene.id === id ? { ...scene, [key]: value } : scene)),
    }));
  const addScene = () =>
    setDraft((prev) => ({
      ...prev,
      scenes: [
        ...prev.scenes,
        makeScene({
          title: `New scene ${prev.scenes.length + 1}`,
          description: 'Describe the visual beat and what changes in this moment.',
        }),
      ],
    }));
  const removeScene = (id) =>
    setDraft((prev) => ({ ...prev, scenes: prev.scenes.filter((scene) => scene.id !== id) }));
  return (
    <div className="page-wrap standard-page studio-page">
      <div className="studio-page-head">
        <div>
          <div className="eyebrow eyebrow-small">
            <WandSparkles size={13} /> STORY STUDIO <span className="eyebrow-slash">/</span>{' '}
            {step === 'brief' ? '01 · STORY BRIEF' : '02 · STORYBOARD'}
          </div>
          <h1>{step === 'brief' ? 'Let’s shape your story.' : 'A first draft, ready for you.'}</h1>
          <p>
            {step === 'brief'
              ? 'Start with a source, a spark or a single scene. You stay in control at every step.'
              : 'Review the beats, edit the details, then take your storyboard into the editor.'}
          </p>
        </div>
        <div className="studio-demo-tag">
          <span /> Preview mode
        </div>
      </div>
      {step === 'brief' ? (
        <div className="studio-layout">
          <section className="studio-brief-card">
            <div className="studio-card-head">
              <div>
                <span className="eyebrow eyebrow-small">01 / THE STORY</span>
                <h2>What happens?</h2>
              </div>
              <span className="optional-label">Start broad. Get specific later.</span>
            </div>
            <textarea
              className="story-prompt"
              value={draft.prompt}
              onChange={(event) => setDraft((prev) => ({ ...prev, prompt: event.target.value }))}
              placeholder="A Nigerian teacher walks into a technology classroom and explains cybersecurity…"
              rows={5}
            />
            <div className="prompt-suggestions">
              <span>Try a prompt</span>
              {[
                'A lesson that feels like an adventure',
                'A brave choice in a faraway kingdom',
                'A 60-second welcome video',
              ].map((text) => (
                <button key={text} onClick={() => setDraft((prev) => ({ ...prev, prompt: text }))}>
                  {text}
                </button>
              ))}
            </div>
            <div className="studio-divider" />
            <div className="studio-card-head">
              <div>
                <span className="eyebrow eyebrow-small">02 / THE LOOK</span>
                <h2>Choose your visual world.</h2>
              </div>
              <span className="optional-label">Change it any time</span>
            </div>
            <div className="style-choice-grid">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  className={`style-choice ${draft.style === option.value ? 'selected' : ''}`}
                  onClick={() => setDraft((prev) => ({ ...prev, style: option.value }))}
                >
                  <span
                    className={`style-choice-visual style-${option.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span>{option.glyph}</span>
                  </span>
                  <strong>{option.label}</strong>
                  <small>
                    {option.value === 'Cinematic realism'
                      ? 'Film-like, natural scenes'
                      : option.value === '3D animation'
                        ? 'Expressive, dimensional worlds'
                        : option.value === '2D animation'
                          ? 'Illustrated and graphic'
                          : 'Bold, expressive motion'}
                  </small>
                  {draft.style === option.value && (
                    <span className="style-check">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="studio-divider" />
            <div className="studio-card-head">
              <div>
                <span className="eyebrow eyebrow-small">03 / THE DETAILS</span>
                <h2>Set the stage.</h2>
              </div>
            </div>
            <div className="studio-options-grid">
              <label className="form-label">
                Video shape
                <select
                  className="form-input"
                  value={draft.aspect}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, aspect: event.target.value }))
                  }
                >
                  <option>16:9</option>
                  <option>9:16</option>
                  <option>1:1</option>
                  <option>4:5</option>
                </select>
              </label>
              <label className="form-label">
                Target duration
                <select
                  className="form-input"
                  value={draft.duration}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, duration: event.target.value }))
                  }
                >
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>2 minutes</option>
                  <option>3–5 minutes</option>
                </select>
              </label>
              <label className="form-label">
                Language
                <select
                  className="form-input"
                  value={draft.language}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, language: event.target.value }))
                  }
                >
                  <option>English</option>
                  <option>Yoruba</option>
                  <option>Igbo</option>
                  <option>Hausa</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </label>
              <label className="form-label">
                Narration voice
                <select
                  className="form-input"
                  value={draft.voice}
                  onChange={(event) => setDraft((prev) => ({ ...prev, voice: event.target.value }))}
                >
                  <option>Warm storyteller</option>
                  <option>Bright, reassuring</option>
                  <option>Deep, cinematic</option>
                  <option>Nigerian English</option>
                  <option>No narration</option>
                </select>
              </label>
            </div>
            <div className="studio-card-footer">
              <span>
                <ShieldCheck size={14} /> Human review before generation
              </span>
              <div className="studio-card-actions">
                {draft.projectId && (
                  <button className="button button-outline" onClick={() => setStep('storyboard')}>
                    Back to storyboard
                  </button>
                )}
                <button
                  className="button button-primary"
                  disabled={!draft.prompt.trim() || isBuilding}
                  onClick={onBuild}
                >
                  {isBuilding ? (
                    <>
                      <span className="spinner" /> Building plan…
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      {draft.projectId ? 'Rebuild storyboard' : 'Build storyboard'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
          <aside className="studio-cast-panel">
            <div className="cast-panel-head">
              <div>
                <span className="eyebrow eyebrow-small">YOUR CAST</span>
                <h2>Who’s in the story?</h2>
              </div>
              <button
                className="round-arrow"
                onClick={() => onCreateCharacter()}
                aria-label="Create a character"
              >
                <Plus size={16} />
              </button>
            </div>
            <p>Saved characters keep their look, voice and personality across scenes.</p>
            <div className="studio-character-list">
              {characters.map((character) => (
                <button
                  key={character.id}
                  className={`studio-character-option ${draft.selectedCharacters.includes(character.id) ? 'selected' : ''}`}
                  onClick={() => toggleCharacter(character.id)}
                >
                  <AvatarArt character={character} size="sm" />
                  <span className="studio-character-copy">
                    <strong>{character.name}</strong>
                    <small>
                      {character.style} · {character.accent}
                    </small>
                  </span>
                  <span className="character-select-check">
                    {draft.selectedCharacters.includes(character.id) && <Check size={13} />}
                  </span>
                </button>
              ))}
            </div>
            <button className="add-cast-button" onClick={() => onCreateCharacter()}>
              <Plus size={15} /> Create a new character
            </button>
            <div className="cast-consent">
              <ShieldCheck size={16} />
              <span>
                <strong>Respectful by design.</strong> Only use a real person’s likeness or voice
                with clear consent.
              </span>
            </div>
            <div className="style-memory-note">
              <span className="memory-spark">
                <Sparkles size={13} />
              </span>
              <div>
                <strong>Character memory</strong>
                <small>Appearance, voice and clothing notes travel with your cast.</small>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="storyboard-layout">
          <section className="storyboard-list-card">
            <div className="storyboard-head">
              <div>
                <Badge tone="violet" icon={Sparkles}>
                  STORYBOARD DRAFT
                </Badge>
                <h2>{project?.title || cleanTitle(draft.prompt)}</h2>
                <p>
                  {draft.style} <span>·</span> {draft.duration} <span>·</span> {draft.aspect}
                </p>
              </div>
              <button
                className="button button-outline button-small"
                onClick={() => setStep('brief')}
              >
                <ArrowLeft size={14} /> Edit brief
              </button>
            </div>
            <div className="storyboard-note">
              <Lightbulb size={15} />
              <span>
                This preview uses a local storyboard template—not an LLM call or rendered video.
                Connect a story model for AI drafting, then review every scene.
              </span>
            </div>
            <div className="storyboard-scenes">
              {draft.scenes.map((scene, index) => (
                <div className="storyboard-scene" key={scene.id}>
                  <div className="storyboard-scene-number">
                    {String(index + 1).padStart(2, '0')}
                    <span>{scene.duration}s</span>
                  </div>
                  <div className="storyboard-scene-body">
                    <input
                      value={scene.title}
                      onChange={(event) => updateScene(scene.id, 'title', event.target.value)}
                      aria-label={`Scene ${index + 1} title`}
                    />
                    <textarea
                      value={scene.description}
                      onChange={(event) => updateScene(scene.id, 'description', event.target.value)}
                      rows={2}
                      aria-label={`Scene ${index + 1} description`}
                    />
                  </div>
                  <button
                    className="icon-button subtle-icon"
                    disabled={draft.scenes.length <= 1}
                    onClick={() => removeScene(scene.id)}
                    aria-label="Remove scene"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-scene-button" onClick={addScene}>
              <Plus size={15} /> Add another scene
            </button>
            <div className="storyboard-footer">
              <span>
                <ShieldCheck size={14} /> Nothing renders until you approve it.
              </span>
              <div>
                <button className="button button-outline" onClick={onSave}>
                  <Check size={15} /> Save draft
                </button>
                <button className="button button-primary" onClick={onEditor}>
                  Open in editor <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </section>
          <aside className="storyboard-aside">
            <div className="preview-board">
              <div className="preview-board-top">
                <span>VISUAL DIRECTION</span>
              </div>
              <ProjectCover
                project={project || { cover: coverForStyle(draft.style), style: draft.style }}
                className="preview-board-image"
              />
              <div className="preview-board-copy">
                <span className="eyebrow eyebrow-small">CAST ON THIS PROJECT</span>
                <div className="preview-board-avatars">
                  {draft.selectedCharacters.length ? (
                    characters
                      .filter((character) => draft.selectedCharacters.includes(character.id))
                      .map((character) => (
                        <div key={character.id} className="preview-board-person">
                          <AvatarArt character={character} size="xs" />
                          <span>{character.name}</span>
                        </div>
                      ))
                  ) : (
                    <span className="no-cast-note">No saved characters selected.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="source-grounded-note">
              <ShieldCheck size={16} />
              <span>
                <strong>Clear source boundaries.</strong> Keep the adaptation faithful, or label
                additions as creative interpretation.
              </span>
            </div>
            <button className="provider-setup-link" onClick={onEngines}>
              <Settings2 size={15} /> Configure generation engines <ArrowRight size={14} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
