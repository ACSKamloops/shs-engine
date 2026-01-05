/**
 * EventCalendar Component - Month View Calendar for Events
 * Features: Month navigation, event indicators, click to view events
 */
import { useState, useMemo } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  category?: string;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date, events: CalendarEvent[]) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add padding days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add padding days for next month to complete grid
  const endPadding = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function EventCalendar({ events, onDateSelect }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get days for current month view
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  
  // Map events to dates
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateStr = event.date.split('T')[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(event);
    });
    return map;
  }, [events]);
  
  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return eventsByDate.get(dateStr) || [];
  }, [selectedDate, eventsByDate]);
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const dateEvents = eventsByDate.get(dateStr) || [];
    onDateSelect?.(date, dateEvents);
  };
  
  return (
    <div className="bg-white rounded-2xl border border-shs-stone overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-shs-stone bg-shs-sand/50">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-shs-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-shs-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <h2 className="text-lg font-bold text-shs-forest-800">
          {MONTHS[month]} {year}
        </h2>
        
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-sm font-medium text-shs-forest-700 bg-white border border-shs-stone rounded-lg hover:bg-shs-forest-50 transition-colors"
        >
          Today
        </button>
      </div>
      
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-shs-stone">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-shs-text-muted uppercase"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayEvents = eventsByDate.get(dateStr) || [];
          const isCurrentMonth = date.getMonth() === month;
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                relative min-h-[80px] p-2 border-r border-b border-shs-stone/50 text-left
                transition-colors
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isSelected ? 'ring-2 ring-inset ring-shs-forest-500 bg-shs-forest-50' : ''}
                ${dayEvents.length > 0 ? 'hover:bg-shs-amber-50' : 'hover:bg-gray-100'}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full
                  ${isTodayDate ? 'bg-shs-forest-600 text-white' : ''}
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-shs-forest-800'}
                `}
              >
                {date.getDate()}
              </span>
              
              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs px-1.5 py-0.5 bg-shs-amber-100 text-shs-amber-800 rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-shs-text-muted px-1.5">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Selected Date Events Panel */}
      {selectedDate && (
        <div className="border-t border-shs-stone p-4 bg-shs-sand/30">
          <h3 className="font-semibold text-shs-forest-800 mb-2">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-shs-text-muted">No events on this day</p>
          ) : (
            <ul className="space-y-2">
              {selectedDateEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-shs-stone"
                >
                  <div className="w-2 h-2 rounded-full bg-shs-amber-500" />
                  <span className="text-sm font-medium text-shs-forest-800">{event.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
