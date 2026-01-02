import type { Meta, StoryObj } from "@storybook/react";
import App from "../App";

const meta: Meta<typeof App> = {
  title: "Demo/App",
  component: App,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof App>;

export const Default: Story = {
  args: {},
};

export const FrameApplied: Story = {
  name: "Frame applied (demo)",
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Shows the main app with the wizard frame active; use dim toggle and layer chips in the UI.",
      },
    },
  },
};

export const DimmingOn: Story = {
  name: "Frame + dimming",
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Use the frame and dim toggles to see out-of-frame doc markers/cards muted while the frame is applied.",
      },
    },
  },
};
