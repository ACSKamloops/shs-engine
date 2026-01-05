/**
 * SeasonalCalendar - Premium Interactive Secwépemc Calendar Wheel
 * 
 * Modern 2025/2026 design featuring:
 * - Conic gradient circular wheel with 12 segments
 * - Current moon detection using system time
 * - Glassmorphism card design
 * - Pulse glow animation on current month
 * - Multiple variants: full, compact, hero
 * - Smooth CSS transitions and micro-interactions
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface MonthData {
  month: string;
  secwepemc: string;
  english: string;
  activities: string;
}

interface SeasonalCalendarProps {
  moons?: MonthData[];
  colorScheme?: 'forest' | 'amber' | 'earth';
  showQuizMode?: boolean;
  variant?: 'full' | 'compact' | 'hero';
  theme?: 'dark' | 'light';
  className?: string;
}

// Default moons data from Secwepemc-web-07-2017.pdf (Table 1, p.38)
const defaultMoons: MonthData[] = [
  { month: 'January', secwepemc: 'Pell7émtmin̓', english: 'Stay at home month', activities: 'People live on stored provisions; some ice fishing; trapping.' },
  { month: 'February', secwepemc: 'Pelltsípwen̓ten', english: 'Cache pit month', activities: 'People live on stored provisions; ice fishing; fishing for steelhead with torch lights.' },
  { month: 'March', secwepemc: 'Pellsqépts', english: 'Chinook wind month', activities: 'Early lower elevation lake trout fishery; spring hunting; first plant shoots.' },
  { month: 'April', secwepemc: 'Pesll7éw̓ten', english: 'Melting month', activities: 'Snow melts at higher elevations. Digging for nodding onion, yellow bells, balsamroot.' },
  { month: 'May', secwepemc: 'Pell7é7llqten', english: 'Root-digging month', activities: 'Gathering of yellow glacier lily, balsam root, desert parsley. Chinook salmon run.' },
  { month: 'June', secwepemc: 'Pelltspántsk', english: 'Mid-summer month', activities: 'First berries ripe; root digging at higher elevations; chinook salmon run.' },
  { month: 'July', secwepemc: 'Pelltqwelq̓wél̓temc', english: 'Getting-ripe month', activities: 'Many species of berries ripe, root and medicinal plant gathering. Salmon fishing.' },
  { month: 'August', secwepemc: 'Pesqelqlélten', english: 'Many salmon month', activities: 'Sockeye Salmon fishing; blueberries harvested at higher elevations. Main fall hunting.' },
  { month: 'September', secwepemc: 'Pelltemllík̓t', english: 'Spawned out month', activities: 'Hunting season and drying of meat. Black tree lichen harvested.' },
  { month: 'October', secwepemc: 'Pesllwélsten', english: 'Abandoning month', activities: 'Continuing hunting season and drying of meat; tanning hides. Coho salmon fishing.' },
  { month: 'November', secwepemc: 'Pellc7ellcw7ú7llcwten̓', english: 'Entering month', activities: 'People enter into their winter homes; animals enter their dens. Elk hunting.' },
  { month: 'December', secwepemc: 'Pelltetéq̓em', english: 'Cross-over month', activities: 'Winter solstice; people live on stored provisions; trapping.' },
];

// Month order for calculations
const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

// Seasonal color palette - gradients inspired by BC Interior landscapes
const seasonalColors = {
  winter: { 
    gradient: 'from-blue-400 to-indigo-500', 
    bg: 'bg-blue-500/20', 
    text: 'text-blue-300',
    glow: 'shadow-blue-400/50',
    icon: '❄️'
  },
  spring: { 
    gradient: 'from-emerald-400 to-green-500', 
    bg: 'bg-emerald-500/20', 
    text: 'text-emerald-300',
    glow: 'shadow-emerald-400/50',
    icon: '🌱'
  },
  summer: { 
    gradient: 'from-amber-400 to-orange-500', 
    bg: 'bg-amber-500/20', 
    text: 'text-amber-300',
    glow: 'shadow-amber-400/50',
    icon: '☀️'
  },
  fall: { 
    gradient: 'from-orange-500 to-red-500', 
    bg: 'bg-orange-500/20', 
    text: 'text-orange-300',
    glow: 'shadow-orange-400/50',
    icon: '🍂'
  },
};

// Map months to seasons
const monthToSeason = (month: string): keyof typeof seasonalColors => {
  const idx = monthOrder.indexOf(month);
  if (idx <= 1 || idx === 11) return 'winter';
  if (idx >= 2 && idx <= 4) return 'spring';
  if (idx >= 5 && idx <= 7) return 'summer';
  return 'fall';
};

// Custom CSS keyframes for the pulse animation
const pulseKeyframes = `
  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 15px 3px var(--glow-color);
    }
    50% { 
      box-shadow: 0 0 25px 5px var(--glow-color);
    }
  }
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export function SeasonalCalendar({ 
  moons, 
  variant = 'full',
  theme = 'dark',
  className = '',
}: SeasonalCalendarProps) {
  const calendarMoons = moons && moons.length > 0 ? moons : defaultMoons;
  
  // Get current month using system time (per user rules)
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentMoonData = calendarMoons.find(m => m.month === currentMonth);
  const currentSeason = monthToSeason(currentMonth);
  
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(
    variant === 'hero' ? currentMoonData || null : null
  );

  // Sort moons
  const sortedMoons = useMemo(() => 
    [...calendarMoons].sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)),
    [calendarMoons]
  );

  const handleMonthClick = (moon: MonthData) => {
    setSelectedMonth(selectedMonth?.month === moon.month ? null : moon);
  };

  // Inject keyframes
  if (typeof document !== 'undefined' && !document.getElementById('seasonal-calendar-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'seasonal-calendar-styles';
    styleEl.textContent = pulseKeyframes;
    document.head.appendChild(styleEl);
  }

  // ============= HERO VARIANT =============
  if (variant === 'hero') {
    const displayMoon = selectedMonth || currentMoonData;
    const displaySeason = displayMoon ? monthToSeason(displayMoon.month) : currentSeason;
    const colors = seasonalColors[displaySeason];
    
    // Light theme text colors
    const textPrimary = theme === 'light' ? 'text-shs-forest-800' : 'text-white';
    const textSecondary = theme === 'light' ? 'text-shs-forest-600' : 'text-white/80';
    const textMuted = theme === 'light' ? 'text-shs-text-muted' : 'text-white/60';
    const cardBg = theme === 'light' ? 'bg-white border-shs-stone shadow-sm' : 'bg-white/10 backdrop-blur-xl border-white/20';
    const pillBg = theme === 'light' ? 'bg-shs-forest-100 text-shs-forest-700' : 'bg-white/10 text-white/80 backdrop-blur-sm border border-white/20';
    const wheelCenterBg = theme === 'light' ? 'bg-shs-forest-800' : 'bg-white/10 backdrop-blur-xl border border-white/20';
    const monthBtnInactive = theme === 'light' ? 'bg-shs-forest-700/80 hover:bg-shs-forest-600' : 'bg-white/10 backdrop-blur-sm hover:bg-white/20';
    const monthBtnSelected = theme === 'light' ? 'bg-shs-forest-600 ring-2 ring-shs-forest-400' : 'bg-white/20 backdrop-blur-sm ring-2 ring-white/50';
    
    return (
      <section className={`relative overflow-hidden ${className}`}>
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20 transition-all duration-1000`} />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Circular Wheel */}
            <div className="flex justify-center">
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Outer glow ring */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.gradient} opacity-30 blur-xl`} />
                
                {/* Main wheel container */}
                <div className="relative w-full h-full">
                  {/* Month segments */}
                  {sortedMoons.map((moon, idx) => {
                    const angle = (idx * 30) - 90; // 30 degrees per month, start at top
                    const isCurrentMonth = moon.month === currentMonth;
                    const isSelected = selectedMonth?.month === moon.month;
                    const moonSeason = monthToSeason(moon.month);
                    const moonColors = seasonalColors[moonSeason];
                    
                    // Calculate position on circle
                    const radius = 42; // Percentage from center
                    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                    
                    return (
                      <button
                        key={moon.month}
                        onClick={() => handleMonthClick(moon)}
                        className={`
                          absolute w-12 h-12 md:w-14 md:h-14 -translate-x-1/2 -translate-y-1/2
                          rounded-full flex items-center justify-center
                          transition-all duration-300 cursor-pointer
                          ${isCurrentMonth 
                            ? `bg-gradient-to-br ${moonColors.gradient} ring-2 ring-white/70 shadow-lg ${moonColors.glow}` 
                            : isSelected
                              ? monthBtnSelected
                              : monthBtnInactive
                          }
                          ${isCurrentMonth ? 'animate-[pulse-glow_3s_ease-in-out_infinite]' : ''}
                        `}
                        style={{ 
                          left: `${x}%`, 
                          top: `${y}%`,
                          '--glow-color': isCurrentMonth ? 'rgba(255,255,255,0.4)' : 'transparent'
                        } as React.CSSProperties}
                        title={`${moon.secwepemc} - ${moon.english}`}
                      >
                        <span className="text-xs md:text-sm font-bold text-white">
                          {moon.month.slice(0, 3)}
                        </span>
                      </button>
                    );
                  })}
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full ${wheelCenterBg} flex flex-col items-center justify-center text-center p-4`}>
                      <span className="text-3xl md:text-4xl mb-2">{colors.icon}</span>
                      <div className="text-white">
                        <span className="text-xs uppercase tracking-wider opacity-70">Current Moon</span>
                        <h3 className="text-lg md:text-xl font-bold leading-tight">
                          {displayMoon?.secwepemc}
                        </h3>
                        <p className="text-xs opacity-80">{displayMoon?.english}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Details Panel */}
            <div className="text-center lg:text-left">
              <div className={`inline-block px-4 py-1.5 rounded-full ${pillBg} text-sm mb-4`}>
                Secwépemc Seasonal Round
              </div>
              
              <h2 className={`text-3xl md:text-5xl font-extrabold mb-4 leading-tight`}>
                <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                  {displayMoon?.secwepemc}
                </span>
              </h2>
              
              <p className={`text-xl md:text-2xl ${textSecondary} mb-2`}>
                "{displayMoon?.english}"
              </p>
              
              <p className={`${textMuted} text-sm mb-6`}>
                {displayMoon?.month} • {displaySeason.charAt(0).toUpperCase() + displaySeason.slice(1)}
              </p>
              
              {/* Activities Card */}
              <div className={`${cardBg} rounded-2xl border p-6 mb-8`}>
                <h4 className={`${textPrimary} font-semibold mb-3 flex items-center gap-2`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Traditional Activities
                </h4>
                <p className={`${textSecondary} leading-relaxed`}>
                  {displayMoon?.activities}
                </p>
              </div>
              
              <Link
                to="/curriculum/land"
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl 
                           bg-gradient-to-r ${colors.gradient} text-white font-semibold
                           shadow-lg hover:shadow-xl transition-all duration-300
                           hover:-translate-y-0.5`}
              >
                Learn More About Our Seasonal Round
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ============= COMPACT VARIANT =============
  if (variant === 'compact') {
    const displayMoon = selectedMonth || currentMoonData;
    const displaySeason = displayMoon ? monthToSeason(displayMoon.month) : currentSeason;
    const colors = seasonalColors[displaySeason];
    
    return (
      <div className={`${className}`}>
        {/* Compact grid of months */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {sortedMoons.map((moon) => {
            const isCurrentMonth = moon.month === currentMonth;
            const isSelected = selectedMonth?.month === moon.month;
            const moonSeason = monthToSeason(moon.month);
            const moonColors = seasonalColors[moonSeason];
            
            return (
              <button
                key={moon.month}
                onClick={() => handleMonthClick(moon)}
                className={`
                  p-2 rounded-lg text-center transition-all duration-300
                  ${isCurrentMonth 
                    ? `bg-gradient-to-br ${moonColors.gradient} text-white shadow-lg ring-2 ring-white/50` 
                    : isSelected
                      ? 'bg-shs-forest-100 text-shs-forest-700 ring-2 ring-shs-forest-300'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }
                `}
              >
                <span className="text-xs font-medium block">
                  {moon.month.slice(0, 3)}
                </span>
                {isCurrentMonth && (
                  <span className="block w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Selected month details */}
        {displayMoon && (
          <div className={`bg-gradient-to-br ${colors.gradient} rounded-xl p-4 text-white animate-[fade-in_0.3s_ease-out]`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{colors.icon}</span>
              <div>
                <h4 className="font-bold text-sm">{displayMoon.secwepemc}</h4>
                <p className="text-xs opacity-80">{displayMoon.english}</p>
              </div>
            </div>
            <p className="text-xs opacity-90">{displayMoon.activities}</p>
          </div>
        )}
      </div>
    );
  }

  // ============= FULL VARIANT (Default) =============
  const displayMoon = selectedMonth || currentMoonData;
  const displaySeason = displayMoon ? monthToSeason(displayMoon.month) : currentSeason;
  const colors = seasonalColors[displaySeason];

  return (
    <div className={`bg-white rounded-2xl border border-shs-stone/30 overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{colors.icon}</span>
            <div>
              <h3 className="font-bold text-lg">Secwépemc Seasonal Round</h3>
              <p className="text-sm opacity-90">12 moons guiding traditional activities</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs opacity-70 block">Current Moon</span>
            <span className="font-bold">{currentMoonData?.secwepemc}</span>
          </div>
        </div>
      </div>

      {/* Season Legend */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(seasonalColors).map(([season, sColors]) => (
            <div key={season} className="flex items-center gap-2">
              <span>{sColors.icon}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${sColors.gradient} text-white`}>
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {sortedMoons.map((moon) => {
            const isCurrentMonth = moon.month === currentMonth;
            const isSelected = selectedMonth?.month === moon.month;
            const moonSeason = monthToSeason(moon.month);
            const moonColors = seasonalColors[moonSeason];
            
            return (
              <button
                key={moon.month}
                onClick={() => handleMonthClick(moon)}
                className={`
                  relative p-3 rounded-xl transition-all duration-300
                  ${isCurrentMonth 
                    ? `bg-gradient-to-br ${moonColors.gradient} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-current` 
                    : isSelected
                      ? 'bg-shs-forest-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }
                `}
              >
                <div className="text-center">
                  <div className="text-xs font-medium opacity-75 mb-1">
                    {moon.month.slice(0, 3)}
                  </div>
                  <div className="text-sm font-bold leading-tight">
                    {moon.secwepemc.length > 10 
                      ? moon.secwepemc.slice(0, 8) + '...' 
                      : moon.secwepemc}
                  </div>
                </div>
                {isCurrentMonth && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-current" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Details */}
      {displayMoon && (
        <div className={`border-t border-gray-100 animate-[fade-in_0.3s_ease-out]`}>
          <div className={`p-6 bg-gradient-to-b ${colors.bg} to-white`}>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{colors.icon}</span>
                  <h4 className="text-2xl font-bold text-gray-800">
                    {displayMoon.secwepemc}
                  </h4>
                </div>
                <p className="text-shs-forest-600 font-medium">
                  {displayMoon.month} — "{displayMoon.english}"
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Traditional Activities
                </h5>
                <p className="text-gray-600 leading-relaxed">
                  {displayMoon.activities}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedMonth && !currentMoonData && (
        <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-sm text-gray-500">
            👆 Click a month to see traditional activities
          </p>
        </div>
      )}
    </div>
  );
}

export default SeasonalCalendar;
