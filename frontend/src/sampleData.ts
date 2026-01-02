/**
 * Sample data for demo mode when API is unavailable
 */
import type { Doc, Artifact } from './store/useDocsStore';
import type { MapSuggestion } from './store/useMapStore';

export const SAMPLE_DOCS: Doc[] = [
  {
    id: 1,
    title: 'Water rights correspondence (1912)',
    summary: 'Letter describing water allocations near Pukaist reserve; mentions irrigation ditch.',
    location_name: 'Nicola region',
    lat: 50.45,
    lng: -121.2,
    theme: 'Water rights',
    doc_type: 'letter',
    created_at: -1830384000, // 1912
    status: 'not_started',
    relevant: true,
  },
  {
    id: 2,
    title: 'Annual report on Indian reserves (1909)',
    summary: 'Inspector notes: Pukaist band occupies reserve since 1878; land reductions documented.',
    location_name: 'Pukaist area',
    lat: 50.65,
    lng: -120.9,
    theme: 'Land reductions',
    doc_type: 'report',
    created_at: -1925078400, // 1909
    status: 'follow_up',
    relevant: true,
  },
  {
    id: 3,
    title: 'Boundary survey map (1880)',
    summary: 'Hand-drawn map showing original Pukaist reserve boundaries prior to 1916.',
    location_name: 'Survey camp',
    lat: 50.32,
    lng: -121.4,
    theme: 'Land reductions',
    doc_type: 'map',
    created_at: -2840140800, // 1880
    status: 'reviewed',
    relevant: false,
  },
];

export const SAMPLE_SUGGESTIONS: MapSuggestion[] = [
  { id: 's1', title: 'Possible treaty boundary marker', lat: 50.85, lng: -121.2, confidence: 'high' },
  { id: 's2', title: 'Historic irrigation canal map', lat: 50.7, lng: -120.6, confidence: 'medium' },
  { id: 's3', title: 'Nearby band office (unverified)', lat: 51.05, lng: -119.7, confidence: 'low' },
];

export const SAMPLE_GLOBAL_DOCS: { title: string; lat: number; lng: number }[] = [
  { title: 'Adjacent watershed report (context)', lat: 49.85, lng: -123.0 },
  { title: 'Regional treaty note (context)', lat: 51.4, lng: -122.8 },
];

/**
 * Sample AOI GeoJSON layers for demo mode
 * Pre-populated with BC reserves, First Nation offices, and treaty areas
 */
export const SAMPLE_AOI_LAYERS: Record<string, GeoJSON.FeatureCollection> = {
  aoi_First_Nation_Office: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-120.29, 50.68] }, properties: { name: "Tk'emlúps te Secwépemc", code: 688, theme: 'First_Nation_Office' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-121.43, 49.44] }, properties: { name: 'Union Bar First Nation', code: 588, theme: 'First_Nation_Office' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.41, 49.94] }, properties: { name: 'Skatin', code: 562, theme: 'First_Nation_Office' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-124.11, 53.94] }, properties: { name: "Saik'uz First Nation", code: 615, theme: 'First_Nation_Office' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-125.24, 49.95] }, properties: { name: 'Homalco', code: 552, theme: 'First_Nation_Office' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-119.50, 49.88] }, properties: { name: 'Westbank First Nation', code: 662, theme: 'First_Nation_Office' } },
    ],
  },
  aoi_ALC_Confirmed: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-120.5, 50.5], [-120.3, 50.5], [-120.3, 50.7], [-120.5, 50.7], [-120.5, 50.5]]] }, properties: { name: 'Pukaist IR No. 1', ALCODE: 'BC-001', theme: 'ALC_Confirmed' } },
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-121.0, 50.2], [-120.8, 50.2], [-120.8, 50.4], [-121.0, 50.4], [-121.0, 50.2]]] }, properties: { name: 'Nicola IR No. 2', ALCODE: 'BC-002', theme: 'ALC_Confirmed' } },
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-119.7, 49.8], [-119.5, 49.8], [-119.5, 50.0], [-119.7, 50.0], [-119.7, 49.8]]] }, properties: { name: 'Westbank IR No. 9', ALCODE: 'BC-003', theme: 'ALC_Confirmed' } },
    ],
  },
  aoi_BC_SOI: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-121.5, 49.5], [-119.5, 49.5], [-119.5, 51.5], [-121.5, 51.5], [-121.5, 49.5]]] }, properties: { name: 'Nlaka\'pamux Statement of Intent Region', SOI_ID: 'BC-SOI-001', theme: 'BC_SOI' } },
    ],
  },
  aoi_Modern_Treaty: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-125.0, 49.0], [-124.0, 49.0], [-124.0, 50.0], [-125.0, 50.0], [-125.0, 49.0]]] }, properties: { name: 'Maa-nulth First Nations Treaty', TREATY_ID: 'MT-001', theme: 'Modern_Treaty' } },
    ],
  },
  aoi_ALC_Modified: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-120.4, 50.55], [-120.35, 50.55], [-120.35, 50.6], [-120.4, 50.6], [-120.4, 50.55]]] }, properties: { name: 'Pukaist IR Reduction (1916)', ALCODE: 'BC-001-MOD', theme: 'ALC_Modified', reduction_year: 1916 } },
    ],
  },
};

