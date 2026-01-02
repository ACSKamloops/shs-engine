/**
 * Upload progress store for tracking document uploads and processing queue
 */
import { create } from 'zustand';

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'done' | 'error';

export interface UploadItem {
  id: string;
  fileName: string;
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
  docId?: number; // After upload completes
}

interface UploadStore {
  items: UploadItem[];
  /** Add files to upload queue */
  addFiles: (files: File[]) => string[];
  /** Update item status */
  updateItem: (id: string, update: Partial<UploadItem>) => void;
  /** Remove completed/errored items */
  clearCompleted: () => void;
  /** Get count of active uploads */
  activeCount: () => number;
}

let nextId = 1;

export const useUploadStore = create<UploadStore>((set, get) => ({
  items: [],

  addFiles: (files) => {
    const ids: string[] = [];
    const newItems: UploadItem[] = files.map((f) => {
      const id = `upload-${nextId++}`;
      ids.push(id);
      return {
        id,
        fileName: f.name,
        status: 'pending',
        progress: 0,
      };
    });
    set((s) => ({ items: [...s.items, ...newItems] }));
    return ids;
  },

  updateItem: (id, update) => {
    set((s) => ({
      items: s.items.map((item) =>
        item.id === id ? { ...item, ...update } : item
      ),
    }));
  },

  clearCompleted: () => {
    set((s) => ({
      items: s.items.filter(
        (item) => item.status !== 'done' && item.status !== 'error'
      ),
    }));
  },

  activeCount: () => {
    const items = get().items;
    return items.filter(
      (item) => item.status === 'uploading' || item.status === 'processing'
    ).length;
  },
}));
