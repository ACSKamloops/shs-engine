/**
 * PipelineStages component with animated status indicators
 * Shows document processing workflow with live status feedback
 */

export type StageStatus = 'pending' | 'processing' | 'done' | 'error' | 'skipped';

export type PipelineStage = {
  key: string;
  label: string;
  done: boolean;
  detail: string;
  /** Optional explicit status - if not provided, derives from 'done' */
  status?: StageStatus;
};

type Props = {
  stages: PipelineStage[];
  orientation?: 'vertical' | 'horizontal';
};

/** Spinner animation for processing state */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-cyan-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/** Get status properties for styling */
function getStatusProps(stage: PipelineStage) {
  const status = stage.status ?? (stage.done ? 'done' : 'pending');
  
  switch (status) {
    case 'done':
      return {
        icon: '✓',
        bg: 'bg-emerald-500',
        text: 'text-slate-900',
        border: 'border-emerald-500/30',
        showSpinner: false,
      };
    case 'processing':
      return {
        icon: null,
        bg: 'bg-cyan-500/30',
        text: 'text-cyan-300',
        border: 'border-cyan-500/50',
        showSpinner: true,
      };
    case 'error':
      return {
        icon: '✕',
        bg: 'bg-red-500',
        text: 'text-white',
        border: 'border-red-500/30',
        showSpinner: false,
      };
    case 'skipped':
      return {
        icon: '—',
        bg: 'bg-slate-600',
        text: 'text-slate-400',
        border: 'border-slate-600/30',
        showSpinner: false,
      };
    default: // pending
      return {
        icon: '○',
        bg: 'bg-white/10',
        text: 'text-slate-400',
        border: 'border-white/10',
        showSpinner: false,
      };
  }
}

export function PipelineStages({ stages, orientation = 'vertical' }: Props) {
  const containerClasses =
    orientation === 'horizontal'
      ? 'grid gap-2 md:grid-cols-3 lg:grid-cols-6'
      : 'grid gap-2';

  return (
    <div className={containerClasses}>
      {stages.map((step) => {
        const props = getStatusProps(step);
        return (
          <div
            key={step.key}
            className={`flex items-start gap-3 rounded-lg border ${props.border} bg-black/30 px-3 py-2 transition-all ${
              orientation === 'horizontal' ? 'h-full' : ''
            } ${step.status === 'processing' ? 'ring-1 ring-cyan-500/30' : ''}`}
          >
            <div
              className={`mt-0.5 h-5 w-5 flex items-center justify-center rounded-full text-xs font-bold ${props.bg} ${props.text}`}
            >
              {props.showSpinner ? <Spinner /> : props.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${step.status === 'processing' ? 'text-cyan-300' : 'text-white'}`}>
                {step.label}
              </p>
              <p className="text-xs text-slate-400 truncate">{step.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
