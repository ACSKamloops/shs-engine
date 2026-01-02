/**
 * Saved Filters Panel
 * UI for managing saved spatial and search filters
 */
import { useState } from 'react';
import { useSavedFiltersStore } from '../../store/savedFiltersStore';

interface SavedFiltersPanelProps {
  currentGeometry?: string | null;
  currentTheme?: string;
  currentDateRange?: { start: string; end: string };
  onApplyFilter: (filter: {
    geometry?: string;
    theme?: string;
    dateRange?: { start: string; end: string };
  }) => void;
}

export function SavedFiltersPanel({
  currentGeometry,
  currentTheme,
  currentDateRange,
  onApplyFilter,
}: SavedFiltersPanelProps) {
  const { filters, addFilter, removeFilter, clearAll } = useSavedFiltersStore();
  const [newName, setNewName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleSave = () => {
    if (!newName.trim()) return;
    
    addFilter({
      name: newName.trim(),
      geometry: currentGeometry || undefined,
      theme: currentTheme,
      dateRange: currentDateRange,
    });
    
    setNewName('');
    setShowSave(false);
  };

  const handleApply = (filter: typeof filters[0]) => {
    onApplyFilter({
      geometry: filter.geometry,
      theme: filter.theme,
      dateRange: filter.dateRange,
    });
  };

  const hasActiveFilter = currentGeometry || currentTheme || (currentDateRange?.start || currentDateRange?.end);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-white/80">💾 Saved Filters</h5>
        {hasActiveFilter && !showSave && (
          <button
            onClick={() => setShowSave(true)}
            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30"
          >
            Save Current
          </button>
        )}
      </div>

      {/* Save dialog */}
      {showSave && (
        <div className="mb-3 p-2 bg-white/5 rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Filter name..."
            className="w-full px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-white mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!newName.trim()}
              className="flex-1 px-2 py-1 text-xs bg-purple-500 text-white rounded disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setShowSave(false)}
              className="px-2 py-1 text-xs text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters list */}
      {filters.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-4">No saved filters</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{filter.name}</p>
                <p className="text-[10px] text-white/40">
                  {filter.geometry && '📍 '}
                  {filter.theme && `${filter.theme} `}
                  {filter.dateRange?.start && `${filter.dateRange.start}-${filter.dateRange.end}`}
                </p>
              </div>
              <button
                onClick={() => handleApply(filter)}
                className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Apply
              </button>
              <button
                onClick={() => removeFilter(filter.id)}
                className="px-1.5 py-1 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {filters.length > 0 && (
        <button
          onClick={clearAll}
          className="w-full mt-2 px-2 py-1 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

export default SavedFiltersPanel;
