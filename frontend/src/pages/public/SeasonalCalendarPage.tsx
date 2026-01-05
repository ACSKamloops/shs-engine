import { useState } from 'react';
import seasonalData from '../../data/calendar/seasonal_round.json';

interface MonthData {
  month: string;
  names: { secwepemc: string; english: string }[];
  subsistenceActivities: string;
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

export default function SeasonalCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const currentMonth = monthOrder[currentMonthIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-shs-sand/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-700 to-shs-forest-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2">Secwépemc Seasonal Calendar</h1>
          <p className="text-xl opacity-90">12 Months of the Traditional Year</p>
          <p className="text-sm opacity-75 mt-2">
            Source: Secwépemc People and Plants Research Papers
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {reorderedMonths.map((month) => {
            const isCurrentMonth = month.month === currentMonth;
            const isSelected = month.month === selectedMonth;
            
            return (
              <button
                key={month.month}
                onClick={() => setSelectedMonth(isSelected ? null : month.month)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-shs-forest-600 bg-shs-forest-50 shadow-lg scale-105'
                    : isCurrentMonth
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-shs-stone/30 bg-white hover:border-shs-forest-300 hover:shadow-md'
                }`}
              >
                {isCurrentMonth && (
                  <span className="text-xs font-bold text-amber-600 mb-1 block">NOW</span>
                )}
                <h3 className="font-bold text-shs-forest-800 text-lg">{month.month}</h3>
                {month.names[0] && (
                  <>
                    <p className="text-shs-forest-600 font-semibold text-sm mt-1">
                      {month.names[0].secwepemc}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      {month.names[0].english}
                    </p>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Month Detail */}
        {selectedMonth && (
          <div className="bg-white rounded-3xl border border-shs-stone/30 p-8 shadow-lg animate-fadeIn">
            {(() => {
              const month = months.find(m => m.month === selectedMonth);
              if (!month) return null;
              
              return (
                <>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-shs-forest-100 flex items-center justify-center text-3xl">
                      🗓️
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-shs-forest-800">{month.month}</h2>
                      {month.names.map((name, idx) => (
                        <div key={idx} className="mt-1">
                          <span className="font-bold text-shs-forest-600">{name.secwepemc}</span>
                          <span className="text-gray-600 ml-2">— {name.english}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-shs-sand/50 rounded-2xl p-6">
                    <h3 className="font-bold text-shs-forest-700 mb-3 flex items-center gap-2">
                      <span className="text-xl">🏕️</span>
                      Subsistence Activities
                    </h3>
                    <p className="text-shs-text-body leading-relaxed">
                      {month.subsistenceActivities}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="mt-10 p-6 bg-shs-forest-50 rounded-2xl">
          <h3 className="font-bold text-shs-forest-800 mb-4">About the Secwépemc Calendar</h3>
          <p className="text-shs-text-body">
            The traditional Secwépemc year begins in November with "Pellc7ellcw7ú7llcwten̓" 
            (Entering Month), when people and animals enter their winter homes. Each month 
            name describes the seasonal activities and natural phenomena occurring during that time.
          </p>
        </div>
      </div>
    </div>
  );
}
