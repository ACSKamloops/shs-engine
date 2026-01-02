/**
 * Pukaist Embed Widget
 * Lightweight embeddable upload component for external sites
 * 
 * Usage:
 * <script src="https://api.pukaist.io/embed.js"
 *         data-api-key="pk_..."
 *         data-theme="claims"
 *         data-container="#upload-zone">
 * </script>
 */
import { useState, useCallback } from 'react';

export interface EmbedConfig {
  apiKey?: string;
  apiUrl?: string;
  theme?: string;
  containerId?: string;
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (file: File, progress: number) => void;
  onUploadComplete?: (file: File, docId: number) => void;
  onUploadError?: (file: File, error: string) => void;
  styles?: {
    primaryColor?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
}

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'done' | 'error';
  error?: string;
  docId?: number;
}

export function EmbedUploader({ config }: { config: EmbedConfig }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const apiUrl = config.apiUrl || '/api';
  const theme = config.theme || 'default';

  const uploadFile = useCallback(async (file: File) => {
    const uploadIndex = uploads.length;
    
    setUploads((prev) => [
      ...prev,
      { file, progress: 0, status: 'uploading' },
    ]);

    config.onUploadStart?.(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('theme', theme);

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const docId = result.doc_id || result.id;

      setUploads((prev) =>
        prev.map((u, i) =>
          i === uploadIndex ? { ...u, status: 'done', progress: 100, docId } : u
        )
      );

      config.onUploadComplete?.(file, docId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      
      setUploads((prev) =>
        prev.map((u, i) =>
          i === uploadIndex ? { ...u, status: 'error', error: errorMsg } : u
        )
      );

      config.onUploadError?.(file, errorMsg);
    }
  }, [apiUrl, config, theme, uploads.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => void uploadFile(file));
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => void uploadFile(file));
  }, [uploadFile]);

  const primaryColor = config.styles?.primaryColor || '#06b6d4';
  const borderRadius = config.styles?.borderRadius || '12px';
  const fontFamily = config.styles?.fontFamily || 'system-ui, sans-serif';

  return (
    <div
      style={{
        fontFamily,
        padding: '16px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius,
        border: `2px dashed ${isDragOver ? primaryColor : '#374151'}`,
        transition: 'all 0.2s ease',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="pukaist-file-input"
        />
        <label
          htmlFor="pukaist-file-input"
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            {isDragOver ? 'Drop files here...' : 'Drag & drop files or click to browse'}
          </p>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
            PDF, DOCX, images, KMZ
          </p>
        </label>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #374151', paddingTop: '16px' }}>
          {uploads.map((upload, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                background: '#1e293b',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {upload.status === 'uploading' && '⏳'}
                {upload.status === 'done' && '✅'}
                {upload.status === 'error' && '❌'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {upload.file?.name}
                </p>
                {upload.status === 'uploading' && (
                  <div style={{ height: '4px', background: '#374151', borderRadius: '2px', marginTop: '4px' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${upload.progress}%`,
                        background: primaryColor,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
                {upload.error && (
                  <p style={{ color: '#f87171', fontSize: '11px', margin: '4px 0 0' }}>{upload.error}</p>
                )}
              </div>
              {upload.docId && (
                <span style={{ color: '#64748b', fontSize: '11px' }}>#{upload.docId}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Branding */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <span style={{ color: '#475569', fontSize: '10px' }}>
          Powered by Pukaist Engine
        </span>
      </div>
    </div>
  );
}

/**
 * Auto-initialize when script is loaded with data attributes
 */
export function initEmbed(): void {
  if (typeof window === 'undefined') return;

  const scripts = document.querySelectorAll('script[data-pukaist]');
  scripts.forEach((script) => {
    const config: EmbedConfig = {
      apiKey: script.getAttribute('data-api-key') || undefined,
      apiUrl: script.getAttribute('data-api-url') || undefined,
      theme: script.getAttribute('data-theme') || undefined,
      containerId: script.getAttribute('data-container') || undefined,
    };

    const containerId = config.containerId;
    if (containerId) {
      const container = document.querySelector(containerId);
      if (container) {
        // Would need React DOM to render - this is the hook point
        console.log('[Pukaist] Embed initialized for', containerId, config);
      }
    }
  });
}
