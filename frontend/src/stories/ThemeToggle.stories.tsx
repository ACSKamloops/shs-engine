import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { ThemeToggle } from "../components/ThemeToggle";

function ThemeToggleDemo() {
  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <h2 className="text-lg font-semibold text-white mb-4">Theme Toggle</h2>
      <p className="text-slate-400 text-sm mb-4">
        Switch between dark, light, and system themes. 
        Preference is persisted to localStorage.
      </p>
      <ThemeToggle />
    </div>
  );
}

const meta: Meta<typeof ThemeToggleDemo> = {
  title: "Components/ThemeToggle",
  component: ThemeToggleDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggleDemo>;

export const Default: Story = {};
