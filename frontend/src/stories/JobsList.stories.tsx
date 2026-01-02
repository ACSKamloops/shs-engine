import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { JobsList } from "../components/JobsList";

const jobs = [
  { id: 1, status: "done", last_error: "", created_at: Date.now() / 1000 - 600, updated_at: Date.now() / 1000 - 300 },
  { id: 2, status: "flagged", last_error: "validation failed", created_at: Date.now() / 1000 - 1200, updated_at: Date.now() / 1000 - 900 },
];

const jobTasks = {
  1: [
    { id: 101, status: "done", theme: "demo", created_at: Date.now() / 1000 - 500, updated_at: Date.now() / 1000 - 400 },
    { id: 102, status: "done", theme: "demo", created_at: Date.now() / 1000 - 480, updated_at: Date.now() / 1000 - 380 },
  ],
  2: [{ id: 201, status: "flagged", theme: "claims", created_at: Date.now() / 1000 - 1000, updated_at: Date.now() / 1000 - 950 }],
};

function JobsListPreview() {
  return (
    <div className="p-6 bg-slate-900 text-white max-w-3xl">
      <JobsList
        jobs={jobs}
        jobStatusFilter="all"
        taskStatusFilter="all"
        expandedJobId={2}
        jobTasks={jobTasks}
        onReload={() => {}}
        onLoadTasks={() => {}}
        onViewPipeline={() => {}}
      />
    </div>
  );
}

const meta: Meta<typeof JobsListPreview> = {
  title: "Pipeline/JobsList",
  component: JobsListPreview,
};

export default meta;
type Story = StoryObj<typeof JobsListPreview>;

export const Default: Story = {};
