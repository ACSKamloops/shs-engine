/**
 * MoonSelector - Compact 12-Moon Picker
 * 
 * Simplified moon selector for embedding in other components.
 * Shows 12 moon markers with current moon highlighted.
 * Click to select and filter content by moon/month.
 */
import { useState, useMemo } from 'react';

interface MoonData {
  month: string;
  secwepemc: string;
  english: string;
  activities: string;
}

interface MoonSelectorProps {
  moons?: MoonData[];
  selectedMonth?: string;
  onSelect?: (moon: MoonData) => void;
  showTooltip?: boolean;
  variant?: 'horizontal' | 'circular' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Default moons from Secwepemc calendar
const defaultMoons: MoonData[] = [
  { month: 'January', secwepemc: "Pell7émtmin̓", english: 'Stay at home month', activities: 'Stored provisions; ice fishing; trapping.' },
  { month: 'February', secwepemc: "Pelltsípwen̓ten", english: 'Cache pit month', activities: 'Stored provisions; steelhead fishing.' },
  { month: 'March', secwepemc: 'Pellsqépts', english: 'Chinook wind month', activities: 'Spring hunting; first plant shoots.' },
  { month: 'April', secwepemc: "Pesll7éw̓ten", english: 'Melting month', activities: 'Digging nodding onion, yellow bells.' },
  { month: 'May', secwepemc: 'Pell7é7llqten', english: 'Root-digging month', activities: 'Yellow glacier lily, balsam root.' },
  { month: 'June', secwepemc: 'Pelltspántsk', english: 'Mid-summer month', activities: 'First berries; chinook salmon run.' },
  { month: 'July', secwepemc: "Pelltqwelq̓wél̓temc", english: 'Getting-ripe month', activities: 'Many berries; salmon fishing.' },
  { month: 'August', secwepemc: 'Pesqelqlélten', english: 'Many salmon month', activities: 'Sockeye fishing; blueberries.' },
  { month: 'September', secwepemc: "Pelltemllík̓t", english: 'Spawned out month', activities: 'Hunting; drying meat.' },
  { month: 'October', secwepemc: 'Pesllwélsten', english: 'Abandoning month', activities: 'Hunting; tanning hides; coho salmon.' },
  { month: 'November', secwepemc: "Pellc7ellcw7ú7llcwten̓", english: 'Entering month', activities: 'Enter winter homes; elk hunting.' },
  { month: 'December', secwepemc: "Pelltetéq̓em", english: 'Cross-over month', activities: 'Winter solstice; trapping.' },
];

const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Season colors
const getSeasonColor = (month: string) => {
  const idx = monthOrder.indexOf(month);
  if (idx <= 1 || idx === 11) return { gradient: 'from-blue-400 to-indigo-500', dot: 'bg-blue-500' };
  if (idx >= 2 && idx <= 4) return { gradient: 'from-emerald-400 to-green-500', dot: 'bg-emerald-500' };
  if (idx >= 5 && idx <= 7) return { gradient: 'from-amber-400 to-orange-500', dot: 'bg-amber-500' };
  return { gradient: 'from-orange-400 to-red-500', dot: 'bg-orange-500' };
};

export function MoonSelector({
  moons,
  selectedMonth,
  onSelect,
  showTooltip = true,
  variant = 'horizontal',
  size = 'md',
  className = '',
}: MoonSelectorProps) {
  const [hoveredMoon, setHoveredMoon] = useState<MoonData | null>(null);
  const calendarMoons = moons && moons.length > 0 ? moons : defaultMoons;
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const selectedMoon = selectedMonth 
    ? calendarMoons.find(m => m.month === selectedMonth)
    : calendarMoons.find(m => m.month === currentMonth);

  const sortedMoons = useMemo(() =>
    [...calendarMoons].sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)),
    [calendarMoons]
  );

  // Size configurations
  const sizeConfig = {
    sm: { dot: 'w-6 h-6', text: 'text-[9px]', tooltip: 'text-xs' },
    md: { dot: 'w-8 h-8', text: 'text-[10px]', tooltip: 'text-sm' },
    lg: { dot: 'w-10 h-10', text: 'text-xs', tooltip: 'text-base' },
  };
  const config = sizeConfig[size];

  // Dots variant - minimal
  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {sortedMoons.map((moon) => {
          const isCurrent = moon.month === currentMonth;
          const isSelected = moon.month === selectedMonth;
          const colors = getSeasonColor(moon.month);

          return (
            <button
              key={moon.month}
              onClick={() => onSelect?.(moon)}
              onMouseEnter={() => setHoveredMoon(moon)}
              onMouseLeave={() => setHoveredMoon(null)}
              className={`
                w-3 h-3 rounded-full transition-all duration-200
                ${isCurrent || isSelected
                  ? `${colors.dot} ring-2 ring-offset-1 ring-current scale-125`
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              title={`${moon.secwepemc} - ${moon.english}`}
            />
          );
        })}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {sortedMoons.map((moon) => {
          const isCurrent = moon.month === currentMonth;
          const isSelected = moon.month === selectedMonth;
          const colors = getSeasonColor(moon.month);

          return (
            <button
              key={moon.month}
              onClick={() => onSelect?.(moon)}
              onMouseEnter={() => setHoveredMoon(moon)}
              onMouseLeave={() => setHoveredMoon(null)}
              className={`
                flex-shrink-0 ${config.dot} rounded-full flex items-center justify-center
                font-bold transition-all duration-300
                ${isCurrent
                  ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg scale-110 ring-2 ring-white/50`
                  : isSelected
                    ? `bg-shs-forest-600 text-white shadow-md`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span className={config.text}>{moon.month.slice(0, 1)}</span>
            </button>
          );
        })}
      </div>

      {/* Tooltip */}
      {showTooltip && hoveredMoon && (
        <div 
          className={`
            absolute z-20 left-1/2 -translate-x-1/2 mt-2
            bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl
            ${config.tooltip} text-center whitespace-nowrap
            animate-[fade-in_0.15s_ease-out]
          `}
        >
          <div className="font-bold">{hoveredMoon.secwepemc}</div>
          <div className="opacity-80">{hoveredMoon.english}</div>
          <div className="text-xs opacity-60 mt-1">{hoveredMoon.month}</div>
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}

      {/* Selected moon display */}
      {selectedMoon && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getSeasonColor(selectedMoon.month).dot}`} />
            <span className="font-medium text-shs-forest-700">{selectedMoon.secwepemc}</span>
            <span className="text-shs-text-muted">•</span>
            <span className="text-sm text-shs-text-muted">{selectedMoon.english}</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default MoonSelector;
