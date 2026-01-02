import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { PipelineSettings } from "../features/settings/PipelineSettings";

function PipelineSettingsDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Pipeline Configuration</h2>
      <PipelineSettings />
    </div>
  );
}

const meta: Meta<typeof PipelineSettingsDemo> = {
  title: "Settings/PipelineSettings",
  component: PipelineSettingsDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof PipelineSettingsDemo>;

export const Default: Story = {};
