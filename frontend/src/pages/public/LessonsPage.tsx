/**
 * LessonsPage - Eastern Secwepemctsín Language Lessons
 * 
 * Displays the 41-lesson Gold Standard curriculum from SCES Book 1.
 * Features expandable lessons with vocabulary lists and FlipCard practice.
 */
import { useState } from 'react';
import lessonsData from '../../data/lessons_eastern_gold_standard.json';
import { FlipCard } from '../../components/public/FlipCard';

interface VocabularyItem {
  secwepemc: string;
  english: string;
}

interface Lesson {
  lesson_number: number;
  title: string;
  vocabulary: VocabularyItem[];
}

export default function LessonsPage() {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState<number | null>(null);

  const lessons = lessonsData.lessons as Lesson[];
  const metadata = lessonsData.metadata;

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-forest-800 to-shs-forest-700 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-shs-amber-500/20 rounded-full text-shs-amber-300 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-shs-amber-400 rounded-full" />
            Gold Standard
          </div>
          <h1 className="text-4xl font-extrabold mb-2">{metadata.title}</h1>
          <p className="text-xl opacity-90">{metadata.dialect} Dialect</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
            <span>{metadata.total_lessons} Lessons</span>
            <span>•</span>
            <span>{metadata.total_vocabulary_pairs} Vocabulary Items</span>
            <span>•</span>
            <span>{metadata.year}</span>
          </div>
          <p className="text-sm opacity-60 mt-2">
            Editors: {metadata.editors.join(', ')}
          </p>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-4">
          {lessons.map((lesson) => {
            const isExpanded = expandedLesson === lesson.lesson_number;
            const isPractice = practiceMode === lesson.lesson_number;

            return (
              <div 
                key={lesson.lesson_number}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isExpanded 
                    ? 'border-shs-forest-400 shadow-lg' 
                    : 'border-shs-stone/20 hover:border-shs-forest-300 hover:shadow-md'
                }`}
              >
                {/* Lesson Header */}
                <button
                  onClick={() => setExpandedLesson(isExpanded ? null : lesson.lesson_number)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-shs-forest-500 to-shs-forest-700 flex items-center justify-center text-white font-bold">
                      {lesson.lesson_number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{lesson.title}</h3>
                      <p className="text-sm text-shs-text-muted">
                        {lesson.vocabulary.length} vocabulary items
                      </p>
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-shs-stone/20">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 mt-4 mb-6">
                      <button
                        onClick={() => setPracticeMode(isPractice ? null : lesson.lesson_number)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          isPractice
                            ? 'bg-shs-amber-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isPractice ? '📋 Show List' : '🎴 Practice Mode'}
                      </button>
                    </div>

                    {/* Practice Mode: FlipCards */}
                    {isPractice ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {lesson.vocabulary.map((item, i) => (
                          <FlipCard
                            key={i}
                            front={item.secwepemc}
                            back={item.english}
                          />
                        ))}
                      </div>
                    ) : (
                      /* List Mode: Table */
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="py-3 px-4 text-xs font-semibold text-shs-text-muted uppercase tracking-wide">
                                Secwépemctsín
                              </th>
                              <th className="py-3 px-4 text-xs font-semibold text-shs-text-muted uppercase tracking-wide">
                                English
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {lesson.vocabulary.map((item, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-shs-forest-700">
                                  {item.secwepemc}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {item.english}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Source Attribution */}
        <div className="mt-12 p-6 bg-shs-sand rounded-2xl border border-shs-stone/20">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📚</span>
            <div>
              <h4 className="font-bold text-shs-forest-800 mb-1">Source</h4>
              <p className="text-sm text-shs-text-body">
                {metadata.source}
              </p>
              <p className="text-sm text-shs-text-muted mt-1">
                Publisher: {metadata.publisher}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
