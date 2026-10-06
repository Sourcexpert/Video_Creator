import { useState } from 'react';
import { Check, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { styleOptions } from '../constants.js';
import { createId } from '../lib/projects.js';
import { AvatarArt } from '../components/AvatarArt.jsx';
import { Badge } from '../components/Badge.jsx';
import { Modal } from '../components/Modal.jsx';

const AGES = ['Child', 'Teen', 'Young adult', 'Early 30s', 'Middle-aged', 'Older adult'];
const PRESENTATIONS = ['Feminine', 'Masculine', 'Androgynous', 'Non-binary'];
const VOICES = [
  'Warm storyteller',
  'Bright, reassuring',
  'Playful, curious',
  'Confident, warm',
  'Deep, cinematic',
];
const PALETTES = [
  { label: 'Earth & sky', colors: ['#674235', '#536a78', '#ce9470'] },
  { label: 'Cobalt & coral', colors: ['#593c34', '#355c92', '#d69472'] },
  { label: 'Warm & bright', colors: ['#654537', '#87ae9d', '#cb8e6b'] },
  { label: 'Ink & amber', colors: ['#343b48', '#4b544f', '#a9785e'] },
  { label: 'Deep & copper', colors: ['#2f211d', '#8a4f3a', '#8d5a3f'] },
];

const blankCharacter = {
  name: '',
  role: '',
  presentation: 'Feminine',
  age: 'Early 30s',
  ethnicity: '',
  skinTone: '',
  hair: '',
  clothing: '',
  voice: 'Warm storyteller',
  accent: 'Nigerian English',
  language: 'English',
  style: '3D animation',
  palette: PALETTES[0].colors,
  original: true,
};

/** Picks which illustrated portrait to draw from the presentation and age. */
function portraitKind({ presentation, age }) {
  const young = age === 'Child' || age === 'Teen';
  if (presentation === 'Masculine') return young ? 'boy' : 'man';
  return 'woman';
}

/**
 * Create or edit a character profile.
 * `character` is either an existing profile (isNew = false) or optional starting values for a new one.
 */
export function CharacterModal({ character, isNew, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(() =>
    isNew
      ? { ...blankCharacter, ...character, id: createId('char') }
      : { ...blankCharacter, ...character },
  );
  // Consent is remembered on the profile so editing later doesn't require ticking it again.
  const [realConsent, setRealConsent] = useState(Boolean(character?.consentConfirmed));
  const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const preview = { ...form, kind: portraitKind(form) };
  const canSave = form.name.trim() && (form.original || realConsent);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    onSave({
      ...preview,
      name: form.name.trim(),
      role: (form.role || '').trim(),
      consentConfirmed: !form.original && realConsent,
    });
  };

  return (
    <Modal
      title={isNew ? 'Create a character' : 'Edit character'}
      kicker="CHARACTER VAULT"
      onClose={onClose}
      wide
    >
      <div className="character-form-layout">
        <div className="character-form-preview">
          <AvatarArt character={preview} size="xl" />
          <Badge tone="violet" icon={Sparkles}>
            {form.style}
          </Badge>
          <h3>{form.name || 'Your character'}</h3>
          <p>{form.role || 'A memorable character starts with a clear point of view.'}</p>
          <div className="preview-quality">
            <CheckCircle2 size={14} /> Profile saves locally
          </div>
        </div>
        <form className="character-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label">
              Character name
              <input
                autoFocus
                className="form-input"
                value={form.name}
                onChange={(event) => change('name', event.target.value)}
                placeholder="e.g. Ada Okafor"
                required
              />
            </label>
            <label className="form-label">
              Age appearance
              <select
                className="form-input"
                value={form.age}
                onChange={(event) => change('age', event.target.value)}
              >
                {AGES.map((age) => (
                  <option key={age}>{age}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="form-label">
            Role or personality
            <input
              className="form-input"
              value={form.role || ''}
              onChange={(event) => change('role', event.target.value)}
              placeholder="A curious teacher who loves a good puzzle"
            />
          </label>
          <div className="form-row">
            <label className="form-label">
              Ethnicity / origin
              <input
                className="form-input"
                value={form.ethnicity || ''}
                onChange={(event) => change('ethnicity', event.target.value)}
                placeholder="Optional appearance note"
              />
            </label>
            <label className="form-label">
              Skin tone
              <input
                className="form-input"
                value={form.skinTone || ''}
                onChange={(event) => change('skinTone', event.target.value)}
                placeholder="e.g. deep brown, olive"
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              Hair
              <input
                className="form-input"
                value={form.hair || ''}
                onChange={(event) => change('hair', event.target.value)}
                placeholder="Style, texture, colour"
              />
            </label>
            <label className="form-label">
              Signature clothing
              <input
                className="form-input"
                value={form.clothing || ''}
                onChange={(event) => change('clothing', event.target.value)}
                placeholder="A look to keep consistent"
              />
            </label>
          </div>
          <div className="form-row">
            <label className="form-label">
              Visual style
              <select
                className="form-input"
                value={form.style}
                onChange={(event) => change('style', event.target.value)}
              >
                {styleOptions.map((option) => (
                  <option key={option.value}>{option.value}</option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Presentation
              <select
                className="form-input"
                value={form.presentation}
                onChange={(event) => change('presentation', event.target.value)}
              >
                {PRESENTATIONS.map((presentation) => (
                  <option key={presentation}>{presentation}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="palette-row">
            <span className="form-label-title">PORTRAIT PALETTE</span>
            {PALETTES.map((palette) => (
              <button
                key={palette.label}
                type="button"
                title={palette.label}
                aria-label={`Palette: ${palette.label}`}
                aria-pressed={(form.palette || []).join() === palette.colors.join()}
                className={`palette-choice ${(form.palette || []).join() === palette.colors.join() ? 'active' : ''}`}
                onClick={() => change('palette', palette.colors)}
              >
                <span style={{ background: palette.colors[0] }} />
                <span style={{ background: palette.colors[1] }} />
                <span style={{ background: palette.colors[2] }} />
              </button>
            ))}
          </div>
          <div className="form-row">
            <label className="form-label">
              Voice profile
              <select
                className="form-input"
                value={form.voice}
                onChange={(event) => change('voice', event.target.value)}
              >
                {VOICES.map((voice) => (
                  <option key={voice}>{voice}</option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Language & accent
              <input
                className="form-input"
                value={form.accent || ''}
                onChange={(event) => change('accent', event.target.value)}
                placeholder="e.g. Nigerian English"
              />
            </label>
          </div>
          <label className="real-person-toggle">
            <input
              type="checkbox"
              checked={!form.original}
              onChange={(event) => {
                change('original', !event.target.checked);
                if (!event.target.checked) setRealConsent(false);
              }}
            />
            <span>
              <strong>This character is based on a real person.</strong>
              <small>
                Only use a likeness or voice with permission. Public-figure impersonation is not
                supported.
              </small>
            </span>
          </label>
          {!form.original && (
            <label className="consent-check">
              <input
                type="checkbox"
                checked={realConsent}
                onChange={(event) => setRealConsent(event.target.checked)}
                required
              />
              <span>
                I confirm I have documented consent to use this person’s likeness and voice.
              </span>
            </label>
          )}
          <div className="modal-form-footer">
            {!isNew && (
              <button
                type="button"
                className="button button-danger"
                onClick={() => onDelete(character)}
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
            <button type="button" className="button button-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button-primary" disabled={!canSave}>
              <Check size={15} /> Save character
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
