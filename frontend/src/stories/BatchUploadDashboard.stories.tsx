import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { BatchUploadDashboard } from "../features/upload/BatchUploadDashboard";

function BatchUploadDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Batch Upload Dashboard</h2>
      <p className="text-slate-400 text-sm mb-4">
        Drag multiple files to upload them in batch with progress tracking.
      </p>
      <BatchUploadDashboard />
    </div>
  );
}

const meta: Meta<typeof BatchUploadDemo> = {
  title: "Upload/BatchUploadDashboard",
  component: BatchUploadDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof BatchUploadDemo>;

export const Default: Story = {};
