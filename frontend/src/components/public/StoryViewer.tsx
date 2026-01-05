/**
 * StoryViewer - Interactive Teaching Stories (stsptékwll) Component
 * Displays Secwépemc traditional narratives with ecological and moral lessons
 * Features: Story browser, lesson extraction, vocabulary highlights, discussion prompts
 */
import { useState } from 'react';
import teachingStoriesData from '../../data/teaching_stories.json';

interface StoryLine {
  line: number;
  secwepemc: string;
  english: string;
}

interface Story {
  id: string;
  titleSecwepemc: string | null;
  titleEnglish: string;
  narrator: string | null;
  narratorCommunity?: string;
  source: { chapter: number; page?: number; pages?: string };
  themes: string[];
  summary: string;
  moralLessons: string[];
  keyLines?: StoryLine[];
  fullText?: string;
  ecologicalContent?: {
    description: string;
    indicatorSequence?: Array<{
      secwepemc: string;
      english: string;
      scientific?: string;
      indicator?: string;
    }>;
  };
  culturalNote?: string;
}

interface StoryViewerProps {
  stories?: Story[];
  compact?: boolean;
}

// Theme configuration
const themeConfig: Record<string, { color: string; icon: string }> = {
  respect: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🙏' },
  TEK: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🌿' },
  ecological_indicators: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🌲' },
  humility: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '💧' },
  boasting: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '⚠️' },
  waste: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🚫' },
  consequences: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⚡' },
  salmon: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: '🐟' },
  copying: { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: '🔄' },
  unique_abilities: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '✨' },
  elders: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '👴' },
  nature: { color: 'bg-lime-100 text-lime-700 border-lime-200', icon: '🍃' },
};

