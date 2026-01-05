/**
 * GalleryPage - Photo Gallery with Filtering and Lightbox
 * Showcases cultural camps, events, community, and land photography
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PhotoGallery, type GalleryImage } from '../../components/public/PhotoGallery';

// Sample gallery images (replace with real images later)
const galleryImages: GalleryImage[] = [
  // Camps
  {
    id: 'camp-1',
    src: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400',
    alt: 'Campfire under starry sky',
    caption: 'Evening gathering at Adams Lake Cultural Camp',
    category: 'camps',
    date: '2025-08',
  },
  {
    id: 'camp-2',
    src: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400',
    alt: 'Traditional shelter building',
    caption: 'Youth learning traditional shelter construction',
    category: 'camps',
    date: '2025-07',
  },
  {
    id: 'camp-3',
    src: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400',
    alt: 'Mountain lake at sunrise',
    caption: 'Morning ceremony at Shuswap Lake',
    category: 'camps',
    date: '2025-06',
  },
  // Events
  {
    id: 'event-1',
    src: 'https://images.unsplash.com/photo-1529543544277-085d37439a41?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1529543544277-085d37439a41?w=400',
    alt: 'Community gathering',
    caption: 'Annual community gathering celebration',
    category: 'events',
    date: '2025-09',
  },
  {
    id: 'event-2',
    src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
    alt: 'Outdoor workshop',
    caption: 'Traditional crafts workshop',
    category: 'events',
    date: '2025-08',
  },
  // Community
  {
    id: 'community-1',
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400',
    alt: 'Elders and youth together',
    caption: 'Elders sharing knowledge with youth',
    category: 'community',
    date: '2025-07',
  },
  {
    id: 'community-2',
    src: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=400',
    alt: 'Group hiking',
    caption: 'Land-based learning walk',
    category: 'community',
    date: '2025-06',
  },
  // Land
  {
    id: 'land-1',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    alt: 'Mountain peaks',
    caption: 'Secwepemcúl̓ecw mountain range',
    category: 'land',
    date: '2025-05',
  },
  {
    id: 'land-2',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    alt: 'Sunlit forest',
    caption: 'Ancient forest in the territory',
    category: 'land',
    date: '2025-04',
  },
  {
    id: 'land-3',
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
    alt: 'Lake reflection',
    caption: 'Shuswap Lake reflections',
    category: 'land',
    date: '2025-03',
  },
  {
    id: 'land-4',
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    alt: 'Misty valley',
    caption: 'Morning mist over the valley',
    category: 'land',
    date: '2025-02',
  },
  {
    id: 'camp-4',
    src: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=400',
    alt: 'Cooking over fire',
    caption: 'Traditional food preparation at camp',
    category: 'camps',
    date: '2025-09',
  },
];

// Animation hook
function useIntersectionObserver(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function GalleryPage() {
  const heroAnim = useIntersectionObserver();

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 to-shs-forest-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-shs-forest-900/50 to-shs-forest-900" />
        </div>
        
        <div
          ref={heroAnim.ref}
          className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${
            heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-6">
            Photo Gallery
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            Our Stories in Pictures
          </h1>
          <p className="text-lg md:text-xl text-shs-forest-200 max-w-2xl mx-auto">
            A digital sanctuary for Secwépemc knowledge—preserving our oral histories, 
            land laws, and the vibrant life of our community.
          </p>
        </div>
      </section>

      {/* Digital Archive Structure - HSP Vision */}
      <section className="py-16 md:py-24 bg-shs-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-3xl border border-shs-stone shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-shs-forest-100 rounded-full flex items-center justify-center text-shs-forest-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-shs-forest-800 mb-2">Narrative Documentation</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">
                Preserving our stories through cultural documentation. This section prioritizes 
                Elder-verified accounts of land use, occupancy, and ecological knowledge.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-shs-stone shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-shs-amber-100 rounded-full flex items-center justify-center text-shs-amber-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-shs-forest-800 mb-2">Linguistic Ecology</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">
                Documentation of *Secwepemctsín* in place. Each entry is tagged with its geographical 
                context, ensuring language lives where it was born.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-shs-stone shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-shs-earth-100 rounded-full flex items-center justify-center text-shs-earth-600 mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-shs-forest-800 mb-2">Heritage Stewardship</h3>
              <p className="text-shs-text-body text-sm leading-relaxed">
                A visual repository of stewardship outcomes—from wildfire recovery snapshots 
                to archaeological field surveys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PhotoGallery images={galleryImages} />
        </div>
      </section>

      {/* Submit Photos CTA */}
      <section className="py-16 bg-shs-sand border-t border-shs-stone">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-shs-forest-800 mb-4">
            Share Your Photos
          </h2>
          <p className="text-shs-text-body mb-8 max-w-xl mx-auto">
            Have photos from an SHS event or camp? We'd love to feature them in our gallery. 
            Contact us to submit your images.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors shadow-lg"
          >
            Submit Photos
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Land Acknowledgement Note */}
      <section className="py-8 bg-shs-forest-50 border-t border-shs-forest-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-shs-forest-700 italic">
            These photos were taken on the unceded traditional territory of the Secwépemc people. 
            We express gratitude for the land and all it provides.
          </p>
        </div>
      </section>
    </div>
  );
}
