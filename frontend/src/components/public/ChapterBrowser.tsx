/**
 * ChapterBrowser - Academic Chapter Reference Component
 * Displays chapter highlights from Secwépemc ethnobotany research
 * Features: Chapter cards, key passages, citation helper
 */
import { useState } from 'react';
import chapterData from '../../data/chapter_highlights.json';

interface ChapterHighlight {
  topic: string;
  summary?: string;
  curriculumUse?: string[];
  secwepemc?: string;
  english?: string;
  speaker?: string;
  vocabulary?: string[];
}

interface Chapter {
  chapter: number;
  title: string;
  authors?: string[];
  themes: string[];
  highlights: ChapterHighlight[];
  titleTranslation?: string;
}

interface ChapterBrowserProps {
  chapters?: Chapter[];
}

// Theme icons
const themeIcons: Record<string, string> = {
  TEK: '🌿',
  collaboration: '🤝',
  intellectual_property: '📜',
  cultural_revitalization: '🔄',
  landscape_terminology: '🏔️',
  seasonal_round: '🗓️',
  resource_use: '🌾',
  elder_testimonies: '🪶',
  stewardship: '🌱',
  resource_management: '⚙️',
  burning: '🔥',
  harvesting: '🌿',
  ethnobotany: '🌺',
  root_vegetables: '🥔',
  traditional_foods: '🍂',
  nutrition: '💪',
  environmental_change: '🌍',
  cultural_loss: '💔',
  elder_observations: '👁️',
  stsptékwll: '📖',
  TEK_in_narrative: '📚',
  ecological_indicators: '🌲',
  storytelling: '🎭',
  TEKW: '🧠',
  philosophy: '💭',
  future_applications: '🔮',
  land_title: '📋',
  synthesis: '🔗',
  future_research: '🔬',
  cultural_continuity: '♾️',
};

export function ChapterBrowser({ chapters }: ChapterBrowserProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Use provided chapters or load from data file
  const allChapters: Chapter[] = chapters || chapterData.chapters;

  const generateCitation = (chapter: Chapter) => {
    const authors = chapter.authors?.join(', ') || 'Unknown';
    return `${authors}. (2017). ${chapter.title}. In Secwepemc Ethnobotany (Chapter ${chapter.chapter}). Secwépemc Cultural Education Society.`;
  };

  const copyCitation = (chapter: Chapter) => {
    navigator.clipboard.writeText(generateCitation(chapter));
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-shs-stone/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <h3 className="font-bold text-lg">Chapter Browser</h3>
            <p className="text-sm opacity-90">
              Academic source material from Secwépemc Ethnobotany
            </p>
          </div>
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-shs-stone/20">
        {/* Chapter List */}
        <div className="p-4 bg-shs-sand/30">
          <h4 className="font-semibold text-shs-forest-700 mb-3">
            Chapters ({allChapters.length})
          </h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {allChapters.map((chapter) => (
              <button
                key={chapter.chapter}
                onClick={() => setSelectedChapter(
                  selectedChapter?.chapter === chapter.chapter ? null : chapter
                )}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedChapter?.chapter === chapter.chapter
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white border border-shs-stone/20 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`font-bold text-sm ${
                    selectedChapter?.chapter === chapter.chapter ? 'text-indigo-200' : 'text-indigo-600'
                  }`}>
                    Ch.{chapter.chapter}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm leading-tight">
                      {chapter.title.length > 50 
                        ? chapter.title.substring(0, 50) + '...' 
                        : chapter.title}
                    </div>
                    {chapter.titleTranslation && (
                      <div className={`text-xs mt-0.5 italic ${
                        selectedChapter?.chapter === chapter.chapter ? 'opacity-70' : 'text-shs-text-muted'
                      }`}>
                        {chapter.titleTranslation}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chapter Detail */}
        <div className="md:col-span-2 p-6">
          {selectedChapter ? (
            <div className="animate-fadeIn">
              {/* Chapter Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-indigo-600">
                      Chapter {selectedChapter.chapter}
                    </span>
                    <h3 className="text-xl font-bold text-shs-forest-800">
                      {selectedChapter.title}
                    </h3>
                    {selectedChapter.titleTranslation && (
                      <p className="text-sm text-shs-forest-600 italic">
                        "{selectedChapter.titleTranslation}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copyCitation(selectedChapter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      copiedCitation
                        ? 'bg-green-100 text-green-700'
                        : 'bg-shs-sand hover:bg-shs-stone/20 text-shs-text-body'
                    }`}
                  >
                    {copiedCitation ? '✓ Copied!' : '📋 Copy Citation'}
                  </button>
                </div>

                {/* Authors */}
                {selectedChapter.authors && (
                  <p className="text-sm text-shs-text-muted">
                    By: {selectedChapter.authors.join(', ')}
                  </p>
                )}

                {/* Themes */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedChapter.themes.map(theme => (
                    <span
                      key={theme}
                      className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 border border-indigo-200"
                    >
                      {themeIcons[theme] || '📝'} {theme.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              <div>
                <h4 className="font-semibold text-shs-forest-700 mb-3">Key Passages</h4>
                <div className="space-y-3">
                  {selectedChapter.highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="p-4 bg-shs-sand/30 rounded-lg border-l-4 border-indigo-400"
                    >
                      <h5 className="font-semibold text-shs-forest-800 mb-1">
                        {highlight.topic}
                      </h5>
                      
                      {/* Quote if available */}
                      {highlight.secwepemc && (
                        <p className="text-sm text-indigo-700 italic mb-1">
                          "{highlight.secwepemc}"
                        </p>
                      )}
                      {highlight.english && highlight.secwepemc && (
                        <p className="text-sm text-shs-text-body mb-2">
                          "{highlight.english}"
                        </p>
                      )}
                      {highlight.speaker && (
                        <p className="text-xs text-shs-text-muted mb-2">
                          — {highlight.speaker}
                        </p>
                      )}
                      
                      <p className="text-sm text-shs-text-body">{highlight.summary}</p>
                      
                      {/* Curriculum Use */}
                      {highlight.curriculumUse && highlight.curriculumUse.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {highlight.curriculumUse.map((use, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 rounded text-xs bg-shs-forest-100 text-shs-forest-700"
                            >
                              {use}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-shs-text-muted">
              <div className="text-center">
                <span className="text-4xl mb-2 block">👈</span>
                <p>Select a chapter to explore</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Source Info */}
      <div className="p-4 bg-shs-sand/30 border-t border-shs-stone/20">
        <p className="text-xs text-shs-text-muted text-center">
          Source: Secwepemc-web-07-2017.pdf • Secwépemc Cultural Education Society
        </p>
      </div>
    </div>
  );
}

export default ChapterBrowser;
