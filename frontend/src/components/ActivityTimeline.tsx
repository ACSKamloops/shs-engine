/**
 * Activity Timeline Component
 * Visual action history
 */

export type ActivityType = 
  | 'upload' 
  | 'process' 
  | 'search' 
  | 'export' 
  | 'delete' 
  | 'create' 
  | 'update' 
  | 'view';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, string | number>;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const ACTIVITY_ICONS: Record<ActivityType, { icon: string; color: string }> = {
  upload: { icon: '⬆️', color: 'bg-blue-500/20 text-blue-400' },
  process: { icon: '⚙️', color: 'bg-purple-500/20 text-purple-400' },
  search: { icon: '🔍', color: 'bg-cyan-500/20 text-cyan-400' },
  export: { icon: '📤', color: 'bg-green-500/20 text-green-400' },
  delete: { icon: '🗑️', color: 'bg-red-500/20 text-red-400' },
  create: { icon: '➕', color: 'bg-emerald-500/20 text-emerald-400' },
  update: { icon: '✏️', color: 'bg-amber-500/20 text-amber-400' },
  view: { icon: '👁️', color: 'bg-slate-500/20 text-slate-400' },
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityTimeline({ activities, maxItems = 10, className = '' }: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <div className={`bg-bg-elevated border border-glass-border rounded-lg p-6 text-center ${className}`}>
        <span className="text-2xl block mb-2">📋</span>
        <p className="text-sm text-text-muted">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={`bg-bg-elevated border border-glass-border rounded-lg p-4 ${className}`}>
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
        Recent Activity
      </h3>

      <div className="space-y-1">
        {displayedActivities.map((activity, index) => {
          const { icon, color } = ACTIVITY_ICONS[activity.type];
          const isLast = index === displayedActivities.length - 1;

          return (
            <div key={activity.id} className="flex gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${color}`}>
                  {icon}
                </div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-white/5 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-primary font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-text-muted mt-0.5">{activity.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>

                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span 
                        key={key}
                        className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-text-muted"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > maxItems && (
        <button className="w-full mt-2 py-2 text-xs text-text-muted hover:text-text-primary transition-colors">
          View all {activities.length} activities →
        </button>
      )}
    </div>
  );
}

// Compact inline activity indicator
interface RecentActivityProps {
  activities: ActivityItem[];
  limit?: number;
}

export function RecentActivityBadge({ activities, limit = 3 }: RecentActivityProps) {
  const recent = activities.slice(0, limit);
  
  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted">
      <span>Recent:</span>
      <div className="flex -space-x-1">
        {recent.map((activity) => {
          const { icon, color } = ACTIVITY_ICONS[activity.type];
          return (
            <span 
              key={activity.id}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${color} border border-bg-base`}
              title={activity.title}
            >
              {icon}
            </span>
          );
        })}
      </div>
      <span>{formatRelativeTime(recent[0].timestamp)}</span>
    </div>
  );
}
