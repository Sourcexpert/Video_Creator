import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Layers3,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Film,
} from 'lucide-react';
import { styleOptions } from '../constants.js';
import {
  computeProgress,
  findCurrentEpisode,
  formatUpdated,
  getEpisodes,
  projectStatus,
} from '../lib/projects.js';
import { AvatarArt } from '../components/AvatarArt.jsx';
import { ProjectCover } from '../components/ProjectCover.jsx';
import { StatusPill } from '../components/StatusPill.jsx';
import { Badge } from '../components/Badge.jsx';

export function OverviewPage({
  projects,
  characters,
  onNewStory,
  onNavigate,
  onEditor,
  onCharacter,
  onAddCharacter,
  onBook,
  onEngines,
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic realism');
  // Projects arrive sorted newest first, so the first one is the most recently edited.
  const activeProject = projects[0];
  const recentProjects = projects.slice(0, 3);
  const current = activeProject ? findCurrentEpisode(activeProject) : null;
  const progress = activeProject ? computeProgress(activeProject) : 0;
  const episodeCount = getEpisodes(activeProject).length;
  const dateLabel = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
  return (
    <div className="page-wrap dashboard-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" /> {dateLabel.toUpperCase()}
          </div>
          <h1>
            {greeting()}, Ada <span className="wave">✳</span>
          </h1>
          <p>Ready to make something memorable?</p>
        </div>
        <button className="button button-primary" onClick={() => onNewStory()}>
          <Plus size={17} /> New video
        </button>
      </div>

      <div className="start-grid">
        <section className="idea-card">
          <div className="idea-topline">
            <span className="idea-spark">
              <Sparkles size={15} />
            </span>
            <span>START WITH AN IDEA</span>
            <span className="idea-badge">AI STORY STUDIO</span>
          </div>
          <h2>
            Every great story
            <br />
            starts somewhere.
          </h2>
          <p>Share a spark, a lesson or a scene. We’ll help you shape it.</p>
          <div className="idea-input-shell">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="A curious teacher takes her class on a journey through the human body…"
              rows={2}
              aria-label="Describe your story"
              onKeyDown={(event) => {
                // Ctrl/⌘ + Enter is a quick way to send the idea to the studio.
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  onNewStory(prompt, selectedStyle);
                }
              }}
            />
            <div className="idea-input-footer">
              <div className="style-select" role="group" aria-label="Choose visual style">
                {styleOptions.slice(0, 3).map((option) => (
                  <button
                    key={option.value}
                    className={selectedStyle === option.value ? 'selected' : ''}
                    onClick={() => setSelectedStyle(option.value)}
                    aria-pressed={selectedStyle === option.value}
                    title={option.label}
                  >
                    <span>{option.glyph}</span>
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                className="idea-send"
                onClick={() => onNewStory(prompt, selectedStyle)}
                aria-label="Open in Story studio"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="idea-footnote">
            <Sparkles size={13} /> Start with one sentence. Refine every scene before rendering.
          </div>
          <div className="idea-orb idea-orb-one" />
          <div className="idea-orb idea-orb-two" />
        </section>
        <section className="book-cta-card">
          <div className="book-cta-head">
            <span className="book-cta-icon">
              <BookOpen size={19} />
            </span>
            <span className="mini-label">FROM BOOK TO SERIES</span>
            <button className="arrow-circle" onClick={onBook} aria-label="Open book to series">
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="book-art-stack">
            <span />
            <span />
            <span />
            <BookOpen size={27} />
          </div>
          <h3>
            One book.
            <br />
            <em>A whole world.</em>
          </h3>
          <p>Turn a document into a season of stories—with characters that stay consistent.</p>
          <button className="text-link" onClick={onBook}>
            Build a series <ArrowRight size={15} />
          </button>
        </section>
      </div>

      {activeProject && (
        <section className="continue-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow eyebrow-small">PICK UP WHERE YOU LEFT OFF</div>
              <h2>Continue creating</h2>
            </div>
            <button className="quiet-link" onClick={() => onNavigate('projects')}>
              All projects <ArrowRight size={14} />
            </button>
          </div>
          <div className="continue-card">
            <div className="continue-art">
              <ProjectCover project={activeProject} showShade />
              <div className="art-caption">
                <span className="art-caption-dot" /> {activeProject.type?.toUpperCase()}
              </div>
            </div>
            <div className="continue-content">
              <div className="continue-top">
                <Badge tone="violet" icon={Layers3}>
                  {episodeCount > 1 ? 'SERIES' : 'SINGLE STORY'}
                </Badge>
                <StatusPill status={projectStatus(activeProject)} />
              </div>
              <h3>{activeProject.title}</h3>
              <p>{activeProject.subtitle}</p>
              <div className="continue-meta">
                <span>
                  <Film size={14} /> {episodeCount} episode{episodeCount === 1 ? '' : 's'}
                </span>
                <span>
                  <Clock3 size={14} /> Edited {formatUpdated(activeProject).toLowerCase()}
                </span>
              </div>
              <div className="progress-label">
                <span>
                  Episode {String(current.number).padStart(2, '0')} · {current.episode?.title}
                </span>
                <strong>{progress}% of scenes ready</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
              <button className="button button-dark" onClick={() => onEditor(activeProject.id)}>
                Continue editing <ArrowRight size={16} />
              </button>
            </div>
            <div className="continue-spark">
              <Sparkles size={15} />
            </div>
          </div>
        </section>
      )}

      <div className="dashboard-lower-grid">
        <section className="recent-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow eyebrow-small">YOUR WORKSPACE</div>
              <h2>Recent projects</h2>
            </div>
            <button className="quiet-link" onClick={() => onNavigate('projects')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="recent-list">
            {recentProjects.length ? (
              recentProjects.map((project) => (
                <button
                  className="recent-row"
                  key={project.id}
                  onClick={() => onEditor(project.id)}
                >
                  <ProjectCover project={project} className="recent-thumb" />
                  <div className="recent-main">
                    <strong>{project.title}</strong>
                    <span>
                      {project.type} <i>·</i> {project.style}
                    </span>
                  </div>
                  <StatusPill status={projectStatus(project)} />
                  <span className="recent-time">{formatUpdated(project)}</span>
                  <ArrowUpRight className="recent-open" size={15} />
                </button>
              ))
            ) : (
              <div className="empty-inline">No projects yet. Start with an idea above.</div>
            )}
          </div>
        </section>
        <aside className="cast-card">
          <div className="cast-card-head">
            <div>
              <div className="eyebrow eyebrow-small">CHARACTER VAULT</div>
              <h2>Made to return</h2>
            </div>
            <button
              className="round-arrow"
              onClick={() => onNavigate('characters')}
              aria-label="View characters"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
          <p>Your cast stays recognisable, scene after scene.</p>
          <div className="cast-avatar-row">
            {characters.slice(0, 3).map((character) => (
              <button
                key={character.id}
                className="cast-avatar-item"
                onClick={() => onCharacter(character)}
                title={character.name}
              >
                <AvatarArt character={character} size="sm" />
              </button>
            ))}
            <button className="cast-add" onClick={onAddCharacter} aria-label="Create a character">
              <Plus size={17} />
            </button>
          </div>
          <div className="cast-card-footer">
            <span>
              <Users size={14} /> {characters.length} saved character
              {characters.length === 1 ? '' : 's'}
            </span>
            <button onClick={() => onNavigate('characters')}>
              Manage <ArrowRight size={13} />
            </button>
          </div>
        </aside>
      </div>
      <div className="dashboard-note">
        <ShieldCheck size={15} />
        <span>
          Your stories stay yours. Content is processed locally in this preview; connect a provider
          when you’re ready to render.
        </span>
        <button onClick={onEngines}>
          Engine setup <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
