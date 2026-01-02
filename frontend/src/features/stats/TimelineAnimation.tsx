/**
 * Timeline Animation Control
 * Playback control showing documents appearing by year
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface TimelineAnimationProps {
  startYear: number;
  endYear: number;
  onYearChange: (year: number | null) => void;
  className?: string;
}

export function TimelineAnimation({ startYear, endYear, onYearChange, className }: TimelineAnimationProps) {
  const [playing, setPlaying] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(startYear);
  const [speed, setSpeed] = useState(1000); // ms per year
  const intervalRef = useRef<number | null>(null);

  const play = useCallback(() => {
    if (currentYear >= endYear) {
      setCurrentYear(startYear);
    }
    setPlaying(true);
  }, [currentYear, endYear, startYear]);

  const pause = useCallback(() => {
    setPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentYear(startYear);
    onYearChange(null);
  }, [pause, startYear, onYearChange]);

  // Animation loop
  useEffect(() => {
    if (!playing) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentYear((prev) => {
        const next = prev + 1;
        if (next > endYear) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, speed, endYear]);

  // Emit year changes
  useEffect(() => {
    if (playing || currentYear !== startYear) {
      onYearChange(currentYear);
    }
  }, [currentYear, playing, startYear, onYearChange]);

  const progress = ((currentYear - startYear) / (endYear - startYear)) * 100;

  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${className || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-white/80">📽️ Timeline Animation</h5>
        <span className="text-lg font-bold text-purple-400">{currentYear}</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-white/10 rounded-full mb-3 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (playing ? pause() : play())}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            playing
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium bg-white/10 text-white/70 rounded-lg hover:bg-white/20"
        >
          ↺ Reset
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-white/50">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-white/10 border border-white/10 rounded text-white"
          >
            <option value={2000}>0.5x</option>
            <option value={1000}>1x</option>
            <option value={500}>2x</option>
            <option value={250}>4x</option>
          </select>
        </div>
      </div>

      {/* Year slider */}
      <div className="mt-3">
        <input
          type="range"
          min={startYear}
          max={endYear}
          value={currentYear}
          onChange={(e) => {
            pause();
            setCurrentYear(Number(e.target.value));
          }}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>{startYear}</span>
          <span>{endYear}</span>
        </div>
      </div>
    </div>
  );
}

export default TimelineAnimation;
