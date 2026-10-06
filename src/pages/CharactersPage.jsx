import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Mic2,
} from 'lucide-react';
import { AvatarArt } from '../components/AvatarArt.jsx';
import { Badge } from '../components/Badge.jsx';
import { styleOptions } from '../constants.js';

const STYLE_FILTERS = ['All styles', ...styleOptions.map((option) => option.value)];

export function CharactersPage({ characters, onAdd, onEdit, query }) {
  const [filter, setFilter] = useState('All styles');
  const [localQuery, setLocalQuery] = useState(query || '');
  // Keep the box in sync with the search in the top bar.
  useEffect(() => {
    setLocalQuery(query || '');
  }, [query]);
  const needle = localQuery.trim().toLowerCase();
  const results = characters.filter((character) => {
    const styleMatch = filter === 'All styles' || character.style === filter;
    const text = `${character.name} ${character.role} ${character.ethnicity} ${character.accent}`;
    return styleMatch && (!needle || text.toLowerCase().includes(needle));
  });
  return (
    <div className="page-wrap standard-page">
      <div className="page-title-row character-title-row">
        <div>
          <div className="eyebrow eyebrow-small">YOUR CAST, ALWAYS IN CHARACTER</div>
          <h1>Character vault</h1>
          <p>Save a look, voice and personality once. Bring them back in any story.</p>
        </div>
        <button className="button button-primary" onClick={onAdd}>
          <Plus size={16} /> Create character
        </button>
      </div>
      <div className="character-insight">
        <div className="insight-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <strong>Consistency starts with a reference.</strong>
          <span>
            Profiles keep approved appearance notes and visual references attached to every new
            scene.
          </span>
        </div>
        <button onClick={() => onAdd()}>
          {characters.length ? 'Add another character' : 'Create your first character'}{' '}
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="character-toolbar">
        <div className="filter-tabs">
          {STYLE_FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="project-search">
          <Search size={16} />
          <input
            placeholder="Find a character"
            aria-label="Find a character"
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
          />
        </div>
      </div>
      {results.length ? (
        <div className="character-grid">
          {results.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => onEdit(character)}
            />
          ))}
          <button className="new-character-card" onClick={onAdd}>
            <span className="new-character-icon">
              <Plus size={22} />
            </span>
            <strong>Create a new character</strong>
            <span>Design a look, voice and point of view.</span>
            <span className="new-character-arrow">
              <ArrowRight size={15} />
            </span>
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={24} />
          </div>
          <h3>{characters.length ? 'No characters match' : 'Your vault is empty'}</h3>
          <p>Try another search or create a new character.</p>
          <button className="button button-primary" onClick={onAdd}>
            <Plus size={16} /> Create character
          </button>
        </div>
      )}
      <div className="safety-line">
        <ShieldCheck size={15} />
        <span>
          Only use real-person likenesses and voices with consent. Public-figure impersonation is
          not supported.
        </span>
      </div>
    </div>
  );
}

export function CharacterCard({ character, onClick }) {
  return (
    <button className="character-card" onClick={onClick}>
      <div className="character-card-top">
        <Badge tone="sand" icon={Sparkles}>
          {character.style}
        </Badge>
      </div>
      <div className="character-portrait-row">
        <AvatarArt character={character} size="lg" />
        <div className="character-portrait-orbit" />
      </div>
      <div className="character-card-info">
        <h3>{character.name}</h3>
        <p>{character.role || [character.age, character.ethnicity].filter(Boolean).join(' · ')}</p>
        <div className="character-tags">
          <span>
            <Mic2 size={13} /> {character.accent || 'Voice not set'}
          </span>
          <span>
            <ImageIcon size={13} /> Reference profile
          </span>
        </div>
      </div>
      <div className="character-card-footer">
        <span>
          <CheckCircle2 size={14} /> Saved memory
        </span>
        <ArrowUpRight size={15} />
      </div>
    </button>
  );
}
