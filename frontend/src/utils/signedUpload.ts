/**
 * Signed Upload URLs Utility
 * Generate pre-signed URLs for secure client-side uploads
 */

export interface SignedUploadRequest {
  filename: string;
  contentType: string;
  theme?: string;
  expiresIn?: number; // seconds, default 3600
}

export interface SignedUploadResponse {
  uploadUrl: string;
  uploadId: string;
  expiresAt: number;
  fields?: Record<string, string>; // Additional form fields if needed
}

/**
 * Request a signed upload URL from the backend
 */
export async function getSignedUploadUrl(
  apiBase: string,
  request: SignedUploadRequest,
  authToken?: string
): Promise<SignedUploadResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${apiBase}/upload/signed-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filename: request.filename,
      content_type: request.contentType,
      theme: request.theme || 'default',
      expires_in: request.expiresIn || 3600,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get signed URL: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    uploadUrl: data.upload_url,
    uploadId: data.upload_id,
    expiresAt: data.expires_at,
    fields: data.fields,
  };
}

/**
 * Upload a file using a signed URL
 */
export async function uploadWithSignedUrl(
  signedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

/**
 * Complete upload and trigger processing
 */
export async function completeSignedUpload(
  apiBase: string,
  uploadId: string,
  authToken?: string
): Promise<{ docId: number; jobId: number }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${apiBase}/upload/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ upload_id: uploadId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to complete upload: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    docId: data.doc_id,
    jobId: data.job_id,
  };
}

/**
 * Demo mode: Simulate signed upload flow
 */
export function createDemoSignedUpload(_filename: string): SignedUploadResponse {
  return {
    uploadUrl: `https://demo-storage.pukaist.io/uploads/${Date.now()}`,
    uploadId: `demo-upload-${Date.now()}`,
    expiresAt: Date.now() + 3600000,
    fields: {
      'x-demo-mode': 'true',
    },
  };
}
