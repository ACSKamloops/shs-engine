import React from "react";

type Suggestion = {
  aoi_themes: string[];
  aoi_codes: string[];
  aoi_names: string[];
  band_numbers: string[];
};

type Props = {
  isOpen: boolean;
  caseType: string;
  claimant: string;
  defendant: string;
  periodStart: string;
  periodEnd: string;
  mission: string;
  requirements: string;
  theme: string;
  aoiTheme: string;
  aoiCode: string;
  aoiName: string;
  bandNbr: string;
  summaryEnabled: boolean;
  llmMode: string;
  allowedExts: string;
  themeLand: boolean;
  themeGovernance: boolean;
  themeFiduciary: boolean;
  themeWater: boolean;
  themeCoercion: boolean;
  onChange: (fields: Partial<{
    caseType: string;
    claimant: string;
    defendant: string;
    periodStart: string;
    periodEnd: string;
    mission: string;
    requirements: string;
    theme: string;
    aoiTheme: string;
    aoiCode: string;
    aoiName: string;
    bandNbr: string;
    summaryEnabled: boolean;
    llmMode: string;
    allowedExts: string;
    themeLand: boolean;
    themeGovernance: boolean;
    themeFiduciary: boolean;
    themeWater: boolean;
    themeCoercion: boolean;
  }>) => void;
  onClose: () => void;
  onSave: () => void;
  onSuggest: () => Promise<Suggestion | void>;
  suggestions: Suggestion | null;
};