export const SAMPLE_ARTIFACTS: Record<number, Artifact> = {
  1: {
    content_preview:
      'Dear Sir, I write to confirm that the irrigation ditch serving Pukaist reserve has been diverted by settlers...',
    summary: 'Water rights dispute regarding irrigation access for the Pukaist reserve.',
    metadata: {
      pages: 2,
      source: 'smart',
      confidence: 0.91,
    },
    insights: {
      water_dispute: true,
      settler_involvement: true,
      year: 1912,
    },
  },
  2: {
    content_preview:
      'Annual inspection confirms Pukaist band continues to occupy the reserve established in 1878. Several parcels have been removed from the original boundaries...',
    summary: 'Inspector documents land reductions and continued occupation of reserve.',
    metadata: {
      pages: 4,
      source: 'hunyuan',
      confidence: 0.88,
    },
    insights: {
      land_reduction: true,
      original_date: 1878,
      parcels_removed: 3,
    },
  },
  3: {
    content_preview: '[Raster image; limited text extracted]',
    summary: 'Survey map showing original reserve boundaries.',
    metadata: {
      pages: 1,
      source: 'pdf_text',
      confidence: 0.82,
    },
    insights: {
      boundary_change: true,
      year: 1880,
    },
  },
};

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

/**
 * Call OpenAI Chat API
 */
export async function callOpenAIChat(params: {
  apiKey: string;
  prompt: string;
  model?: string;
  baseUrl?: string;
}): Promise<string> {
  const { apiKey, prompt, model = DEFAULT_OPENAI_MODEL, baseUrl = 'https://api.openai.com/v1' } = params;
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error: ${resp.status} ${text}`);
  }
  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content || '(No response)';
}

/**
 * Compute OCR quality heuristic from content preview
 */
export function computeOcrQuality(preview?: string | null): 'high' | 'medium' | 'low' | null {
  if (!preview) return null;
  const len = preview.length;
  if (len < 50) return 'low';
  const alphaRatio = (preview.match(/[a-zA-Z]/g)?.length ?? 0) / len;
  if (alphaRatio > 0.7 && len > 200) return 'high';
  if (alphaRatio > 0.5) return 'medium';
  return 'low';
}

/**
 * Format source label for display
 */
export function formatSourceLabel(src?: string | null): string | null {
  const val = (src || '').toLowerCase();
  if (val === 'pdf_text') return 'PDF text';
  if (val === 'direct') return 'Direct extraction';
  if (val === 'smart') return 'Smart OCR (auto)';
  if (val === 'tesseract') return 'Tesseract OCR';
  if (val === 'hunyuan') return 'Hunyuan VLM OCR';
  if (val === 'none') return 'No text';
  if (src) return src;
  return null;
}

