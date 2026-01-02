import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { WebhookManager } from "../features/settings/WebhookManager";

function WebhookManagerDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Webhook Configuration</h2>
      <WebhookManager />
    </div>
  );
}

const meta: Meta<typeof WebhookManagerDemo> = {
  title: "Settings/WebhookManager",
  component: WebhookManagerDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof WebhookManagerDemo>;

export const Default: Story = {};
