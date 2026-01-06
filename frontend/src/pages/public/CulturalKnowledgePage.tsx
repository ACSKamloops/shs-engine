/**
 * CulturalKnowledgePage - Cultural Series Library
 * Displays verified gold_standard content from SCES Cultural Series
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';

// Import gold_standard data
import foodsData from '../../data/gold_standard/foods_cultural_series.json';
import gamesData from '../../data/gold_standard/games_cultural_series.json';
import homesData from '../../data/gold_standard/homes_cultural_series.json';
import clothingData from '../../data/gold_standard/clothing_cultural_series.json';
import technologyData from '../../data/gold_standard/technology_cultural_series.json';
import songsDancesData from '../../data/gold_standard/songs_dances_cultural_series.json';
import thingsWeDoData from '../../data/gold_standard/things_we_do_cultural.json';

interface CulturalBook {
  id: string;
  title: string;
  source: string;
  pages: number;
  sections: string[];
  content: string;
  icon: string;
  color: string;
}

const culturalBooks: CulturalBook[] = [
  { ...foodsData, icon: '🍲', color: 'amber' },
  { ...gamesData, icon: '🎯', color: 'blue' },
  { ...homesData, icon: '🏠', color: 'green' },
  { ...clothingData, icon: '👗', color: 'purple' },
  { ...technologyData, icon: '🛠️', color: 'stone' },
  { ...songsDancesData, icon: '🎵', color: 'pink' },
  { ...thingsWeDoData, icon: '🌿', color: 'teal' },
];

export function CulturalKnowledgePage() {
  const [selectedBook, setSelectedBook] = useState<CulturalBook | null>(null);
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Secwépemc Cultural Knowledge"
        subheadline="Explore the SCES Cultural Series — verified traditional knowledge from foods and games to technology and ceremonies."
        size="medium"
      />

      {/* Books Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-shs-forest-100 text-shs-forest-700 rounded-full text-sm font-medium mb-3">
              ✓ Gold Standard Verified
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800">
              Cultural Series Library
            </h2>
            <p className="text-shs-text-body mt-2">7 verified volumes from SCES publications</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {culturalBooks.map((book) => (
              <button
                key={book.id}
                onClick={() => {
                  setSelectedBook(book);
                  setShowContent(true);
                }}
                className="bg-white rounded-xl p-6 border border-shs-stone hover:shadow-lg hover:border-shs-forest-300 transition-all text-left group"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                  {book.icon}
                </span>
                <h3 className="font-bold text-shs-forest-800 mb-1">{book.title}</h3>
                <p className="text-sm text-shs-text-muted">{book.pages} pages</p>
                <p className="text-xs text-shs-forest-600 mt-2">
                  {book.sections.length} sections
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Modal/Panel */}
      {showContent && selectedBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setShowContent(false)}
            />

            {/* Panel */}
            <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedBook.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-shs-forest-800">{selectedBook.title}</h2>
                    <p className="text-sm text-shs-text-muted">SCES Cultural Series • {selectedBook.pages} pages</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContent(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Table of Contents */}
              <div className="px-6 py-4 bg-shs-cream border-b border-gray-200">
                <h3 className="font-semibold text-shs-forest-700 mb-2">Table of Contents</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {selectedBook.sections.slice(0, 12).map((section, i) => (
                    <span key={i} className="text-shs-text-body truncate">• {section}</span>
                  ))}
                  {selectedBook.sections.length > 12 && (
                    <span className="text-shs-text-muted italic">+{selectedBook.sections.length - 12} more...</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="prose prose-stone max-w-none">
                  {selectedBook.content.split('\n\n').slice(0, 50).map((paragraph, i) => {
                    // Render headings
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={i} className="text-2xl font-bold text-shs-forest-800 mt-6 mb-4">{paragraph.replace('# ', '')}</h1>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold text-shs-forest-700 mt-5 mb-3">{paragraph.replace('## ', '')}</h2>;
                    }
                    // Regular paragraph
                    return <p key={i} className="text-shs-text-body mb-4 leading-relaxed">{paragraph}</p>;
                  })}
                  {selectedBook.content.split('\n\n').length > 50 && (
                    <p className="text-center text-shs-text-muted italic py-4 border-t border-gray-200 mt-6">
                      Showing first 50 sections. Full content available in curriculum modules.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-between items-center">
                <p className="text-xs text-shs-text-muted">
                  Source: {selectedBook.source} • SCES Verified
                </p>
                <Link
                  to="/curriculum"
                  className="px-4 py-2 bg-shs-forest-600 text-white rounded-lg hover:bg-shs-forest-700 transition-colors text-sm font-medium"
                >
                  View in Curriculum
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dictionary Link */}
      <section className="py-12 bg-shs-sand border-t border-shs-stone">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-shs-forest-800 mb-4">
            Also Available
          </h2>
          <Link
            to="/dictionary"
            className="inline-block bg-white rounded-xl p-6 border border-shs-stone hover:shadow-md transition-all"
          >
            <span className="text-3xl">📚</span>
            <h3 className="font-bold text-shs-forest-800 mt-3">Secwepemctsín Dictionary</h3>
            <p className="text-sm text-shs-text-muted">12,690 verified words</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default CulturalKnowledgePage;
