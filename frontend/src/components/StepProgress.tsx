/**
 * Step Progress Component
 * Multi-step progress indicator for long operations
 */

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface StepProgressProps {
  steps: ProgressStep[];
  currentStep?: number;
  className?: string;
}

export function StepProgress({ steps, className = '' }: StepProgressProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          {/* Step indicator */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              step.status === 'complete' ? 'bg-emerald-500 text-white' :
              step.status === 'active' ? 'bg-accent-primary text-white animate-pulse' :
              step.status === 'error' ? 'bg-red-500 text-white' :
              'bg-white/10 text-text-muted'
            }`}>
              {step.status === 'complete' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.status === 'error' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : step.status === 'active' ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`w-0.5 h-6 mt-1 transition-colors ${
                step.status === 'complete' ? 'bg-emerald-500' : 'bg-white/10'
              }`} />
            )}
          </div>
          
          {/* Step content */}
          <div className="flex-1 pt-1">
            <h4 className={`text-sm font-medium ${
              step.status === 'active' ? 'text-text-primary' :
              step.status === 'complete' ? 'text-emerald-400' :
              step.status === 'error' ? 'text-red-400' :
              'text-text-muted'
            }`}>
              {step.label}
            </h4>
            {step.description && (
              <p className="text-xs text-text-muted mt-0.5">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Horizontal progress bar variant
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ progress, label, showPercentage = true, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2 text-xs">
          {label && <span className="text-text-secondary">{label}</span>}
          {showPercentage && <span className="text-text-muted">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

// Processing status component
interface ProcessingStatusProps {
  title: string;
  steps: ProgressStep[];
  estimatedTime?: string;
  onCancel?: () => void;
}

export function ProcessingStatus({ title, steps, estimatedTime, onCancel }: ProcessingStatusProps) {
  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const progress = (completedSteps / steps.length) * 100;
  
  return (
    <div className="bg-bg-elevated border border-glass-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {estimatedTime && (
          <span className="text-xs text-text-muted">~{estimatedTime} remaining</span>
        )}
      </div>
      
      <ProgressBar progress={progress} className="mb-4" />
      
      <StepProgress steps={steps} />
      
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 w-full px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
