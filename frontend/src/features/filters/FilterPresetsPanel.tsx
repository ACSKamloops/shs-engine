/**
 * Filter Presets Panel
 * Save and load filter configurations
 */
import { useState } from 'react';
import { useFilterPresetsStore, type FilterPreset } from '../../store/useFilterPresetsStore';
import { useAppStore } from '../../store';

interface FilterPresetsPanelProps {
  currentFilters: FilterPreset['filters'];
  onApplyPreset: (filters: FilterPreset['filters']) => void;
}

export function FilterPresetsPanel({ currentFilters, onApplyPreset }: FilterPresetsPanelProps) {
  const presets = useFilterPresetsStore((s) => s.presets);
  const addPreset = useFilterPresetsStore((s) => s.addPreset);
  const removePreset = useFilterPresetsStore((s) => s.removePreset);
  const setBanner = useAppStore((s) => s.setBanner);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    if (newName.trim()) {
      addPreset(newName.trim(), currentFilters);
      setNewName('');
      setIsAdding(false);
      setBanner(`Saved preset: ${newName.trim()}`);
    }
  };

  const handleApply = (preset: FilterPreset) => {
    onApplyPreset(preset.filters);
    setBanner(`Applied preset: ${preset.name}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wide">
          📁 Filter Presets
        </h4>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-cyan-400 hover:text-cyan-300"
        >
          {isAdding ? 'Cancel' : '+ Save Current'}
        </button>
      </div>

      {/* Save New Preset */}
      {isAdding && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 px-2 py-1 text-sm bg-white/10 text-white rounded border border-white/10"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!newName.trim()}
            className="px-3 py-1 text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded"
          >
            Save
          </button>
        </div>
      )}

      {/* Presets List */}
      {presets.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-2">
          No saved presets. Click "Save Current" to create one.
        </p>
      ) : (
        <div className="space-y-1">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 group"
            >
              <button
                type="button"
                onClick={() => handleApply(preset)}
                className="text-sm text-white flex-1 text-left"
              >
                {preset.name}
              </button>
              <button
                type="button"
                onClick={() => removePreset(preset.id)}
                className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
