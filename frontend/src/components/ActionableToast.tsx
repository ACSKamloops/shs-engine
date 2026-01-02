/**
 * Actionable Toast Component
 * Toast notifications with action buttons (View, Undo, Dismiss)
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, 0 = persistent
  actions?: ToastAction[];
  onDismiss: (id: string) => void;
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  error: 'bg-red-500/15 border-red-500/30 text-red-400',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  info: 'bg-accent-primary/15 border-accent-primary/30 text-accent-primary',
};

export function Toast({ id, message, type = 'info', duration = 5000, actions, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  }, [id, onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border glass-blur-sm shadow-lg transition-all duration-200 animate-slide-up ${
        TOAST_STYLES[type]
      } ${isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}
    >
      <span className="text-lg">{TOAST_ICONS[type]}</span>
      <span className="flex-1 text-sm font-medium text-text-primary">{message}</span>
      
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 ml-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                handleDismiss();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={handleDismiss}
        className="ml-2 p-1 rounded hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// Toast Container Component
interface ToastData extends Omit<ToastProps, 'onDismiss'> {}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm toast-stack">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

// Hook for managing toasts
let toastId = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, actions?: ToastAction[]) => {
    return addToast({ message, type: 'success', actions });
  }, [addToast]);

  const error = useCallback((message: string, actions?: ToastAction[]) => {
    return addToast({ message, type: 'error', duration: 0, actions });
  }, [addToast]);

  const warning = useCallback((message: string, actions?: ToastAction[]) => {
    return addToast({ message, type: 'warning', actions });
  }, [addToast]);

  const info = useCallback((message: string, actions?: ToastAction[]) => {
    return addToast({ message, type: 'info', actions });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onDismiss={removeToast} />,
  };
}
