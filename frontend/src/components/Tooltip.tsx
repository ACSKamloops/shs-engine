/**
 * Tooltip Component
 * Contextual tooltips with positioning and animations
 */
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.top - tooltipRect.height - padding;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.bottom + padding;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - padding;
        y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        break;
      case 'right':
        x = triggerRect.right + padding;
        y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        break;
    }

    // Keep within viewport
    x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`fixed z-[100] px-3 py-2 text-xs font-medium rounded-lg bg-bg-elevated border border-glass-border text-text-primary shadow-lg backdrop-blur-sm transition-opacity duration-150 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={{ left: coords.x, top: coords.y }}
        >
          {content}
          {/* Arrow */}
          <div 
            className={`absolute w-2 h-2 bg-bg-elevated border-glass-border rotate-45 ${
              position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
              position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
              position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' :
              'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b'
            }`}
          />
        </div>,
        document.body
      )}
    </>
  );
}

/**
 * HelpTooltip - Question mark icon with tooltip
 */
export interface HelpTooltipProps {
  content: ReactNode;
  docsLink?: string;
}

export function HelpTooltip({ content, docsLink }: HelpTooltipProps) {
  return (
    <Tooltip 
      content={
        <div className="max-w-xs">
          <p>{content}</p>
          {docsLink && (
            <a 
              href={docsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-accent-primary hover:underline"
            >
              Learn more →
            </a>
          )}
        </div>
      }
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-white/10 text-text-muted hover:text-text-primary hover:bg-white/20 transition-colors"
        aria-label="Help"
      >
        ?
      </button>
    </Tooltip>
  );
}
