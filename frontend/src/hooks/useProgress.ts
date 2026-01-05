/**
 * useProgress - Learning Progress Tracking Hook
 * 
 * Stores user learning progress in localStorage:
 * - Pathway completion percentages
 * - Module/unit/lesson tracking
 * - Learning streaks
 * 
 * Note: For visual progress only (no auth required)
 */
import { useState, useEffect, useCallback } from 'react';

// Progress data structure
interface LessonProgress {
  viewedAt: string;
  completed: boolean;
}

interface UnitProgress {
  lessons: Record<string, LessonProgress>;
  completedAt?: string;
}

interface ModuleProgress {
  units: Record<string, UnitProgress>;
  lastAccessed?: string;
}

interface PathwayProgress {
  modules: Record<string, ModuleProgress>;
}

interface ProgressData {
  pathways: Record<string, PathwayProgress>;
  streak: {
    currentDays: number;
    lastVisit: string;
  };
  totalLessonsViewed: number;
  firstVisit?: string;
}

const STORAGE_KEY = 'shs_learning_progress';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Default progress structure
const getDefaultProgress = (): ProgressData => ({
  pathways: {
    land: { modules: {} },
    mind: { modules: {} },
    heart: { modules: {} },
    spirit: { modules: {} },
  },
  streak: {
    currentDays: 0,
    lastVisit: '',
  },
  totalLessonsViewed: 0,
});

// Load progress from localStorage
const loadProgress = (): ProgressData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load progress:', e);
  }
  return getDefaultProgress();
};

// Save progress to localStorage
const saveProgress = (progress: ProgressData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
};

// Hook for managing learning progress
export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(getDefaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const loaded = loadProgress();
    
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = loaded.streak.lastVisit;
    
    if (lastVisit) {
      const lastDate = new Date(lastVisit);
      const todayDate = new Date(today);
      const diff = todayDate.getTime() - lastDate.getTime();
      
      if (diff > ONE_DAY_MS && diff < ONE_DAY_MS * 2) {
        // Consecutive day - increment streak
        loaded.streak.currentDays += 1;
      } else if (diff >= ONE_DAY_MS * 2) {
        // More than 1 day gap - reset streak
        loaded.streak.currentDays = 1;
      }
      // Same day - don't change streak
    } else {
      // First visit ever
      loaded.streak.currentDays = 1;
      loaded.firstVisit = today;
    }
    
    loaded.streak.lastVisit = today;
    setProgress(loaded);
    saveProgress(loaded);
    setIsLoaded(true);
  }, []);

  // Mark a lesson as viewed
  const markLessonViewed = useCallback((
    pathwayId: string,
    moduleId: string,
    unitId: string,
    lessonId: string
  ) => {
    setProgress(prev => {
      const updated = { ...prev };
      const now = new Date().toISOString();
      
      // Ensure pathway exists
      if (!updated.pathways[pathwayId]) {
        updated.pathways[pathwayId] = { modules: {} };
      }
      
      // Ensure module exists
      if (!updated.pathways[pathwayId].modules[moduleId]) {
        updated.pathways[pathwayId].modules[moduleId] = { units: {} };
      }
      updated.pathways[pathwayId].modules[moduleId].lastAccessed = now;
      
      // Ensure unit exists
      if (!updated.pathways[pathwayId].modules[moduleId].units[unitId]) {
        updated.pathways[pathwayId].modules[moduleId].units[unitId] = { lessons: {} };
      }
      
      // Mark lesson as viewed
      if (!updated.pathways[pathwayId].modules[moduleId].units[unitId].lessons[lessonId]) {
        updated.pathways[pathwayId].modules[moduleId].units[unitId].lessons[lessonId] = {
          viewedAt: now,
          completed: true,
        };
        updated.totalLessonsViewed += 1;
      }
      
      saveProgress(updated);
      return updated;
    });
  }, []);

  // Mark an entire unit as completed
  const markUnitCompleted = useCallback((
    pathwayId: string,
    moduleId: string,
    unitId: string
  ) => {
    setProgress(prev => {
      const updated = { ...prev };
      const now = new Date().toISOString();
      
      // Ensure pathway/module/unit exist
      if (!updated.pathways[pathwayId]) {
        updated.pathways[pathwayId] = { modules: {} };
      }
      if (!updated.pathways[pathwayId].modules[moduleId]) {
        updated.pathways[pathwayId].modules[moduleId] = { units: {} };
      }
      if (!updated.pathways[pathwayId].modules[moduleId].units[unitId]) {
        updated.pathways[pathwayId].modules[moduleId].units[unitId] = { lessons: {} };
      }
      
      updated.pathways[pathwayId].modules[moduleId].units[unitId].completedAt = now;
      saveProgress(updated);
      return updated;
    });
  }, []);

  // Calculate pathway completion percentage
  const getPathwayProgress = useCallback((
    pathwayId: string,
    totalUnits: number
  ): number => {
    const pathway = progress.pathways[pathwayId];
    if (!pathway || totalUnits === 0) return 0;
    
    let completedUnits = 0;
    Object.values(pathway.modules).forEach(module => {
      Object.values(module.units).forEach(unit => {
        if (unit.completedAt) completedUnits++;
      });
    });
    
    return Math.round((completedUnits / totalUnits) * 100);
  }, [progress]);

  // Calculate module completion percentage
  const getModuleProgress = useCallback((
    pathwayId: string,
    moduleId: string,
    totalUnits: number
  ): number => {
    const module = progress.pathways[pathwayId]?.modules[moduleId];
    if (!module || totalUnits === 0) return 0;
    
    let completedUnits = 0;
    Object.values(module.units).forEach(unit => {
      if (unit.completedAt) completedUnits++;
    });
    
    return Math.round((completedUnits / totalUnits) * 100);
  }, [progress]);

  // Check if a lesson has been viewed
  const isLessonViewed = useCallback((
    pathwayId: string,
    moduleId: string,
    unitId: string,
    lessonId: string
  ): boolean => {
    return !!progress.pathways[pathwayId]?.modules[moduleId]?.units[unitId]?.lessons[lessonId];
  }, [progress]);

  // Check if a unit is completed
  const isUnitCompleted = useCallback((
    pathwayId: string,
    moduleId: string,
    unitId: string
  ): boolean => {
    return !!progress.pathways[pathwayId]?.modules[moduleId]?.units[unitId]?.completedAt;
  }, [progress]);

  // Get streak info
  const getStreak = useCallback(() => ({
    days: progress.streak.currentDays,
    lastVisit: progress.streak.lastVisit,
  }), [progress]);

  // Get overall stats
  const getOverallStats = useCallback(() => ({
    totalLessonsViewed: progress.totalLessonsViewed,
    streakDays: progress.streak.currentDays,
    firstVisit: progress.firstVisit,
  }), [progress]);

  // Reset all progress (for testing)
  const resetProgress = useCallback(() => {
    const defaultProgress = getDefaultProgress();
    setProgress(defaultProgress);
    saveProgress(defaultProgress);
  }, []);

  return {
    isLoaded,
    progress,
    markLessonViewed,
    markUnitCompleted,
    getPathwayProgress,
    getModuleProgress,
    isLessonViewed,
    isUnitCompleted,
    getStreak,
    getOverallStats,
    resetProgress,
  };
}

export default useProgress;
