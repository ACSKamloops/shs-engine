import type { Meta, StoryObj } from "@storybook/react";
import type { FeatureCollection } from "geojson";
import App from "../App";
import { within, waitFor, userEvent } from "@storybook/testing-library";

const sampleCustomLayer: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Storybook demo point" },
      geometry: { type: "Point", coordinates: [-121.0, 50.6] },
    },
  ],
};

const meta: Meta<typeof App> = {
  title: "Demo/App Custom Layer",
  component: App,
  parameters: {
    layout: "fullscreen",
    chromatic: { delay: 800 },
    docs: {
      description: {
        story:
          "Loads the app with a custom GeoJSON layer pre-seeded in localStorage so you can see the violet layer + Converted/Loaded pill without uploading.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof App>;

export const WithCustomLayer: Story = {
  render: () => {
    try {
      localStorage.setItem("pukaist-custom-layer-data", JSON.stringify(sampleCustomLayer));
      localStorage.setItem("pukaist-custom-layer-name", "storybook-demo.geojson");
      localStorage.setItem("pukaist-use-live-api", "false");
      localStorage.setItem("pukaist-tour-seen-v1", "true");
      localStorage.setItem(
        "pukaist-wizard-frame",
        JSON.stringify({ periodStart: "1800", periodEnd: "2025", theme: "" }),
      );
    } catch {
      // ignore storage failures (Storybook will still render)
    }
    return <App />;
  },
};

export const WithConvertedKmlLayer: Story = {
  render: () => {
    try {
      localStorage.setItem("pukaist-custom-layer-data", JSON.stringify(sampleCustomLayer));
      localStorage.setItem("pukaist-custom-layer-name", "storybook-demo.kml");
      localStorage.setItem("pukaist-use-live-api", "false");
      localStorage.setItem("pukaist-tour-seen-v1", "true");
      localStorage.setItem(
        "pukaist-wizard-frame",
        JSON.stringify({ periodStart: "1800", periodEnd: "2025", theme: "" }),
      );
    } catch {
      // ignore
    }
    return <App />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => canvas.getByText(/Custom layer: Converted/i));
    await waitFor(() => canvas.getByText(/Converted from KML\/KMZ/i));
  },
  parameters: {
    chromatic: { delay: 800 },
  },
};

export const CopyToastDemo: Story = {
  render: () => {
    try {
      (navigator as unknown as { clipboard: { writeText: (text: string) => Promise<void> } }).clipboard = {
        writeText: async () => Promise.resolve(),
      };
      localStorage.setItem("pukaist-custom-layer-data", JSON.stringify(sampleCustomLayer));
      localStorage.setItem("pukaist-custom-layer-name", "storybook-demo.geojson");
      localStorage.setItem("pukaist-use-live-api", "false");
      localStorage.setItem("pukaist-tour-seen-v1", "true");
      localStorage.setItem(
        "pukaist-wizard-frame",
        JSON.stringify({ periodStart: "1800", periodEnd: "2025", theme: "" }),
      );
    } catch {
      // ignore
    }
    return <App />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copyButtons = canvas.getAllByRole("button", { name: /^Copy$/i });
    if (copyButtons.length) {
      await userEvent.click(copyButtons[0]);
      await waitFor(() => canvas.getByText(/Copied summary|Copied OCR|Copied metadata|Copied insights/i));
    }
  },
  parameters: {
    chromatic: { delay: 1000 },
  },
};
