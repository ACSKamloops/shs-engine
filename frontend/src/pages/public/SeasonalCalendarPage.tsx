/**
 * SeasonalCalendarPage - Secwépemc Seasonal Round (Modernized Jan 2026)
 * Features: Framer Motion, animated month transitions, interactive calendar
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import seasonalData from '../../data/calendar/seasonal_round.json';
import ElderQuoteCard, { curatedQuotes } from '../../components/cultural/ElderQuoteCard';
import { SectionReveal, FloatingIcon, AnimatedCard } from '../../components/ui/AnimatedComponents';

interface MonthData {
  month: string;
  names: { secwepemc: string; english: string; secwepemcNFC?: string; englishNFC?: string }[];
  subsistenceActivities: string;
  rawLines?: string[];
}

const months = seasonalData.months as MonthData[];

// Get current month for highlighting
const currentMonthIndex = new Date().getMonth();
const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

// Reorder starting from November (traditional start)
const reorderedMonths = [
  ...months.filter(m => ['November', 'December'].includes(m.month)),
  ...months.filter(m => !['November', 'December'].includes(m.month))
];

// Month icons (seasonal activities)
const monthIcons: Record<string, string> = {
  'November': '🏠',   // Entering homes
  'December': '❄️',   // Winter solstice
  'January': '🧊',    // Stay home/ice fishing
  'February': '🕯️',   // Cache pit/torchlight fishing
  'March': '🌬️',     // Chinook wind
  'April': '💧',      // Melting/spring
  'May': '🌱',        // Root digging
  'June': '🌿',       // Mid-summer
  'July': '🍒',       // Getting ripe
  'August': '🐟',     // Many salmon
  'September': '🦌',  // Hunting/drying meat
  'October': '🍂',    // Abandoning/preparing
};

// Season colors
const getSeasonColor = (month: string): string => {
  const winterMonths = ['November', 'December', 'January', 'February'];
  const springMonths = ['March', 'April', 'May'];
  const summerMonths = ['June', 'July', 'August'];
  
  if (winterMonths.includes(month)) return 'from-slate-600 to-slate-500';
  if (springMonths.includes(month)) return 'from-emerald-600 to-green-500';
  if (summerMonths.includes(month)) return 'from-amber-500 to-yellow-400';
  return 'from-orange-500 to-red-400';
};

const getSeasonBg = (month: string): string => {
  const winterMonths = ['November', 'December', 'January', 'February'];
  const springMonths = ['March', 'April', 'May'];
  const summerMonths = ['June', 'July', 'August'];
  
  if (winterMonths.includes(month)) return 'bg-slate-50 border-slate-200';
  if (springMonths.includes(month)) return 'bg-emerald-50 border-emerald-200';
  if (summerMonths.includes(month)) return 'bg-amber-50 border-amber-200';
  return 'bg-orange-50 border-orange-200';
};

export default function SeasonalCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const currentMonth = monthOrder[currentMonthIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-shs-cream via-white to-shs-sand/30">
      {/* Premium Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-shs-forest-800 via-shs-forest-700 to-emerald-800 text-white py-16 md:py-20 px-6">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="flex items-center gap-4 mb-4"
          >
            <span className="text-5xl">🌙</span>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-black tracking-tight"
              >
                Secwépemc Seasonal Round
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl opacity-90 font-light mt-1"
              >
                Pellc7ellcw7ú7llcwten̓ — The 12 Moons of the Traditional Year
              </motion.p>
            </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm opacity-70 max-w-2xl mt-4"
          >
            Source: <em>Secwépemc People and Plants: Research Papers in Shuswap Ethnobotany</em> (Table 1, p. 38)
          </motion.p>
        </div>
      </section>

      {/* Current Month Banner */}
      {(() => {
        const current = months.find(m => m.month === currentMonth);
        if (!current) return null;
        return (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`bg-gradient-to-r ${getSeasonColor(currentMonth)} text-white py-4 px-6`}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.span 
                  className="text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {monthIcons[currentMonth]}
                </motion.span>
                <div>
                  <p className="text-sm font-medium opacity-80">This Month</p>
                  <p className="font-bold text-lg">
                    {currentMonth} — <span className="font-normal">{current.names[0]?.secwepemc}</span>
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-80 hidden md:block max-w-md text-right">
                {current.names[0]?.english}
              </p>
            </div>
          </motion.div>
        );
      })()}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Calendar Wheel Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">
          {reorderedMonths.map((month, idx) => {
            const isCurrentMonth = month.month === currentMonth;
            const isSelected = month.month === selectedMonth;
            
            return (
              <motion.button
                key={month.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMonth(isSelected ? null : month.month)}
                className={`relative group p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-shs-forest-600 bg-white shadow-xl'
                    : isCurrentMonth
                    ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : `${getSeasonBg(month.month)} hover:shadow-lg`
                }`}
              >
                {/* Month number badge */}
                <motion.span 
                  className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected 
                      ? 'bg-shs-forest-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-500'
                  }`}
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {idx + 1}
                </motion.span>
                
                {isCurrentMonth && (
                  <motion.span 
                    className="absolute -top-2 -left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Now
                  </motion.span>
                )}
                
                <div className="flex items-start gap-3">
                  <motion.span 
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {monthIcons[month.month]}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-shs-forest-800 text-lg">{month.month}</h3>
                    {month.names[0] && (
                      <>
                        <p className="text-shs-forest-600 font-semibold text-sm mt-1 break-words">
                          {month.names[0].secwepemc}
                        </p>
                        <p className="text-xs text-gray-600 italic mt-0.5">
                          {month.names[0].english}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Preview activities on hover */}
                <p className="mt-3 text-xs text-gray-500 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {month.subsistenceActivities.slice(0, 80)}...
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Month Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedMonth && (() => {
            const month = months.find(m => m.month === selectedMonth);
            if (!month) return null;
            
            return (
              <motion.div 
                key={selectedMonth}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden"
              >
                {/* Detail Header */}
                <div className={`bg-gradient-to-r ${getSeasonColor(month.month)} text-white p-8`}>
                  <div className="flex items-start gap-6">
                    <motion.div 
                      className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-5xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    >
                      {monthIcons[month.month]}
                    </motion.div>
                    <div className="flex-1">
                      <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black"
                      >
                        {month.month}
                      </motion.h2>
                      <motion.div 
                        className="mt-2 space-y-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {month.names.map((name, idx) => (
                          <p key={idx} className="text-lg">
                            <span className="font-bold">{name.secwepemc}</span>
                            <span className="opacity-80 ml-2">— {name.english}</span>
                          </p>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Activities Section */}
                <motion.div 
                  className="p-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-bold text-shs-forest-800 text-lg mb-4 flex items-center gap-2">
                    <FloatingIcon icon="🏕️" size="sm" />
                    Subsistence Activities
                  </h3>
                  <p className="text-shs-text-body leading-relaxed text-lg bg-gradient-to-br from-shs-sand/30 to-emerald-50/30 rounded-2xl p-6 border border-shs-sand">
                    {month.subsistenceActivities}
                  </p>
                  
                  {/* Citation */}
                  <p className="mt-6 text-xs text-gray-400 flex items-center gap-2">
                    <span>📖</span>
                    Source: Table 1, p. 38 (PDF p. {seasonalData.metadata.pdfPage})
                  </p>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* About Section */}
        <SectionReveal delay={0.2}>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <AnimatedCard className="p-6" glass>
              <h3 className="font-bold text-shs-forest-800 mb-3 flex items-center gap-2">
                <motion.span 
                  className="text-2xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  📅
                </motion.span>
                Understanding the Calendar
              </h3>
              <p className="text-shs-text-body text-sm leading-relaxed">
                The traditional Secwépemc year begins in <strong>November</strong> with "Pellc7ellcw7ú7llcwten̓" 
                (Entering Month), when people and animals enter their winter homes. Each moon's name 
                describes the seasonal activities and natural phenomena during that time.
              </p>
            </AnimatedCard>
            
            <AnimatedCard delay={0.1} className="p-6" glass>
              <h3 className="font-bold text-shs-forest-800 mb-3 flex items-center gap-2">
                <motion.span 
                  className="text-2xl"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  🌿
                </motion.span>
                Seasonal Wisdom
              </h3>
              <p className="text-shs-text-body text-sm leading-relaxed">
                This calendar reflects deep ecological knowledge passed down through generations, 
                connecting the Secwépemc people to the land through <strong>hunting, fishing, 
                gathering, and ceremony</strong> in alignment with natural cycles.
              </p>
            </AnimatedCard>
          </div>
        </SectionReveal>

        {/* Elder Wisdom - Contextual Quote */}
        {curatedQuotes.land_stewardship?.[0] && (
          <SectionReveal delay={0.3}>
            <div className="mt-12">
              <ElderQuoteCard 
                quote={curatedQuotes.land_stewardship[0]} 
                variant="featured"
              />
            </div>
          </SectionReveal>
        )}

        {/* Season Legend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {[
            { label: 'Winter (Nov-Feb)', color: 'from-slate-600 to-slate-500' },
            { label: 'Spring (Mar-May)', color: 'from-emerald-600 to-green-500' },
            { label: 'Summer (Jun-Aug)', color: 'from-amber-500 to-yellow-400' },
            { label: 'Fall (Sep-Oct)', color: 'from-orange-500 to-red-400' },
          ].map((season) => (
            <motion.span 
              key={season.label}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100"
            >
              <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${season.color}`} />
              <span className="text-gray-600">{season.label}</span>
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
