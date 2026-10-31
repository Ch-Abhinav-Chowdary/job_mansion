import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
};

const STYLES = {
  success: {
    bg: 'bg-success-soft',
    border: 'border-success/30',
    iconColor: 'text-success',
  },
  error: {
    bg: 'bg-error-soft',
    border: 'border-error/30',
    iconColor: 'text-error',
  },
  warning: {
    bg: 'bg-warning-soft',
    border: 'border-warning/30',
    iconColor: 'text-warning',
  },
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  /**
   * showToast({ message, type: 'success' | 'error' | 'warning', duration = 5000 })
   * DESIGN.md: "One toast at a time. 5 s default."
   */
  const showToast = useCallback(
    ({ message, type = 'success', duration = 5000 }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({ message, type });

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setToast(null);
          timerRef.current = null;
        }, duration);
      }
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-md pointer-events-auto"
        >
          {(() => {
            const currentStyle = STYLES[toast.type] || STYLES.success;
            const IconComponent = ICONS[toast.type] || ICONS.success;

            return (
              <div
                className={`flex items-start gap-3 p-4 rounded-sm shadow-md border ${currentStyle.bg} ${currentStyle.border} text-ink`}
              >
                <div className={`shrink-0 ${currentStyle.iconColor} mt-0.5`}>
                  <IconComponent size={20} strokeWidth={1.75} />
                </div>
                <div className="flex-1 text-sm font-medium leading-relaxed">
                  {toast.message}
                </div>
                <button
                  type="button"
                  onClick={dismissToast}
                  aria-label="Dismiss toast"
                  className="shrink-0 -mr-1 -mt-1 p-1 text-muted hover:text-ink transition-colors rounded-sm"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>
            );
          })()}
        </aside>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
