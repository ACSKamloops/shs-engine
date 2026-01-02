import React from "react";

type Props = {
  mode?: "full" | "floating";
  showDocs: boolean;
  showSuggestions: boolean;
  showAoi: boolean;
  showPoi: boolean;
  showGlobalDocs: boolean;
  aoiThemeFilter: string;
  aoiThemeOptions: string[];
  onToggleDocs: (v: boolean) => void;
  onToggleSuggestions: (v: boolean) => void;
  onToggleAoi: (v: boolean) => void;
  onTogglePoi: (v: boolean) => void;
  onToggleGlobalDocs: (v: boolean) => void;
  onThemeChange: (v: string) => void;
  onRefreshAoi: () => void;
  onOpenImport: () => void;
  mapRef: React.RefObject<HTMLDivElement | null>;
};

export function MapControls({
  mode = "full",
  showDocs,
  showSuggestions,
  showAoi,
  showPoi,
  showGlobalDocs,
  aoiThemeFilter,
  aoiThemeOptions,
  onToggleDocs,
  onToggleSuggestions,
  onToggleAoi,
  onTogglePoi,
  onToggleGlobalDocs,
  onThemeChange,
  onRefreshAoi,
  onOpenImport,
  mapRef,
}: Props) {
  const labelForTheme = (value: string) => {
    switch (value) {
      case "ALC_Confirmed":
        return "Reserves / settlements (confirmed)";
      case "ALC_Modified":
        return "Reserves / settlements (modified)";
      case "Modern_Treaty":
        return "Modern treaties";
      case "BC_SOI":
        return "BC Statement of Intent (SOI) regions";
      case "First_Nation_Office":
        return "First Nation offices (points)";
      default:
        return value || "Unnamed";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm font-semibold text-slate-100">Map & edit</p>
          <span className="pill bg-emerald-500/20 text-emerald-50 text-[11px]">Click to add · Drag to move</span>
          <span className="pill bg-white/10 text-slate-100 text-[11px]">Green = confirmed · Orange = suggestions</span>
          <span className="pill bg-white/10 text-slate-100 text-[11px]">Tip: drag a file onto the map to upload</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <label className="flex items-center gap-1 text-slate-300">
            <input type="checkbox" checked={showDocs} onChange={(e) => onToggleDocs(e.target.checked)} />
            Docs
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            <input type="checkbox" checked={showSuggestions} onChange={(e) => onToggleSuggestions(e.target.checked)} />
            Suggestions
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            <input type="checkbox" checked={showAoi} onChange={(e) => onToggleAoi(e.target.checked)} />
            Boundaries / AOIs
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            <input type="checkbox" checked={showPoi} onChange={(e) => onTogglePoi(e.target.checked)} />
            First Nation offices
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            <input
              type="checkbox"
              checked={showGlobalDocs}
              onChange={(e) => onToggleGlobalDocs(e.target.checked)}
            />
            Global docs
          </label>
          <select
            className="text-xs rounded bg-white/10 text-white px-2 py-1 border border-white/10"
            value={aoiThemeFilter}
            onChange={(e) => onThemeChange(e.target.value)}
          >
            <option value="">All boundary layers</option>
            {aoiThemeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {labelForTheme(opt)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1">
            <span className="inline-block rounded-full bg-emerald-400 w-3 h-3 shadow" />
            <span>Doc points</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block rounded-full bg-amber-400 w-3 h-3 shadow" />
            <span>Suggestions</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block rounded-full bg-emerald-400 w-3 h-3 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
            <span>High relevance</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block rounded-full bg-slate-500 w-3 h-3" />
            <span>Low / not relevant</span>
          </div>
        </div>
      </div>
      {mode === "full" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_auto] gap-3">
          <div ref={mapRef} className="map-container" />
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2 w-64">
            <p className="text-xs uppercase tracking-widest text-slate-400">Layers</p>
            <div className="flex flex-col gap-2">
              <button
                className="text-xs px-3 py-2 rounded bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                onClick={onOpenImport}
              >
                + Add layer (KML/KMZ/GeoJSON)
              </button>
              <button
                className="text-xs px-3 py-2 rounded bg-white/10 text-white hover:bg-white/20"
                onClick={onRefreshAoi}
              >
                Refresh AOIs
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Add boundary layers via the modal. Map is live behind this workspace; click to add points.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-slate-400">Layers</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="text-xs px-3 py-2 rounded bg-emerald-400 text-slate-900 hover:bg-emerald-300"
              onClick={onOpenImport}
            >
              + Add layer
            </button>
            <button
              className="text-xs px-3 py-2 rounded bg-white/10 text-white hover:bg-white/20"
              onClick={onRefreshAoi}
            >
              Refresh AOIs
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Map is running full-screen behind this workspace. Click the canvas to add points; toggles above control visibility.
          </p>
        </div>
      )}
    </div>
  );
}
