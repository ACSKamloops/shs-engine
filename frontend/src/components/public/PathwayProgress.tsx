/**
 * PathwayProgress - Overall Learning Path Completion Tracker
 * 
 * Shows progress across an entire learning pathway with:
 * - Large progress ring
 * - Module completion breakdown
 * - Streak/engagement metrics (optional)
 */

interface PathwayProgressProps {
  pathway: 'land' | 'mind' | 'heart' | 'spirit';
  pathwayName: string;
  element: string; // Secwépemctsín name
  totalModules: number;
  completedModules: number;
  totalUnits: number;
  completedUnits: number;
  streak?: number;
  lastActive?: string;
  className?: string;
}

// Pathway color schemes
const pathwayColors = {
  land: {
    gradient: 'from-emerald-500 to-green-600',
    ring: '#10b981',
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  mind: {
    gradient: 'from-sky-500 to-blue-600',
    ring: '#0ea5e9',
    light: 'bg-sky-50',
    text: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700',
  },
  heart: {
    gradient: 'from-rose-500 to-pink-600',
    ring: '#f43f5e',
    light: 'bg-rose-50',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
  },
  spirit: {
    gradient: 'from-violet-500 to-purple-600',
    ring: '#8b5cf6',
    light: 'bg-violet-50',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700',
  },
};

// Large Progress Ring Component
function LargeProgressRing({ 
  progress, 
  color,
  size = 120,
  strokeWidth = 10,
}: { 
  progress: number; 
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress ring with gradient effect */}
        <circle
          className="transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{Math.round(progress)}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
}

export function PathwayProgress({
  pathway,
  pathwayName,
  element,
  totalModules,
  completedModules,
  totalUnits,
  completedUnits,
  streak,
  lastActive,
  className = '',
}: PathwayProgressProps) {
  const colors = pathwayColors[pathway];
  const overallProgress = totalUnits > 0 
    ? Math.round((completedUnits / totalUnits) * 100) 
    : 0;

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{element}</p>
            <h3 className="text-2xl font-bold">{pathwayName} Pathway</h3>
          </div>
          {streak && streak > 0 && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-xl">🔥</span>
              <span className="font-bold">{streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress content */}
      <div className="p-6">
        <div className="flex items-center gap-8">
          {/* Large progress ring */}
          <LargeProgressRing progress={overallProgress} color={colors.ring} />

          {/* Stats breakdown */}
          <div className="flex-1 space-y-4">
            {/* Modules progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Modules</span>
                <span className="text-sm font-semibold text-gray-800">
                  {completedModules}/{totalModules}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                  style={{ width: `${(completedModules / totalModules) * 100}%` }}
                />
              </div>
            </div>

            {/* Units progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Units</span>
                <span className="text-sm font-semibold text-gray-800">
                  {completedUnits}/{totalUnits}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                  style={{ width: `${(completedUnits / totalUnits) * 100}%` }}
                />
              </div>
            </div>

            {/* Last active */}
            {lastActive && (
              <p className="text-xs text-gray-400">
                Last active: {lastActive}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PathwayProgress;
