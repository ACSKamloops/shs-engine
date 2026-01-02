import type { Meta, StoryObj } from "@storybook/react";
import App from "../App";

const meta: Meta<typeof App> = {
  title: "Demo/Tour",
  component: App,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: "Tour demo: run with mocks (default) or set VITE_STORYBOOK_API_BASE for live API."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof App>;

export const TourDemo: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const clickButtonByText = (text: string) => {
      const btn = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
        el.textContent?.toLowerCase().includes(text.toLowerCase()),
      );
      if (btn) btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };
    // Open tour from Filters area
    clickButtonByText("Guided tour");
    await sleep(150);
    // Step through all screens
    clickButtonByText("Next");
    await sleep(150);
    clickButtonByText("Next");
    await sleep(150);
    clickButtonByText("Next");
    await sleep(150);
    clickButtonByText("Next");
    await sleep(150);
    clickButtonByText("Done");
  },
};
