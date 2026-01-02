/**
 * Keyboard Shortcuts Help Panel
 * Displays available keyboard shortcuts grouped by category
 */
import { useState, useEffect } from 'react';
import { DEFAULT_SHORTCUTS, formatShortcut, type KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

const CATEGORY_LABELS: Record<string, string> = {
  navigation: '🧭 Navigation',
  actions: '⚡ Actions',
  documents: '📄 Documents',
};

const CATEGORY_ORDER = ['navigation', 'actions', 'documents'];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleHelpShortcut = () => setIsOpen((prev) => !prev);
    const handleEscape = () => setIsOpen(false);
    document.addEventListener('shortcut:help', handleHelpShortcut);
    document.addEventListener('shortcut:escape', handleEscape);
    return () => {
      document.removeEventListener('shortcut:help', handleHelpShortcut);
      document.removeEventListener('shortcut:escape', handleEscape);
    };
  }, []);

  if (!isOpen) return null;

  // Group shortcuts by category
  const grouped = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = DEFAULT_SHORTCUTS.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        className="bg-bg-base border border-glass-border rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-text-primary">⌨️ Keyboard Shortcuts</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            aria-label="Close shortcuts help"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {CATEGORY_ORDER.map((category) => (
            grouped[category]?.length > 0 && (
              <div key={category}>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="space-y-1 bg-bg-elevated rounded-lg p-2">
                  {grouped[category].map((shortcut, index) => (
                    <ShortcutRow key={index} shortcut={shortcut} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        <p className="text-xs text-text-muted mt-4 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-glass-border rounded text-text-secondary">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-glass-border rounded text-text-secondary">?</kbd> to toggle
        </p>
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/3">
      <span className="text-sm text-text-secondary">{shortcut.description}</span>
      <kbd className="px-2 py-1 bg-bg-base border border-glass-border rounded text-xs text-accent-primary font-mono">
        {formatShortcut(shortcut)}
      </kbd>
    </div>
  );
}

