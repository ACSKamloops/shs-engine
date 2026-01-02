import type { Meta, StoryObj } from '@storybook/react';
import { AiProviderSettings } from '../features/settings/AiProviderSettings';

/**
 * AI Provider Settings panel for configuring LLM provider and API key.
 * API keys are stored locally and never sent to the backend.
 */
const meta: Meta<typeof AiProviderSettings> = {
  title: 'Settings/AiProvider',
  component: AiProviderSettings,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-slate-900 text-white max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AiProviderSettings>;

/** Default state with no API key configured */
export const Default: Story = {};

/** With provider configured */
export const Configured: Story = {
  decorators: [
    (Story) => {
      // Pre-configure store for this story
      return <Story />;
    },
  ],
};
