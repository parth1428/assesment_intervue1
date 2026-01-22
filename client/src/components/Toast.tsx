import { useEffect } from 'react';

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="toast" role="alert">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        x
      </button>
    </div>
  );
};
