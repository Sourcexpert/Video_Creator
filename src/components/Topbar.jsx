import { useEffect, useRef } from 'react';
import { Bell, ChevronRight, Menu, Search, X } from 'lucide-react';
import { shortcutLabel } from '../lib/platform.js';

export function Topbar({
  onSearch,
  onNotifications,
  onEngines,
  onMenu,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
}) {
  const searchRef = useRef(null);
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    onSearch('');
  };
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="topbar-path">
        <span>Fable Studio</span>
        <ChevronRight size={14} />
        <strong>Workspace</strong>
      </div>
      <div className="topbar-actions">
        {searchOpen ? (
          <div className="search-open">
            <Search size={16} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                onSearch(event.target.value);
              }}
              onKeyDown={(event) => event.key === 'Escape' && closeSearch()}
              aria-label="Search projects and characters"
              placeholder="Search projects, characters…"
            />
            <kbd>ESC</kbd>
            <button onClick={closeSearch} aria-label="Close search">
              <X size={15} />
            </button>
          </div>
        ) : (
          <button className="top-search" onClick={() => setSearchOpen(true)}>
            <Search size={16} />
            <span>Search anything</span>
            <kbd>{shortcutLabel}</kbd>
          </button>
        )}
        <button className="top-icon-button" aria-label="Notifications" onClick={onNotifications}>
          <Bell size={18} />
        </button>
        <span className="topbar-divider" />
        <button className="top-avatar" onClick={onEngines} aria-label="Account settings">
          AO
        </button>
      </div>
    </header>
  );
}
