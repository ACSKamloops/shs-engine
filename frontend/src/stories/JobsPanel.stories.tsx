import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { JobsPanel } from "../features/workspace/JobsPanel";

function JobsPanelDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Jobs & Tasks Panel</h2>
      <JobsPanel />
    </div>
  );
}

const meta: Meta<typeof JobsPanelDemo> = {
  title: "Workspace/JobsPanel",
  component: JobsPanelDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof JobsPanelDemo>;

export const Default: Story = {};
