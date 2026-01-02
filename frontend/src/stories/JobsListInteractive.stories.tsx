import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { JobsList } from "../components/JobsList";

interface JobsListStoryArgs {
  jobStatusFilter: "all" | "done" | "flagged" | "processing";
  taskStatusFilter: "all" | "done" | "flagged" | "processing";
  showExpandedJob: boolean;
  jobCount: number;
}

function JobsListWithArgs(args: JobsListStoryArgs) {
  const now = Date.now() / 1000;
  
  // Generate jobs based on count
  const jobs = Array.from({ length: args.jobCount }, (_, i) => ({
    id: i + 1,
    status: i === 0 ? "done" : i === 1 ? "flagged" : i === 2 ? "processing" : "done",
    last_error: i === 1 ? "Validation failed: missing coordinates" : "",
    created_at: now - (i + 1) * 600,
    updated_at: now - i * 300,
  }));

  const jobTasks: Record<number, Array<{ id: number; status: string; theme: string; created_at: number; updated_at: number }>> = {
    1: [
      { id: 101, status: "done", theme: "claims", created_at: now - 500, updated_at: now - 400 },
      { id: 102, status: "done", theme: "claims", created_at: now - 480, updated_at: now - 380 },
    ],
    2: [
      { id: 201, status: "flagged", theme: "consultation", created_at: now - 1000, updated_at: now - 950 },
    ],
    3: [
      { id: 301, status: "processing", theme: "default", created_at: now - 200, updated_at: now - 100 },
      { id: 302, status: "pending", theme: "default", created_at: now - 180, updated_at: now - 80 },
    ],
  };

  return (
    <div className="p-6 bg-slate-900 text-white max-w-3xl">
      <h2 className="text-lg font-semibold mb-4">Jobs & Tasks List</h2>
      <p className="text-slate-400 text-sm mb-4">
        Use controls to filter jobs and tasks by status.
      </p>
      <JobsList
        jobs={jobs}
        jobStatusFilter={args.jobStatusFilter}
        taskStatusFilter={args.taskStatusFilter}
        expandedJobId={args.showExpandedJob ? 2 : null}
        jobTasks={jobTasks}
        onReload={() => console.log("Reload clicked")}
        onLoadTasks={(jobId) => console.log("Load tasks for job:", jobId)}
        onViewPipeline={(taskId) => console.log("View pipeline for task:", taskId)}
      />
    </div>
  );
}

const meta: Meta<JobsListStoryArgs> = {
  title: "Pipeline/JobsListInteractive",
  component: JobsListWithArgs,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
  argTypes: {
    jobStatusFilter: {
      control: "select",
      options: ["all", "done", "flagged", "processing"],
      description: "Filter jobs by status",
    },
    taskStatusFilter: {
      control: "select",
      options: ["all", "done", "flagged", "processing"],
      description: "Filter tasks by status",
    },
    showExpandedJob: {
      control: "boolean",
      description: "Show expanded job with tasks",
    },
    jobCount: {
      control: { type: "range", min: 1, max: 10, step: 1 },
      description: "Number of jobs to display",
    },
  },
  args: {
    jobStatusFilter: "all",
    taskStatusFilter: "all",
    showExpandedJob: true,
    jobCount: 3,
  },
};

export default meta;
type Story = StoryObj<JobsListStoryArgs>;

export const Default: Story = {};

export const FilteredToFlagged: Story = {
  args: {
    jobStatusFilter: "flagged",
    showExpandedJob: true,
  },
};

export const ManyJobs: Story = {
  args: {
    jobCount: 8,
    showExpandedJob: false,
  },
};
