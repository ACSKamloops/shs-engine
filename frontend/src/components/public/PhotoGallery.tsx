/**
 * PhotoGallery Component - Responsive Image Grid with Filtering
 * Features: Category filter, lazy loading, lightbox integration
 */
import { useState, useMemo } from 'react';
import { Lightbox } from './Lightbox';

export interface GalleryImage {
  id: string;
  src: string;
  thumbnail?: string;
  alt: string;
  caption?: string;
  category: 'camps' | 'events' | 'community' | 'land';
  date?: string;
}

interface PhotoGalleryProps {
  images: GalleryImage[];
  showFilter?: boolean;
}

const categoryLabels: Record<GalleryImage['category'], string> = {
  camps: 'Cultural Camps',
  events: 'Events',
  community: 'Community',
  land: 'The Land',
};

const categoryIcons: Record<GalleryImage['category'], string> = {
  camps: '⛺',
  events: '📅',
  community: '👥',
  land: '🌲',
};

export function PhotoGallery({ images, showFilter = true }: PhotoGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<GalleryImage['category'] | 'all'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter images
  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return images;
    return images.filter((img) => img.category === activeFilter);
  }, [images, activeFilter]);

  // Get unique categories from images
  const categories = useMemo(() => {
    const cats = new Set(images.map((img) => img.category));
    return Array.from(cats);
  }, [images]);

  // Open lightbox
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // Navigate lightbox
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => Math.min(filteredImages.length - 1, prev + 1));
  };

  return (
    <div>
      {/* Filter Bar */}
      {showFilter && categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-shs-forest-600 text-white shadow-lg'
                : 'bg-white text-shs-text-body border border-shs-stone hover:border-shs-forest-300'
            }`}
          >
            All Photos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === cat
                  ? 'bg-shs-forest-600 text-white shadow-lg'
                  : 'bg-white text-shs-text-body border border-shs-stone hover:border-shs-forest-300'
              }`}
            >
              <span className="mr-1.5">{categoryIcons[cat]}</span>
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 text-shs-text-muted">
          <p>No photos in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-shs-stone focus:outline-none focus:ring-4 focus:ring-shs-forest-500/50"
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-0.5 bg-white/20 text-white text-xs rounded-full mb-2">
                    {categoryIcons[image.category]} {categoryLabels[image.category]}
                  </span>
                  {image.caption && (
                    <p className="text-white text-sm line-clamp-2">{image.caption}</p>
                  )}
                </div>
              </div>

              {/* Zoom icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        images={filteredImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </div>
  );
}
