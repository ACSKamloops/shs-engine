/**
 * EventsPage - Community Events (Modernized Jan 2026)
 * Features: Framer Motion animations, hero image, animated cards, premium UI
 */
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventCalendar } from '../../components/public/EventCalendar';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

// Event type
interface Event {
  id: string;
  title: string;
  date: string;
  isoDate: string;
  time: string;
  location: string;
  type: 'camp' | 'workshop' | 'gathering' | 'ceremony';
  description: string;
  icon: string;
  registration: 'open' | 'closed' | 'coming-soon' | 'waitlist';
  spots?: number;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Spring Food Sovereignty Camp',
    date: 'April 15-19, 2026',
    isoDate: '2026-04-15',
    time: 'Full Day',
    location: 'Adams Lake Area',
    type: 'camp',
    icon: '🏕️',
    description: 'Join us for a 5-day immersive camp focused on traditional hunting protocols, fishing techniques, and plant gathering.',
    registration: 'coming-soon',
    spots: 15,
  },
  {
    id: '2',
    title: 'Youth Leadership Gathering',
    date: 'May 8-10, 2026',
    isoDate: '2026-05-08',
    time: '9:00 AM - 5:00 PM',
    location: 'Chase Community Center',
    type: 'gathering',
    icon: '👨‍👩‍👧',
    description: 'A weekend gathering for youth ages 14-25 to develop leadership skills through cultural teachings and mentorship.',
    registration: 'coming-soon',
    spots: 30,
  },
  {
    id: '3',
    title: 'Traditional Arts Workshop',
    date: 'June 14, 2026',
    isoDate: '2026-06-14',
    time: '10:00 AM - 4:00 PM',
    location: 'Secwépemc Cultural Centre',
    type: 'workshop',
    icon: '🎨',
    description: 'Learn traditional Secwépemc arts and crafts from skilled practitioners. All materials provided.',
    registration: 'coming-soon',
    spots: 20,
  },
  {
    id: '4',
    title: 'Summer Cultural Camp',
    date: 'July 12-19, 2026',
    isoDate: '2026-07-12',
    time: 'Full Week',
    location: 'Secwepemcúl̓ecw',
    type: 'camp',
    icon: '🌲',
    description: 'Our flagship week-long cultural camp bringing together Elders, families, and youth for comprehensive land-based learning.',
    registration: 'coming-soon',
    spots: 40,
  },
];

const pastEvents = [
  { title: 'Fall Hunting Camp 2025', date: 'September 2025', participants: 25, icon: '🦌' },
  { title: 'Summer Youth Camp 2025', date: 'July 2025', participants: 35, icon: '⛺' },
  { title: 'Spring Gathering 2025', date: 'April 2025', participants: 60, icon: '🌸' },
];

const eventTypeStyles = {
  camp: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Cultural Camp', gradient: 'from-emerald-500 to-teal-500' },
  workshop: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Workshop', gradient: 'from-amber-500 to-orange-500' },
  gathering: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Gathering', gradient: 'from-sky-500 to-blue-500' },
  ceremony: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Ceremony', gradient: 'from-purple-500 to-pink-500' },
};

const registrationStyles = {
  open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Registration Open' },
  closed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Closed' },
  'coming-soon': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Coming Soon' },
  waitlist: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Waitlist' },
};

