/**
 * Jobs Panel Component
 * Wrapper for JobsList with integrated API calls
 */
import { useState, useEffect, useCallback } from 'react';
import { JobsList } from '../../components/JobsList';
import { useApi } from '../../hooks';
import { useAppStore } from '../../store';

interface Job {
  id: number;
  status: string;
  last_error?: string;
  created_at?: number;
  updated_at?: number;
}

interface Task {
  id: number;
  status: string;
  theme?: string;
  created_at?: number;
  updated_at?: number;
}

export function JobsPanel() {
  const { loadJobTasks, api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTasks, setJobTasks] = useState<Record<number, Task[]>>({});
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Load jobs list
  const loadJobs = useCallback(async () => {
    if (!useLiveApi) {
      // Demo mode jobs
      setJobs([
        { id: 1, status: 'done', created_at: Date.now() / 1000 - 3600 },
        { id: 2, status: 'processing', created_at: Date.now() / 1000 - 1800 },
        { id: 3, status: 'flagged', last_error: 'Validation failed', created_at: Date.now() / 1000 - 600 },
      ]);
      return;
    }
    
    setLoading(true);
    try {
      const data = await api<{ jobs: Job[] }>('/jobs');
      setJobs(data?.jobs || []);
    } catch {
      setBanner('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [api, useLiveApi, setBanner]);

  // Load tasks for a job
  const handleLoadTasks = useCallback(async (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
    
    if (expandedJobId === jobId) return; // Closing, don't load
    
    if (!useLiveApi) {
      // Demo mode tasks
      setJobTasks((prev) => ({
        ...prev,
        [jobId]: [
          { id: jobId * 100 + 1, status: 'done', theme: 'claims' },
          { id: jobId * 100 + 2, status: 'processing', theme: 'consultation' },
        ],
      }));
      return;
    }
    
    const result = await loadJobTasks(jobId);
    if (result) {
      setJobTasks((prev) => ({
        ...prev,
        [jobId]: result.tasks.map((t) => ({
          id: t.id,
          status: t.status,
          theme: t.theme,
          created_at: t.created_at,
        })),
      }));
    }
  }, [expandedJobId, loadJobTasks, useLiveApi]);

  // View pipeline for a task
  const handleViewPipeline = useCallback((taskId: number) => {
    setBanner(`Viewing pipeline for task #${taskId}`);
    // Could navigate to task detail or show modal
  }, [setBanner]);

  // Initial load
  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  return (
    <div className="space-y-3">
      {loading && (
        <div className="text-xs text-cyan-400 animate-pulse">Loading jobs...</div>
      )}
      <JobsList
        jobs={jobs}
        jobStatusFilter={jobStatusFilter}
        taskStatusFilter={taskStatusFilter}
        expandedJobId={expandedJobId}
        jobTasks={jobTasks}
        onReload={loadJobs}
        onLoadTasks={handleLoadTasks}
        onViewPipeline={handleViewPipeline}
      />
      
      {/* Filter controls - could wire to state */}
      <div className="flex gap-2 text-xs">
        <select 
          value={jobStatusFilter} 
          onChange={(e) => setJobStatusFilter(e.target.value)}
          className="rounded bg-white/10 text-white px-2 py-1"
        >
          <option value="all">All Jobs</option>
          <option value="done">Done</option>
          <option value="processing">Processing</option>
          <option value="flagged">Flagged</option>
        </select>
        <select 
          value={taskStatusFilter} 
          onChange={(e) => setTaskStatusFilter(e.target.value)}
          className="rounded bg-white/10 text-white px-2 py-1"
        >
          <option value="all">All Tasks</option>
          <option value="done">Done</option>
          <option value="processing">Processing</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>
    </div>
  );
}
