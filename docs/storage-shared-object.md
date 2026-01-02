# Storage Options — Shared & Object Backends

This note outlines how to extend the current local filesystem storage model to use shared filesystems or object storage for uploads and staging, while preserving the existing layout and local-first behavior.

## Current Model (Local-First)

- Uploads are stored under:
  - `PUKAIST_INCOMING_DIR` (default `99_Working_Files/Incoming`)
- Staged text/metadata are under:
  - `PUKAIST_STAGING_DIR` (default `99_Working_Files/Evidence_Staging`)
- Index DB and queue DB are local SQLite files under `99_Working_Files`.
- The worker and API run on the same machine (or share the same mounted directories).

This is ideal for local dev and small, single-node deployments.

## Shared Filesystem (First Step)

For simple multi-node setups (API + workers on separate hosts/containers), you can:

- Mount a shared filesystem (e.g., NFS, SMB, EFS) at the same paths on all nodes:
  - `/app/99_Working_Files`
  - `/app/01_Internal_Reports`
- Configure:
  - `PUKAIST_INCOMING_DIR`, `PUKAIST_STAGING_DIR`, `PUKAIST_INDEX_PATH`, `PUKAIST_QUEUE_DB`, `PUKAIST_LOG_DIR`, `PUKAIST_REFINED_DIR`
    to point into these shared mounts.

Behavior:
- API writes uploads into `Incoming`, visible to all workers.
- Workers write staged text/metadata into `Evidence_Staging` and update the shared index and queue.
- Notebooks and logs remain accessible from any node that mounts the volume.

This keeps the existing code unchanged; the difference is only in how volumes are mounted in production.

## Object Storage (Design)

For larger deployments or cloud environments, you may want to move uploads/staging to an object storage backend (e.g., S3, GCS, MinIO) while keeping:
- Queue DB and index DB in a local/shared relational database.
- Notebooks (Markdown) in a filesystem or object store.

Proposed configuration (future):

- `PUKAIST_STORAGE_BACKEND` — `filesystem` (default) or `object`.
- Object storage envs:
  - `PUKAIST_OBJECT_ENDPOINT` — S3-compatible endpoint URL.
  - `PUKAIST_OBJECT_BUCKET` — bucket name.
  - `PUKAIST_OBJECT_PREFIX` — optional key prefix (e.g., `pukaist/`).
  - `PUKAIST_OBJECT_ACCESS_KEY` / `PUKAIST_OBJECT_SECRET_KEY` — credentials (or rely on instance roles).

Behavior:

- When `PUKAIST_STORAGE_BACKEND=filesystem`:
  - The current logic remains: uploads go to `PUKAIST_INCOMING_DIR`; staging goes to `PUKAIST_STAGING_DIR`.
- When `PUKAIST_STORAGE_BACKEND=object`:
  - Upload handler writes the file to object storage (e.g., `s3://bucket/pukaist/incoming/<hash-or-uuid>`), and stores:
    - The object key and any relevant metadata in the queue DB.
  - Worker fetches the object by key, processes it, and writes staged artifacts either:
    - Back to object storage under a staging prefix, or
    - To a local scratch directory for indexing.

In both cases, the logical paths (`Incoming`, `Evidence_Staging`) remain conceptual; the underlying storage is swapped via configuration.

## Local-First Guarantee

- For dev and small deployments:
  - You do not need to configure object storage; filesystem mode remains the default and continues to work as-is.
- For cloud/production:
  - You can choose between:
    - Shared filesystem mounts.
    - Object storage with a lightweight adapter.

This design satisfies the Phase 2 storage goal in `MASTER_PLAN.md` at the documentation level. Implementing the object storage adapter and wiring it into the upload/worker paths can be done in a future incremental change, once a specific backend (e.g., S3, GCS, MinIO) is chosen.

