export const DEFAULT_OPENAI_MODEL = "gpt-5-nano";

export async function callOpenAIChat({
  apiKey,
  model = DEFAULT_OPENAI_MODEL,
  prompt,
  baseUrl = "https://api.openai.com/v1",
}: {
  apiKey: string;
  model?: string;
  prompt: string;
  baseUrl?: string;
}): Promise<string> {
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${text}`);
  }
  const json = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  return content.trim();
}

export function hasOpenAIKey(): boolean {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    return Boolean(env?.VITE_OPENAI_API_KEY);
  } catch {
    return false;
  }
}
