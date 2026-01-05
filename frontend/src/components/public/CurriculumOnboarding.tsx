/**
 * CurriculumOnboarding - Explains the Cḱuĺtn Learning Framework
 * 
 * Provides visual introduction to the four pathways:
 * - tmícw (Land) - Place-based learning
 * - sképqin (Mind) - Language and stories  
 * - púsmen (Heart) - Values and relationships
 * - súmec (Spirit) - Governance and ceremony
 */
export function CurriculumOnboarding() {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-shs-forest-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-shs-amber-100 text-shs-amber-700 text-sm font-semibold rounded-full mb-4">
            How Learning Works Here
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-shs-forest-800 mb-3">
            Cḱuĺtn — The Secwépemc Way of Being
          </h2>
          <p className="text-shs-text-body max-w-2xl mx-auto">
            Our curriculum follows the Cḱuĺtn framework, organizing learning through four interconnected elements 
            that guide Secwépemc life.
          </p>
        </div>



        {/* How It Works */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 text-center">📚 How Learning is Organized</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-shs-forest-100 text-shs-forest-700 font-bold 
                              flex items-center justify-center mx-auto mb-2">1</div>
              <p className="font-semibold text-sm">Pathways</p>
              <p className="text-xs text-gray-500">4 learning tracks</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-shs-forest-100 text-shs-forest-700 font-bold 
                              flex items-center justify-center mx-auto mb-2">2</div>
              <p className="font-semibold text-sm">Modules</p>
              <p className="text-xs text-gray-500">6 curriculum packages</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-shs-forest-100 text-shs-forest-700 font-bold 
                              flex items-center justify-center mx-auto mb-2">3</div>
              <p className="font-semibold text-sm">Units</p>
              <p className="text-xs text-gray-500">Topic-focused groups</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-shs-forest-100 text-shs-forest-700 font-bold 
                              flex items-center justify-center mx-auto mb-2">4</div>
              <p className="font-semibold text-sm">Lessons</p>
              <p className="text-xs text-gray-500">Individual activities</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CurriculumOnboarding;
