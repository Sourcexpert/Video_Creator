import { useEffect } from 'react';

/** Calls `onOutside` when the user clicks outside `ref` or presses Escape. Used for dropdown menus. */
export function useClickOutside(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onOutside();
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onOutside, active]);
}
