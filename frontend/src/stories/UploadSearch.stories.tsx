import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";

function UploadSearchPreview() {
  return (
    <div className="p-6 bg-slate-900 text-white space-y-4 max-w-4xl">
      <div className="glass p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Upload</h2>
        <input type="file" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" />
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Optional theme/tag"
          />
          <button className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300">Upload & enqueue</button>
        </div>
        <pre className="text-xs bg-black/50 border border-white/10 rounded-lg p-3 max-h-48 overflow-auto whitespace-pre-wrap text-slate-200">
          Response payload will render here.
        </pre>
      </div>

      <div className="glass p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Search & Docs</h2>
        <div className="flex gap-2">
          <input className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Search query" />
          <input className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white" placeholder="Theme filter" />
          <button className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300">Search</button>
          <button className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20">Recent</button>
        </div>
        <div className="space-y-2">
          <div className="glass border border-white/10 px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="pill">demo</span>
              <span className="pill bg-emerald-500/20 text-emerald-100">text</span>
              <span className="pill bg-white/20 text-slate-100">status: done</span>
              <span className="text-xs text-slate-400">#1</span>
              <button className="ml-auto text-xs px-2 py-1 rounded bg-white/10 text-slate-100 hover:bg-white/20">View pipeline</button>
              <button className="text-xs px-2 py-1 rounded bg-white/10 text-slate-100 hover:bg-white/20">Download artifact</button>
            </div>
            <p className="text-white font-semibold mt-1">Sample doc title</p>
            <p className="text-sm text-slate-300">Sample summary snippet appears here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof UploadSearchPreview> = {
  title: "Pipeline/UploadSearch",
  component: UploadSearchPreview,
};

export default meta;
type Story = StoryObj<typeof UploadSearchPreview>;

export const Default: Story = {};
