/**
 * Collections Panel
 * View, create, and manage document collections
 */
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { useDocsStore } from '../../store';

interface Collection {
  name: string;
  tenant_id?: string;
  doc_ids: number[];
}

export function CollectionsPanel() {
  const docs = useDocsStore((s) => s.docs);
  const selectedId = useDocsStore((s) => s.selectedId);
  const { listCollections, createCollection, deleteCollection, addToCollection, removeFromCollection } = useApi();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const cols = await listCollections();
    setCollections(cols);
    setLoading(false);
  }, [listCollections]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const docIds = selectedId ? [selectedId] : [];
    await createCollection(newName.trim(), docIds);
    setNewName('');
    setShowCreate(false);
    refresh();
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete collection "${name}"?`)) return;
    await deleteCollection(name);
    if (selectedCollection === name) setSelectedCollection(null);
    refresh();
  };

  const handleAddSelected = async (name: string) => {
    if (!selectedId) return;
    await addToCollection(name, selectedId);
    refresh();
  };

  const handleRemoveDoc = async (name: string, docId: number) => {
    await removeFromCollection(name, docId);
    refresh();
  };

  const selectedCol = collections.find((c) => c.name === selectedCollection);
  const selectedDocs = selectedCol ? docs.filter((d) => selectedCol.doc_ids.includes(d.id)) : [];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          📚 Collections
          {loading && <span className="animate-pulse text-white/40">...</span>}
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30"
        >
          + New
        </button>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name..."
            className="w-full px-2 py-1.5 text-sm bg-white/10 border border-white/10 rounded text-white mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="flex-1 px-3 py-1.5 text-xs bg-purple-500 text-white rounded disabled:opacity-50"
            >
              Create {selectedId && '& Add Selected'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collections list */}
      {collections.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-6">No collections yet</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {collections.map((col) => (
            <div
              key={col.name}
              className={`p-2 rounded-lg cursor-pointer transition-colors group ${
                selectedCollection === col.name
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setSelectedCollection(selectedCollection === col.name ? null : col.name)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{col.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">{col.doc_ids.length} docs</span>
                  {selectedId && !col.doc_ids.includes(selectedId) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddSelected(col.name); }}
                      className="px-1.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded opacity-0 group-hover:opacity-100"
                    >
                      + Add
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(col.name); }}
                    className="px-1.5 py-0.5 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected collection docs */}
      {selectedCol && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-xs font-medium text-white/60 mb-2">Documents in "{selectedCol.name}"</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-1 px-2 bg-white/5 rounded text-xs group">
                <span className="text-white/80 truncate">{doc.title}</span>
                <button
                  onClick={() => handleRemoveDoc(selectedCol.name, doc.id)}
                  className="text-red-400 opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
            {selectedDocs.length === 0 && (
              <p className="text-xs text-white/40 text-center py-2">Empty collection</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionsPanel;