export function StoryViewer({
  stories,
  compact = false,
}: StoryViewerProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'lessons' | 'text' | 'ecology'>('summary');

  // Use provided stories or load from data file
  const allStories: Story[] = stories || teachingStoriesData.stories;

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-shs-amber-500 to-shs-amber-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h3 className="font-bold text-lg">Stsptékwll</h3>
            <p className="text-sm opacity-90">Traditional Teaching Stories</p>
          </div>
        </div>
      </div>

      {/* Story List */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'md:grid-cols-3'} divide-y md:divide-y-0 md:divide-x divide-shs-stone/20`}>
        {/* Story Navigation */}
        {!compact && (
          <div className="p-4 bg-shs-sand/30">
          <h4 className="font-semibold text-shs-forest-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Stories ({allStories.length})
          </h4>
          <div className="space-y-2">
            {allStories.map((story) => (
              <button
                key={story.id}
                onClick={() => {
                  setSelectedStory(story);
                  setActiveTab('summary');
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedStory?.id === story.id
                    ? 'bg-shs-forest-600 text-white shadow-md'
                    : 'bg-white border border-shs-stone/20 hover:border-shs-forest-300 hover:bg-shs-forest-50'
                }`}
              >
                <div className="font-medium text-sm">
                  {story.titleEnglish}
                </div>
                {story.titleSecwepemc && (
                  <div className={`text-xs mt-0.5 ${
                    selectedStory?.id === story.id ? 'opacity-80' : 'text-shs-forest-600 italic'
                  }`}>
                    {story.titleSecwepemc}
                  </div>
                )}
                {story.narrator && (
                  <div className={`text-xs mt-1 ${
                    selectedStory?.id === story.id ? 'opacity-70' : 'text-shs-text-muted'
                  }`}>
                    — {story.narrator}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

        {/* Story Content */}
        <div className={compact ? 'p-0' : 'md:col-span-2 p-6'}>
          {selectedStory ? (
            <div className="animate-fadeIn">
              {/* Story Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-shs-forest-800 mb-2">
                  {selectedStory.titleEnglish}
                </h3>
                {selectedStory.titleSecwepemc && (
                  <p className="text-lg text-shs-forest-600 italic mb-2">
                    {selectedStory.titleSecwepemc}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-shs-text-muted">
                  {selectedStory.narrator && (
                    <span className="flex items-center gap-1">
                      <span>🪶</span>
                      {selectedStory.narrator}
                      {selectedStory.narratorCommunity && ` (${selectedStory.narratorCommunity})`}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span>📖</span>
                    Chapter {selectedStory.source.chapter}
                  </span>
                </div>

                {/* Theme Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedStory.themes.map(theme => {
                    const config = themeConfig[theme] || { 
                      color: 'bg-gray-100 text-gray-600 border-gray-200', 
                      icon: '📝' 
                    };
                    return (
                      <span
                        key={theme}
                        className={`px-2 py-0.5 rounded-full text-xs border ${config.color}`}
                      >
                        {config.icon} {theme.replace('_', ' ')}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Content Tabs */}
              <div className="border-b border-shs-stone/20 mb-4">
                <div className="flex gap-1">
                  {[
                    { id: 'summary', label: 'Summary', icon: '📝' },
                    { id: 'lessons', label: 'Lessons', icon: '💡' },
                    ...(selectedStory.keyLines || selectedStory.fullText ? [{ id: 'text', label: 'Story Text', icon: '📜' }] : []),
                    ...(selectedStory.ecologicalContent ? [{ id: 'ecology', label: 'Ecological Knowledge', icon: '🌲' }] : []),
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'border-shs-forest-600 text-shs-forest-700'
                          : 'border-transparent text-shs-text-muted hover:text-shs-forest-600'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === 'summary' && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-shs-text-body leading-relaxed">{selectedStory.summary}</p>
                    {selectedStory.culturalNote && (
                      <div className="mt-4 p-4 bg-shs-amber-50 rounded-lg border border-shs-amber-200">
                        <h5 className="font-semibold text-shs-amber-800 mb-1 flex items-center gap-1">
                          💡 Cultural Note
                        </h5>
                        <p className="text-sm text-shs-amber-700">{selectedStory.culturalNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'lessons' && (
                  <div>
                    <h5 className="font-semibold text-shs-forest-700 mb-3">What This Story Teaches</h5>
                    <ul className="space-y-2">
                      {selectedStory.moralLessons.map((lesson, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-shs-sand/30 rounded-lg">
                          <span className="text-shs-forest-600 font-bold">{i + 1}</span>
                          <span className="text-shs-text-body">{lesson}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Discussion Prompts */}
                    <div className="mt-6 p-4 bg-shs-forest-50 rounded-lg border border-shs-forest-200">
                      <h5 className="font-semibold text-shs-forest-700 mb-2">Discussion Questions</h5>
                      <ul className="space-y-2 text-sm text-shs-forest-600">
                        <li>• What lesson from this story applies to your life today?</li>
                        <li>• How does this story show the connection between people and nature?</li>
                        <li>• What would you do differently than the characters in this story?</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div>
                    {selectedStory.keyLines ? (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-shs-forest-700 mb-3">Key Lines (Secwépemctsín)</h5>
                        {selectedStory.keyLines.map((line) => (
                          <div key={line.line} className="p-3 bg-shs-sand/30 rounded-lg border-l-4 border-shs-forest-500">
                            <div className="text-xs text-shs-text-muted mb-1">Line {line.line}</div>
                            <p className="text-shs-forest-700 italic font-medium">{line.secwepemc}</p>
                            <p className="text-sm text-shs-text-body mt-1">"{line.english}"</p>
                          </div>
                        ))}
                      </div>
                    ) : selectedStory.fullText ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-shs-text-body leading-relaxed whitespace-pre-line">
                          {selectedStory.fullText}
                        </p>
                      </div>
                    ) : (
                      <p className="text-shs-text-muted">Full story text not available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'ecology' && selectedStory.ecologicalContent && (
                  <div>
                    <p className="text-shs-text-body mb-4">{selectedStory.ecologicalContent.description}</p>
                    
                    {selectedStory.ecologicalContent.indicatorSequence && (
                      <div>
                        <h5 className="font-semibold text-shs-forest-700 mb-3">Tree Species as Elevation Indicators</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedStory.ecologicalContent.indicatorSequence.map((item, i) => (
                            <div key={i} className="flex items-center">
                              <div className="px-3 py-2 bg-shs-forest-100 rounded-lg border border-shs-forest-200">
                                <div className="font-medium text-shs-forest-700">{item.secwepemc}</div>
                                <div className="text-xs text-shs-forest-600">{item.english}</div>
                                {item.indicator && (
                                  <div className="text-xs text-shs-text-muted mt-0.5">↳ {item.indicator}</div>
                                )}
                              </div>
                              {i < selectedStory.ecologicalContent!.indicatorSequence!.length - 1 && (
                                <span className="mx-2 text-shs-forest-400">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-sm text-shs-text-muted italic">
                          Coyote uses these trees as biogeoclimatic indicators to navigate down the mountain
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-shs-text-muted">
              <div className="text-center">
                <span className="text-4xl mb-2 block">👈</span>
                <p>Select a story to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryViewer;
