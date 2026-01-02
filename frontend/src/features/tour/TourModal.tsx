/**
 * Tour Modal Component - Redesigned
 * Floating tour with spotlight effect, glassmorphism styling, and auto-navigation
 */
import type React from 'react';
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useAppStore } from '../../store';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_VERSION = 'v2-nav';

interface TourStep {
  anchor: string;
  route: string;
  title: string;
  detail: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    anchor: 'wizard',
    route: '/', // Start at dashboard/root
    title: 'Project Setup',
    detail: 'Start here to define your project goals. Tell the system what you are looking for, set the time period of interest, and choose geographic regions to focus on.',
  },
  {
    anchor: 'documents',
    route: '/documents',
    title: 'Evidence Library',
    detail: 'This is your main document list. You can upload new files, search your collection, and filter by status. Use this view to organize and prioritize your evidence.',
  },
  {
    anchor: 'inspector',
    route: '/documents',
    title: 'Document Analysis',
    detail: 'Select any document to see the details. Read the extracted text, view the AI-generated summary, and check key data points like dates and locations.',
  },
  {
    anchor: 'workspace',
    route: '/map',
    title: 'Map Explorer',
    detail: 'Visualize your evidence geographically. See exactly where events occurred and how they relate to boundaries, territories, and other points of interest.',
  },
];

export const TourModal: React.FC = () => {
  const showTour = useAppStore((s) => s.showTour);
  const setShowTour = useAppStore((s) => s.setShowTour);
  const tourStep = useAppStore((s) => s.tourStep);
  const setTourStep = useAppStore((s) => s.setTourStep);
  const nextTourStep = useAppStore((s) => s.nextTourStep);
  const prevTourStep = useAppStore((s) => s.prevTourStep);

  const navigate = useNavigate();
  const location = useLocation();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [modalStyle, setModalStyle] = useState<React.CSSProperties>({});
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Ref for the modal itself to measure its size
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if tour has been seen
  useEffect(() => {
    try {
      const seen = localStorage.getItem(`pukaist-tour-seen-${TOUR_VERSION}`);
      if (!seen) setShowTour(true);
    } catch {
      // ignore
    }
  }, [setShowTour]);

  const handleClose = () => {
    setShowTour(false);
    try {
      localStorage.setItem(`pukaist-tour-seen-${TOUR_VERSION}`, 'true');
    } catch {
      // ignore
    }
  };

  const handleRestart = () => {
    setTourStep(0);
  };

  const handleNext = () => {
    if (tourStep >= TOUR_STEPS.length - 1) {
      handleClose();
    } else {
      nextTourStep();
    }
  };

  const step = TOUR_STEPS[tourStep] || TOUR_STEPS[0];

  // Auto-navigate if needed
  useEffect(() => {
    if (!showTour) return;
    
    if (location.pathname !== step.route) {
      setIsNavigating(true);
      navigate(step.route);
    } else {
      // Small delay to allow render after nav
      const timer = setTimeout(() => setIsNavigating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showTour, step.route, location.pathname, navigate]);

  // Locate target element and calculate position
  useLayoutEffect(() => {
    if (!showTour || isNavigating) {
      setIsReady(false);
      return;
    }

    // Small delay to ensure DOM is settled after navigation/render
    const timer = setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-tour='${step.anchor}']`);

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        
        const margin = 20;
        const modalWidth = 320;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Default to right
        let top = rect.top;
        let left = rect.right + margin;
        
        // If fits on right
        if (left + modalWidth < windowWidth - margin) {
          // Check bottom overflow
          if (top + 200 > windowHeight) {
             top = windowHeight - 220; // Pin to bottom area
          }
        } 
        // Else try left
        else if (rect.left - modalWidth - margin > margin) {
          left = rect.left - modalWidth - margin;
        }
        // Else bottom
        else {
          top = rect.bottom + margin;
          left = Math.max(margin, Math.min(windowWidth - modalWidth - margin, rect.left));
        }

        setModalStyle({
          top: `${top + window.scrollY}px`,
          left: `${left + window.scrollX}px`,
        });
        setIsReady(true);
      } else {
        // Fallback center if element missing
        setTargetRect(null);
        setModalStyle({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        });
        setIsReady(true);
      }
    }, 400); // 400ms delay for DOM settle

    return () => clearTimeout(timer);
  }, [showTour, tourStep, isNavigating, step.anchor]);

  if (!showTour) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity duration-500" 
        style={{ opacity: isReady ? 1 : 0 }} 
      />

      {/* Spotlight Cutout */}
      {targetRect && isReady && (
        <div
          className="absolute transition-all duration-500 ease-in-out border-2 border-indigo-400/50 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="absolute pointer-events-auto transition-all duration-500 ease-in-out w-80"
        style={{
          ...modalStyle,
          opacity: isReady ? 1 : 0,
          transform: isReady ? 'none' : 'scale(0.95)',
        }}
      >
        <div className="glass p-5 rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#0f172a]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
              Step {tourStep + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            {step.detail}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={prevTourStep}
              disabled={tourStep === 0}
              className="text-xs font-medium text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60 transition-colors"
            >
              Back
            </button>

            <div className="flex gap-2">
              <button
                 onClick={handleRestart}
                 className="text-xs font-medium text-white/40 hover:text-white/60 transition-colors mr-2"
              >
                Restart
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 active:scale-95"
              >
                {tourStep >= TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
