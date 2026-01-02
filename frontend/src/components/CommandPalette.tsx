/**
 * Command Palette Component
 * Linear/Notion-style Cmd+K command palette with fuzzy search
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: CommandItem[];
}

// Fuzzy search implementation
function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === queryLower.length;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < text.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      if (lastIndex < i) {
        result.push(text.slice(lastIndex, i));
      }
      result.push(<mark key={i} className="bg-accent-primary/30 text-text-primary rounded">{text[i]}</mark>);
      lastIndex = i + 1;
      queryIndex++;
    }
  }
  
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  
  return result;
}

// Default navigation commands
function useDefaultCommands(): CommandItem[] {
  const navigate = useNavigate();
  
  return useMemo(() => [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: <span className="text-lg">🏠</span>,
      shortcut: 'G D',
      action: () => navigate('/'),
    },
    {
      id: 'nav-documents',
      label: 'Go to Documents',
      category: 'Navigation',
      icon: <span className="text-lg">📄</span>,
      shortcut: 'G O',
      action: () => navigate('/documents'),
    },
    {
      id: 'nav-map',
      label: 'Go to Map Explorer',
      category: 'Navigation',
      icon: <span className="text-lg">🗺️</span>,
      shortcut: 'G M',
      action: () => navigate('/map'),
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      category: 'Navigation',
      icon: <span className="text-lg">⚙️</span>,
      shortcut: 'G S',
      action: () => navigate('/settings'),
    },
    {
      id: 'nav-admin',
      label: 'Go to Admin Console',
      category: 'Navigation',
      icon: <span className="text-lg">🛠️</span>,
      shortcut: 'G A',
      action: () => navigate('/admin'),
    },
    {
      id: 'action-wizard',
      label: 'Open Project Wizard',
      category: 'Actions',
      icon: <span className="text-lg">⚡</span>,
      shortcut: 'N',
      action: () => document.dispatchEvent(new CustomEvent('shortcut:new-wizard')),
    },
    {
      id: 'action-search',
      label: 'Focus Search',
      category: 'Actions',
      icon: <span className="text-lg">🔍</span>,
      shortcut: '/',
      action: () => {
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
        input?.focus();
      },
    },
    {
      id: 'action-shortcuts',
      label: 'Show Keyboard Shortcuts',
      category: 'Actions',
      icon: <span className="text-lg">⌨️</span>,
      shortcut: 'Shift ?',
      action: () => document.dispatchEvent(new CustomEvent('shortcut:help')),
    },
  ], [navigate]);
}

export function CommandPalette({ isOpen, onClose, commands: customCommands = [] }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const defaultCommands = useDefaultCommands();
  const allCommands = useMemo(() => [...defaultCommands, ...customCommands], [defaultCommands, customCommands]);
  
  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;
    return allCommands.filter(cmd => 
      fuzzyMatch(cmd.label, query) || 
      (cmd.description && fuzzyMatch(cmd.description, query)) ||
      (cmd.category && fuzzyMatch(cmd.category, query))
    );
  }, [allCommands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filteredCommands) {
      const category = cmd.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  const flatCommands = useMemo(() => 
    Object.values(groupedCommands).flat(),
    [groupedCommands]
  );

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [flatCommands, selectedIndex, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-bg-base/95 glass-blur-lg border border-glass-border rounded-xl shadow-2xl overflow-hidden animate-spring-in animate-spotlight"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Spotlight gradient overlay */}
        <div className="absolute inset-0 command-palette-spotlight pointer-events-none" />
        
        {/* Search Input */}
        <div className="relative flex items-center gap-3 px-4 py-3 border-b border-glass-border">
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-sm"
            autoComplete="off"
          />
          <kbd className="px-2 py-1 text-xs text-text-muted bg-white/5 rounded border border-glass-border">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {flatCommands.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              No commands found
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                  {category}
                </div>
                {commands.map((cmd) => {
                  const globalIndex = flatCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <button
                      key={cmd.id}
                      data-index={globalIndex}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected 
                          ? 'bg-accent-primary/15 text-text-primary' 
                          : 'text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      {cmd.icon && <span className="w-6 text-center">{cmd.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {highlightMatch(cmd.label, query)}
                        </div>
                        {cmd.description && (
                          <div className="text-xs text-text-muted truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 text-[10px] text-text-muted bg-white/5 rounded border border-glass-border font-mono">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-glass-border text-[10px] text-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 rounded">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white/5 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 rounded">↵</kbd>
              to select
            </span>
          </div>
          <span>
            {flatCommands.length} command{flatCommands.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
