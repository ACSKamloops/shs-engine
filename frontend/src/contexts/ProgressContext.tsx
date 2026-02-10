/**
 * ProgressContext - Global Progress Tracking for Curriculum
 * Manages lesson completion, last visited, and progress persistence (Learn mode only)
 */
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';

// Types
export interface ProgressState {
  completedLessons: string[]; // Array of lessonIds
  currentLesson: string | null;
  lastVisited: {
    moduleId: string;
    unitId: string;
    lessonId: string;
    timestamp: number;
  } | null;
}

interface ProgressContextType {
  progress: ProgressState;
  isLessonComplete: (lessonId: string) => boolean;
  markComplete: (lessonId: string) => void;
  markIncomplete: (lessonId: string) => void;
  setLastVisited: (moduleId: string, unitId: string, lessonId: string) => void;
  getModuleProgress: (moduleId: string, lessonIds: string[]) => number; // Returns percentage 0-100
  resetProgress: () => void;
}

const STORAGE_KEY = 'shs_curriculum_progress';

const initialState: ProgressState = {
  completedLessons: [],
  currentLesson: null,
  lastVisited: null,
};

// Create context
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Load from localStorage
function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return initialState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...initialState,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn('Failed to load progress from localStorage:', e);
  }
  return initialState;
}

// Save to localStorage
function saveProgress(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
  }
}

// Provider component
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(loadProgress);

  // Persist to localStorage on change
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Check if a lesson is complete
  const isLessonComplete = useCallback((lessonId: string): boolean => {
    return progress.completedLessons.includes(lessonId);
  }, [progress.completedLessons]);

  // Mark a lesson as complete
  const markComplete = useCallback((lessonId: string): void => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      };
    });
  }, []);

  // Mark a lesson as incomplete (undo completion)
  const markIncomplete = useCallback((lessonId: string): void => {
    setProgress((prev) => ({
      ...prev,
      completedLessons: prev.completedLessons.filter((id) => id !== lessonId),
    }));
  }, []);

  // Set last visited lesson
  const setLastVisited = useCallback((moduleId: string, unitId: string, lessonId: string): void => {
    setProgress((prev) => ({
      ...prev,
      currentLesson: lessonId,
      lastVisited: {
        moduleId,
        unitId,
        lessonId,
        timestamp: Date.now(),
      },
    }));
  }, []);

  // Calculate module progress percentage
  const getModuleProgress = useCallback((_moduleId: string, lessonIds: string[]): number => {
    if (lessonIds.length === 0) return 0;
    const completedCount = lessonIds.filter((id) => 
      progress.completedLessons.includes(id)
    ).length;
    return Math.round((completedCount / lessonIds.length) * 100);
  }, [progress.completedLessons]);

  // Reset all progress
  const resetProgress = useCallback((): void => {
    setProgress(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: ProgressContextType = {
    progress,
    isLessonComplete,
    markComplete,
    markIncomplete,
    setLastVisited,
    getModuleProgress,
    resetProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// Hook to use progress context
export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

// Optional hook for checking if progress is available (use outside provider)
export function useProgressSafe(): ProgressContextType | null {
  const context = useContext(ProgressContext);
  return context ?? null;
}

export default ProgressContext;
