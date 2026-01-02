/**
 * Confirm Dialog Component
 * Confirmation modal for destructive actions
 */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmInput?: string; // If set, user must type this to confirm
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    icon: '⚠️',
    button: 'bg-red-500 hover:bg-red-600 text-white',
    iconBg: 'bg-red-500/20',
  },
  warning: {
    icon: '⚡',
    button: 'bg-amber-500 hover:bg-amber-600 text-black',
    iconBg: 'bg-amber-500/20',
  },
  info: {
    icon: 'ℹ️',
    button: 'bg-accent-primary hover:bg-accent-primary-hover text-white',
    iconBg: 'bg-accent-primary/20',
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  confirmInput,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  
  const styles = VARIANT_STYLES[variant];
  const canConfirm = !confirmInput || inputValue === confirmInput;

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md bg-bg-base border border-glass-border rounded-xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center text-2xl mb-4`}>
          {styles.icon}
        </div>

        {/* Title */}
        <h2 id="confirm-title" className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h2>

        {/* Message */}
        <p id="confirm-message" className="text-sm text-text-secondary mb-4">
          {message}
        </p>

        {/* Type-to-confirm input */}
        {confirmInput && (
          <div className="mb-4">
            <label className="block text-xs text-text-muted mb-2">
              Type <span className="font-mono text-text-primary bg-white/5 px-1 rounded">{confirmInput}</span> to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-glass-border rounded-lg text-text-primary text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
              placeholder={confirmInput}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-white/5 text-text-secondary border border-glass-border rounded-lg hover:bg-white/10 hover:text-text-primary transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${styles.button} ${
              !canConfirm ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Hook for managing confirm dialog
import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmInput?: string;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver?.(true);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolver?.(false);
  }, [resolver]);

  const Dialog = options ? (
    <ConfirmDialog
      isOpen={isOpen}
      {...options}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, Dialog };
}
