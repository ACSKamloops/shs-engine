import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { FiltersPanel } from "../features/workspace/FiltersPanel";

function FiltersPanelDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-sm">
      <h2 className="text-lg font-semibold mb-4">Filters Panel</h2>
      <p className="text-slate-400 text-sm mb-4">
        Filter documents by theme, type, status, and more.
      </p>
      <FiltersPanel />
    </div>
  );
}

const meta: Meta<typeof FiltersPanelDemo> = {
  title: "Workspace/FiltersPanel",
  component: FiltersPanelDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof FiltersPanelDemo>;

export const Default: Story = {};
