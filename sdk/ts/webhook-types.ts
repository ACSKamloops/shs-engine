export type PukaistWebhookPayload = {
  job_id: number;
  task_id: number;
  status: string;
  theme?: string | null;
  file_path: string;
  doc_type?: string | null;
  inferred_date?: string | null;
  doc_id?: string | null;
  title?: string | null;
  timestamp: string;
  error?: string | null;
};

export async function verifySignature(body: string, token: string, signatureHeader: string | undefined): Promise<boolean> {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const crypto = await import("crypto");
  const sig = signatureHeader.replace("sha256=", "");
  const digest = crypto.createHmac("sha256", token).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(digest, "hex"));
}
