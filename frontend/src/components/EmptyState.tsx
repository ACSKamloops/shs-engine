/**
 * Empty State Component
 * Illustrated empty states with CTAs
 */
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// Built-in icons for common empty states
const EMPTY_ICONS = {
  documents: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  folder: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  map: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Icon with gradient background */}
      <div className="relative mb-6 animate-float">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-full blur-2xl" />
        <div className="relative text-text-muted">
          {icon || EMPTY_ICONS.documents}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover transition-colors shadow-lg shadow-accent-primary/25"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-sm font-medium bg-white/5 text-text-secondary border border-glass-border rounded-lg hover:bg-white/10 hover:text-text-primary transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states
export function NoDocumentsEmpty({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={EMPTY_ICONS.documents}
      title="No documents yet"
      description="Upload your first document to get started with analysis and mapping."
      action={{ label: 'Upload Documents', onClick: onUpload }}
    />
  );
}

export function NoSearchResultsEmpty({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={EMPTY_ICONS.search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try different keywords or filters.`}
      action={{ label: 'Clear Search', onClick: onClear }}
    />
  );
}

export function NoCollectionsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={EMPTY_ICONS.folder}
      title="No collections"
      description="Organize your documents into collections for easier management."
      action={{ label: 'Create Collection', onClick: onCreate }}
    />
  );
}

export function ErrorEmpty({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={EMPTY_ICONS.error}
      title="Something went wrong"
      description={message || "We encountered an error loading this content. Please try again."}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}
