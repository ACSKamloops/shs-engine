/**
 * VideoPlayer - Simple video player for SCES archive videos
 * Styled to match site design with controls and poster support
 */
import { useState, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  title: string;
  duration?: string;
  presenter?: string;
  source?: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({
  src,
  title,
  duration,
  presenter,
  source,
  poster,
  className = '',
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-shs-sand/50 rounded-xl p-4 border border-shs-stone/30 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-shs-forest-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-shs-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h6 className="font-semibold text-shs-forest-800">{title}</h6>
            <p className="text-xs text-shs-text-muted">Video unavailable</p>
            {duration && <span className="text-xs text-shs-amber-600">{duration}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-shs-stone/30 bg-black ${className}`}>
      {/* Video element */}
      <div className="relative aspect-video bg-gray-900">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          preload="metadata"
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={handlePause}
          onError={handleError}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Play overlay (shows before first play) */}
        {!isPlaying && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
          >
            <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
              <svg className="w-10 h-10 text-shs-forest-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* Video info bar */}
      <div className="bg-shs-forest-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h6 className="font-semibold text-white text-sm">{title}</h6>
          <div className="flex items-center gap-3 text-xs text-shs-forest-200">
            {presenter && <span>{presenter}</span>}
            {source && <span className="opacity-75">Source: {source}</span>}
          </div>
        </div>
        {duration && (
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-white font-medium">
            {duration}
          </span>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;
