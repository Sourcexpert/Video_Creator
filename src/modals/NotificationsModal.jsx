import { ArrowRight, Bell } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';

export function NotificationsModal({ onClose, onNavigate }) {
  return (
    <Modal title="You’re all caught up" kicker="NOTIFICATIONS" onClose={onClose}>
      <div className="notifications-empty">
        <div className="notification-bell">
          <Bell size={20} />
        </div>
        <p>No new updates right now.</p>
        <span>When your storyboards, exports or reviews change, you’ll see them here.</span>
        <button
          className="text-link"
          onClick={() => {
            onClose();
            onNavigate('projects');
          }}
        >
          Browse your projects <ArrowRight size={14} />
        </button>
      </div>
    </Modal>
  );
}
