// Lightweight TS client for the local-first API (fetch-based).
// Intended for embedding into a website or tests; no external deps.

export type UploadResponse = {
  job_id?: number | null;
  task_id?: number | null;
  stored_as: string;
  theme?: string;
  enqueued: boolean;
  deduped?: boolean;
  sha256?: string;
  manifest_id?: number;
  note?: string;
};
export type UploadOptions = {
  theme?: string;
  enqueue?: boolean;
  dedupe?: boolean;
  callback_url?: string;
  intent?: {
    allowed_exts?: string[] | string;
    prefilter_keywords?: string[] | string;
    prefilter_min_chars?: number;
    llm_mode?: "sync" | "batch" | "offline";
    summary_enabled?: boolean;
  };
};
export type TasksOptions = { limit?: number; status?: string; theme?: string; intent_contains?: string };
export type Task = {
  id: number;
  status: string;
  theme?: string;
  last_error?: string;
  error_summary?: string;
  job_id?: number;
  file_path?: string;
  attempts?: number;
  leased_at?: number;
  created_at?: number;
  updated_at?: number;
  intent?: any;
};
export type Job = {
  id: number;
  status: string;
  last_error?: string;
  callback_url?: string;
  callback_attempts?: number;
  last_callback_status?: string;
  created_at?: number;
  updated_at?: number;
};
export type SearchResult = { id: number; task_id: number; file_path: string; theme?: string; title?: string; doc_type?: string; inferred_date?: string; snippet?: string; status?: string };
export type SearchOptions = { limit?: number; theme?: string; doc_type?: string };
export type CodexPreset = { name: string; command: string };
export type CodexPresetsResponse = { theme: string; presets: CodexPreset[] };
export type CliRunResponse = { command: string; exit_code: number; output: string };
export type CliRunHistoryEntry = {
  run_id: string;
  ts_start?: number;
  ts_end?: number;
  duration_ms?: number;
  command: string;
  exit_code: number;
  env_keys?: string[];
  output_len?: number;
  output_tail?: string;
  disconnected?: boolean;
};
export type CliHistoryResponse = { runs: CliRunHistoryEntry[]; path: string };
export type MetricsHistoryEntry = { ts: number; counters: Record<string, number> };
export type MetricsHistoryResponse = { history: MetricsHistoryEntry[]; path: string };
export type CodexQueueSummary = { theme: string; file: string; total: number; counts: Record<string, number> };
export type CodexQueuesResponse = { queues: CodexQueueSummary[] };
export type CodexQueueDetailResponse = { theme: string; total: number; tasks: Record<string, string>[]; offset: number };
export type CodexFlaggedResponse = { tasks: Record<string, string>[] };
export type CodexCommsEntry = { ID: string; Timestamp: string; Agent: string; Status: string; Message: string; NextSteps: string };
export type CodexCommsResponse = { entries: CodexCommsEntry[] };
export type CodexRefinedFilesResponse = { files: { name: string; path: string }[] };
export type CodexRefinedTextResponse = { name: string; text: string };
export type CodexMacroField = { key: string; label: string; type: "string" | "number" | "boolean"; required?: boolean; default?: any };
export type CodexMacro = { id: string; name: string; description?: string; group?: string; template: string; fields?: CodexMacroField[] };
export type CodexMacrosResponse = { macros: CodexMacro[] };
export type CodexRunMacroPayload = { id: string; args?: Record<string, any>; env?: Record<string, string> };
export type CodexChatMessage = { role: "user" | "assistant"; content: string; ts?: number };
export type CodexChatThread = {
  id: string;
  title?: string;
  theme?: string;
  created_at?: number;
  updated_at?: number;
  messages: CodexChatMessage[];
  context_pack_ids?: string[];
  tenant_id?: string | null;
};
export type CodexChatListItem = {
  id: string;
  title?: string;
  theme?: string;
  created_at?: number;
  updated_at?: number;
  message_count?: number;
  context_pack_ids?: string[];
};
export type CodexChatsResponse = { chats: CodexChatListItem[] };
export type CodexChatResponse = { chat: CodexChatThread };
export type CodexContextPack = {
  id: string;
  name: string;
  themes?: string[];
  content: string;
  default?: boolean;
  created_at?: number;
  updated_at?: number;
};
export type CodexContextPacksResponse = { packs: CodexContextPack[] };

