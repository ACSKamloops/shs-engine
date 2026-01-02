import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { ConsultationLetterGenerator } from "../features/settings/ConsultationLetterGenerator";

function ConsultationLetterDemo() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Consultation Letter Generator</h2>
      <p className="text-sm text-slate-400 mb-4">
        Note: Requires a document with geo-location to be selected. 
        Without store context, this will show the "no document" state.
      </p>
      <ConsultationLetterGenerator />
    </div>
  );
}

const meta: Meta<typeof ConsultationLetterDemo> = {
  title: "Integration/ConsultationLetterGenerator",
  component: ConsultationLetterDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof ConsultationLetterDemo>;

export const Default: Story = {};
