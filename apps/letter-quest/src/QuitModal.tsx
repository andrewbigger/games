import './QuitModal.css';

interface QuitModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function QuitModal({ isOpen, onConfirm, onCancel }: QuitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="quit-modal-overlay" onClick={onCancel}>
      <div className="quit-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="quit-modal-title">Quit Application?</h2>
        <p className="quit-modal-text">Are you sure you want to quit the application?</p>
        <div className="quit-modal-buttons">
          <button className="quit-modal-button quit-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="quit-modal-button quit-modal-confirm" onClick={onConfirm}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