export type AutorunConfig = {
  enabled: boolean;
  interval_sec: number;
  max_concurrent_runs: number;
  themes: string[];
  pending_threshold: number;
  require_no_inprogress: boolean;
  cooldown_sec: number;
  reap_stale_before_run: boolean;
  stale_mins: number;
  codex_env: Record<string, string>;
  active_start_hour: number;
  active_end_hour: number;
  on_upload_enabled: boolean;
  on_upload_delay_sec: number;
  on_upload_macros: Record<string, { id: string; args?: Record<string, any>; env?: Record<string, string> }[]>;
};
export type AutorunConfigResponse = { config: AutorunConfig };
export type AutorunThemeStatus = {
  theme: string;
  counts: Record<string, number>;
  pending: number;
  inprogress: number;
  inprogress_autocodex: number;
  eligible: boolean;
};
export type AutorunStatusResponse = {
  config: AutorunConfig;
  themes: AutorunThemeStatus[];
  recent_autoruns: any[];
};

export type CodexPromptInfo = { name: string; path: string; exists: boolean };
export type CodexPromptsListResponse = { prompts: CodexPromptInfo[]; versions_dir: string };
export type CodexPromptResponse = { name: string; path: string; content: string };
export type CodexPromptSaveResponse = { status: string; name: string; version_saved: string; path: string };
export type CodexPromptVersionsResponse = { name: string; versions: { file: string; mtime: number }[] };
export type CodexPromptRestoreResponse = { status: string; name: string; restored_from: string; backup_version: string };

export type KnowledgeGraphNode = { id: string; type: string; label: string; data?: any };
export type KnowledgeGraphEdge = { source: string; target: string; type: string };
export type KnowledgeGraphResponse = { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] };

export type AuditEvent = Record<string, any>;
export type AuditEventsResponse = { events: AuditEvent[]; path: string };

export class PukaistClient {
  baseUrl: string;
  apiKey: string;