export const Wizard: React.FC<Props> = ({
  isOpen,
  caseType,
  claimant,
  defendant,
  periodStart,
  periodEnd,
  mission,
  theme,
  aoiCode,
  aoiName,
  bandNbr,
  summaryEnabled,
  llmMode,
  allowedExts,
  themeLand,
  themeGovernance,
  themeFiduciary,
  themeWater,
  themeCoercion,
  onChange,
  onClose,
  onSave,
  onSuggest,
  suggestions,
}) => {
  const [step, setStep] = React.useState<number>(1);
  const [setupMode, setSetupMode] = React.useState<"quick" | "full">("quick");
  const totalSteps = setupMode === "quick" ? 2 : 4;
  if (!isOpen) return null;

  const workflowLabel = (value: string) => {
    const labels: Record<string, string> = {
      general_project: "General project",
      research: "Research / investigation",
      compliance: "Compliance / audit",
      ops: "Operations / incidents",
      specific_claim: "Legacy template: Specific claim",
      aboriginal_title: "Legacy template: Title / rights",
      duty_to_consult: "Legacy template: Consultation / engagement",
      other: "Other / custom",
    };
    return labels[value] || value || "(not set)";
  };

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const renderQuickStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Step 1 · Project profile</p>
              <p className="text-[11px] text-text-secondary">
                Capture a lightweight frame so filters (time window, tags, focus areas) stay aligned. This does not change
                any files — it only controls what the workspace highlights and how it groups review.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
              <label className="space-y-1">
                <span>Workflow template</span>
                <select
                  className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                  value={caseType}
                  onChange={(e) => onChange({ caseType: e.target.value })}
                >
                  <optgroup label="General">
                    <option value="general_project">General project</option>
                    <option value="research">Research / investigation</option>
                    <option value="compliance">Compliance / audit</option>
                    <option value="ops">Operations / incidents</option>
                    <option value="other">Other / custom</option>
                  </optgroup>
                  <optgroup label="Legacy templates (optional)">
                    <option value="specific_claim">Legacy template: Specific claim</option>
                    <option value="aboriginal_title">Legacy template: Title / rights</option>
                    <option value="duty_to_consult">Legacy template: Consultation / engagement</option>
                  </optgroup>
                </select>
                <p className="text-[11px] text-text-muted">
                  Optional label for the kind of work this workspace is for (saved with the profile for reference).
                </p>
              </label>
              <label className="space-y-1">
                <span>Focus period (YYYY–YYYY)</span>
                <div className="flex gap-2">
                  <input
                    className="w-20 rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="1878"
                    value={periodStart}
                    onChange={(e) => onChange({ periodStart: e.target.value })}
                  />
                  <span className="text-text-muted">to</span>
                  <input
                    className="w-20 rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="1916"
                    value={periodEnd}
                    onChange={(e) => onChange({ periodEnd: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  Optional: the years that matter most for this work (used for filtering and highlighting).
                </p>
              </label>
              <label className="space-y-1">
                <span>Stakeholder A (optional)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                  placeholder="Team / org / community / customer…"
                  value={claimant}
                  onChange={(e) => onChange({ claimant: e.target.value })}
                />
                <p className="text-[11px] text-text-muted">
                  Who this work is centered on (a person, team, organization, community, etc.).
                </p>
              </label>
              <label className="space-y-1">
                <span>Stakeholder B (optional)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                  placeholder="Partner / vendor / agency / counterparty…"
                  value={defendant}
                  onChange={(e) => onChange({ defendant: e.target.value })}
                />
                <p className="text-[11px] text-text-muted">
                  Optional second party for context (partner, vendor, regulator, counterparty, etc.).
                </p>
              </label>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Goal or guiding question</p>
              <p className="text-[11px] text-text-muted">
                In one or two sentences, describe what you are trying to understand, decide, or produce. Keep it factual and
                tied to documents (questions you want the sources to answer).
              </p>
            </div>
            <label className="text-xs text-text-secondary">
              <textarea
                className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                rows={3}
                placeholder="e.g. Trace key decisions and changes across 2019–2022 and capture the most relevant source excerpts."
                value={mission}
                onChange={(e) => onChange({ mission: e.target.value })}
              />
            </label>
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Default theme/tag</p>
              <p className="text-[11px] text-text-muted">
                Optional starting tag for new uploads in this workspace (for example, “Research”, “Finance”, “Stakeholders”, or
                “Site photos”).
              </p>
              <p className="text-[11px] text-text-muted">
                Example: <span className="italic">“Research”</span> or <span className="italic">“Roadmap”</span>.
              </p>
            </div>
            <label className="text-xs text-text-secondary">
              <input
                className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                value={theme}
                onChange={(e) => onChange({ theme: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="text-xs px-3 py-1 rounded bg-bg-elevated text-text-primary hover:bg-bg-hover border border-glass-border transition-colors"
              onClick={async () => {
                await onSuggest();
                if (setupMode === "full") {
                  setStep(2);
                }
              }}
            >
              Suggest map defaults from goal
            </button>
            {suggestions && (
              <div className="text-[11px] text-text-secondary space-y-1">
                <p className="text-text-primary">Suggestions from existing AOI/POI data:</p>
                <p>AOI themes: {suggestions.aoi_themes.join(", ") || "(none)"}</p>
                <p>AOI codes: {suggestions.aoi_codes.join(", ") || "(none)"}</p>
                <p>AOI names: {suggestions.aoi_names.join(", ") || "(none)"}</p>
                <p>Office codes: {suggestions.band_numbers.join(", ") || "(none)"}</p>
              </div>
            )}
          </div>
        );
      case 2:
      default:
        return (
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Step 2 · Review & save</p>
              <p className="text-[11px] text-text-secondary">
                Quick setup saves only the project profile and goal. Map focus and pipeline toggles stay on simple defaults,
                and you can always switch to full setup later.
              </p>
            </div>
            <div className="rounded-lg border border-glass-border bg-bg-elevated p-3 space-y-1 text-[13px]">
              <p><span className="text-text-muted">Workflow:</span> {workflowLabel(caseType)} (quick)</p>
              <p><span className="text-text-muted">Stakeholder A:</span> {claimant || "(none)"}</p>
              <p><span className="text-text-muted">Stakeholder B:</span> {defendant || "(none)"}</p>
              <p><span className="text-text-muted">Focus period:</span> {periodStart || "(start?)"} – {periodEnd || "(end?)"}</p>
              <p><span className="text-text-muted">Goal:</span> {mission || "(none)"}</p>
              <p><span className="text-text-muted">Theme:</span> {theme || "(none)"} (default tag)</p>
            </div>
          </div>
        );
    }
  };

  const renderFullStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Step 1 · Basic profile (Full)</p>
              <p className="text-[11px] text-text-secondary">
                Set up the core identifiers and goals for this workspace. This aligns auto-tagging and sets the default context.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
              <label className="space-y-1">
                <span>Workflow template</span>
                <select
                  className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                  value={caseType}
                  onChange={(e) => onChange({ caseType: e.target.value })}
                >
                  <option value="general_project">General project (default)</option>
                  <option value="research">Research / investigation</option>
                  <option value="compliance">Compliance / audit</option>
                  <option value="ops">Critical operations</option>
                </select>
                <p className="text-[11px] text-text-muted">
                  Determines default tag sets and risk highlighting rules.
                </p>
              </label>
              <label className="space-y-1">
                <span>Focus period (YYYY–YYYY)</span>
                <div className="flex gap-2">
                  <input
                    className="w-20 rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="1878"
                    value={periodStart}
                    onChange={(e) => onChange({ periodStart: e.target.value })}
                  />
                  <span className="text-text-muted">to</span>
                  <input
                    className="w-20 rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="1916"
                    value={periodEnd}
                    onChange={(e) => onChange({ periodEnd: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-text-muted">
                  Used for timeline filtering and relevancy scoring.
                </p>
              </label>
              <label className="space-y-1">
                <span>Primary stakeholder</span>
                <input
                  className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                  placeholder="e.g. Acme Corp / Community X"
                  value={claimant}
                  onChange={(e) => onChange({ claimant: e.target.value })}
                />
              </label>
              <label className="space-y-1">
                <span>Secondary stakeholder (optional)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                  placeholder="e.g. Partner Agency"
                  value={defendant}
                  onChange={(e) => onChange({ defendant: e.target.value })}
                />
              </label>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Research goal / Mission</p>
              <textarea
                className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                rows={2}
                placeholder="What are the key questions this workspace needs to answer?"
                value={mission}
                onChange={(e) => onChange({ mission: e.target.value })}
              />
            </div>
              <button
              type="button"
              className="text-xs px-3 py-1 rounded bg-bg-elevated text-text-primary hover:bg-bg-hover border border-glass-border transition-colors"
              onClick={async () => {
                await onSuggest();
                // stay on step 1 or auto-advance? let's stay so they can review suggestions
              }}
            >
              Suggest map defaults from goal
            </button>
            {suggestions && (
              <div className="text-[11px] text-text-secondary space-y-1 border border-glass-border rounded p-2 bg-bg-elevated/50">
                <p className="text-text-primary font-semibold">AI Suggestions:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted">Themes:</span> {suggestions.aoi_themes.join(", ") || "-"}
                  </div>
                  <div>
                    <span className="text-text-muted">Codes:</span> {suggestions.aoi_codes.join(", ") || "-"}
                  </div>
                   <div>
                    <span className="text-text-muted">Names:</span> {suggestions.aoi_names.join(", ") || "-"}
                  </div>
                   <div>
                    <span className="text-text-muted">Band #:</span> {suggestions.band_numbers.join(", ") || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Step 2 · Map & Geography</p>
              <p className="text-[11px] text-text-secondary">
                Configure the map interface to highlight relevant areas, reserves, or points of interest automatically.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
                <label className="space-y-1">
                  <span>AOI Codes (CSV)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="e.g. 101, 102"
                    value={aoiCode}
                    onChange={(e) => onChange({ aoiCode: e.target.value })}
                  />
                   <p className="text-[11px] text-text-muted">Official area/reserve codes to highlight.</p>
                </label>
                  <label className="space-y-1">
                  <span>AOI Names (CSV)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="e.g. Peach Valley, Red River"
                    value={aoiName}
                    onChange={(e) => onChange({ aoiName: e.target.value })}
                  />
                    <p className="text-[11px] text-text-muted">Place names to search and pin.</p>
                </label>
                <label className="space-y-1">
                  <span>Band Numbers (CSV)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                    placeholder="e.g. 550, 551"
                    value={bandNbr}
                    onChange={(e) => onChange({ bandNbr: e.target.value })}
                  />
                   <p className="text-[11px] text-text-muted">Administrative codes for groups.</p>
                </label>
              </div>
             <div className="space-y-2 pt-2">
                <p className="text-xs text-text-primary">Map Layer Data Themes</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-text-secondary">
                   <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!themeLand} onChange={(e) => onChange({ themeLand: e.target.checked })} 
                    className="rounded border-glass-border bg-bg-elevated text-accent-primary focus:ring-accent-primary"/>
                    Lands / Reserves / Tenure
                   </label>
                   <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!themeWater} onChange={(e) => onChange({ themeWater: e.target.checked })} 
                     className="rounded border-glass-border bg-bg-elevated text-accent-primary focus:ring-accent-primary"/>
                    Water / Fisheries / Marine
                   </label>
                   <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!themeGovernance} onChange={(e) => onChange({ themeGovernance: e.target.checked })} 
                     className="rounded border-glass-border bg-bg-elevated text-accent-primary focus:ring-accent-primary"/>
                    Governance / Admin / boundaries
                   </label>
                   <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!themeFiduciary} onChange={(e) => onChange({ themeFiduciary: e.target.checked })} 
                     className="rounded border-glass-border bg-bg-elevated text-accent-primary focus:ring-accent-primary"/>
                    Fiduciary / Finance / Trust
                   </label>
                   <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!themeCoercion} onChange={(e) => onChange({ themeCoercion: e.target.checked })} 
                     className="rounded border-glass-border bg-bg-elevated text-accent-primary focus:ring-accent-primary"/>
                    Enforcement / Schools / Health
                   </label>
                </div>
                 <p className="text-[11px] text-text-muted">
                  Selects which geographic data layers are enabled by default for this workspace.
                </p>
             </div>
          </div>
        );
      case 3:
        return (
             <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Step 3 · Processing & Analysis</p>
              <p className="text-[11px] text-text-secondary">
                Configure how documents are processed, summarized, and analyzed.
              </p>
            </div>
             <div className="space-y-3 pt-1">
                 <label className="flex items-center justify-between p-2 rounded-lg border border-glass-border bg-bg-elevated">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-text-primary">Auto-summarization</span>
                    <p className="text-[10px] text-text-muted">Generate summaries for every new document upload.</p>
                  </div>
                    <input type="checkbox" checked={summaryEnabled} onChange={(e) => onChange({ summaryEnabled: e.target.checked })} 
                     className="rounded border-glass-border bg-bg-elevated text-accent-primary focus:ring-accent-primary"/>
                 </label>
                 
                 <label className="space-y-1 block">
                    <span className="text-xs text-text-secondary">LLM Processing Mode</span>
                    <select
                      className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                      value={llmMode}
                      onChange={(e) => onChange({ llmMode: e.target.value })}
                    >
                      <option value="standard">Standard (Balanced cost/speed)</option>
                      <option value="high_accuracy">High Accuracy (Slower, more detailed)</option>
                      <option value="fast">Fast (Brief summaries, max speed)</option>
                    </select>
                </label>

                  <label className="space-y-1 block">
                    <span className="text-xs text-text-secondary">Allowed File Extensions</span>
                     <input
                      className="mt-1 w-full rounded-lg border border-glass-border bg-bg-elevated px-2 py-1 text-sm text-text-primary"
                      placeholder=".pdf, .docx, .txt"
                      value={allowedExts}
                      onChange={(e) => onChange({ allowedExts: e.target.value })}
                    />
                    <p className="text-[10px] text-text-muted">Comma-separated list of allowed file types for ingestion.</p>
                </label>
             </div>
          </div>
        )
      case 4:
      default:
        return (
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="space-y-1">
              <p className="text-xs text-text-primary">Step 4 · Review & Save (Full)</p>
              <p className="text-[11px] text-text-secondary">
                Review your full workspace configuration rules before finalizing.
              </p>
            </div>
            <div className="rounded-lg border border-glass-border bg-bg-elevated p-3 space-y-2 text-[13px]">
               <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><span className="text-text-muted">Workflow:</span> {workflowLabel(caseType)}</p>
                  <p><span className="text-text-muted">Period:</span> {periodStart}-{periodEnd}</p>
                   <p><span className="text-text-muted">Primary:</span> {claimant || "-"}</p>
                   <p><span className="text-text-muted">Secondary:</span> {defendant || "-"}</p>
                   <p className="col-span-2"><span className="text-text-muted">Goal:</span> <span className="italic truncate block">{mission || "-"}</span></p>
               </div>
               <div className="border-t border-glass-border pt-1 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><span className="text-text-muted">AOI Codes:</span> {aoiCode || "-"}</p>
                   <p><span className="text-text-muted">AOI Names:</span> {aoiName || "-"}</p>
                   <p><span className="text-text-muted">Band #:</span> {bandNbr || "-"}</p>
               </div>
                <div className="border-t border-glass-border pt-1 mt-1">
                  <p><span className="text-text-muted">Summarization:</span> {summaryEnabled ? "On" : "Off"}</p>
                  <p><span className="text-text-muted">LLM Mode:</span> {llmMode}</p>
               </div>
            </div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-bg-base rounded-xl border border-glass-border shadow-2xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <div>
            <h2 id="wizard-title" className="text-xl font-bold text-text-primary flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-sm">
                {step}
              </span>
              {step === 1 ? "Project Setup" : step === 2 ? "Map & Geography" : step === 3 ? "Pipeline Config" : "Review"}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {setupMode === 'quick' ? 'Quick Setup (Essentials only)' : 'Full System Configuration'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-bg-elevated rounded-lg p-0.5 border border-glass-border">
              <button
                type="button"
                onClick={() => {
                  setSetupMode('quick');
                  setStep(s => Math.min(s, 2));
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  setupMode === 'quick'
                    ? 'bg-accent-primary/10 text-accent-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Quick
              </button>
              <button
                type="button"
                onClick={() => {
                  setSetupMode('full');
                  setStep(s => Math.min(s, 4));
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  setupMode === 'full'
                    ? 'bg-accent-primary/10 text-accent-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Full
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close wizard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {setupMode === 'quick' ? renderQuickStep() : renderFullStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-glass-border bg-bg-elevated/30 flex justify-between items-center rounded-b-xl">
           <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass-border/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={prev}
            disabled={step === 1}
          >
            Back
          </button>
          
          <div className="flex gap-2">
             <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass-border/10 transition-colors"
              >
                Cancel
              </button>
            <button
              type="button"
              onClick={() => {
                const isLastStep = setupMode === 'quick' ? step === 2 : step === 4;
                if (isLastStep) {
                  onSave();
                } else {
                  next();
                }
              }}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/25 hover:shadow-accent-primary/40 hover:-translate-y-0.5 transition-all"
            >
              {((setupMode === 'quick' && step === 2) || (setupMode === 'full' && step === 4)) ? 'Create Workspace' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
