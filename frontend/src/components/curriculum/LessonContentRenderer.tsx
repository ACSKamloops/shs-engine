/**
 * LessonContentRenderer - Smart renderer for diverse lesson content formats
 * 
 * Handles ALL lesson data fields:
 * - content (string, object, or array)
 * - steps, protocol (process steps)
 * - animals, species, roots (entity lists)
 * - practices (stewardship)
 * - calendar (seasonal data)
 * - Never exposes raw JSON to users
 */
import { motion } from 'framer-motion';

interface LessonContentRendererProps {
  content?: any;
  steps?: string[];
  protocol?: string[];
  animals?: any[];
  species?: any[];
  roots?: any[];
  practices?: any[];
  calendar?: any;
  className?: string;
}

// Helper to render a list of items as cards
function renderItemList(items: any[], icon: string, title: string) {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h4>
      <div className="space-y-2">
        {items.map((item: any, i: number) => {
          // Handle different object shapes
          const primary = typeof item === 'string' ? item : 
            (item.method || item.animal || item.secwepemc || item.english || item.title || item.name);
          const secondary = typeof item === 'string' ? null :
            (item.description || item.english || item.season || item.note || item.details);
          
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <span className="w-7 h-7 bg-shs-forest-100 text-shs-forest-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                {primary && (
                  <p className="font-semibold text-gray-900">{primary}</p>
                )}
                {secondary && (
                  <p className="text-gray-600 text-sm mt-0.5">{secondary}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to render step-by-step process
function renderSteps(steps: string[], title: string = 'Process Steps') {
  if (!steps || steps.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <span>📋</span> {title}
      </h4>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
          >
            <span className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {i + 1}
            </span>
            <p className="text-gray-800 flex-1">{step}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function LessonContentRenderer({ 
  content, 
  steps,
  protocol,
  animals,
  species,
  roots,
  practices, 
  calendar, 
  className = '' 
}: LessonContentRendererProps) {
  // Check if we have ANY content
  const hasContent = content || steps?.length || protocol?.length || animals?.length || 
    species?.length || roots?.length || practices?.length || calendar;
  
  if (!hasContent) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <span className="text-4xl mb-3 block">📄</span>
        <p className="text-gray-500">Content is being prepared. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* String content - render as paragraphs */}
      {typeof content === 'string' && (
        <div className="prose prose-sm max-w-none">
          {content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed">{paragraph}</p>
          ))}
        </div>
      )}

      {/* Object with title/description */}
      {typeof content === 'object' && content !== null && !Array.isArray(content) && (
        <div className="space-y-4">
          {content.title && (
            <h4 className="text-lg font-bold text-gray-900">{content.title}</h4>
          )}
          {content.description && (
            <p className="text-gray-700">{content.description}</p>
          )}
          {content.overview && (
            <p className="text-gray-700">{content.overview}</p>
          )}
          {content.introduction && (
            <div className="bg-shs-forest-50 p-4 rounded-xl border border-shs-forest-100">
              <p className="text-shs-forest-800">{content.introduction}</p>
            </div>
          )}
          {content.keyPoints && Array.isArray(content.keyPoints) && (
            <ul className="space-y-2">
              {content.keyPoints.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-shs-forest-500 mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Array content - render as cards */}
      {Array.isArray(content) && renderItemList(content, '📖', 'Content')}

      {/* Steps (process instructions) */}
      {steps && steps.length > 0 && renderSteps(steps, 'Construction Steps')}

      {/* Protocol (ceremony steps) */}
      {protocol && protocol.length > 0 && renderSteps(protocol, 'Protocol')}

      {/* Animals */}
      {animals && animals.length > 0 && renderItemList(animals, '🦌', 'Animals Hunted')}

      {/* Species (fish, etc) */}
      {species && species.length > 0 && renderItemList(species, '🐟', 'Species')}

      {/* Roots */}
      {roots && roots.length > 0 && renderItemList(roots, '🌱', 'Root Foods')}

      {/* Practices data (stewardship) */}
      {practices && practices.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span>🌿</span> Traditional Practices
          </h4>
          <div className="grid gap-3">
            {practices.slice(0, 6).map((practice: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-green-800">{practice.category}</p>
                    {practice.management && (
                      <p className="text-sm text-green-700 mt-1">{practice.management}</p>
                    )}
                  </div>
                  {practice.practiceTypes && (
                    <div className="flex gap-1 flex-wrap">
                      {practice.practiceTypes.slice(0, 2).map((type: string, j: number) => (
                        <span key={j} className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {practices.length > 6 && (
              <p className="text-sm text-gray-500 text-center">
                +{practices.length - 6} more practices
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calendar data */}
      {calendar && Array.isArray(calendar) && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span>📅</span> Seasonal Calendar
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calendar.map((entry: any, i: number) => (
              <div key={i} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900">{entry.month}</p>
                {entry.berries && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.berries.map((berry: string, j: number) => (
                      <span key={j} className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full">
                        {berry}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar as object */}
      {calendar && !Array.isArray(calendar) && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <span>📅</span> Seasonal Calendar
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['spring', 'summer', 'fall', 'winter'].map((season) => {
              const seasonData = calendar[season];
              if (!seasonData) return null;
              const seasonIcons: Record<string, string> = { spring: '🌸', summer: '☀️', fall: '🍂', winter: '❄️' };
              return (
                <div key={season} className="p-3 bg-gray-50 rounded-xl text-center">
                  <span className="text-2xl block mb-2">{seasonIcons[season]}</span>
                  <p className="font-medium text-gray-900 capitalize">{season}</p>
                  {typeof seasonData === 'string' && (
                    <p className="text-xs text-gray-600 mt-1">{seasonData}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonContentRenderer;
