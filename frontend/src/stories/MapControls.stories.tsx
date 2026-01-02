import type { Meta, StoryObj } from "@storybook/react";
import { useState, useRef } from "react";
import "../index.css";
import { MapControls } from "../components/MapControls";

type Suggestion = {
  id: number;
  label: string;
  lat: number;
  lon: number;
  status: string;
  score?: number;
  source?: string;
};

const mockSuggestions: Suggestion[] = [
  { id: 1, label: "Vancouver (gazetteer)", lat: 49.2827, lon: -123.1207, status: "pending", score: 0.92, source: "gazetteer" },
  { id: 2, label: "Ottawa (kmz)", lat: 45.4215, lon: -75.6972, status: "accepted", score: 0.71, source: "kmz" },
];

function MapControlsPreview() {
  const [showDocs, setShowDocs] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showAoi, setShowAoi] = useState(true);
  const [showPoi, setShowPoi] = useState(true);
  const [showGlobalDocs, setShowGlobalDocs] = useState(true);
  const [aoiTheme, setAoiTheme] = useState("");
  const [banner, setBanner] = useState<string>("Tap “Add layer” to import overlays");
  const mapRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="p-6 bg-slate-900 text-white space-y-4 max-w-4xl">
      <MapControls
        showDocs={showDocs}
        showSuggestions={showSuggestions}
        showAoi={showAoi}
        showPoi={showPoi}
        showGlobalDocs={showGlobalDocs}
        aoiThemeFilter={aoiTheme}
        aoiThemeOptions={["ALC_Confirmed", "BC_SOI"]}
        onToggleDocs={setShowDocs}
        onToggleSuggestions={setShowSuggestions}
        onToggleAoi={setShowAoi}
        onTogglePoi={setShowPoi}
        onToggleGlobalDocs={setShowGlobalDocs}
        onThemeChange={setAoiTheme}
        onRefreshAoi={() => setBanner("AOIs refreshed")}
        onOpenImport={() => setBanner("Opening import modal…")}
        mapRef={mapRef}
      />

      <p className="text-xs text-slate-300">{banner}</p>

      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-slate-400">Suggestions</p>
          <span className="text-xs text-slate-300">Total {mockSuggestions.length}</span>
        </div>
        <div className="space-y-2">
          {(showSuggestions ? mockSuggestions : []).map((s) => (
            <div key={s.id} className="glass bg-white/5 border border-amber-300/30 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-white font-semibold">{s.label}</p>
                  <p className="text-xs text-slate-300">
                    {s.lat.toFixed(4)}, {s.lon.toFixed(4)} · {s.status}
                    {s.score ? ` · score ${s.score.toFixed(2)}` : ""} {s.source ? ` · ${s.source}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 rounded bg-emerald-400 text-slate-900 hover:bg-emerald-300">Accept</button>
                  <button className="text-xs px-2 py-1 rounded bg-white/10 text-slate-100 hover:bg-white/20">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof MapControlsPreview> = {
  title: "Pipeline/MapControls",
  component: MapControlsPreview,
};

export default meta;
type Story = StoryObj<typeof MapControlsPreview>;

export const Default: Story = {};

export const ReservesOnly: Story = {
  name: "Reserves only (ALC_*)",
  args: {},
};

export const TreatiesOnly: Story = {
  name: "Modern treaties only",
  args: {},
};

export const SoiOnly: Story = {
  name: "BC SOI only",
  args: {},
};

export const OfficesAndReserves: Story = {
  name: "Offices + reserves",
  args: {},
};
