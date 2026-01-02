import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { ExportPanel } from "../features/export/ExportPanel";

function ExportPanelDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-md">
      <h2 className="text-lg font-semibold mb-4">Export Data Panel</h2>
      <p className="text-slate-400 text-sm mb-4">
        Export documents to ArcGIS-compatible formats.
      </p>
      <ExportPanel />
    </div>
  );
}

const meta: Meta<typeof ExportPanelDemo> = {
  title: "Export/ExportPanel",
  component: ExportPanelDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof ExportPanelDemo>;

export const Default: Story = {};
