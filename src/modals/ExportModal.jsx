import { useState } from 'react';
import { Download, Film } from 'lucide-react';
import { getEpisodes } from '../lib/projects.js';
import { ProjectCover } from '../components/ProjectCover.jsx';
import { Modal } from '../components/Modal.jsx';

const FORMATS = ['16:9 · YouTube', '9:16 · Reels & Shorts', '1:1 · Square', '4:5 · Social feed'];
const QUALITIES = ['720p', '1080p', '4K'];

export function ExportModal({ project, onClose, onSave }) {
  const saved = project.exportSettings || {};
  // Default the aspect ratio to the one chosen in the Story studio, if any.
  const studioFormat = FORMATS.find((option) =>
    option.startsWith(project.settings?.aspect || '16:9'),
  );
  const [format, setFormat] = useState(saved.format || studioFormat || FORMATS[0]);
  const [quality, setQuality] = useState(saved.quality || '1080p');
  const [burnCaptions, setBurnCaptions] = useState(saved.burnCaptions ?? true);
  const episodeCount = getEpisodes(project).length;
  return (
    <Modal title="Export your story" kicker="FINAL DELIVERY" onClose={onClose}>
      <div className="export-project">
        <ProjectCover project={project} className="export-thumb" />
        <div>
          <strong>{project.title || 'Untitled project'}</strong>
          <span>
            {project.style || 'Visual style'} · {episodeCount} episode
            {episodeCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      <label className="form-label export-label">
        Aspect ratio
        <select
          className="form-input"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
        >
          {FORMATS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="form-label export-label">
        Output quality
        <select
          className="form-input"
          value={quality}
          onChange={(event) => setQuality(event.target.value)}
        >
          {QUALITIES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="export-toggle">
        <span>
          <strong>Burn in subtitles</strong>
          <small>Keep dialogue accessible without sound.</small>
        </span>
        <input
          type="checkbox"
          checked={burnCaptions}
          onChange={(event) => setBurnCaptions(event.target.checked)}
        />
        <i />
      </label>
      <div className="export-preview-only">
        <Film size={15} />
        <span>
          Export is available after a video engine and render worker are connected. This preview
          will not create a fake MP4.
        </span>
      </div>
      <button
        className="button button-primary button-block export-action"
        onClick={() => onSave({ format, quality, burnCaptions })}
      >
        <Download size={15} /> Save export settings
      </button>
    </Modal>
  );
}
