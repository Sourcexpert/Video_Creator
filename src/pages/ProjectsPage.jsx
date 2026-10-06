import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Clapperboard,
  FolderOpen,
  Layers3,
  Plus,
  Search,
  ShieldCheck,
  Film,
} from 'lucide-react';
import {
  countScenes,
  formatUpdated,
  getEpisodes,
  initials,
  projectStatus,
} from '../lib/projects.js';
import { ProjectCover } from '../components/ProjectCover.jsx';
import { StatusPill } from '../components/StatusPill.jsx';

const FILTERS = {
  'All projects': () => true,
  'In progress': (status) => status === 'In progress' || status === 'Outline',
  'Ready to export': (status) => status === 'Ready to export',
  Drafts: (status) => status === 'Draft',
};

export function ProjectsPage({ projects, characters, onEditor, onNewStory, onBook, query }) {
  const [filter, setFilter] = useState('All projects');
  const [localQuery, setLocalQuery] = useState(query || '');
  // Keep the box in sync with the search in the top bar.
  useEffect(() => {
    setLocalQuery(query || '');
  }, [query]);
  const needle = localQuery.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    const matchesFilter = FILTERS[filter](projectStatus(project));
    const matchesSearch =
      !needle ||
      `${project.title} ${project.subtitle} ${project.type} ${project.style}`
        .toLowerCase()
        .includes(needle);
    return matchesFilter && matchesSearch;
  });
  return (
    <div className="page-wrap standard-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow eyebrow-small">YOUR CREATIVE SPACE</div>
          <h1>My projects</h1>
          <p>Every idea, episode and story—together in one place.</p>
        </div>
        <div className="title-actions">
          <button className="button button-outline" onClick={onBook}>
            <BookOpen size={16} /> From a book
          </button>
          <button className="button button-primary" onClick={() => onNewStory()}>
            <Plus size={16} /> New video
          </button>
        </div>
      </div>
      <div className="project-toolbar">
        <div className="filter-tabs">
          {Object.keys(FILTERS).map((item) => (
            <button
              key={item}
              className={filter === item ? 'active' : ''}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
              {item === 'All projects' && <span>{projects.length}</span>}
            </button>
          ))}
        </div>
        <div className="project-search">
          <Search size={16} />
          <input
            placeholder="Search projects"
            aria-label="Search projects"
            value={localQuery}
            onChange={(event) => setLocalQuery(event.target.value)}
          />
        </div>
      </div>
      {visibleProjects.length ? (
        <div className="project-grid">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              characters={characters}
              onClick={() => onEditor(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={24} />
          </div>
          <h3>{projects.length ? 'No projects found' : 'No projects yet'}</h3>
          <p>
            {projects.length
              ? 'Try another filter or search, or create something new.'
              : 'Start with an idea or turn a book into a series.'}
          </p>
          <button className="button button-primary" onClick={() => onNewStory()}>
            <Plus size={16} /> Start a story
          </button>
        </div>
      )}
      <div className="projects-foot">
        <span>
          <ShieldCheck size={15} /> Your projects are saved on this device.
        </span>
        <span>
          {projects.length} total project{projects.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}

export function ProjectCard({ project, characters, onClick }) {
  const episodes = getEpisodes(project);
  const sceneCount = countScenes(project);
  const cast = (project.cast || [])
    .map((id) => characters.find((character) => character.id === id))
    .filter(Boolean);
  return (
    <button className="project-card" onClick={onClick}>
      <div className="project-card-art">
        <ProjectCover project={project} showShade />
        <span className="project-type-chip">
          <Clapperboard size={12} /> {project.type}
        </span>
        <span className="project-card-open">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="project-card-body">
        <div className="project-card-title">
          <h3>{project.title}</h3>
          <StatusPill status={projectStatus(project)} />
        </div>
        <p>{project.subtitle}</p>
        <div className="project-card-details">
          <span>
            <Film size={14} /> {episodes.length} episode{episodes.length === 1 ? '' : 's'}
          </span>
          <span>
            <Layers3 size={14} /> {sceneCount} scene{sceneCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="project-card-bottom">
          <div className="tiny-avatars">
            {cast.slice(0, 3).map((character) => (
              <span key={character.id} title={character.name}>
                {initials(character.name)}
              </span>
            ))}
            <small>{project.style}</small>
          </div>
          <span className="project-updated">{formatUpdated(project)}</span>
        </div>
      </div>
    </button>
  );
}
