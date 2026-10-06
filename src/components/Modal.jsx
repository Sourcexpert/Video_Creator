import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, kicker, onClose, children, wide, icon: Icon }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-card ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <div>
            {kicker && <span className="eyebrow eyebrow-small">{kicker}</span>}
            <h2>
              {Icon && (
                <span className="modal-icon">
                  <Icon size={17} />
                </span>
              )}
              {title}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
