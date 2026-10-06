const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Label for the search / new-story keyboard shortcut on this computer. */
export const shortcutLabel = isMac ? '⌘ K' : 'Ctrl K';
