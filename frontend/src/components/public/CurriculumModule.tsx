/**
 * CurriculumModule - Interactive Learning Module Component
 * Displays curriculum content with FlipCards, expandable lessons, and vocabulary practice
 * Matches site design system with animations and interactions
 */
import { useState, useRef, useEffect } from 'react';
import { FlipCard } from './FlipCard';
import { SeasonalCalendar } from './SeasonalCalendar';
import { VideoPlayer } from './VideoPlayer';

// Types
interface VocabularyItem {
  secwepemc: string;
  english: string;
  partOfSpeech?: string;
}

interface Lesson {
  lessonId: string;
  title: string;
  source?: string;
  content?: any;
  steps?: string[];
  protocol?: string[];
  methods?: any[];
  divisions?: { name: string; location: string; villages: string[] }[];
  moons?: { month: string; secwepemc: string; english: string; activities: string }[];
  [key: string]: any;
}

interface LandscapeTerm {
  secwepemc: string;
  english: string;
  morphology?: string;
}

interface LexicalSuffix {
  suffix: string;
  meaning: string;
}

interface LessonVocabulary {
  source?: string;
  lessons?: number[];
  words: { secwepemc: string; english: string; lesson?: number }[];
}

interface Unit {
  unitId: string;
  title: string;
  description: string;
  duration: string;
  season: string;
  lessons: Lesson[];
  vocabulary?: VocabularyItem[];
  lessonVocabulary?: LessonVocabulary;
  landscapeTerms?: { source?: string; terms: LandscapeTerm[] };
  lexicalSuffixes?: { source?: string; note?: string; bodyPartSuffixes?: LexicalSuffix[]; landscapeSuffixes?: LexicalSuffix[] };
  protocols?: string[];
  videoResources?: { title: string; duration?: string; presenter?: string; source?: string; url?: string }[];
}

interface CurriculumModuleProps {
  moduleId: string;
  title: string;
  subtitle: string;
  description: string;
  program: string;
  year: string;
  units: Unit[];
  tprRoutines?: { secwepemc: string; english: string }[];
  colorScheme?: 'forest' | 'amber' | 'earth';
}

// Animation hook
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

// Color schemes matching site design
const colorSchemes = {
  forest: {
    badge: 'bg-shs-forest-100 text-shs-forest-700',
    header: 'bg-shs-forest-600 text-white',
    headerHover: 'hover:bg-shs-forest-50',
    accent: 'bg-shs-forest-500',
    muted: 'text-shs-forest-100',
    flip: 'bg-shs-forest-700',
    border: 'border-shs-forest-200',
  },
  amber: {
    badge: 'bg-shs-amber-100 text-shs-amber-700',
    header: 'bg-shs-amber-500 text-white',
    headerHover: 'hover:bg-shs-amber-50',
    accent: 'bg-shs-amber-400',
    muted: 'text-shs-amber-100',
    flip: 'bg-shs-amber-600',
    border: 'border-shs-amber-200',
  },
  earth: {
    badge: 'bg-shs-earth-100 text-shs-earth-700',
    header: 'bg-shs-earth-600 text-white',
    headerHover: 'hover:bg-shs-earth-50',
    accent: 'bg-shs-earth-500',
    muted: 'text-shs-earth-100',
    flip: 'bg-shs-earth-700',
    border: 'border-shs-earth-200',
  },
};

// Module icons
const moduleIcons: Record<string, string> = {
  food_sovereignty: '🍖',
  land_stewardship: '🌲',
  cultural_preservation: '🎭',
  healing_wellness: '💚',
  youth_mentorship: '👨‍👩‍👧',
};

