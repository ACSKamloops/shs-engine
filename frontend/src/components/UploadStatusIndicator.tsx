/**
 * Upload Status Indicator - Shows active upload progress
 */
import { useUploadStore, type UploadStatus } from '../store/useUploadStore';

const statusColors: Record<UploadStatus, string> = {
  pending: 'bg-slate-500',
  uploading: 'bg-cyan-500',
  processing: 'bg-amber-500',
  done: 'bg-emerald-500',
  error: 'bg-red-500',
};

const statusIcons: Record<UploadStatus, string> = {
  pending: '⏳',
  uploading: '📤',
  processing: '⚙️',
  done: '✓',
  error: '✕',
};

export function UploadStatusIndicator() {
  const items = useUploadStore((s) => s.items);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);
  
  const active = items.filter((i) => i.status === 'uploading' || i.status === 'processing');
  const completed = items.filter((i) => i.status === 'done' || i.status === 'error');
  
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">
          {active.length > 0 ? `Processing ${active.length} file(s)...` : 'Processing Complete'}
        </span>
        {completed.length > 0 && (
          <button
            onClick={clearCompleted}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
      
      {/* Items */}
      <div className="max-h-48 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-3 py-2 border-b border-white/5 last:border-0 flex items-center gap-2"
          >
            <span className="text-sm">{statusIcons[item.status]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{item.fileName}</p>
              {item.status === 'uploading' && (
                <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${statusColors[item.status]} transition-all`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              {item.error && (
                <p className="text-xs text-red-400 truncate">{item.error}</p>
              )}
            </div>
            <span
              className={`w-2 h-2 rounded-full ${statusColors[item.status]} ${
                item.status === 'uploading' || item.status === 'processing'
                  ? 'animate-pulse'
                  : ''
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
