/**
 * EventsPage - Community Events and Gatherings
 */
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Hero } from '../../components/public/Hero';
import { EventCalendar } from '../../components/public/EventCalendar';

// Intersection observer hook
function useIntersectionObserver() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsIntersecting(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

// Event type
interface Event {
  id: string;
  title: string;
  date: string;
  isoDate: string; // For calendar
  time: string;
  location: string;
  type: 'camp' | 'workshop' | 'gathering' | 'ceremony';
  description: string;
  image?: string;
  registration: 'open' | 'closed' | 'coming-soon' | 'waitlist';
  spots?: number;
}

// Sample events (placeholder - will be dynamic later)
const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Spring Food Sovereignty Camp',
    date: 'April 15-19, 2026',
    isoDate: '2026-04-15',
    time: 'Full Day',
    location: 'Adams Lake Area',
    type: 'camp',
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
    description: 'Our flagship week-long cultural camp bringing together Elders, families, and youth for comprehensive land-based learning.',
    registration: 'coming-soon',
    spots: 40,
  },
];

// Past events
const pastEvents = [
  {
    title: 'Fall Hunting Camp 2025',
    date: 'September 2025',
    participants: 25,
  },
  {
    title: 'Summer Youth Camp 2025',
    date: 'July 2025',
    participants: 35,
  },
  {
    title: 'Spring Gathering 2025',
    date: 'April 2025',
    participants: 60,
  },
];

const eventTypeStyles = {
  camp: { bg: 'bg-shs-forest-100', text: 'text-shs-forest-700', label: 'Cultural Camp' },
  workshop: { bg: 'bg-shs-amber-100', text: 'text-shs-amber-700', label: 'Workshop' },
  gathering: { bg: 'bg-shs-earth-100', text: 'text-shs-earth-700', label: 'Gathering' },
  ceremony: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Ceremony' },
};

const registrationStyles = {
  open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Registration Open' },
  closed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Registration Closed' },
  'coming-soon': { bg: 'bg-shs-amber-100', text: 'text-shs-amber-700', label: 'Coming Soon' },
  waitlist: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Waitlist Only' },
};

function EventCard({ event, index }: { event: Event; index: number }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const typeStyle = eventTypeStyles[event.type];
  const regStyle = registrationStyles[event.registration];

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`bg-white rounded-2xl border border-shs-stone overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Image placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-shs-forest-100 to-shs-earth-100">
        <div className="absolute inset-0 flex items-center justify-center text-shs-forest-300">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
            {typeStyle.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${regStyle.bg} ${regStyle.text}`}>
            {regStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-shs-forest-800 mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="space-y-1.5 text-sm text-shs-text-muted mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {event.date}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </div>
        </div>

        <p className="text-shs-text-body text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          {event.spots && (
            <span className="text-xs text-shs-text-muted">{event.spots} spots</span>
          )}
          <Link
            to="/contact"
            className="text-shs-forest-600 font-semibold text-sm hover:text-shs-forest-800 transition-colors ml-auto"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function EventsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const pastSection = useIntersectionObserver();

  const filteredEvents = filter === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(e => e.type === filter);

  // Convert events for calendar
  const calendarEvents = upcomingEvents.map(e => ({
    id: e.id,
    title: e.title,
    date: e.isoDate,
    category: e.type,
  }));

  return (
    <div>
      {/* Hero */}
      <Hero
        headline="Events & Gatherings"
        subheadline="Join us at our cultural camps, workshops, and community gatherings throughout the year."
        primaryCta={{ label: 'Contact for Info', to: '/contact' }}
        size="medium"
      />

      {/* Upcoming Events */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
                2026 Calendar
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800">
                Upcoming Events
              </h2>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex bg-white border border-shs-stone rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-shs-forest-600 text-white'
                      : 'text-shs-text-body hover:bg-shs-sand'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-shs-forest-600 text-white'
                      : 'text-shs-text-body hover:bg-shs-sand'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Filter buttons - only show in list view */}
          {viewMode === 'list' && (
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { value: 'all', label: 'All Events' },
                { value: 'camp', label: 'Camps' },
                { value: 'workshop', label: 'Workshops' },
                { value: 'gathering', label: 'Gatherings' },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === btn.value
                      ? 'bg-shs-forest-600 text-white'
                      : 'bg-white border border-shs-stone text-shs-text-body hover:border-shs-forest-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-shs-cream rounded-2xl">
                <p className="text-shs-text-muted">No events found for this category.</p>
              </div>
            )
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <EventCalendar events={calendarEvents} />
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-shs-forest-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Never Miss an Event</h2>
          <p className="text-shs-forest-200 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter and be the first to know when registration opens for camps and events.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-shs-forest-700 border border-shs-forest-600 rounded-xl text-white placeholder-shs-forest-400 focus:outline-none focus:border-shs-amber-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Past Events */}
      <section
        ref={pastSection.ref as React.RefObject<HTMLElement>}
        className="py-20 md:py-28 bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
              Past Events
            </h2>
            <p className="text-shs-text-body">
              A look back at recent gatherings and their impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event, index) => (
              <div
                key={event.title}
                className={`bg-shs-sand rounded-xl p-6 text-center transition-all duration-500 ${
                  pastSection.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-shs-forest-700 mb-1">
                  {event.participants}
                </div>
                <div className="text-sm text-shs-text-muted mb-2">participants</div>
                <h3 className="font-semibold text-shs-forest-800">{event.title}</h3>
                <p className="text-sm text-shs-text-muted">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host an Event CTA */}
      <section className="py-16 bg-gradient-to-br from-shs-earth-100 to-shs-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
            Want to Partner on an Event?
          </h2>
          <p className="text-shs-text-body mb-8 max-w-xl mx-auto">
            We collaborate with communities, schools, and organizations to bring cultural programming to your area.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors shadow-lg"
          >
            Discuss Partnership
          </Link>
        </div>
      </section>
    </div>
  );
}
