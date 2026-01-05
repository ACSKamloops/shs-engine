/**
 * LawsPage - Secwépemc Legal Reference Browser
 * Interactive display of Laws 2023 hierarchical structure with accordion navigation
 */
import { useState } from 'react';
import { Hero } from '../../components/public/Hero';
import { LawsAttribution, LawsSourceBadge } from '../../components/public/LawsAttribution';

// Import hierarchical laws data
import lawsData from '../../data/laws/secwepemc_laws_2023_HIERARCHICAL.json';

// Types
interface Subsection {
  id: string;
  title: string;
  content: string;
  summary?: string;
  vocabulary?: Array<{ secwepemc: string; english: string }>;
}

interface Section {
  id: string;
  title: string;
  introduction: string;
  restatement_table: string;
  subsections: Subsection[];
}

interface Chapter {
  id: string;
  title: string;
  introduction: string;
  sections: Section[];
}

// Accordion Item Component
function AccordionItem({ 
  title, 
  isOpen, 
  onToggle, 
  children,
  level = 0,
  badge
}: { 
  title: string; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
  level?: number;
  badge?: string;
}) {
  const levelStyles = [
    'bg-shs-forest-600 text-white hover:bg-shs-forest-700',
    'bg-shs-forest-100 text-shs-forest-800 hover:bg-shs-forest-200',
    'bg-white text-shs-forest-700 hover:bg-shs-sand border border-shs-stone'
  ];

  return (
    <div className={`rounded-xl overflow-hidden ${level === 0 ? 'mb-4' : level === 1 ? 'mb-2' : 'mb-1'}`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${levelStyles[level] || levelStyles[2]}`}
      >
        <div className="flex items-center gap-3">
          {badge && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${level === 0 ? 'bg-white/20' : 'bg-shs-forest-600 text-white'}`}>
              {badge}
            </span>
          )}
          <span className={`font-semibold ${level === 0 ? 'text-base' : 'text-sm'}`}>{title}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`${level === 0 ? 'bg-shs-forest-50 p-4' : level === 1 ? 'bg-white p-3' : 'bg-shs-sand/50 p-3'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// Content Display Component
function ContentBlock({ content, label }: { content: string; label?: string }) {
  if (!content) return null;
  
  return (
    <div className="mb-4">
      {label && (
        <h4 className="text-xs uppercase tracking-wide text-shs-forest-600 font-semibold mb-2">{label}</h4>
      )}
      <div className="prose prose-sm max-w-none text-shs-text-body whitespace-pre-wrap leading-relaxed">
        {content.slice(0, 2000)}
        {content.length > 2000 && (
          <span className="text-shs-text-muted italic">... [Content truncated for display]</span>
        )}
      </div>
    </div>
  );
}

// Subsection Display
function SubsectionView({ subsection }: { subsection: Subsection }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AccordionItem
      title={subsection.title}
      badge={subsection.id}
      isOpen={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      level={2}
    >
      <ContentBlock content={subsection.content} />
      <LawsAttribution sectionId={subsection.id} variant="inline" />
    </AccordionItem>
  );
}

// Section Display
function SectionView({ section }: { section: Section }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AccordionItem
      title={section.title}
      badge={section.id}
      isOpen={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      level={1}
    >
      {section.introduction && (
        <ContentBlock content={section.introduction} label="Introduction" />
      )}
      {section.restatement_table && (
        <div className="mb-4 p-3 bg-shs-amber-50 rounded-lg border border-shs-amber-200">
          <h4 className="text-xs uppercase tracking-wide text-shs-amber-700 font-semibold mb-2">
            Restatement Table
          </h4>
          <pre className="text-xs text-shs-text-body whitespace-pre-wrap font-mono">
            {section.restatement_table.slice(0, 1000)}
            {section.restatement_table.length > 1000 && '...'}
          </pre>
        </div>
      )}
      {section.subsections.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs uppercase tracking-wide text-shs-forest-600 font-semibold mb-3">
            Subsections ({section.subsections.length})
          </h4>
          {section.subsections.map(sub => (
            <SubsectionView key={sub.id} subsection={sub} />
          ))}
        </div>
      )}
    </AccordionItem>
  );
}

// Chapter Display
function ChapterView({ chapter }: { chapter: Chapter }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const chapterNum = chapter.id.replace('ch', '').replace('_intro', ' Intro').replace('_content', '');

  return (
    <AccordionItem
      title={chapter.title}
      badge={`CH ${chapterNum}`}
      isOpen={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      level={0}
    >
      {chapter.introduction && (
        <ContentBlock content={chapter.introduction.slice(0, 500)} label="Chapter Introduction" />
      )}
      {chapter.sections.length > 0 && (
        <div className="mt-4">
          {chapter.sections.map(section => (
            <SectionView key={section.id} section={section} />
          ))}
        </div>
      )}
      {chapter.sections.length === 0 && (
        <p className="text-sm text-shs-text-muted italic">
          This chapter contains introductory content only.
        </p>
      )}
    </AccordionItem>
  );
}

// Stats Component
function LawsStats() {
  const totalSections = (lawsData as any).chapters.reduce(
    (acc: number, ch: Chapter) => acc + ch.sections.length, 0
  );
  const totalSubsections = (lawsData as any).chapters.reduce(
    (acc: number, ch: Chapter) => acc + ch.sections.reduce(
      (sAcc: number, s: Section) => sAcc + s.subsections.length, 0
    ), 0
  );

  const stats = [
    { value: '5', label: 'Chapters' },
    { value: String(totalSections), label: 'Sections' },
    { value: String(totalSubsections), label: 'Subsections' },
    { value: '75K+', label: 'Words' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
          <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-shs-forest-200">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export function LawsPage() {
  const chapters = (lawsData as any).chapters as Chapter[];

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Secwépemc Legal Reference"
        subheadline="Browse the Laws of wséltkten and Secwépemc-kt — A comprehensive legal framework documenting Secwépemc governance, obligations, and traditional legal processes."
        primaryCta={{ label: 'Explore Chapters', to: '#chapters' }}
        secondaryCta={{ label: 'Curriculum', to: '/curriculum' }}
        size="medium"
      />

      {/* Stats */}
      <section className="py-12 bg-shs-forest-900 -mt-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <LawsStats />
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <LawsSourceBadge className="mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
              Understanding Secwépemc Law
            </h2>
            <p className="text-shs-text-body max-w-2xl mx-auto">
              This legal reference is organized into five interconnected chapters, each exploring 
              fundamental aspects of Secwépemc legal traditions, from the principle of 
              <em> wseltktenéws</em> (being relatives) to lawful responses to harms.
            </p>
          </div>

          {/* Chapter Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {chapters.filter(ch => ch.sections.length > 0).map((ch, i) => (
              <div key={ch.id} className="bg-white rounded-xl p-4 border border-shs-stone hover:shadow-md transition-shadow">
                <span className="text-xs font-mono text-shs-forest-600">Chapter {i + 1}</span>
                <h3 className="font-bold text-shs-forest-800 mt-1 text-sm leading-tight">
                  {ch.title.replace(/CHAPTER \d+:?\s*/i, '')}
                </h3>
                <p className="text-xs text-shs-text-muted mt-2">
                  {ch.sections.length} sections • {ch.sections.reduce((a, s) => a + s.subsections.length, 0)} subsections
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content - Accordion */}
      <section id="chapters" className="py-16 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shs-forest-100 text-shs-forest-700 text-sm font-semibold rounded-full mb-4">
              Full Legal Reference
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
              Browse by Chapter
            </h2>
            <p className="text-shs-text-body">
              Click on any chapter to explore its sections and subsections.
            </p>
          </div>

          {/* Chapters Accordion */}
          <div className="space-y-2">
            {chapters.map(chapter => (
              <ChapterView key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>
      </section>

      {/* Attribution Footer */}
      <section className="py-12 bg-shs-forest-50 border-t border-shs-stone/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-bold text-shs-forest-800 mb-4">Source Attribution</h3>
          <p className="text-sm text-shs-text-body mb-4">
            This legal reference is derived from <strong>Secwépemc Laws 2023: wséltkten and Secwépemc-kt</strong>, 
            a comprehensive documentation of Secwépemc legal traditions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone">
              SNTC (Secwépemc Nation Tribal Council)
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone">
              ILRU (Indigenous Legal Research Unit)
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-shs-forest-700 border border-shs-stone">
              University of Victoria
            </span>
          </div>
          <p className="text-xs text-shs-text-muted mt-4">
            © 2023 Secwépemc Nation Tribal Council. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LawsPage;
