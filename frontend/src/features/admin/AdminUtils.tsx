import type { ReactNode } from 'react';

export function downloadBlob(filename: string, content: string, mime = 'application/json') {
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

export function exportJson(filename: string, data: any) {
  downloadBlob(filename, JSON.stringify(data, null, 2), 'application/json');
}

export function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r || {}))));
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(esc).join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => esc((r || {})[h])).join(','));
  }
  return lines.join('\n');
}

export function exportCsv(filename: string, rows: any[]) {
  downloadBlob(filename, toCsv(rows), 'text/csv');
}

export function HelpText({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-white/45 leading-relaxed">{children}</p>;
}

export function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-8 mt-2">
      <polyline fill="none" stroke="rgba(34,211,238,0.9)" strokeWidth="3" points={pts} />
    </svg>
  );
}

export const SHARED_THEME_KEY = 'pukaist-admin-theme';

export const KNOWN_THEMES = [
  'Land_Reduction_Trespass',
  'Governance_Sovereignty',
  'Fiduciary_Duty_Negligence',
  'Water_Rights_Fishing',
  'Coercion_Duress',
];

export type ContextPackTemplate = {
  id: string;
  name: string;
  description: string;
  themes: string;
  content: string;
  default?: boolean;
};

export const CONTEXT_PACK_TEMPLATES: ContextPackTemplate[] = [
  {
    id: 'neutral',
    name: 'Neutral Assistant (General)',
    description: 'Plain-language, neutral writing; avoids advice and focuses on actionable steps.',
    themes: '',
    content: [
      'Use neutral, factual language.',
      'Ask clarifying questions when requirements are unclear.',
      'If asked for legal/medical/financial advice, provide general information only and suggest consulting a qualified professional for decisions.',
      'Prefer checklists and concrete next steps.',
    ].join('\n'),
  },
  {
    id: 'repo_engineer',
    name: 'Repo Engineer',
    description: 'Optimized for making safe, reviewable code changes in this repo.',
    themes: '',
    content: [
      'Focus on small, reviewable changes.',
      'Prefer existing patterns over rewrites.',
      'Avoid destructive actions unless explicitly requested.',
      'When relevant, suggest a quick way to validate changes (tests/build).',
    ].join('\n'),
  },
  {
    id: 'research_synth',
    name: 'Research Synthesizer',
    description: 'Summarizes provided sources neutrally; separates quotes from paraphrase.',
    themes: '',
    content: [
      'Summarize sources neutrally and clearly.',
      'Distinguish direct quotes from paraphrase.',
      'When file/page anchors are provided, include them; do not invent citations.',
    ].join('\n'),
  },
  {
    id: 'json_only',
    name: 'JSON Output (Strict)',
    description: 'For structured workflows: returns valid JSON only (no markdown).',
    themes: '',
    content: ['Return valid JSON only. Do not wrap output in markdown code fences.'].join('\n'),
  },
];

