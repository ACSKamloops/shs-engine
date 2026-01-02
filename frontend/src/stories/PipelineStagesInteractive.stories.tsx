import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { PipelineStages, type PipelineStage, type StageStatus } from "../components/PipelineStages";

interface PipelineStagesStoryArgs {
  ocrStatus: StageStatus;
  llmStatus: StageStatus;
  embeddingsStatus: StageStatus;
  geoStatus: StageStatus;
  insightsStatus: StageStatus;
}

function statusToDone(status: StageStatus): boolean {
  return status === "done";
}

function statusToDetail(stage: string, status: StageStatus): string {
  if (status === "done") {
    switch (stage) {
      case "ocr": return "98% quality";
      case "llm": return "GPT-4 turbo";
      case "geo": return "3 locations";
      case "embeddings": return "1536 dims";
      case "insights": return "5 entities";
    }
  }
  if (status === "error") return "Failed";
  if (status === "skipped") return "Skipped";
  if (status === "processing") return "In progress...";
  return "";
}

function PipelineStagesWithArgs(args: PipelineStagesStoryArgs) {
  const stages: PipelineStage[] = [
    { key: "ocr", label: "OCR", status: args.ocrStatus, done: statusToDone(args.ocrStatus), detail: statusToDetail("ocr", args.ocrStatus) },
    { key: "llm", label: "LLM Summary", status: args.llmStatus, done: statusToDone(args.llmStatus), detail: statusToDetail("llm", args.llmStatus) },
    { key: "embeddings", label: "Embeddings", status: args.embeddingsStatus, done: statusToDone(args.embeddingsStatus), detail: statusToDetail("embeddings", args.embeddingsStatus) },
    { key: "geo", label: "Geo Extract", status: args.geoStatus, done: statusToDone(args.geoStatus), detail: statusToDetail("geo", args.geoStatus) },
    { key: "insights", label: "Insights", status: args.insightsStatus, done: statusToDone(args.insightsStatus), detail: statusToDetail("insights", args.insightsStatus) },
  ];

  return (
    <div className="p-6 bg-slate-900 text-white max-w-md">
      <h2 className="text-lg font-semibold mb-4">Pipeline Processing Status</h2>
      <p className="text-slate-400 text-sm mb-4">
        Use the controls to simulate different pipeline states.
      </p>
      <PipelineStages stages={stages} />
    </div>
  );
}

const statusOptions: StageStatus[] = ["pending", "processing", "done", "error", "skipped"];

const meta: Meta<PipelineStagesStoryArgs> = {
  title: "Pipeline/PipelineStagesInteractive",
  component: PipelineStagesWithArgs,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    ocrStatus: { control: "select", options: statusOptions, description: "OCR stage status" },
    llmStatus: { control: "select", options: statusOptions, description: "LLM stage status" },
    embeddingsStatus: { control: "select", options: statusOptions, description: "Embeddings stage status" },
    geoStatus: { control: "select", options: statusOptions, description: "Geo extraction stage status" },
    insightsStatus: { control: "select", options: statusOptions, description: "Insights stage status" },
  },
  args: {
    ocrStatus: "done",
    llmStatus: "processing",
    embeddingsStatus: "pending",
    geoStatus: "pending",
    insightsStatus: "pending",
  },
};

export default meta;
type Story = StoryObj<PipelineStagesStoryArgs>;

export const Default: Story = {};

export const AllComplete: Story = {
  args: {
    ocrStatus: "done",
    llmStatus: "done",
    embeddingsStatus: "done",
    geoStatus: "done",
    insightsStatus: "done",
  },
};

export const WithErrors: Story = {
  args: {
    ocrStatus: "done",
    llmStatus: "error",
    embeddingsStatus: "skipped",
    geoStatus: "skipped",
    insightsStatus: "skipped",
  },
};

export const Processing: Story = {
  args: {
    ocrStatus: "done",
    llmStatus: "done",
    embeddingsStatus: "processing",
    geoStatus: "pending",
    insightsStatus: "pending",
  },
};
