/**
 * Create Collection from Filter Button
 * Allows creating a collection from currently filtered docs
 */
import { useState } from 'react';

interface CreateCollectionButtonProps {
  docIds: number[];
  filterDescription?: string;
  className?: string;
  onCreated?: (name: string) => void;
}

export function CreateCollectionButton({
  docIds,
  filterDescription,
  className,
  onCreated,
}: CreateCollectionButtonProps) {
  const [creating, setCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || docIds.length === 0) return;

    setCreating(true);
    try {
      const res = await fetch('/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('apiKey') || 'dev-token',
        },
        body: JSON.stringify({
          name: name.trim(),
          doc_ids: docIds,
          description: filterDescription,
        }),
      });

      if (!res.ok) throw new Error('Failed to create collection');

      setShowDialog(false);
      setName('');
      onCreated?.(name.trim());
    } catch (error) {
      console.error('Create collection failed:', error);
      alert('Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  if (docIds.length === 0) return null;

  return (
    <div className={`relative ${className || ''}`}>
      <button
        onClick={() => setShowDialog(true)}
        className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-lg
                   hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
      >
        📁 Create Collection ({docIds.length})
      </button>

      {showDialog && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-white/10 rounded-xl p-4 shadow-xl z-50">
          <h4 className="text-sm font-semibold text-white mb-3">Create Collection</h4>
          
          <p className="text-xs text-slate-400 mb-3">
            {docIds.length} documents
            {filterDescription && ` from: ${filterDescription}`}
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name..."
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white mb-3"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowDialog(false)}
              className="flex-1 px-3 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="flex-1 px-3 py-2 text-xs font-medium bg-emerald-500 text-white rounded-lg
                         hover:bg-emerald-600 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCollectionButton;