function EventCard({ event, index }: { event: Event; index: number }) {
  const typeStyle = eventTypeStyles[event.type];
  const regStyle = registrationStyles[event.registration];

  return (
    <AnimatedCard delay={index * 0.1} className="overflow-hidden group">
      {/* Gradient header */}
      <div className={`h-3 bg-gradient-to-r ${typeStyle.gradient}`} />
      
      <div className="p-6">
        {/* Icon and badges */}
        <div className="flex items-start justify-between mb-4">
          <motion.span 
            className="text-4xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {event.icon}
          </motion.span>
          <div className="flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
              {typeStyle.label}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-shs-forest-800 mb-3 group-hover:text-emerald-700 transition-colors">
          {event.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${regStyle.bg} ${regStyle.text}`}>
              {regStyle.label}
            </span>
            {event.spots && (
              <span className="text-xs text-gray-400">{event.spots} spots</span>
            )}
          </div>
          <motion.div whileHover={{ x: 4 }}>
            <Link
              to="/contact"
              className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 flex items-center gap-1"
            >
              Details <span>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </AnimatedCard>
  );
}

export function EventsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredEvents = filter === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(e => e.type === filter);

  const calendarEvents = upcomingEvents.map(e => ({
    id: e.id,
    title: e.title,
    date: e.isoDate,
    category: e.type,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[450px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/heroes/events_hero.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-shs-forest-900/80" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-6"
            >
              🎪
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
              Events & Gatherings
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join us at cultural camps, workshops, and community gatherings throughout the year.
            </p>
            <div className="flex gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#events"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30"
              >
                <FloatingIcon icon="📅" size="sm" />
                View Events
              </motion.a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-2xl border border-white/30"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-gradient-to-b from-shs-forest-900 via-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 text-emerald-700 text-sm font-semibold rounded-full mb-4 shadow-sm"
                >
                  <FloatingIcon icon="✨" size="sm" delay={0.2} />
                  2026 Calendar
                </motion.span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                  Upcoming Events
                </h2>
              </div>

              {/* View Toggle */}
              <div className="flex bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-lg">
                {[
                  { mode: 'list', icon: '📋', label: 'List' },
                  { mode: 'calendar', icon: '📆', label: 'Calendar' },
                ].map(({ mode, icon, label }) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode(mode as 'list' | 'calendar')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Filter Pills */}
          {viewMode === 'list' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {[
                { value: 'all', label: 'All Events', icon: '🌟' },
                { value: 'camp', label: 'Camps', icon: '🏕️' },
                { value: 'workshop', label: 'Workshops', icon: '🎨' },
                { value: 'gathering', label: 'Gatherings', icon: '👨‍👩‍👧' },
              ].map((btn) => (
                <motion.button
                  key={btn.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(btn.value)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === btn.value
                      ? 'bg-white text-emerald-700 shadow-lg'
                      : 'bg-white/60 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  <span>{btn.icon}</span>
                  {btn.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Event Cards */}
          <AnimatePresence mode="wait">
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </motion.div>
            )}

            {viewMode === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EventCalendar events={calendarEvents} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-800 via-teal-800 to-cyan-900 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-5 text-8xl">📬</div>
          <div className="absolute bottom-5 right-5 text-8xl">🔔</div>
        </div>
        
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <SectionReveal>
            <FloatingIcon icon="📩" size="xl" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 mt-4">
              Never Miss an Event
            </h2>
            <p className="text-lg text-emerald-200 mb-10">
              Subscribe to be the first to know when registration opens.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                required
              />
              <GlowButton className="whitespace-nowrap">
                Subscribe ✨
              </GlowButton>
            </form>
          </SectionReveal>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <SectionReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full mb-4">
                📸 Looking Back
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4">
                Past Events
              </h2>
              <p className="text-lg text-gray-600">
                A glimpse of recent gatherings and their impact.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <AnimatedCard key={event.title} delay={index * 0.15} className="p-8 text-center">
                <motion.span 
                  className="text-5xl block mb-4"
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {event.icon}
                </motion.span>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  {event.participants}
                </div>
                <div className="text-sm text-gray-400 mb-3">participants</div>
                <h3 className="font-bold text-shs-forest-800 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.date}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <SectionReveal>
            <FloatingIcon icon="🤝" size="xl" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800 mb-4 mt-4">
              Want to Partner on an Event?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
              We collaborate with communities, schools, and organizations to bring cultural programming to your area.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
              >
                <span>Discuss Partnership</span>
                <span className="text-2xl">→</span>
              </Link>
            </motion.div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

export default EventsPage;
