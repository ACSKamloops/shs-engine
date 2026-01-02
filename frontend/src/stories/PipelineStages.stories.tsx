import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { PipelineStages } from "../components/PipelineStages";
import type { PipelineStage } from "../components/PipelineStages";

const stages: PipelineStage[] = [
  { key: "uploaded", label: "Uploaded & queued", done: true, detail: "Task created and tracked in the queue." },
  { key: "processed", label: "Processed by worker", done: true, detail: "Worker completed processing." },
  { key: "text", label: "Text extracted (OCR / parsers)", done: true, detail: "Artifact stored with preview and metadata." },
  { key: "summary", label: "Summary generated", done: true, detail: "Summary stored in the index and notebooks." },
  { key: "geo", label: "Geo hints stored", done: false, detail: "No coordinates recorded for this document." },
  { key: "insights", label: "Insights recorded", done: true, detail: "Structured insights saved with the artifact." },
];

function PipelineStagesPreview() {
  return (
    <div className="p-6 bg-slate-900 text-white space-y-3 max-w-4xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Pipeline</p>
        <p className="text-sm text-slate-200 font-semibold">Artifact Demo · task #10</p>
      </div>
      <PipelineStages stages={stages} />
    </div>
  );
}

const meta: Meta<typeof PipelineStagesPreview> = {
  title: "Pipeline/Stages",
  component: PipelineStagesPreview,
};

export default meta;
type Story = StoryObj<typeof PipelineStagesPreview>;

export const Default: Story = {};
