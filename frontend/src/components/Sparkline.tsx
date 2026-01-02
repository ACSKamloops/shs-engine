/**
 * Sparkline Component
 * Mini trend charts for dashboard stats
 */
import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  className?: string;
  showDots?: boolean;
  animated?: boolean;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = 'var(--accent-primary)',
  fillOpacity = 0.2,
  strokeWidth = 2,
  className = '',
  showDots = false,
  animated = true,
}: SparklineProps) {
  const { path, fillPath, points } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', fillPath: '', points: [] };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight,
    }));

    // Create smooth curve
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Create fill path
    const lastPoint = points[points.length - 1];
    const fillPath = `${path} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`;

    return { path, fillPath, points };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center text-xs text-text-muted ${className}`}
        style={{ width, height }}
      >
        –
      </div>
    );
  }

  const trend = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'neutral';
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : color;

  return (
    <svg 
      className={className} 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Fill gradient */}
      <defs>
        <linearGradient id={`sparkline-gradient-${trendColor.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trendColor} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={fillPath}
        fill={`url(#sparkline-gradient-${trendColor.replace(/[^a-z0-9]/gi, '')})`}
        className={animated ? 'animate-fade-in' : ''}
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-fade-in' : ''}
      />

      {/* Dots */}
      {showDots && points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={2}
          fill={trendColor}
          className={animated ? 'animate-fade-in' : ''}
        />
      ))}

      {/* Last value dot (always shown) */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={trendColor}
          stroke="var(--bg-base)"
          strokeWidth={2}
        />
      )}
    </svg>
  );
}

// Stat card with sparkline
interface SparklineStatProps {
  label: string;
  value: string | number;
  data: number[];
  icon?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function SparklineStat({ label, value, data, icon, trend, className = '' }: SparklineStatProps) {
  return (
    <div className={`bg-bg-elevated border border-glass-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-text-muted uppercase tracking-widest">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-bold text-text-primary">{value}</div>
          {trend && (
            <div className={`text-xs mt-1 ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        
        <Sparkline data={data} width={80} height={32} />
      </div>
    </div>
  );
}

// Mini sparkline for inline use
export function MiniSparkline({ data, className = '' }: { data: number[]; className?: string }) {
  return <Sparkline data={data} width={60} height={20} strokeWidth={1.5} className={className} />;
}
