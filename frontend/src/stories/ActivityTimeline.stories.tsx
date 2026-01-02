import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { ActivityTimeline, type ActivityItem } from "../components/ActivityTimeline";

const activities: ActivityItem[] = [
  { id: "1", type: "create", title: "Task created", description: "task #10", timestamp: new Date(Date.now() - 3600000) },
  { id: "2", type: "update", title: "Task updated", description: "done", timestamp: new Date(Date.now() - 1800000) },
  { id: "3", type: "process", title: "Doc indexed", description: "doc #1", timestamp: new Date(Date.now() - 1200000) },
  { id: "4", type: "upload", title: "Geo points attached", description: "2 points", timestamp: new Date(Date.now() - 600000) },
];

function ActivityTimelinePreview() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-xl">
      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Activity timeline (storybook)</p>
      <ActivityTimeline activities={activities} />
    </div>
  );
}

const meta: Meta<typeof ActivityTimelinePreview> = {
  title: "Pipeline/ActivityTimeline",
  component: ActivityTimelinePreview,
};

export default meta;
type Story = StoryObj<typeof ActivityTimelinePreview>;

export const Default: Story = {};

