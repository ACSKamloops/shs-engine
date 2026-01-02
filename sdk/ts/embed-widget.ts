// Pukaist Embed Widget
// Small, self-contained panel for upload + job status + search.
// Intended to be mounted into an existing page via:
//   import { mountPukaistWidget } from "../sdk/ts/embed-widget.ts";
//   mountPukaistWidget({ mountId: "pukaist-widget", baseUrl, apiKey });

import { PukaistClient, UploadResponse, Task, Job, SearchResult } from "./pukaist-client.ts";

export interface PukaistWidgetOptions {
  mountId: string;
  baseUrl?: string;
  apiKey?: string;
  defaultTheme?: string;
}

function parseError(err: any): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err?.message) return err.message;
  return String(err);
}

export function mountPukaistWidget(options: PukaistWidgetOptions): void {
  const container = document.getElementById(options.mountId);
  if (!container) {
    throw new Error(`Pukaist widget mount element not found: ${options.mountId}`);
  }

  const client = new PukaistClient(options.baseUrl, options.apiKey);

  container.innerHTML = "";
  container.className = "pukaist-widget";

  const style = document.createElement("style");
  style.textContent = `
  .pukaist-widget {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.75rem;
    max-width: 420px;
    font-size: 14px;
    background: #fafafa;
  }
  .pukaist-widget h3 {
    margin: 0 0 0.5rem;
    font-size: 16px;
  }
  .pukaist-widget label {
    display: inline-block;
    margin-right: 0.5rem;
  }
  .pukaist-widget input[type="text"] {
    width: 60%;
    max-width: 240px;
  }
  .pukaist-widget button {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
    padding: 0.2rem 0.5rem;
    font-size: 13px;
  }
  .pukaist-widget .section {
    margin-bottom: 0.75rem;
  }
  .pukaist-widget .small {
    font-size: 12px;
    color: #555;
  }
  .pukaist-widget pre {
    background: #f7f7f7;
    padding: 0.4rem;
    max-height: 180px;
    overflow: auto;
    font-size: 12px;
  }
  .pukaist-widget .banner {
    background: #eef2ff;
    border: 1px solid #cbd5ff;
    color: #1f2937;
    padding: 0.4rem;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 0.5rem;
  }
  `;
  container.appendChild(style);

  const title = document.createElement("h3");
  title.textContent = "Pukaist Ingest";
  container.appendChild(title);

  const banner = document.createElement("div");
  banner.className = "banner";
  banner.id = `${options.mountId}-banner`;
  banner.textContent = "Ready.";
  container.appendChild(banner);

  // Upload section
  const uploadSection = document.createElement("div");
  uploadSection.className = "section";
  uploadSection.innerHTML = `
    <div>
      <input type="file" id="${options.mountId}-file" />
    </div>
    <div>
      <label>Theme:
        <input type="text" id="${options.mountId}-theme" placeholder="optional-theme" />
      </label>
    </div>
    <button type="button" id="${options.mountId}-upload-btn">Upload</button>
    <div class="small" id="${options.mountId}-upload-status"></div>
  `;
  container.appendChild(uploadSection);

  // Job status section
  const statusSection = document.createElement("div");
  statusSection.className = "section";
  statusSection.innerHTML = `
    <div class="small">Job status</div>
    <div class="small">Job ID: <span id="${options.mountId}-job-id">–</span></div>
    <button type="button" id="${options.mountId}-refresh-job" disabled>Refresh job summary</button>
    <pre id="${options.mountId}-job-out"></pre>
  `;
  container.appendChild(statusSection);

  // Search section
  const searchSection = document.createElement("div");
  searchSection.className = "section";
  searchSection.innerHTML = `
    <div class="small">Search indexed content</div>
    <div>
      <input type="text" id="${options.mountId}-search-q" placeholder="search term" />
      <button type="button" id="${options.mountId}-search-btn">Search</button>
    </div>
    <pre id="${options.mountId}-search-out"></pre>
  `;
  container.appendChild(searchSection);

  const fileInput = container.querySelector<HTMLInputElement>(`#${options.mountId}-file`)!;
  const themeInput = container.querySelector<HTMLInputElement>(`#${options.mountId}-theme`)!;
  const uploadBtn = container.querySelector<HTMLButtonElement>(`#${options.mountId}-upload-btn`)!;
  const uploadStatus = container.querySelector<HTMLDivElement>(`#${options.mountId}-upload-status`)!;
  const jobIdSpan = container.querySelector<HTMLSpanElement>(`#${options.mountId}-job-id`)!;
  const refreshJobBtn = container.querySelector<HTMLButtonElement>(`#${options.mountId}-refresh-job`)!;
  const jobOut = container.querySelector<HTMLPreElement>(`#${options.mountId}-job-out`)!;
  const searchInput = container.querySelector<HTMLInputElement>(`#${options.mountId}-search-q`)!;
  const searchBtn = container.querySelector<HTMLButtonElement>(`#${options.mountId}-search-btn`)!;
  const searchOut = container.querySelector<HTMLPreElement>(`#${options.mountId}-search-out`)!;

  let currentJobId: number | null = null;

  if (options.defaultTheme) {
    themeInput.value = options.defaultTheme;
  }

  uploadBtn.onclick = async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      banner.textContent = "No file selected.";
      uploadStatus.textContent = "";
      return;
    }
    banner.textContent = "Uploading...";
    uploadStatus.textContent = "";
    uploadBtn.disabled = true;
    refreshJobBtn.disabled = true;
    searchBtn.disabled = true;
    try {
      const theme = themeInput.value.trim() || undefined;
      const res: UploadResponse = await client.upload(file, theme);
      uploadStatus.textContent = `Uploaded. Job ${res.job_id}, task ${res.task_id}.`;
      banner.textContent = `Upload ok (job ${res.job_id ?? "n/a"})`;
      currentJobId = res.job_id;
      jobIdSpan.textContent = String(res.job_id);
      refreshJobBtn.disabled = false;
      jobOut.textContent = "";
    } catch (err: any) {
      const msg = parseError(err);
      uploadStatus.textContent = "Error: " + msg;
      banner.textContent = "Upload failed: " + msg;
    } finally {
      uploadBtn.disabled = false;
      searchBtn.disabled = false;
    }
  };

  refreshJobBtn.onclick = async () => {
    if (!currentJobId) return;
    refreshJobBtn.disabled = true;
    searchBtn.disabled = true;
    banner.textContent = "Loading job summary...";
    jobOut.textContent = "";
    try {
      const summary = await client.jobSummary(currentJobId);
      const tasks = await client.jobTasks(currentJobId);
      jobOut.textContent = JSON.stringify(
        {
          job: summary.job as Job,
          task_counts: summary.task_counts,
          tasks: tasks.tasks as Task[],
        },
        null,
        2,
      );
      banner.textContent = "Job summary loaded.";
    } catch (err: any) {
      const msg = parseError(err);
      jobOut.textContent = "Error: " + msg;
      banner.textContent = "Job summary failed: " + msg;
    } finally {
      refreshJobBtn.disabled = false;
      searchBtn.disabled = false;
    }
  };

  searchBtn.onclick = async () => {
    const q = searchInput.value.trim();
    if (!q) {
      banner.textContent = "Enter a search term.";
      searchOut.textContent = "";
      return;
    }
    searchBtn.disabled = true;
    banner.textContent = "Searching...";
    searchOut.textContent = "";
    try {
      const res = await client.search(q, 10);
      searchOut.textContent = JSON.stringify(res.results as SearchResult[], null, 2);
      banner.textContent = `Search returned ${res.results?.length ?? 0} result(s).`;
    } catch (err: any) {
      const msg = parseError(err);
      searchOut.textContent = "Error: " + msg;
      banner.textContent = "Search failed: " + msg;
    } finally {
      searchBtn.disabled = false;
    }
  };
}
