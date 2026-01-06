/**
 * CulturalContent - Display rich content from SCES Cultural Series
 * 
 * Features:
 * - Formatted text display (no raw data)
 * - Theme-based organization
 * - Citations to source pages
 * - Facts and lists display
 * - Collapsible sections
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import scesContent from '../../data/curriculum/sces_content.json';

interface Paragraph {
  text: string;
  page: number;
  themes: string[];
}

interface Section {
  title: string;
  theme: string;
  level: number;
  paragraphs: Paragraph[];
}

interface Fact {
  kind: string;
  value: number;
  unit: string;
  source: string;
}

interface ContentList {
  kind: string;
  items: string[];
  source: string;
}

interface CulturalContentProps {
  moduleId?: 'food_sovereignty' | 'land_stewardship' | 'cultural_preservation' | 'healing_wellness' | 'youth_mentorship';
  theme?: string;
  maxSections?: number;
  showFacts?: boolean;
  showLists?: boolean;
}

const themeLabels: Record<string, { name: string; icon: string }> = {
  foodways: { name: 'Foodways', icon: '🍖' },
  family_community: { name: 'Family & Community', icon: '👨‍👩‍👧' },
  land_environment: { name: 'Land & Environment', icon: '🌲' },
  health_body_wellness: { name: 'Health & Wellness', icon: '💚' },
  history_territory_governance: { name: 'History & Territory', icon: '📜' },
  songs_dances_ceremony: { name: 'Songs & Ceremony', icon: '🎵' },
  stories_oral_history: { name: 'Stories & Oral History', icon: '📖' },
  clothing_adornment: { name: 'Clothing & Adornment', icon: '👘' },
};

const listKindLabels: Record<string, string> = {
  winter_storage_pit_contents: 'Winter Storage Pit Contents',
};

export function CulturalContent({
  moduleId = 'food_sovereignty',
  theme,
  maxSections = 5,
  showFacts = true,
  showLists = true,
}: CulturalContentProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const moduleData = (scesContent as any).modules[moduleId];
  
  if (!moduleData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl block mb-2">📚</span>
        No content available for this module.
      </div>
    );
  }

  // Filter sections by theme if specified
  let sections: Section[] = moduleData.sections || [];
  if (theme) {
    sections = sections.filter(s => s.theme === theme);
  }
  
  // Remove duplicates by title
  const seenTitles = new Set<string>();
  sections = sections.filter(s => {
    if (seenTitles.has(s.title)) return false;
    seenTitles.add(s.title);
    return true;
  });

  const displaySections = showAll ? sections : sections.slice(0, maxSections);
  const facts: Fact[] = moduleData.facts || [];
  const lists: ContentList[] = moduleData.lists || [];

  return (
    <div className="space-y-6">
      {/* Facts - Quick highlights */}
      {showFacts && facts.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {facts.slice(0, 4).map((fact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-bold text-amber-800">
                  {fact.value} {fact.unit}
                </p>
                <p className="text-xs text-amber-600">{fact.source}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sections - Main content */}
      <div className="space-y-4">
        {displaySections.map((section, index) => {
          const isExpanded = expandedSection === section.title;
          const themeMeta = themeLabels[section.theme] || { name: section.theme, icon: '📄' };
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.title)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{themeMeta.icon}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {themeMeta.name}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                  </div>
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-gray-400 ml-4"
                  >
                    ▼
                  </motion.span>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && section.paragraphs.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                      {section.paragraphs.map((para, pIndex) => (
                        <div key={pIndex} className="relative">
                          <p className="text-gray-700 leading-relaxed">
                            {para.text}
                          </p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <span>📄</span>
                            Source: p.{para.page}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Show more */}
      {sections.length > maxSections && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-shs-forest-600 font-medium text-sm hover:text-shs-forest-700"
        >
          {showAll ? '← Show less' : `Show all ${sections.length} sections →`}
        </button>
      )}

      {/* Lists - Traditional knowledge lists */}
      {showLists && lists.length > 0 && (
        <div className="mt-6">
          {lists.map((list, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <span>📋</span>
                {listKindLabels[list.kind] || list.kind}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {list.items.map((item, j) => (
                  <span
                    key={j}
                    className="bg-white px-3 py-1.5 rounded-lg text-sm text-green-700 border border-green-100"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-3">{list.source}</p>
            </div>
          ))}
        </div>
      )}

      {/* Source attribution */}
      <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
        Source: SCES Cultural Series - Foods of the Shuswap People
      </p>
    </div>
  );
}

export default CulturalContent;