  constructor(baseUrl: string = "http://localhost:8000", apiKey: string = "dev-token") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      ...opts,
      headers: {
        "X-API-Key": this.apiKey,
        ...(opts.headers || {}),
      },
    });
    if (!resp.ok) {
      const text = await resp.text();
      let detail = text;
      try {
        const data: unknown = JSON.parse(text);
        if (data && typeof data === "object" && "detail" in data) {
          const d = (data as { detail: unknown }).detail;
          detail = typeof d === "string" ? d : JSON.stringify(d);
        }
      } catch {
        // Leave detail as raw text if not JSON.
      }
      throw new Error(`HTTP ${resp.status}: ${detail}`);
    }
    return resp.json() as Promise<T>;
  }

  async upload(file: File, opts: UploadOptions = {}): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);
    const params = new URLSearchParams();
    if (opts.theme) params.set("theme", opts.theme);
    if (opts.enqueue === false) params.set("enqueue", "false");
    if (opts.dedupe === false) params.set("dedupe", "false");
    if (opts.callback_url) params.set("callback_url", opts.callback_url);
    if (opts.intent) params.set("intent", JSON.stringify(opts.intent));
    const path = params.toString() ? `/upload?${params.toString()}` : "/upload";
    return this.request<UploadResponse>(path, { method: "POST", body: form });
  }

  tasks(opts: TasksOptions = {}): Promise<{ tasks: Task[] }> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.status) params.set("status", opts.status);
    if (opts.theme) params.set("theme", opts.theme);
    if (opts.intent_contains) params.set("intent_contains", opts.intent_contains);
    const path = params.toString() ? `/tasks?${params.toString()}` : "/tasks";
    return this.request(path);
  }

  flagged(opts: TasksOptions = {}): Promise<{ tasks: Task[] }> {
    const params = new URLSearchParams();
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.theme) params.set("theme", opts.theme);
    if (opts.intent_contains) params.set("intent_contains", opts.intent_contains);
    const path = params.toString() ? `/tasks/flagged?${params.toString()}` : "/tasks/flagged";
    return this.request(path);
  }

  jobs(): Promise<{ jobs: Job[] }> {
    return this.request("/jobs");
  }

  job(jobId: number): Promise<Job> {
    return this.request(`/jobs/${jobId}`);
  }

  jobSummary(jobId: number): Promise<{ job: Job; task_counts: Record<string, number> }> {
    return this.request(`/jobs/${jobId}/summary`);
  }

  jobTasks(jobId: number): Promise<{ tasks: Task[] }> {
    return this.request(`/jobs/${jobId}/tasks`);
  }

  status(): Promise<{ queue: Record<string, number> }> {
    return this.request("/status");
  }

  search(query: string, opts: number | SearchOptions = {}): Promise<{ results: SearchResult[] }> {
    const options: SearchOptions = typeof opts === "number" ? { limit: opts } : opts;
    const params = new URLSearchParams({ q: query, limit: String(options.limit ?? 20) });
    if (options.theme) params.set("theme", options.theme);
    if (options.doc_type) params.set("doc_type", options.doc_type);
    return this.request(`/search?${params.toString()}`);
  }

  docs(opts: SearchOptions | number = {}): Promise<{ docs: SearchResult[] }> {
    const options: SearchOptions = typeof opts === "number" ? { limit: opts } : opts;
    const params = new URLSearchParams({ limit: String(options.limit ?? 50) });
    if (options.theme) params.set("theme", options.theme);
    if (options.doc_type) params.set("doc_type", options.doc_type);
    return this.request(`/docs?${params.toString()}`);
  }

  doc(docId: number): Promise<SearchResult> {
    return this.request(`/docs/${docId}`);
  }

  geojson(limit = 100): Promise<any> {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.request(`/geojson?${params.toString()}`);
  }

  codexPresets(theme?: string): Promise<CodexPresetsResponse> {
    const params = new URLSearchParams();
    if (theme) params.set("theme", theme);
    const path = params.toString() ? `/admin/codex/presets?${params.toString()}` : "/admin/codex/presets";
    return this.request(path);
  }

  codexGetTask(theme: string): Promise<any> {
    return this.request("/admin/codex/get-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
  }

  codexResetQueue(theme?: string): Promise<any> {
    return this.request("/admin/codex/reset-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme ? { theme } : {}),
    });
  }

  codexReapStale(theme?: string, mins?: number): Promise<any> {
    const payload: any = {};
    if (theme) payload.theme = theme;
    if (mins != null) payload.mins = mins;
    return this.request("/admin/codex/reap-stale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  cliRun(command: string, env?: Record<string, string>): Promise<CliRunResponse> {
    return this.request("/admin/cli/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(env ? { command, env } : { command }),
    });
  }

  async cliStream(command: string, env?: Record<string, string>): Promise<Response> {
    const resp = await fetch(`${this.baseUrl}/admin/cli/stream`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(env ? { command, env } : { command }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp;
  }

  cliCancel(run_id: string): Promise<{ status: string; run_id: string }> {
    return this.request("/admin/cli/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ run_id }),
    });
  }

  cliHistory(limit = 200, offset = 0): Promise<CliHistoryResponse> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    return this.request(`/admin/cli/history?${params.toString()}`);
  }

  metricsHistory(limit = 200, offset = 0): Promise<MetricsHistoryResponse> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    return this.request(`/metrics/history?${params.toString()}`);
  }

  codexQueues(): Promise<CodexQueuesResponse> {
    return this.request("/admin/codex/queues");
  }

  codexQueue(theme: string, opts: { status?: string; search?: string; limit?: number; offset?: number } = {}): Promise<CodexQueueDetailResponse> {
    const params = new URLSearchParams();
    if (opts.status) params.set("status", opts.status);
    if (opts.search) params.set("search", opts.search);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    const path = params.toString()
      ? `/admin/codex/queue/${encodeURIComponent(theme)}?${params.toString()}`
      : `/admin/codex/queue/${encodeURIComponent(theme)}`;
    return this.request(path);
  }

  codexFlagged(): Promise<CodexFlaggedResponse> {
    return this.request("/admin/codex/flagged");
  }

  codexComms(limit = 50, agent?: string): Promise<CodexCommsResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (agent) params.set("agent", agent);
    return this.request(`/admin/codex/comms?${params.toString()}`);
  }

  codexRefinedFiles(): Promise<CodexRefinedFilesResponse> {
    return this.request("/admin/codex/refined/files");
  }

  codexRefinedText(name: string): Promise<CodexRefinedTextResponse> {
    const params = new URLSearchParams({ name });
    return this.request(`/admin/codex/refined/text?${params.toString()}`);
  }

  codexMacros(): Promise<CodexMacrosResponse> {
    return this.request("/admin/codex/macros");
  }

  codexRunMacro(payload: CodexRunMacroPayload): Promise<CliRunResponse> {
    return this.request("/admin/codex/run-macro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async codexRunMacroStream(payload: CodexRunMacroPayload): Promise<Response> {
    const resp = await fetch(`${this.baseUrl}/admin/codex/run-macro/stream`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp;
  }

  async codexChatStream(prompt: string, env?: Record<string, string>, schema_path?: string): Promise<Response> {
    const resp = await fetch(`${this.baseUrl}/admin/codex/chat/stream`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, env, schema_path }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp;
  }

  codexChats(): Promise<CodexChatsResponse> {
    return this.request("/admin/codex/chats");
  }

  codexCreateChat(payload: { theme?: string; title?: string; context_pack_ids?: string[] } = {}): Promise<CodexChatResponse> {
    return this.request("/admin/codex/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  codexChat(chatId: string): Promise<CodexChatResponse> {
    return this.request(`/admin/codex/chats/${encodeURIComponent(chatId)}`);
  }

  codexUpdateChat(chatId: string, patch: Partial<CodexChatThread>): Promise<CodexChatResponse> {
    return this.request(`/admin/codex/chats/${encodeURIComponent(chatId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  codexDeleteChat(chatId: string): Promise<{ status: string }> {
    return this.request(`/admin/codex/chats/${encodeURIComponent(chatId)}`, { method: "DELETE" });
  }

  async codexChatThreadStream(
    chatId: string,
    message: string,
    opts: { env?: Record<string, string>; theme?: string; context_pack_ids?: string[]; schema_path?: string } = {}
  ): Promise<Response> {
    const resp = await fetch(`${this.baseUrl}/admin/codex/chats/${encodeURIComponent(chatId)}/stream`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        theme: opts.theme,
        context_pack_ids: opts.context_pack_ids,
        schema_path: opts.schema_path,
        env: opts.env,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp;
  }

  codexContextPacks(): Promise<CodexContextPacksResponse> {
    return this.request("/admin/codex/context-packs");
  }

  codexSaveContextPack(pack: Partial<CodexContextPack>): Promise<{ pack: CodexContextPack }> {
    return this.request("/admin/codex/context-packs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pack),
    });
  }

  codexDeleteContextPack(packId: string): Promise<{ status: string }> {
    return this.request(`/admin/codex/context-packs/${encodeURIComponent(packId)}`, { method: "DELETE" });
  }

  codexAutorunConfig(): Promise<AutorunConfigResponse> {
    return this.request("/admin/codex/autorun/config");
  }

  codexUpdateAutorunConfig(patch: Partial<AutorunConfig>): Promise<AutorunConfigResponse> {
    return this.request("/admin/codex/autorun/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  codexAutorunStatus(): Promise<AutorunStatusResponse> {
    return this.request("/admin/codex/autorun/status");
  }

  codexPromptsList(): Promise<CodexPromptsListResponse> {
    return this.request("/admin/codex/prompts");
  }

  codexPrompt(name: string): Promise<CodexPromptResponse> {
    return this.request(`/admin/codex/prompts/${encodeURIComponent(name)}`);
  }

  codexSavePrompt(name: string, content: string): Promise<CodexPromptSaveResponse> {
    return this.request(`/admin/codex/prompts/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  }

  codexPromptVersions(name: string): Promise<CodexPromptVersionsResponse> {
    return this.request(`/admin/codex/prompts/${encodeURIComponent(name)}/versions`);
  }

  codexRestorePrompt(name: string, file: string): Promise<CodexPromptRestoreResponse> {
    return this.request(`/admin/codex/prompts/${encodeURIComponent(name)}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file }),
    });
  }

  analyticsSummary(): Promise<{ summary: any }> {
    return this.request("/admin/analytics/summary");
  }

  adminGraph(
    opts: {
      theme?: string;
      limit_docs?: number;
      include_entities?: boolean;
      max_entities_per_type_per_doc?: number;
      include_contradictions?: boolean;
      max_contradictions?: number;
    } = {}
  ): Promise<KnowledgeGraphResponse> {
    const params = new URLSearchParams();
    if (opts.theme) params.set("theme", opts.theme);
    if (opts.limit_docs != null) params.set("limit_docs", String(opts.limit_docs));
    if (opts.include_entities != null) params.set("include_entities", String(opts.include_entities));
    if (opts.max_entities_per_type_per_doc != null)
      params.set("max_entities_per_type_per_doc", String(opts.max_entities_per_type_per_doc));
    if (opts.include_contradictions != null)
      params.set("include_contradictions", String(opts.include_contradictions));
    if (opts.max_contradictions != null) params.set("max_contradictions", String(opts.max_contradictions));
    const path = params.toString() ? `/admin/graph?${params.toString()}` : "/admin/graph";
    return this.request(path);
  }

  auditEvents(opts: { limit?: number; offset?: number; action?: string; tenant?: string } = {}): Promise<AuditEventsResponse> {
    const params = new URLSearchParams();
    if (opts.limit != null) params.set("limit", String(opts.limit));
    if (opts.offset != null) params.set("offset", String(opts.offset));
    if (opts.action) params.set("action", opts.action);
    if (opts.tenant) params.set("tenant", opts.tenant);
    const path = params.toString() ? `/admin/audit/events?${params.toString()}` : "/admin/audit/events";
    return this.request(path);
  }

  async exportBundle(payload: {
    name?: string;
    include_logs?: boolean;
    include_metrics?: boolean;
    include_chats?: boolean;
    include_refined?: boolean;
    include_queues?: boolean;
    include_exec_events?: boolean;
  } = {}): Promise<Blob> {
    const resp = await fetch(`${this.baseUrl}/admin/export/bundle`, {
      method: "POST",
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }
    return resp.blob();
  }
}
