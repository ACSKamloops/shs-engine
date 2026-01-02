# Pukaist Engine SDK Documentation

## Overview

Pukaist Engine provides a REST API and TypeScript utilities for document processing, geospatial analysis, and Indigenous consultation workflows.

---

## Quick Start

### Installation

```bash
# Install from package
npm install @pukaist/sdk

# Or use directly via script tag
<script src="https://api.pukaist.io/embed.js"></script>
```

### Basic Usage

```typescript
import { useApi } from '@pukaist/sdk';

const api = useApi({ baseUrl: 'http://localhost:8000', apiKey: 'pk_...' });

// Upload a document
const job = await api.uploadDocs([file], 'claims');

// Poll for completion
const status = await api.loadJobTasks(job.id);
```

---

## API Reference

### Upload Documents

```typescript
uploadDocs(
  files: File[],
  theme?: string,
  intent?: PipelineIntent
): Promise<{ job_id: number; doc_ids: number[] }>
```

**Parameters:**
- `files` - Array of File objects to upload
- `theme` - Optional project theme (e.g., 'claims', 'consultation')
- `intent` - Pipeline configuration options

**Example:**
```typescript
const result = await api.uploadDocs([file], 'claims', {
  llm_mode: 'batch',
  summary_enabled: true,
  ocr_backend: 'hunyuan'
});
console.log('Job ID:', result.job_id);
```

---

### Load Documents

```typescript
loadDocs(filters?: {
  theme?: string;
  doc_type?: string;
  status?: string;
}): Promise<Doc[]>
```

**Example:**
```typescript
const docs = await api.loadDocs({ theme: 'claims', status: 'reviewed' });
```

---

### Job Status Polling

```typescript
loadJobTasks(jobId: number): Promise<JobTasksResponse>
pollTaskStatus(taskId: number): Promise<TaskDetailResponse>
```

**Example:**
```typescript
const jobStatus = await api.loadJobTasks(123);
console.log(`${jobStatus.done}/${jobStatus.total} tasks complete`);
```

---

### Geo Suggest

```typescript
geoSuggest(docId: number): Promise<GeoSuggestion[]>
```

**Example:**
```typescript
const suggestions = await api.geoSuggest(docId);
for (const s of suggestions) {
  console.log(`${s.place_name}: ${s.lat}, ${s.lng}`);
}
```

---

### Import KMZ/AOI

```typescript
importKmz(file: File): Promise<{ layer_name: string; feature_count: number }>
```

---

## Embeddable Upload Widget

Drop-in upload component for external sites:

```html
<div id="upload-zone"></div>
<script>
  import { EmbedUploader } from '@pukaist/sdk';
  
  const widget = new EmbedUploader({
    apiKey: 'pk_...',
    apiUrl: 'https://api.yoursite.com',
    theme: 'claims',
    containerId: '#upload-zone',
    onUploadComplete: (file, docId) => {
      console.log('Uploaded:', file.name, '→ Doc #', docId);
    },
    styles: {
      primaryColor: '#06b6d4',
      borderRadius: '12px'
    }
  });
</script>
```

---

## Webhooks

### Registering Webhooks

```typescript
POST /webhooks
{
  "url": "https://your-site.com/webhook",
  "events": ["doc.processed", "doc.flagged"],
  "secret": "your-hmac-secret"
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `doc.uploaded` | Document received and queued |
| `doc.processed` | Processing complete, ready for review |
| `doc.flagged` | Processing failed or validation error |
| `job.completed` | All tasks in job finished |
| `consultation.detected` | Indigenous territory overlap detected |

### Payload Example

```json
{
  "event": "doc.processed",
  "timestamp": 1702320000,
  "data": {
    "doc_id": 123,
    "theme": "claims",
    "summary": "Document summary...",
    "geo": { "lat": 50.123, "lng": -120.456 }
  },
  "signature": "sha256=..."
}
```

### Verifying Signatures

```typescript
import * as crypto from 'crypto';

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## Types

```typescript
interface Doc {
  id: number;
  title: string;
  summary: string;
  theme?: string;
  doc_type?: string;
  lat?: number;
  lng?: number;
  status?: 'reviewed' | 'follow_up' | 'not_started';
}

interface PipelineIntent {
  llm_mode?: 'sync' | 'batch' | 'offline';
  summary_enabled?: boolean;
  ocr_backend?: 'tesseract' | 'hunyuan';
  embeddings_enabled?: boolean;
  geo_enabled?: boolean;
  insights_enabled?: boolean;
}

interface JobTasksResponse {
  tasks: TaskStatus[];
  job_id: number;
  total: number;
  done: number;
  pending: number;
  flagged: number;
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/upload` | 100 req/min |
| `/docs` | 1000 req/min |
| `/search` | 500 req/min |
| Webhooks | 5 retries over 24h |
