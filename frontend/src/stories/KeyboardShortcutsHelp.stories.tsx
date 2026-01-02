import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { KeyboardShortcutsHelp } from "../components/KeyboardShortcutsHelp";
import { useEffect } from "react";

function KeyboardShortcutsDemo() {
  useEffect(() => {
    // Auto-trigger the help panel
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('shortcut:help'));
    }, 500);
  }, []);

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts Help</h2>
      <p className="text-slate-400 text-sm mb-4">
        Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">?</kbd> to toggle the shortcuts panel.
      </p>
      <p className="text-slate-500 text-sm">
        The shortcuts panel should appear automatically in this demo.
      </p>
      <KeyboardShortcutsHelp />
    </div>
  );
}

const meta: Meta<typeof KeyboardShortcutsDemo> = {
  title: "Components/KeyboardShortcutsHelp",
  component: KeyboardShortcutsDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutsDemo>;

export const Default: Story = {};
