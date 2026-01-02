import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { EmbedUploader, type EmbedConfig } from "../components/EmbedUploader";

interface EmbedUploaderStoryArgs {
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
  theme: string;
  apiUrl: string;
}

function EmbedUploaderWithArgs(args: EmbedUploaderStoryArgs) {
  const config: EmbedConfig = {
    apiKey: "pk_demo_key",
    apiUrl: args.apiUrl,
    theme: args.theme,
    onUploadStart: (file) => console.log("Upload started:", file.name),
    onUploadComplete: (file, docId) => console.log("Upload complete:", file.name, docId),
    onUploadError: (file, error) => console.log("Upload error:", file.name, error),
    styles: {
      primaryColor: args.primaryColor,
      borderRadius: args.borderRadius,
      fontFamily: args.fontFamily,
    },
  };

  return (
    <div className="p-6 max-w-xl">
      <h2 className="text-white text-lg font-semibold mb-4">Embeddable Upload Widget</h2>
      <p className="text-slate-400 text-sm mb-4">
        Customize using the controls panel below. Try dragging files to test.
      </p>
      <EmbedUploader config={config} />
    </div>
  );
}

const meta: Meta<EmbedUploaderStoryArgs> = {
  title: "Integration/EmbedUploader",
  component: EmbedUploaderWithArgs,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    primaryColor: {
      control: "color",
      description: "Primary accent color for the widget",
    },
    borderRadius: {
      control: "select",
      options: ["4px", "8px", "12px", "16px", "24px"],
      description: "Border radius for the container",
    },
    fontFamily: {
      control: "select",
      options: ["Inter, sans-serif", "Georgia, serif", "Menlo, monospace", "system-ui, sans-serif"],
      description: "Font family for text",
    },
    theme: {
      control: "select",
      options: ["claims", "consultation", "default", "legal"],
      description: "Document processing theme/category",
    },
    apiUrl: {
      control: "text",
      description: "API endpoint URL",
    },
  },
  args: {
    primaryColor: "#06b6d4",
    borderRadius: "12px",
    fontFamily: "Inter, sans-serif",
    theme: "claims",
    apiUrl: "/api",
  },
};

export default meta;
type Story = StoryObj<EmbedUploaderStoryArgs>;

export const Default: Story = {};

export const GreenTheme: Story = {
  args: {
    primaryColor: "#10b981",
    borderRadius: "24px",
    theme: "consultation",
  },
};

export const PurpleMonospace: Story = {
  args: {
    primaryColor: "#8b5cf6",
    borderRadius: "8px",
    fontFamily: "Menlo, monospace",
    theme: "legal",
  },
};
