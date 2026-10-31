import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal adhering strictly to DESIGN.md:
 * - Surface, radius-md, shadow-md, max 480 px wide, 24 px padding
 * - Dimmer: rgba(28, 27, 25, 0.45)
 * - Close button, not only overlay click
 * - Esc key closes
 * - Focus trap / restoration
 * - Title is h3 (Bricolage Grotesque 600)
 */
const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  const modalRef = useRef(null);
  const prevActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    prevActiveElement.current = document.activeElement;
    modalRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      prevActiveElement.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Dimmer backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(28, 27, 25, 0.45)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal dialog */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full max-w-[480px] rounded-md bg-surface p-6 shadow-md border border-border z-10 outline-none animate-fadeIn ${className}`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          {title && (
            <h3
              id="modal-title"
              className="text-lg md:text-xl font-display font-semibold text-ink"
            >
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-sm p-1 text-muted hover:text-ink hover:bg-bg transition-colors"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