// Unit Component with expandable content
function UnitCard({ 
  unit, 
  index, 
  isExpanded, 
  onToggle,
  colors,
}: { 
  unit: Unit; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colors: typeof colorSchemes.forest;
}) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`rounded-2xl overflow-hidden transition-all duration-500 ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Unit Header */}
      <button
        onClick={onToggle}
        className={`w-full p-5 flex items-center gap-4 transition-all duration-300 ${
          isExpanded 
            ? `${colors.header}` 
            : `bg-shs-sand ${colors.headerHover} text-shs-forest-800`
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          isExpanded ? 'bg-white/20' : 'bg-white shadow-sm'
        }`}>
          {index + 1}
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-bold text-lg">{unit.title}</h4>
          <p className={`text-sm ${isExpanded ? colors.muted : 'text-shs-text-muted'}`}>
            {unit.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-right ${isExpanded ? 'text-white/80' : 'text-shs-text-muted'}`}>
            <span className="text-xs block">{unit.season}</span>
            <span className="text-xs font-semibold">{unit.duration}</span>
          </div>
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="bg-white border-x border-b border-shs-stone/30 animate-fadeIn">
          {/* Lessons */}
          <div className="p-6 border-b border-shs-stone/20">
            <h5 className="font-semibold text-shs-forest-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lessons ({unit.lessons.length})
            </h5>
            <div className="space-y-3">
              {unit.lessons.map((lesson) => (
                <div key={lesson.lessonId} className="rounded-xl overflow-hidden border border-shs-stone/30">
                  <button
                    onClick={() => setActiveLesson(activeLesson === lesson.lessonId ? null : lesson.lessonId)}
                    className="w-full p-4 flex items-center justify-between bg-shs-sand/50 hover:bg-shs-sand transition-colors"
                  >
                    <div className="text-left">
                      <h6 className="font-semibold text-shs-forest-800">{lesson.title}</h6>
                      {lesson.source && (
                        <span className="text-xs text-shs-text-muted">Source: {lesson.source}</span>
                      )}
                    </div>
                    <svg 
                      className={`w-4 h-4 text-shs-forest-500 transition-transform ${activeLesson === lesson.lessonId ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {activeLesson === lesson.lessonId && (
                    <div className="p-4 bg-white border-t border-shs-stone/20 animate-fadeIn">
                      {/* Render lesson content based on type */}
                      
                      {/* SeasonalCalendar for moons data */}
                      {lesson.moons && Array.isArray(lesson.moons) && (
                        <div className="mb-4">
                          <SeasonalCalendar moons={lesson.moons} showQuizMode={true} />
                        </div>
                      )}
                      
                      {lesson.steps && (
                        <div className="mb-4">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Steps:</h6>
                          <ol className="list-decimal list-inside space-y-1">
                            {lesson.steps.map((step: string, i: number) => (
                              <li key={i} className="text-sm text-shs-text-body">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {lesson.protocol && (
                        <div className="mb-4">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Protocol:</h6>
                          <ol className="list-decimal list-inside space-y-1">
                            {lesson.protocol.map((step: string, i: number) => (
                              <li key={i} className="text-sm text-shs-text-body">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {/* Array content (like hunting methods, animals, roots, berries) */}
                      {lesson.content && Array.isArray(lesson.content) && lesson.content.length > 0 && (
                        <div className="space-y-3">
                          {lesson.content.map((item: any, i: number) => (
                            <div key={i} className="bg-shs-sand/30 p-4 rounded-lg border-l-4 border-shs-forest-400">
                              {item.method && (
                                <>
                                  <h6 className="font-bold text-shs-forest-700 mb-1">{item.method}</h6>
                                  <p className="text-sm text-shs-text-body">{item.description}</p>
                                </>
                              )}
                              {item.animal && (
                                <>
                                  <h6 className="font-bold text-shs-forest-700 mb-1">{item.animal}</h6>
                                  <p className="text-sm text-shs-text-body">{item.method || item.description}</p>
                                </>
                              )}
                              {item.secwepemc && !item.method && !item.animal && (
                                <>
                                  <h6 className="font-bold text-shs-forest-700">{item.secwepemc}</h6>
                                  <p className="text-sm text-shs-text-body">{item.english}</p>
                                  {item.season && <span className="text-xs text-shs-amber-600">Season: {item.season}</span>}
                                  {item.note && <span className="text-xs text-shs-text-muted italic ml-2">{item.note}</span>}
                                </>
                              )}
                              {item.english && !item.secwepemc && !item.method && !item.animal && (
                                <>
                                  <h6 className="font-bold text-shs-forest-700">{item.english}</h6>
                                  {item.season && <span className="text-xs text-shs-amber-600">Season: {item.season}</span>}
                                  {item.note && <span className="text-xs text-shs-text-muted italic ml-2">{item.note}</span>}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Object content (key-value pairs) */}
                      {lesson.content && typeof lesson.content === 'object' && !Array.isArray(lesson.content) && (
                        <div className="text-sm text-shs-text-body space-y-2">
                          {Object.entries(lesson.content).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-semibold text-shs-forest-600 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                              {typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      )}
                      {lesson.methods && (
                        <div className="space-y-3">
                          {lesson.methods.map((method: any, i: number) => (
                            <div key={i} className="bg-shs-sand/30 p-3 rounded-lg">
                              <h6 className="font-semibold text-shs-forest-700 mb-2">{method.name}</h6>
                              {method.steps && (
                                <ol className="list-decimal list-inside space-y-1">
                                  {method.steps.map((step: string, j: number) => (
                                    <li key={j} className="text-sm text-shs-text-body">{step}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Animals list */}
                      {lesson.animals && Array.isArray(lesson.animals) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Animals & Methods:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lesson.animals.map((item: any, i: number) => (
                              <div key={i} className="bg-shs-sand/30 p-3 rounded-lg border-l-4 border-shs-amber-400">
                                <h6 className="font-bold text-shs-forest-700 text-sm">{item.animal}</h6>
                                <p className="text-xs text-shs-text-body">{item.method}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Roots list */}
                      {lesson.roots && Array.isArray(lesson.roots) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Root Foods:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lesson.roots.map((item: any, i: number) => (
                              <div key={i} className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-400">
                                {item.secwepemc && <h6 className="font-bold text-emerald-800 text-sm">{item.secwepemc}</h6>}
                                <p className="text-sm text-shs-text-body">{item.english}</p>
                                {item.season && <span className="text-xs text-emerald-600">Season: {item.season}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Species list (fish) */}
                      {lesson.species && Array.isArray(lesson.species) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-sky-600 mb-2">Species:</h6>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {lesson.species.map((item: any, i: number) => (
                              <div key={i} className="bg-sky-50 p-3 rounded-lg border border-sky-200">
                                <h6 className="font-bold text-sky-800 text-sm">{item.secwepemc}</h6>
                                <p className="text-xs text-gray-600">{item.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Seasonal calendar */}
                      {lesson.calendar && Array.isArray(lesson.calendar) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Seasonal Calendar:</h6>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                             {lesson.calendar.map((item: any, i: number) => (
                              <div key={i} className="bg-shs-amber-50 p-3 rounded-lg border border-shs-amber-200">
                                <h6 className="font-bold text-shs-amber-700 text-sm">{item.month}</h6>
                                <p className="text-xs text-shs-text-body">{item.berries?.join(', ') || item.activities}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Phrases array (greetings, etc.) */}
                      {lesson.phrases && Array.isArray(lesson.phrases) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Phrases:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lesson.phrases.map((phrase: any, i: number) => (
                              <div key={i} className="bg-shs-forest-50 p-3 rounded-lg border border-shs-forest-200">
                                <p className="font-bold text-shs-forest-800">{phrase.secwepemc}</p>
                                <p className="text-sm text-gray-600">{phrase.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Pattern array (introductions, etc.) */}
                      {lesson.pattern && Array.isArray(lesson.pattern) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-violet-600 mb-2">Pattern:</h6>
                          <div className="space-y-2">
                            {lesson.pattern.map((p: any, i: number) => (
                              <div key={i} className="bg-violet-50 p-3 rounded-lg border-l-4 border-violet-400">
                                <p className="font-bold text-violet-800">{p.secwepemc}</p>
                                <p className="text-sm text-gray-600">{p.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Numbers array */}
                      {lesson.numbers && Array.isArray(lesson.numbers) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-sky-600 mb-2">Numbers:</h6>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {lesson.numbers.map((n: any, i: number) => (
                              <div key={i} className="bg-sky-50 p-2 rounded-lg border border-sky-200 text-center">
                                <p className="text-lg font-bold text-sky-800">{n.number}</p>
                                <p className="text-sm font-medium text-sky-700">{n.secwepemc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Commands array (TPR) */}
                      {lesson.commands && Array.isArray(lesson.commands) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-emerald-600 mb-2">Commands:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lesson.commands.map((cmd: any, i: number) => (
                              <div key={i} className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                <p className="font-bold text-emerald-800">{cmd.secwepemc}</p>
                                <p className="text-sm text-gray-600">{cmd.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Colors array */}
                      {lesson.colors && Array.isArray(lesson.colors) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-pink-600 mb-2">Colors:</h6>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {lesson.colors.map((c: any, i: number) => (
                              <div key={i} className="bg-gradient-to-br from-pink-50 to-purple-50 p-2 rounded-lg border border-pink-200 text-center">
                                <p className="font-bold text-pink-800 text-sm">{c.secwepemc}</p>
                                <p className="text-xs text-gray-600">{c.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Days array */}
                      {lesson.days && Array.isArray(lesson.days) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-indigo-600 mb-2">Days of the Week:</h6>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {lesson.days.map((d: any, i: number) => (
                              <div key={i} className="bg-indigo-50 p-2 rounded-lg border border-indigo-200 text-center">
                                <p className="font-bold text-indigo-800 text-sm">{d.secwepemc}</p>
                                <p className="text-xs text-gray-600">{d.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Stories array */}
                      {lesson.stories && Array.isArray(lesson.stories) && (
                        <div className="space-y-3">
                          {lesson.stories.map((story: any, i: number) => (
                            <div key={i} className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                              <h6 className="font-bold text-amber-800">{story.title}</h6>
                              {story.secwepemc && <p className="text-sm text-amber-700 italic">{story.secwepemc}</p>}
                              {story.moral && <p className="text-sm text-gray-600 mt-1">Moral: {story.moral}</p>}
                              {story.theme && <p className="text-sm text-gray-600 mt-1">Theme: {story.theme}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Types array (song types, etc.) */}
                      {lesson.types && Array.isArray(lesson.types) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-purple-600 mb-2">Types:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lesson.types.map((t: any, i: number) => (
                              <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <p className="font-bold text-purple-800">{t.type || t.name}</p>
                                <p className="text-sm text-gray-600">{t.occasion || t.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Dances array */}
                      {lesson.dances && Array.isArray(lesson.dances) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-rose-600 mb-2">Traditional Dances:</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lesson.dances.map((d: any, i: number) => (
                              <div key={i} className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                                <p className="font-bold text-rose-800">{d.name}</p>
                                <p className="text-xs text-gray-600">{d.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Approach object (TPR method, etc.) */}
                      {lesson.approach && typeof lesson.approach === 'object' && (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                          <h6 className="font-bold text-teal-800 mb-2">{lesson.approach.name}</h6>
                          {lesson.approach.principle && <p className="text-sm text-gray-700 mb-2">{lesson.approach.principle}</p>}
                          {lesson.approach.implementation && <p className="text-sm text-gray-600 mb-2 italic">{lesson.approach.implementation}</p>}
                          {lesson.approach.advantages && (
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {lesson.approach.advantages.map((a: string, i: number) => <li key={i}>{a}</li>)}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {/* Skills / Components / Principles arrays (string lists) */}
                      {lesson.skills && Array.isArray(lesson.skills) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-orange-600 mb-2">Skills:</h6>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {lesson.skills.map((skill: string, i: number) => <li key={i}>{skill}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {lesson.components && Array.isArray(lesson.components) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-cyan-600 mb-2">Components:</h6>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {lesson.components.map((c: string, i: number) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {lesson.principles && Array.isArray(lesson.principles) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-blue-600 mb-2">Principles:</h6>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {lesson.principles.map((p: string, i: number) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {/* Places array */}
                      {lesson.places && Array.isArray(lesson.places) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-amber-600 mb-2">Place Names:</h6>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {lesson.places.map((place: any, i: number) => (
                              <div key={i} className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                                <p className="font-bold text-amber-800 text-sm">{place.secwepemc}</p>
                                <p className="text-xs text-gray-600">{place.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Rivers array (string list) */}
                      {lesson.rivers && Array.isArray(lesson.rivers) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-blue-600 mb-2">Rivers:</h6>
                          <div className="flex flex-wrap gap-2">
                            {lesson.rivers.map((river: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{river}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Vocabulary inside lesson */}
                      {lesson.vocabulary && Array.isArray(lesson.vocabulary) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Vocabulary:</h6>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {lesson.vocabulary.map((v: any, i: number) => (
                              <div key={i} className="bg-shs-forest-50 p-2 rounded-lg border border-shs-forest-200">
                                <p className="font-bold text-shs-forest-800 text-sm">{v.secwepemc}</p>
                                <p className="text-xs text-gray-600">{v.english}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Classifiers (number classifiers) */}
                      {lesson.classifiers && Array.isArray(lesson.classifiers) && (
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-indigo-600 mb-2">Counting Classifiers:</h6>
                          {lesson.classifiers.map((cat: any, i: number) => (
                            <div key={i} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                              <p className="font-bold text-indigo-800 mb-2">{cat.category}</p>
                              {cat.note && <p className="text-xs text-gray-600 italic mb-2">{cat.note}</p>}
                              {cat.examples && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {cat.examples.map((ex: any, j: number) => (
                                    <div key={j} className="bg-white p-2 rounded text-center">
                                      <p className="text-xs text-gray-600">{ex.count}</p>
                                      <p className="font-medium text-indigo-700 text-sm">{ex.secwepemc}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Materials array */}
                      {lesson.materials && Array.isArray(lesson.materials) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-amber-600 mb-2">Materials Needed:</h6>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {lesson.materials.map((m: string, i: number) => <li key={i}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      {/* Technique array */}
                      {lesson.technique && Array.isArray(lesson.technique) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-shs-forest-600 mb-2">Technique:</h6>
                          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                            {lesson.technique.map((t: string, i: number) => <li key={i}>{t}</li>)}
                          </ol>
                        </div>
                      )}
                      
                      {/* Model object (mentorship structure) */}
                      {lesson.model && typeof lesson.model === 'object' && (
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 space-y-2">
                          {lesson.model.structure && <p className="text-sm text-gray-700"><strong>Structure:</strong> {lesson.model.structure}</p>}
                          {lesson.model.ratio && <p className="text-sm text-gray-700"><strong>Ratio:</strong> {lesson.model.ratio}</p>}
                          {lesson.model.goal && <p className="text-sm text-gray-700"><strong>Goal:</strong> {lesson.model.goal}</p>}
                          {lesson.model.activities && (
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {lesson.model.activities.map((a: string, i: number) => <li key={i}>{a}</li>)}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {/* Teaching quote */}
                      {lesson.teaching && typeof lesson.teaching === 'string' && (
                        <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                          <p className="text-sm text-gray-700 italic">"{lesson.teaching}"</p>
                          {lesson.elder && <p className="text-xs text-amber-700 mt-2">— {lesson.elder}</p>}
                        </div>
                      )}
                      
                      {/* Key Teaching (legal traditions / education) */}
                      {lesson.keyTeaching && typeof lesson.keyTeaching === 'string' && (
                        <div className="bg-violet-50 p-4 rounded-lg border-l-4 border-violet-500">
                          <h6 className="text-sm font-semibold text-violet-700 mb-2">Key Teaching:</h6>
                          <p className="text-sm text-gray-700">{lesson.keyTeaching}</p>
                        </div>
                      )}
                      
                      {/* Discussion Questions */}
                      {lesson.discussionQuestions && Array.isArray(lesson.discussionQuestions) && (
                        <div className="space-y-2">
                          <h6 className="text-sm font-semibold text-sky-600">Discussion Questions:</h6>
                          <ul className="space-y-1">
                            {lesson.discussionQuestions.map((q: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-sky-500 mt-0.5">•</span>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Teaching Story (legal traditions) */}
                      {lesson.teachingStory && typeof lesson.teachingStory === 'object' && (
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <h6 className="font-bold text-amber-800 mb-1">{lesson.teachingStory.title}</h6>
                          <p className="text-sm text-gray-700">{lesson.teachingStory.summary}</p>
                        </div>
                      )}
                      
                      {/* Details object (coming of age training) */}
                      {lesson.details && typeof lesson.details === 'object' && (
                        <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 space-y-3">
                          {lesson.details.duration && (
                            <p className="text-sm"><strong>Duration:</strong> {lesson.details.duration}</p>
                          )}
                          {lesson.details.location && (
                            <p className="text-sm"><strong>Location:</strong> {lesson.details.location}</p>
                          )}
                          {lesson.details.preparation && (
                            <p className="text-sm"><strong>Preparation:</strong> {lesson.details.preparation}</p>
                          )}
                          {lesson.details.attire && Array.isArray(lesson.details.attire) && (
                            <div>
                              <p className="text-sm font-semibold text-rose-700">Attire:</p>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {lesson.details.attire.map((item: string, i: number) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                          {lesson.details.tools && Array.isArray(lesson.details.tools) && (
                            <div>
                              <p className="text-sm font-semibold text-rose-700">Tools:</p>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {lesson.details.tools.map((item: string, i: number) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                          {lesson.details.skills && Array.isArray(lesson.details.skills) && (
                            <div>
                              <p className="text-sm font-semibold text-rose-700">Skills Learned:</p>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {lesson.details.skills.map((item: string, i: number) => <li key={i}>{item}</li>)}
                              </ul>
                            </div>
                          )}
                          {lesson.details.tests && Array.isArray(lesson.details.tests) && (
                            <div>
                              <p className="text-sm font-semibold text-rose-700">Tests:</p>
                              <div className="flex flex-wrap gap-1">
                                {lesson.details.tests.map((test: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full">{test}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {lesson.details.spiritualRequirement && (
                            <p className="text-sm text-rose-700 italic">🪶 {lesson.details.spiritualRequirement}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Games object (grouped by difficulty) */}
                      {lesson.games && typeof lesson.games === 'object' && (
                        <div className="space-y-4">
                          {lesson.games.easy && (
                            <div>
                              <h6 className="text-sm font-semibold text-green-600 mb-2">Easy Games:</h6>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {lesson.games.easy.map((game: any, i: number) => (
                                  <div key={i} className="bg-green-50 p-2 rounded-lg border border-green-200">
                                    <p className="font-medium text-green-800 text-sm">{game.name}</p>
                                    <p className="text-xs text-gray-600">Players: {game.players}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {lesson.games.medium && (
                            <div>
                              <h6 className="text-sm font-semibold text-yellow-600 mb-2">Medium Games:</h6>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {lesson.games.medium.map((game: any, i: number) => (
                                  <div key={i} className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                                    <p className="font-medium text-yellow-800 text-sm">{game.name}</p>
                                    <p className="text-xs text-gray-600">Players: {game.players}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {lesson.games.advanced && (
                            <div>
                              <h6 className="text-sm font-semibold text-red-600 mb-2">Advanced Games:</h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {lesson.games.advanced.map((game: any, i: number) => (
                                  <div key={i} className="bg-red-50 p-3 rounded-lg border border-red-200">
                                    <p className="font-bold text-red-800">{game.name}</p>
                                    {game.equipment && <p className="text-xs text-gray-600">Equipment: {game.equipment}</p>}
                                    {game.rules && <p className="text-xs text-gray-600 mt-1">Rules: {game.rules}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Context string */}
                      {lesson.context && typeof lesson.context === 'string' && (
                        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
                          <p className="text-sm text-gray-700 italic">{lesson.context}</p>
                        </div>
                      )}
                      
                      {/* Source reference */}
                      {lesson.source && typeof lesson.source === 'string' && (
                        <p className="text-xs text-gray-400 mt-2">Source: {lesson.source}</p>
                      )}
                      
                      {/* Divisions (Historical Bands with Villages) */}
                      {lesson.divisions && Array.isArray(lesson.divisions) && lesson.divisions.length > 0 && (
                        <div className="mt-4">
                          <h6 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {lesson.divisions.length} Historical Divisions
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lesson.divisions.map((division: { name: string; location: string; villages: string[] }, idx: number) => (
                              <div key={idx} className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <h6 className="font-bold text-amber-800 mb-1">{division.name}</h6>
                                <p className="text-xs text-amber-600 mb-2">{division.location}</p>
                                <div className="flex flex-wrap gap-1">
                                  {division.villages.map((village: string, vIdx: number) => (
                                    <span key={vIdx} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                      {village}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary FlipCards */}
          {unit.vocabulary && unit.vocabulary.length > 0 && (
            <div className="p-6 border-b border-shs-stone/20">
              <h5 className="font-semibold text-shs-forest-700 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Vocabulary ({unit.vocabulary.length} words)
              </h5>
              <p className="text-sm text-shs-text-muted mb-4">Hover or tap cards to reveal meanings</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {unit.vocabulary.map((word) => (
                  <FlipCard
                    key={word.secwepemc}
                    className="h-28 rounded-xl"
                    front={
                      <div className="bg-shs-sand rounded-xl p-3 h-full flex flex-col justify-center items-center text-center border border-shs-stone/50 hover:border-shs-forest-300 transition-colors">
                        <h4 className="text-lg font-bold text-shs-forest-800 mb-1">
                          {word.secwepemc}
                        </h4>
                        {word.partOfSpeech && (
                          <span className="text-xs text-shs-text-muted italic">{word.partOfSpeech}</span>
                        )}
                      </div>
                    }
                    back={
                      <div className={`${colors.flip} rounded-xl p-3 h-full flex flex-col justify-center items-center text-center text-white`}>
                        <p className="text-sm font-bold mb-1">
                          {word.english}
                        </p>
                        <p className="text-xs opacity-80 italic">
                          "{word.secwepemc}"
                        </p>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lesson Vocabulary (Secwépemctsín words with translations) */}
          {unit.lessonVocabulary && unit.lessonVocabulary.words.length > 0 && (
            <div className="p-6 border-b border-shs-stone/20 bg-sky-50/50">
              <h5 className="font-semibold text-sky-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Lesson Vocabulary ({unit.lessonVocabulary.words.length} words)
                {unit.lessonVocabulary.source && (
                  <span className="text-xs text-sky-500 ml-auto">Source: {unit.lessonVocabulary.source}</span>
                )}
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {unit.lessonVocabulary.words.map((word, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-sky-200 hover:border-sky-400 transition-colors">
                    <p className="font-bold text-sky-800 text-sm">{word.secwepemc}</p>
                    <p className="text-xs text-gray-600">{word.english}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Landscape Terms (Geographic vocabulary) */}
          {unit.landscapeTerms && unit.landscapeTerms.terms.length > 0 && (
            <div className="p-6 border-b border-shs-stone/20 bg-emerald-50/50">
              <h5 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Landscape Terms ({unit.landscapeTerms.terms.length})
                {unit.landscapeTerms.source && (
                  <span className="text-xs text-emerald-500 ml-auto">Source: {unit.landscapeTerms.source}</span>
                )}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {unit.landscapeTerms.terms.map((term, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors">
                    <p className="font-bold text-emerald-800">{term.secwepemc}</p>
                    <p className="text-sm text-gray-700">{term.english}</p>
                    {term.morphology && (
                      <p className="text-xs text-emerald-600 mt-1 italic">{term.morphology}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lexical Suffixes (Body-part metaphors) */}
          {unit.lexicalSuffixes && (unit.lexicalSuffixes.bodyPartSuffixes || unit.lexicalSuffixes.landscapeSuffixes) && (
            <div className="p-6 border-b border-shs-stone/20 bg-violet-50/50">
              <h5 className="font-semibold text-violet-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Lexical Suffixes
              </h5>
              {unit.lexicalSuffixes.note && (
                <p className="text-sm text-violet-600 mb-3 italic">{unit.lexicalSuffixes.note}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unit.lexicalSuffixes.bodyPartSuffixes && unit.lexicalSuffixes.bodyPartSuffixes.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-violet-600 mb-2">Body-Part Metaphors</h6>
                    <div className="space-y-1">
                      {unit.lexicalSuffixes.bodyPartSuffixes.map((suffix, idx) => (
                        <div key={idx} className="flex items-baseline gap-2 text-sm">
                          <code className="bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded font-mono">{suffix.suffix}</code>
                          <span className="text-gray-600">{suffix.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {unit.lexicalSuffixes.landscapeSuffixes && unit.lexicalSuffixes.landscapeSuffixes.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-violet-600 mb-2">Landscape Suffixes</h6>
                    <div className="space-y-1">
                      {unit.lexicalSuffixes.landscapeSuffixes.map((suffix, idx) => (
                        <div key={idx} className="flex items-baseline gap-2 text-sm">
                          <code className="bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded font-mono">{suffix.suffix}</code>
                          <span className="text-gray-600">{suffix.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Protocols */}
          {unit.protocols && unit.protocols.length > 0 && (
            <div className="p-6 border-b border-shs-stone/20 bg-shs-amber-50/50">
              <h5 className="font-semibold text-shs-amber-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Cultural Protocols
              </h5>
              <ul className="space-y-2">
                {unit.protocols.map((protocol, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-shs-text-body">
                    <span className="text-shs-amber-500 mt-0.5">●</span>
                    {protocol}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Video Resources */}
          {unit.videoResources && unit.videoResources.length > 0 && (
            <div className="p-6">
              <h5 className="font-semibold text-shs-forest-700 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Resources ({unit.videoResources.length})
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {unit.videoResources.map((video, i) => (
                  video.url ? (
                    <VideoPlayer
                      key={i}
                      src={video.url}
                      title={video.title}
                      duration={video.duration}
                      presenter={video.presenter}
                      source={video.source}
                    />
                  ) : (
                    <div key={i} className="bg-shs-sand/50 rounded-xl p-4 border border-shs-stone/30 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-shs-forest-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-shs-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h6 className="font-semibold text-shs-forest-800 text-sm">{video.title}</h6>
                        <div className="flex items-center gap-2 text-xs text-shs-text-muted">
                          {video.duration && <span>{video.duration}</span>}
                          {video.source && <span>• {video.source}</span>}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Module Component
export function CurriculumModule({
  moduleId,
  title,
  subtitle,
  description,
  program,
  year,
  units,
  tprRoutines,
  colorScheme = 'forest',
}: CurriculumModuleProps) {
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const colors = colorSchemes[colorScheme];
  const icon = moduleIcons[moduleId] || '📚';

  return (
    <div className="bg-white rounded-3xl border border-shs-stone overflow-hidden shadow-sm">
      {/* Module Header */}
      <div className={`p-6 md:p-8 ${colors.header}`}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                {program}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                {year}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-2">{title}</h3>
            <p className="text-sm opacity-90 mb-1">{subtitle}</p>
            <p className="text-sm opacity-80">{description}</p>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="p-6 md:p-8 space-y-4 bg-gradient-to-b from-shs-sand/50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-shs-forest-800">
            Learning Units ({units.length})
          </h4>
          <button
            onClick={() => setExpandedUnit(expandedUnit ? null : units[0]?.unitId)}
            className="text-sm text-shs-forest-600 hover:text-shs-forest-800 font-medium transition-colors"
          >
            {expandedUnit ? 'Collapse All' : 'Expand First'}
          </button>
        </div>

        {units.map((unit, index) => (
          <UnitCard
            key={unit.unitId}
            unit={unit}
            index={index}
            isExpanded={expandedUnit === unit.unitId}
            onToggle={() => setExpandedUnit(expandedUnit === unit.unitId ? null : unit.unitId)}
            colors={colors}
          />
        ))}
      </div>

      {/* TPR Routines */}
      {tprRoutines && tprRoutines.length > 0 && (
        <div className="p-6 md:p-8 bg-shs-forest-50 border-t border-shs-stone/20">
          <h4 className="font-bold text-shs-forest-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-shs-forest-600 text-white flex items-center justify-center text-sm">💬</span>
            TPR Phrases
          </h4>
          <p className="text-sm text-shs-text-muted mb-4">Practice these phrases with physical actions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tprRoutines.map((routine, i) => (
              <FlipCard
                key={i}
                className="h-24 rounded-xl"
                front={
                  <div className="bg-white rounded-xl p-4 h-full flex items-center justify-center text-center border border-shs-stone/50 shadow-sm">
                    <p className="font-semibold text-shs-forest-700">{routine.secwepemc}</p>
                  </div>
                }
                back={
                  <div className="bg-shs-forest-700 rounded-xl p-4 h-full flex items-center justify-center text-center text-white">
                    <p className="text-sm">{routine.english}</p>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurriculumModule;
