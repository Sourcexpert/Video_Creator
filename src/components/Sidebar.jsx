import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  Grid2X2,
  MoreHorizontal,
  Plus,
  Settings2,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from 'lucide-react';

export function Sidebar({
  page,
  onNavigate,
  onNewStory,
  onOpenStudio,
  mobileOpen,
  setMobileOpen,
  onEngines,
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Grid2X2 },
    { id: 'projects', label: 'My projects', icon: FolderKanban },
    { id: 'characters', label: 'Characters', icon: Users },
    { id: 'books', label: 'Book to series', icon: BookOpen, tag: 'NEW' },
  ];
  return (
    <>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">
            <Sparkles size={19} fill="currentColor" />
          </div>
          <div className="brand-word">
            fable<span>STUDIO</span>
          </div>
          <button
            className="sidebar-close icon-button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <button className="workspace-switch" onClick={onEngines}>
          <span className="workspace-avatar">A</span>
          <span className="workspace-switch-copy">
            <strong>Personal workspace</strong>
            <small>Studio plan</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <button className="sidebar-new" onClick={() => onNewStory()}>
          <Plus size={17} /> New video
        </button>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-link ${page === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span>{item.label}</span>
                {item.tag && <span className="nav-tag">{item.tag}</span>}
              </button>
            );
          })}
        </nav>
        <div className="nav-caption nav-caption-create">CREATE</div>
        <nav className="main-nav" aria-label="Create">
          <button
            className={`nav-link ${page === 'studio' ? 'active' : ''}`}
            onClick={onOpenStudio}
          >
            <WandSparkles size={18} strokeWidth={1.9} />
            <span>Story studio</span>
          </button>
          <button className="nav-link" onClick={onEngines}>
            <Settings2 size={18} strokeWidth={1.9} />
            <span>Video engines</span>
            <span className="connection-dot" />
          </button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="credit-card">
          <div className="credit-top">
            <span className="credit-icon">
              <Sparkles size={14} />
            </span>
            <span>Studio credits</span>
            <button aria-label="Credit details" onClick={onEngines}>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="credit-count">
            <strong>240</strong>
            <span>/ 500</span>
          </div>
          <div className="credit-bar">
            <span />
          </div>
          <button className="credit-upgrade" onClick={onEngines}>
            Manage plan <ArrowRight size={13} />
          </button>
        </div>
        <button className="sidebar-help" onClick={onEngines}>
          <CircleHelp size={16} /> Help & integrations <ArrowUpRight size={13} />
        </button>
        <button className="profile-row" onClick={() => onNavigate('overview')}>
          <div className="profile-avatar">AO</div>
          <div className="profile-copy">
            <strong>Ada Okafor</strong>
            <small>Personal account</small>
          </div>
          <MoreHorizontal size={18} />
        </button>
      </aside>
    </>
  );
}
