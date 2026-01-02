/**
 * Feature Spotlight Component
 * Highlight new features with pulsing indicator
 */
import { useState, useEffect, type ReactNode } from 'react';

const SEEN_FEATURES_KEY = 'pukaist-seen-features';

function getSeenFeatures(): Set<string> {
  try {
    const stored = localStorage.getItem(SEEN_FEATURES_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markFeatureSeen(featureId: string) {
  const seen = getSeenFeatures();
  seen.add(featureId);
  localStorage.setItem(SEEN_FEATURES_KEY, JSON.stringify([...seen]));
}

interface FeatureSpotlightProps {
  featureId: string;
  title: string;
  description: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
}

export function FeatureSpotlight({ 
  featureId, 
  title, 
  description, 
  children, 
  position = 'bottom',
  showOnce = true 
}: FeatureSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const seen = getSeenFeatures();
      if (!seen.has(featureId)) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [featureId, showOnce]);

  const handleDismiss = () => {
    setShowTooltip(false);
    setIsVisible(false);
    if (showOnce) {
      markFeatureSeen(featureId);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      {children}
      
      {/* Pulse indicator */}
      {isVisible && !showTooltip && (
        <button
          onClick={() => setShowTooltip(true)}
          className="absolute -top-1 -right-1 z-10"
          aria-label="New feature"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-primary" />
          </span>
        </button>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div 
          className={`absolute z-50 ${positionClasses[position]} w-64 p-4 bg-bg-elevated border border-accent-primary/30 rounded-lg shadow-xl`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-accent-primary flex items-center gap-2">
              <span>✨</span> {title}
            </h4>
            <button
              onClick={handleDismiss}
              className="text-text-muted hover:text-text-primary"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-text-secondary">{description}</p>
          <button
            onClick={handleDismiss}
            className="mt-3 w-full px-3 py-1.5 text-xs font-medium bg-accent-primary/20 text-accent-primary rounded hover:bg-accent-primary/30 transition-colors"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}

// Whats New Modal
interface WhatsNewItem {
  title: string;
  description: string;
  icon?: string;
}

interface WhatsNewModalProps {
  version: string;
  items: WhatsNewItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsNewModal({ version, items, isOpen, onClose }: WhatsNewModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-bg-base border border-glass-border rounded-xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <span className="text-4xl mb-3 block">🎉</span>
          <h2 className="text-xl font-bold text-text-primary">What's New in {version}</h2>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/3 rounded-lg">
              <span className="text-xl">{item.icon || '✨'}</span>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{item.title}</h4>
                <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary-hover transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
