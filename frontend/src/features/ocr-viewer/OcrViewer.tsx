/**
 * OCR Viewer - Browse PDFs and their OCR results side-by-side
 */
import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useApi } from '../../hooks';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker with unpkg CDN (mirrors npm exactly)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface OcrFile {
  name: string;
  basename: string;
  pdf_size: number;
  ocr_size: number;
  status: 'completed' | 'pending' | 'skipped';
  mtime: number;
}

interface OcrPage {
  page: number;
  text: string;
}

interface OcrText {
  filename: string;
  status: string;
  content: string | null;
  pages?: OcrPage[];
  total_pages?: number;
  message?: string;
  char_count?: number;
}

export function OcrViewer() {
  const { api, useLiveApi } = useApi();
  const [files, setFiles] = useState<OcrFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<OcrFile | null>(null);
  const [ocrText, setOcrText] = useState<OcrText | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfKey, setPdfKey] = useState(0); // Key to force remount Document

  // Load file list
  const loadFiles = useCallback(async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}&limit=200` : '?limit=200';
      const data = await api<{ files: OcrFile[] }>(`/ocr/files${params}`);
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, [api, useLiveApi, statusFilter]);

  // Load OCR text for selected file (fetch all pages, then display current page)
  const loadOcrText = useCallback(async (file: OcrFile) => {
    if (!useLiveApi) return;
    try {
      const data = await api<OcrText>(`/ocr/text/${file.basename}`);
      setOcrText(data);
    } catch (err) {
      console.error('Failed to load OCR text:', err);
      setOcrText(null);
    }
  }, [api, useLiveApi]);

  // Get current page text from the loaded OCR data
  const currentPageText = ocrText?.pages?.find(p => p.page === currentPage)?.text || null;

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (selectedFile) {
      loadOcrText(selectedFile);
      setCurrentPage(1);
    }
  }, [selectedFile, loadOcrText]);

  const handleFileSelect = (file: OcrFile) => {
    setSelectedFile(file);
    setNumPages(0);
    setPdfError(null);
    setPdfKey(k => k + 1); // Force remount to avoid stale worker
  };

  const handlePrevFile = () => {
    if (!selectedFile) return;
    const idx = files.findIndex(f => f.name === selectedFile.name);
    if (idx > 0) setSelectedFile(files[idx - 1]);
  };

  const handleNextFile = () => {
    if (!selectedFile) return;
    const idx = files.findIndex(f => f.name === selectedFile.name);
    if (idx < files.length - 1) setSelectedFile(files[idx + 1]);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError(error.message || 'Failed to load PDF');
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'skipped': return '⚠️';
      default: return '❓';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pdfUrl = selectedFile 
    ? `/api/ocr/pdf/${encodeURIComponent(selectedFile.name)}`
    : null;

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">OCR Results Viewer</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-zinc-700 text-white text-sm border border-white/10"
          >
            <option value="">All Files</option>
            <option value="completed">✅ Completed</option>
            <option value="pending">⏳ Pending</option>
            <option value="skipped">⚠️ Skipped</option>
          </select>
          <span className="text-sm text-white/50">{files.length} files</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevFile}
            disabled={!selectedFile || files.indexOf(selectedFile) === 0}
            className="px-3 py-1.5 rounded bg-zinc-700 text-white text-sm disabled:opacity-30 hover:bg-zinc-600"
          >
            ◀ Prev
          </button>
          <button
            onClick={handleNextFile}
            disabled={!selectedFile || files.indexOf(selectedFile) === files.length - 1}
            className="px-3 py-1.5 rounded bg-zinc-700 text-white text-sm disabled:opacity-30 hover:bg-zinc-600"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File List Sidebar */}
        <div className="w-64 border-r border-white/10 bg-zinc-800/30 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-white/50 text-sm">Loading...</div>
          ) : (
            <div className="divide-y divide-white/5">
              {files.map((file) => (
                <div
                  key={file.name}
                  onClick={() => handleFileSelect(file)}
                  className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                    selectedFile?.name === file.name ? 'bg-cyan-500/20 border-l-2 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{statusIcon(file.status)}</span>
                    <span className="text-sm text-white truncate flex-1" title={file.basename}>
                      {file.basename}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 mt-1 ml-7">
                    {formatSize(file.pdf_size)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Panel */}
        <div className="flex-1 flex flex-col border-r border-white/10 bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-white/10">
            <span className="text-sm text-white/70">PDF Preview</span>
            {numPages > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 rounded bg-zinc-700 text-white text-xs disabled:opacity-30"
                >
                  ◀
                </button>
                <span className="text-xs text-white/70">
                  Page {currentPage} / {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                  disabled={currentPage >= numPages}
                  className="px-2 py-1 rounded bg-zinc-700 text-white text-xs disabled:opacity-30"
                >
                  ▶
                </button>
                <select
                  value={pdfScale}
                  onChange={(e) => setPdfScale(parseFloat(e.target.value))}
                  className="px-2 py-1 rounded bg-zinc-700 text-white text-xs ml-2"
                >
                  <option value="0.5">50%</option>
                  <option value="0.75">75%</option>
                  <option value="1">100%</option>
                  <option value="1.25">125%</option>
                  <option value="1.5">150%</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4 flex justify-center">
            {pdfError ? (
              <div className="flex flex-col items-center justify-center h-full text-red-400">
                <span className="text-2xl mb-2">⚠️</span>
                <p className="text-sm">{pdfError}</p>
                <button
                  onClick={() => setPdfKey(k => k + 1)}
                  className="mt-3 px-3 py-1.5 rounded bg-zinc-700 text-white text-sm hover:bg-zinc-600"
                >
                  Retry
                </button>
              </div>
            ) : pdfUrl ? (
              <Document
                key={pdfKey}
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-white/50 animate-pulse">Loading PDF...</div>}
              >
                {numPages > 0 && (
                  <Page
                    pageNumber={currentPage}
                    scale={pdfScale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={<div className="text-white/30">Loading page...</div>}
                    error={<div className="text-red-400 p-4">Failed to render page</div>}
                  />
                )}
              </Document>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30">
                Select a file to preview
              </div>
            )}
          </div>
        </div>

        {/* OCR Text Panel */}
        <div className="w-[400px] flex flex-col bg-zinc-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-white/10">
            <span className="text-sm text-white/70">OCR Text Output</span>
            {ocrText?.char_count && (
              <span className="text-xs text-white/40">{ocrText.char_count.toLocaleString()} chars</span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {ocrText ? (
              ocrText.status === 'completed' ? (
                <div>
                  {/* Page indicator */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                    <span className="text-xs text-cyan-400 font-medium">
                      📄 Page {currentPage} of {ocrText.total_pages || numPages}
                    </span>
                    {currentPageText && (
                      <span className="text-xs text-white/40">
                        {currentPageText.length.toLocaleString()} chars
                      </span>
                    )}
                  </div>
                  {/* Page text */}
                  <pre className="text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed">
                    {currentPageText || <span className="text-white/40 italic">No text extracted for this page</span>}
                  </pre>
                </div>
              ) : ocrText.status === 'skipped' ? (
                <div className="text-amber-400 text-sm">
                  <span className="text-2xl">⚠️</span>
                  <p className="mt-2">{ocrText.message}</p>
                </div>
              ) : (
                <div className="text-white/50 text-sm">
                  <span className="text-2xl">⏳</span>
                  <p className="mt-2">OCR processing pending...</p>
                </div>
              )
            ) : selectedFile ? (
              <div className="text-white/30">Loading OCR text...</div>
            ) : (
              <div className="text-white/30">Select a file to view OCR output</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OcrViewer;
