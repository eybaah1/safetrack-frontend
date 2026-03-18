import { useCallback, useMemo, useRef, useState } from 'react';
import { X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import ToastContext from './toastContext.js';

function ToastIcon({ variant }) {
  if (variant === 'success') return <CheckCircle2 className="w-5 h-5 text-secondary" aria-hidden="true" />;
  if (variant === 'error') return <AlertTriangle className="w-5 h-5 text-danger" aria-hidden="true" />;
  return <Info className="w-5 h-5 text-primary" aria-hidden="true" />;
}

function ToastItem({ toast, onDismiss }) {
  const border =
    toast.variant === 'success'
      ? 'border-secondary/30'
      : toast.variant === 'error'
        ? 'border-danger/30'
        : 'border-primary/30';

  return (
    <div
      className={`w-full max-w-[min(560px,calc(100vw-32px))] bg-bg-secondary/95 backdrop-blur-sm border ${border} rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3`}
      role="status"
      aria-live="polite"
    >
      <ToastIcon variant={toast.variant} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-text-primary">{toast.title}</p>}
        <p className="text-sm text-text-secondary break-words">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-text-muted" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ message, title, variant = 'info', durationMs = 2500 }) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, title, variant }]);

      if (durationMs > 0) {
        window.setTimeout(() => dismiss(id), durationMs);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      push,
      info: (message, opts) => push({ message, variant: 'info', ...opts }),
      success: (message, opts) => push({ message, variant: 'success', ...opts }),
      error: (message, opts) => push({ message, variant: 'error', ...opts }),
      dismiss,
    }),
    [dismiss, push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        className="fixed left-0 right-0 bottom-0 z-[4000] flex flex-col items-center gap-2 p-4"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
