/**
 * Skeleton Loader Component
 * Shimmer loading placeholders
 */

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

function SkeletonBase({ className = '', animate = true }: SkeletonProps) {
  return (
    <div 
      className={`bg-white/5 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase 
          key={i} 
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  return <SkeletonBase className={`${sizes[size]} rounded-full`} />;
}

// Card skeleton
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-elevated border border-glass-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1">
          <SkeletonBase className="h-4 w-32 mb-2" />
          <SkeletonBase className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-glass-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <SkeletonBase className={`h-4 ${i === 0 ? 'w-48' : i === columns - 1 ? 'w-16' : 'w-24'}`} />
        </td>
      ))}
    </tr>
  );
}

// Document list item skeleton
export function SkeletonDocumentItem() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-glass-border">
      <SkeletonBase className="w-10 h-12 rounded" />
      <div className="flex-1">
        <SkeletonBase className="h-4 w-48 mb-2" />
        <SkeletonBase className="h-3 w-32" />
      </div>
      <SkeletonBase className="h-6 w-16 rounded-full" />
    </div>
  );
}

// Dashboard stat card skeleton
export function SkeletonStatCard() {
  return (
    <div className="bg-bg-elevated border border-glass-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <SkeletonBase className="h-3 w-20" />
        <SkeletonBase className="h-6 w-6 rounded" />
      </div>
      <SkeletonBase className="h-8 w-16 mb-2" />
      <SkeletonBase className="h-3 w-24" />
    </div>
  );
}

// Combined skeleton for full page loading
export function SkeletonPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-8 w-48" />
        <div className="flex gap-2">
          <SkeletonBase className="h-9 w-24 rounded-lg" />
          <SkeletonBase className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      
      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

// Export base for custom usage
export { SkeletonBase as Skeleton };
