/**
 * Global app state store
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // API config
  apiBase: string;
  apiKey: string;
  useLiveApi: boolean;
  
  // UI state
  banner: string | null;
  loading: boolean;
  uploading: boolean;
  showTour: boolean;
  tourStep: number;
  showDevPanel: boolean;
  showConfidence: boolean;
  showMapHelp: boolean;
  
  // Notices (auto-clear toasts)
  copyNotice: string | null;
  uploadNotice: string | null;
  kmlNotice: string | null;
  
  // LLM scratchpad
  llmPrompt: string;
  llmOutput: string | null;
  llmError: string | null;
  llmLoading: boolean;
  
  // Actions
  setApiBase: (base: string) => void;
  setApiKey: (key: string) => void;
  setUseLiveApi: (use: boolean) => void;
  setBanner: (msg: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUploading: (uploading: boolean) => void;
  setShowTour: (show: boolean) => void;
  setTourStep: (step: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  setShowDevPanel: (show: boolean) => void;
  setShowConfidence: (show: boolean) => void;
  setShowMapHelp: (show: boolean) => void;
  setCopyNotice: (msg: string | null) => void;
  setUploadNotice: (msg: string | null) => void;
  setKmlNotice: (msg: string | null) => void;
  setLlmPrompt: (prompt: string) => void;
  setLlmOutput: (output: string | null) => void;
  setLlmError: (error: string | null) => void;
  setLlmLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Defaults
      apiBase: '/api',
      apiKey: 'dev-token',
      useLiveApi: true,
      banner: null,
      loading: false,
      uploading: false,
      showTour: false,
      tourStep: 0,
      showDevPanel: false,
      showConfidence: true,
      showMapHelp: false,
      copyNotice: null,
      uploadNotice: null,
      kmlNotice: null,
      llmPrompt: 'Summarize the mission frame in 2 bullets.',
      llmOutput: null,
      llmError: null,
      llmLoading: false,

      // Actions
      setApiBase: (base) => set({ apiBase: base }),
      setApiKey: (key) => set({ apiKey: key }),
      setUseLiveApi: (use) => set({ useLiveApi: use }),
      setBanner: (msg) => set({ banner: msg }),
      setLoading: (loading) => set({ loading }),
      setUploading: (uploading) => set({ uploading }),
      setShowTour: (show) => set({ showTour: show }),
      setTourStep: (step) => set({ tourStep: step }),
      nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
      prevTourStep: () => set((state) => ({ tourStep: Math.max(0, state.tourStep - 1) })),
      setShowDevPanel: (show) => set({ showDevPanel: show }),
      setShowConfidence: (show) => set({ showConfidence: show }),
      setShowMapHelp: (show) => set({ showMapHelp: show }),
      setCopyNotice: (msg) => set({ copyNotice: msg }),
      setUploadNotice: (msg) => set({ uploadNotice: msg }),
      setKmlNotice: (msg) => set({ kmlNotice: msg }),
      setLlmPrompt: (prompt) => set({ llmPrompt: prompt }),
      setLlmOutput: (output) => set({ llmOutput: output }),
      setLlmError: (error) => set({ llmError: error }),
      setLlmLoading: (loading) => set({ llmLoading: loading }),
    }),
    {
      name: 'pukaist-app-store',
      partialize: (state) => ({
        useLiveApi: state.useLiveApi,
        showConfidence: state.showConfidence,
      }),
    }
  )
);
