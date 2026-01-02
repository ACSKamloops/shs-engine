import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { ConsultationPanel } from "../features/workspace/ConsultationPanel";

function ConsultationPanelDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-md">
      <h2 className="text-lg font-semibold mb-4">Consultation Panel</h2>
      <p className="text-slate-400 text-sm mb-4">
        Shows consultation context for geo-located documents. 
        Note: Requires a document with coordinates to be selected.
      </p>
      <ConsultationPanel />
    </div>
  );
}

const meta: Meta<typeof ConsultationPanelDemo> = {
  title: "Workspace/ConsultationPanel",
  component: ConsultationPanelDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof ConsultationPanelDemo>;

export const Default: Story = {};
