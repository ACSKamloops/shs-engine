/**
 * Collection Export Button
 * Allows exporting collection documents as Markdown or PDF reports with geo context
 */
import { useState } from 'react';

interface CollectionExportButtonProps {
  collectionName: string;
  className?: string;
}

export function CollectionExportButton({ collectionName, className }: CollectionExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    format: 'markdown',
    include_summaries: true,
    include_key_quotes: true,
    include_metadata: true,
    include_geo_context: true,
    group_by: null as string | null,
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/collections/${encodeURIComponent(collectionName)}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('apiKey') || 'dev-token',
        },
        body: JSON.stringify(options),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const ext = options.format === 'pdf' ? 'pdf' : 'md';
      const filename = `${collectionName}_report.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowOptions(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-3 py-1.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-lg
                   hover:bg-purple-500/30 transition-colors flex items-center gap-1.5"
      >
        📥 Export Report
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-white/10 rounded-xl p-4 shadow-xl z-50">
          <h4 className="text-sm font-semibold text-white mb-3">Export Options</h4>

          {/* Format */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">Format</label>
            <div className="flex gap-2">
              {['markdown', 'pdf'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOptions({ ...options, format: fmt })}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                    options.format === fmt ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Group By */}
          <div className="mb-3">
            <label className="text-xs text-slate-400 block mb-1">Group By</label>
            <select
              value={options.group_by || ''}
              onChange={(e) => setOptions({ ...options, group_by: e.target.value || null })}
              className="w-full px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-300"
            >
              <option value="">None</option>
              <option value="theme">Theme</option>
              <option value="breach_category">Breach Category</option>
              <option value="inferred_date">Date</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-1.5 mb-4">
            {[
              { key: 'include_summaries', label: 'Summaries' },
              { key: 'include_key_quotes', label: 'Key Quotes' },
              { key: 'include_metadata', label: 'Metadata' },
              { key: 'include_geo_context', label: 'Geo Context (Treaty/Reserve)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={options[key as keyof typeof options] as boolean}
                  onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                  className="rounded border-slate-600"
                />
                {label}
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => setShowOptions(false)} className="flex-1 px-3 py-2 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 px-3 py-2 text-xs font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
