/**
 * Undo Snackbar Component
 * Timed undo notification for reversible actions
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface UndoAction {
  id: string;
  message: string;
  duration?: number; // ms
  onUndo: () => void;
  onExpire?: () => void;
}

interface UndoSnackbarProps {
  action: UndoAction | null;
  onDismiss: () => void;
}

export function UndoSnackbar({ action, onDismiss }: UndoSnackbarProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const startTimeRef = useRef<number>(0);
  const duration = action?.duration || 5000;

  useEffect(() => {
    if (!action) return;

    startTimeRef.current = Date.now();
    setProgress(100);
    setIsExiting(false);

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        action.onExpire?.();
        handleDismiss();
      }
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [action, duration]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  const handleUndo = useCallback(() => {
    action?.onUndo();
    handleDismiss();
  }, [action, handleDismiss]);

  if (!action) return null;

  return createPortal(
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center gap-4 px-4 py-3 bg-bg-elevated border border-glass-border rounded-lg shadow-2xl min-w-[300px]">
        <span className="flex-1 text-sm text-text-primary">{action.message}</span>
        
        <button
          onClick={handleUndo}
          className="px-3 py-1.5 text-sm font-semibold text-accent-primary hover:text-accent-primary-hover transition-colors"
        >
          Undo
        </button>
        
        <button
          onClick={handleDismiss}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-accent-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>,
    document.body
  );
}

// Hook for managing undo actions
let undoId = 0;

export function useUndo() {
  const [currentAction, setCurrentAction] = useState<UndoAction | null>(null);
  const pendingActionsRef = useRef<Map<string, () => void>>(new Map());

  const showUndo = useCallback((
    message: string,
    onUndo: () => void,
    onConfirm?: () => void, // Called when undo expires (action is confirmed)
    duration = 5000
  ): string => {
    const id = `undo-${++undoId}`;
    
    // Store the confirm action
    if (onConfirm) {
      pendingActionsRef.current.set(id, onConfirm);
    }

    setCurrentAction({
      id,
      message,
      duration,
      onUndo: () => {
        pendingActionsRef.current.delete(id);
        onUndo();
      },
      onExpire: () => {
        const confirmAction = pendingActionsRef.current.get(id);
        if (confirmAction) {
          confirmAction();
          pendingActionsRef.current.delete(id);
        }
      },
    });

    return id;
  }, []);

  const dismiss = useCallback(() => {
    if (currentAction) {
      // Trigger expire when dismissed
      currentAction.onExpire?.();
    }
    setCurrentAction(null);
  }, [currentAction]);

  return {
    currentAction,
    showUndo,
    dismiss,
    UndoSnackbar: () => <UndoSnackbar action={currentAction} onDismiss={dismiss} />,
  };
}

// Example usage helper
export function useDeletionWithUndo<T>(
  items: T[],
  setItems: (items: T[]) => void,
  getItemLabel: (item: T) => string
) {
  const { showUndo, UndoSnackbar } = useUndo();

  const deleteItem = useCallback((item: T) => {
    const itemIndex = items.indexOf(item);
    if (itemIndex === -1) return;

    // Optimistically remove
    const newItems = items.filter((_, i) => i !== itemIndex);
    setItems(newItems);

    // Show undo snackbar
    showUndo(
      `Deleted "${getItemLabel(item)}"`,
      () => {
        // Restore on undo
        const restored = [...newItems];
        restored.splice(itemIndex, 0, item);
        setItems(restored);
      },
      () => {
        // This is where you'd make the actual API call to delete
        console.log('Deletion confirmed:', item);
      }
    );
  }, [items, setItems, getItemLabel, showUndo]);

  return { deleteItem, UndoSnackbar };
}
