import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { AvatarArt } from '../components/AvatarArt.jsx';
import { Modal } from '../components/Modal.jsx';

/** Choose which saved characters belong to the open project. */
export function CastModal({ characters, selected, onClose, onSave, onCreateCharacter }) {
  const [cast, setCast] = useState(selected);
  const toggle = (id) =>
    setCast((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  return (
    <Modal title="Project cast" kicker="CHARACTER VAULT" onClose={onClose}>
      <p className="modal-intro">
        Linked characters keep their look and voice notes in every scene of this project.
      </p>
      <div className="cast-modal-list">
        {characters.map((character) => {
          const isSelected = cast.includes(character.id);
          return (
            <button
              key={character.id}
              className={`studio-character-option ${isSelected ? 'selected' : ''}`}
              onClick={() => toggle(character.id)}
              aria-pressed={isSelected}
            >
              <AvatarArt character={character} size="sm" />
              <span className="studio-character-copy">
                <strong>{character.name}</strong>
                <small>
                  {character.style} · {character.accent || 'Voice not set'}
                </small>
              </span>
              <span className="character-select-check">{isSelected && <Check size={13} />}</span>
            </button>
          );
        })}
        {!characters.length && <p className="no-cast-note">Your character vault is empty.</p>}
      </div>
      <button className="add-cast-button" onClick={onCreateCharacter}>
        <Plus size={15} /> Create a new character
      </button>
      <div className="modal-form-footer">
        <button className="button button-outline" onClick={onClose}>
          Cancel
        </button>
        <button className="button button-primary" onClick={() => onSave(cast)}>
          <Check size={15} /> Save cast
        </button>
      </div>
    </Modal>
  );
}
