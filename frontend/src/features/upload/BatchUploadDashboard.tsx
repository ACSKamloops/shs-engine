/**
 * Batch Upload Dashboard
 * Bulk upload progress and status management
 * Inspired by Filestack batch processing UX
 */
import { useState, useCallback } from 'react';
import { useUploadStore, type UploadItem } from '../../store/useUploadStore';
import { useApi } from '../../hooks';
import { usePipelineStore } from '../../store/usePipelineStore';

export function BatchUploadDashboard() {
  const items = useUploadStore((s) => s.items);
  const addFiles = useUploadStore((s) => s.addFiles);
  const updateItem = useUploadStore((s) => s.updateItem);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);
  
  const { uploadDocs } = useApi();
  const toIntent = usePipelineStore((s) => s.toIntent);
  
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = useCallback(async (files: File[]) => {
    const ids = addFiles(files);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = ids[i];
      
      updateItem(id, { status: 'uploading', progress: 10 });
      
      try {
        // Simulate upload progress
        updateItem(id, { progress: 50 });
        
        const intent = toIntent() as Record<string, unknown>;
        await uploadDocs([file], 'batch', intent);
        
        updateItem(id, { 
          status: 'done', 
          progress: 100
        });
      } catch (err) {
        updateItem(id, { 
          status: 'error',
          error: err instanceof Error ? err.message : 'Upload failed'
        });
      }
    }
  }, [addFiles, updateItem, uploadDocs, toIntent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      void handleUpload(files);
    }
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      void handleUpload(files);
    }
  }, [handleUpload]);

  const completedCount = items.filter((i) => i.status === 'done').length;
  const errorCount = items.filter((i) => i.status === 'error').length;
  const pendingCount = items.filter((i) => i.status === 'uploading' || i.status === 'processing' || i.status === 'pending').length;
  const totalProgress = items.length > 0
    ? Math.round(items.reduce((sum, i) => sum + i.progress, 0) / items.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragOver 
            ? 'border-cyan-400 bg-cyan-500/10' 
            : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="batch-upload-input"
        />
        <label htmlFor="batch-upload-input" className="cursor-pointer">
          <div className="text-3xl mb-2">📁</div>
          <p className="text-white/80">Drop files here or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">
            PDF, DOCX, images, KMZ - up to 50 files at once
          </p>
        </label>
      </div>

      {/* Summary Bar */}
      {items.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white">
              <strong>{items.length}</strong> files
            </span>
            {completedCount > 0 && (
              <span className="text-emerald-400">✅ {completedCount} done</span>
            )}
            {pendingCount > 0 && (
              <span className="text-cyan-400">⏳ {pendingCount} processing</span>
            )}
            {errorCount > 0 && (
              <span className="text-red-400">❌ {errorCount} failed</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{totalProgress}%</span>
          </div>
        </div>
      )}

      {/* File List */}
      {items.length > 0 && (
        <div className="max-h-64 overflow-y-auto space-y-1">
          {items.map((item) => (
            <FileRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Actions */}
      {items.length > 0 && completedCount > 0 && (
        <button
          type="button"
          onClick={clearCompleted}
          className="w-full py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg"
        >
          Clear Completed
        </button>
      )}
    </div>
  );
}

function FileRow({ item }: { item: UploadItem }) {
  const statusIcons = {
    pending: '⏸️',
    uploading: '⬆️',
    processing: '⚙️',
    done: '✅',
    error: '❌',
  };

  const statusColors = {
    pending: 'text-slate-400',
    uploading: 'text-cyan-400',
    processing: 'text-amber-400',
    done: 'text-emerald-400',
    error: 'text-red-400',
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
      <span className="text-lg">{statusIcons[item.status]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{item.fileName}</p>
        {item.error && (
          <p className="text-xs text-red-400 truncate">{item.error}</p>
        )}
        {item.status === 'uploading' && (
          <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>
      <span className={`text-xs ${statusColors[item.status]}`}>
        {item.status === 'done' && item.docId ? `#${item.docId}` : item.status}
      </span>
    </div>
  );
}
