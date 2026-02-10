/**
 * GalleryPage - Photo Gallery with Premium Animations (Modernized Jan 2026)
 * Features: Framer Motion, glassmorphism cards, animated hero, staggered reveals
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhotoGallery, type GalleryImage } from '../../components/public/PhotoGallery';
import { AnimatedCard, SectionReveal, FloatingIcon } from '../../components/ui/AnimatedComponents';

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

// Archive feature cards
const archiveFeatures = [
  {
    icon: '📚',
    title: 'Narrative Documentation',
    description: 'Preserving our stories through cultural documentation. This section prioritizes Elder-verified accounts of land use, occupancy, and ecological knowledge.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '🗣️',
    title: 'Linguistic Ecology',
    description: 'Documentation of Secwepemctsín in place. Each entry is tagged with its geographical context, ensuring language lives where it was born.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: '🌲',
    title: 'Heritage Stewardship',
    description: 'A visual repository of stewardship outcomes—from wildfire recovery snapshots to archaeological field surveys.',
    color: 'from-teal-500 to-cyan-500',
  },
];

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-shs-forest-900/50 to-shs-forest-900" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            📸
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 bg-shs-amber-500/20 text-shs-amber-300 text-sm font-semibold rounded-full mb-6"
          >
            Photo Gallery
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
          >
            Our Stories in Pictures
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-shs-forest-200 max-w-2xl mx-auto"
          >
            A digital sanctuary for Secwépemc knowledge—preserving our oral histories, 
            land laws, and the vibrant life of our community.
          </motion.p>
        </div>
      </section>

      {/* Digital Archive Structure - HSP Vision */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-shs-sand to-shs-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                <FloatingIcon icon="✨" size="sm" />
                Digital Archive
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-shs-forest-800">
                Preserving Our Heritage
              </h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {archiveFeatures.map((feature, index) => (
              <AnimatedCard key={feature.title} delay={index * 0.15} className="p-8 text-center" glass>
                <motion.div 
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-shs-forest-800 mb-3">{feature.title}</h3>
                <p className="text-shs-text-body text-sm leading-relaxed">
                  {feature.description}
                </p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal delay={0.1}>
            <PhotoGallery images={galleryImages} />
          </SectionReveal>
        </div>
      </section>

      {/* Submit Photos CTA */}
      <section className="py-20 bg-gradient-to-br from-shs-forest-800 via-shs-forest-900 to-emerald-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">📷</div>
          <div className="absolute bottom-10 right-10 text-9xl">🖼️</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <FloatingIcon icon="📤" size="xl" />
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
              Share Your Photos
            </h2>
            <p className="text-shs-forest-200 mb-10 max-w-xl mx-auto text-lg">
              Have photos from an SHS event or camp? We'd love to feature them in our gallery. 
              Contact us to submit your images.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
              >
                <span>Submit Photos</span>
                <span className="text-xl">→</span>
              </Link>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* Land Acknowledgement Note */}
      <SectionReveal>
        <section className="py-10 bg-shs-forest-50 border-t border-shs-forest-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-shs-forest-700 italic flex items-center justify-center gap-2">
              <span>🌿</span>
              These photos were taken on the unceded traditional territory of the Secwépemc people. 
              We express gratitude for the land and all it provides.
            </p>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
