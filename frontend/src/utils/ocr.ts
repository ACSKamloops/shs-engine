export type OcrQuality = "high" | "medium" | "low" | null;

export function computeOcrQuality(text?: string | null): OcrQuality {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const len = trimmed.length;
  if (len < 40) return "low";
  let clean = 0;
  let noisy = 0;
  for (const ch of trimmed) {
    if (/[a-zA-Z0-9\s.,;:'"()-]/.test(ch)) clean += 1;
    else noisy += 1;
  }
  const ratio = clean / (clean + noisy || 1);
  if (ratio < 0.5) return "low";
  if (len < 200 || ratio < 0.75) return "medium";
  return "high";
}
