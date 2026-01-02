import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { ProjectSettings } from "../features/settings/ProjectSettings";

function ProjectSettingsDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Project Configuration</h2>
      <ProjectSettings />
    </div>
  );
}

const meta: Meta<typeof ProjectSettingsDemo> = {
  title: "Settings/ProjectSettings",
  component: ProjectSettingsDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectSettingsDemo>;

export const Default: Story = {};
