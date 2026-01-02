/**
 * Insights Panel Component
 * Document metadata at-a-glance
 */

interface DocumentInsight {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface InsightsPanelProps {
  title?: string;
  insights: DocumentInsight[];
  className?: string;
}

export function InsightsPanel({ title = 'Insights', insights, className = '' }: InsightsPanelProps) {
  return (
    <div className={`bg-bg-elevated border border-glass-border rounded-lg p-4 ${className}`}>
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
        {title}
      </h3>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {insight.icon && <span className="text-sm">{insight.icon}</span>}
              <span className="text-sm text-text-secondary">{insight.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text-primary">{insight.value}</span>
              {insight.trend && (
                <span className={`text-xs ${
                  insight.trend === 'up' ? 'text-emerald-400' :
                  insight.trend === 'down' ? 'text-red-400' :
                  'text-text-muted'
                }`}>
                  {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '–'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Document-specific insights
interface DocumentMetadata {
  title: string;
  pageCount?: number;
  wordCount?: number;
  createdAt: Date;
  modifiedAt?: Date;
  entities?: string[];
  readingTime?: number; // minutes
  fileSize?: number; // bytes
}

export function DocumentInsightsPanel({ doc }: { doc: DocumentMetadata }) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const insights: DocumentInsight[] = [
    ...(doc.pageCount ? [{ label: 'Pages', value: doc.pageCount, icon: '📄' }] : []),
    ...(doc.wordCount ? [{ label: 'Words', value: doc.wordCount.toLocaleString(), icon: '📝' }] : []),
    ...(doc.readingTime ? [{ label: 'Reading time', value: `${doc.readingTime} min`, icon: '⏱️' }] : []),
    ...(doc.fileSize ? [{ label: 'Size', value: formatFileSize(doc.fileSize), icon: '💾' }] : []),
    { label: 'Created', value: formatDate(doc.createdAt), icon: '📅' },
    ...(doc.modifiedAt ? [{ label: 'Modified', value: formatDate(doc.modifiedAt), icon: '✏️' }] : []),
  ];

  return (
    <div className="bg-bg-elevated border border-glass-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-4 truncate">{doc.title}</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {insights.slice(0, 4).map((insight, index) => (
          <div key={index} className="text-center p-2 bg-white/3 rounded-lg">
            <span className="text-lg block mb-1">{insight.icon}</span>
            <span className="text-lg font-semibold text-text-primary block">{insight.value}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">{insight.label}</span>
          </div>
        ))}
      </div>

      {doc.entities && doc.entities.length > 0 && (
        <div className="pt-3 border-t border-glass-border">
          <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">
            Key Entities
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {doc.entities.slice(0, 6).map((entity, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded-full"
              >
                {entity}
              </span>
            ))}
            {doc.entities.length > 6 && (
              <span className="px-2 py-1 text-xs text-text-muted">
                +{doc.entities.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
