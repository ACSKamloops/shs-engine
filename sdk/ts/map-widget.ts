// Pukaist Map/Search Widget
// Small, embeddable panel for search + map overlays.
// Intended to be mounted into an existing page via:
//   import { mountPukaistMapWidget } from "../sdk/ts/map-widget.ts";
//   mountPukaistMapWidget({ mountId: "pukaist-map-widget", baseUrl, apiKey });

import { PukaistClient, SearchResult } from "./pukaist-client.ts";

export interface MapWidgetOptions {
  mountId: string;
  baseUrl?: string;
  apiKey?: string;
  initialQuery?: string;
  limit?: number;
}

declare const L: any;

export function mountPukaistMapWidget(options: MapWidgetOptions): void {
  const container = document.getElementById(options.mountId);
  if (!container) {
    throw new Error(`Pukaist map widget mount element not found: ${options.mountId}`);
  }

  const hasLeaflet = typeof (globalThis as any).L !== "undefined";
  if (!hasLeaflet) {
    container.innerHTML =
      "Pukaist map widget requires Leaflet (window.L). Include Leaflet JS and CSS before mounting this widget.";
    return;
  }

  const client = new PukaistClient(options.baseUrl, options.apiKey);

  container.innerHTML = "";
  container.className = "pukaist-map-widget";

  const style = document.createElement("style");
  style.textContent = `
  .pukaist-map-widget {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.75rem;
    max-width: 640px;
    font-size: 14px;
    background: #fafafa;
  }
  .pukaist-map-widget h3 {
    margin: 0 0 0.5rem;
    font-size: 16px;
  }
  .pukaist-map-widget label {
    display: inline-block;
    margin-right: 0.5rem;
  }
  .pukaist-map-widget input[type="text"] {
    width: 60%;
    max-width: 260px;
  }
  .pukaist-map-widget button {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
    padding: 0.2rem 0.5rem;
    font-size: 13px;
  }
  .pukaist-map-widget .section {
    margin-bottom: 0.75rem;
  }
  .pukaist-map-widget .small {
    font-size: 12px;
    color: #555;
  }
  .pukaist-map-widget .map-container {
    height: 260px;
    margin-top: 0.5rem;
    border-radius: 4px;
    overflow: hidden;
  }
  .pukaist-map-widget .results {
    max-height: 180px;
    overflow: auto;
    background: #f7f7f7;
    padding: 0.4rem;
    border-radius: 4px;
  }
  .pukaist-map-widget .result-item {
    margin-bottom: 0.4rem;
  }
  .pukaist-map-widget .result-item-title {
    font-weight: 600;
  }
  .pukaist-map-widget .doc-detail {
    margin-top: 0.5rem;
    background: #eef2ff;
    border: 1px solid #cbd5ff;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 12px;
    white-space: pre-wrap;
  }
  `;
  container.appendChild(style);

  const title = document.createElement("h3");
  title.textContent = "Pukaist Map/Search";
  container.appendChild(title);

  const banner = document.createElement("div");
  banner.className = "small";
  banner.id = `${options.mountId}-banner`;
  banner.textContent = "";
  container.appendChild(banner);

  const searchSection = document.createElement("div");
  searchSection.className = "section";
  searchSection.innerHTML = `
    <div class="small">Search indexed content and view points from /geojson.</div>
    <div style="margin-top: 0.25rem;">
      <input type="text" id="${options.mountId}-search-q" placeholder="search term" />
      <button type="button" id="${options.mountId}-search-btn">Search</button>
      <button type="button" id="${options.mountId}-geo-btn">Reload map</button>
      <button type="button" id="${options.mountId}-locate-btn">Locate me</button>
    </div>
    <div style="margin-top: 0.25rem;">
      <label class="small">Theme filter:
        <select id="${options.mountId}-theme-filter">
          <option value="">All</option>
        </select>
      </label>
    </div>
  `;
  container.appendChild(searchSection);

  const mapSection = document.createElement("div");
  mapSection.className = "section";
  const mapDiv = document.createElement("div");
  mapDiv.id = `${options.mountId}-map`;
  mapDiv.className = "map-container";
  mapSection.appendChild(mapDiv);
  container.appendChild(mapSection);

  const resultsSection = document.createElement("div");
  resultsSection.className = "section";
  const resultsTitle = document.createElement("div");
  resultsTitle.className = "small";
  resultsTitle.textContent = "Results";
  resultsSection.appendChild(resultsTitle);
  const resultsContainer = document.createElement("div");
  resultsContainer.id = `${options.mountId}-results`;
  resultsContainer.className = "results";
  resultsSection.appendChild(resultsContainer);
  const docDetail = document.createElement("div");
  docDetail.className = "doc-detail";
  docDetail.id = `${options.mountId}-doc-detail`;
  docDetail.textContent = "";
  resultsSection.appendChild(docDetail);
  container.appendChild(resultsSection);

  const searchInput = container.querySelector<HTMLInputElement>(`#${options.mountId}-search-q`)!;
  const searchBtn = container.querySelector<HTMLButtonElement>(`#${options.mountId}-search-btn`)!;
  const geoBtn = container.querySelector<HTMLButtonElement>(`#${options.mountId}-geo-btn`)!;
  const locateBtn = container.querySelector<HTMLButtonElement>(`#${options.mountId}-locate-btn`)!;
  const themeFilter = container.querySelector<HTMLSelectElement>(`#${options.mountId}-theme-filter`)!;

  const map = L.map(mapDiv).setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  const geoLayer = L.geoJSON().addTo(map);
  const highlightLayer = L.layerGroup().addTo(map);

  let lastGeo: any[] = [];
  let lastResults: SearchResult[] = [];

  const setDocDetail = (content: string | { title?: string; theme?: string; doc_type?: string; summary?: string; snippet?: string; id?: number }) => {
    if (typeof content === "string") {
      docDetail.textContent = content;
      return;
    }
    const parts: string[] = [];
    if (content.id) parts.push(`Doc #${content.id}`);
    if (content.title) parts.push(content.title);
    if (content.theme) parts.push(`Theme: ${content.theme}`);
    if (content.doc_type) parts.push(`Type: ${content.doc_type}`);
    const header = parts.join(" · ") || "Document";
    const summary = content.summary || content.snippet || "";
    docDetail.innerHTML = `<strong>${header}</strong>${summary ? `<div style="margin-top:4px;">${summary}</div>` : ""}`;
  };

  const rebuildThemeFilter = (features: any[]) => {
    const themes = new Set<string>();
    features.forEach((f) => {
      const t = f?.properties?.theme;
      if (typeof t === "string" && t.trim()) themes.add(t.trim());
    });
    themeFilter.innerHTML = "";
    const allOpt = document.createElement("option");
    allOpt.value = "";
    allOpt.textContent = "All";
    themeFilter.appendChild(allOpt);
    Array.from(themes)
      .sort()
      .forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        themeFilter.appendChild(opt);
      });
  };

  const applyThemeFilter = <T extends { theme?: string }>(items: T[]): T[] => {
    const selected = themeFilter.value.trim();
    if (!selected) return items;
    return items.filter((item) => (item.theme || "").toLowerCase() === selected.toLowerCase());
  };

  const focusDoc = async (docId: number) => {
    const matches = lastGeo.filter((f) => f?.properties?.doc_id === docId);
    highlightLayer.clearLayers();
    const points: [number, number][] = [];
    matches.forEach((f) => {
      if (f.geometry?.type === "Point" && Array.isArray(f.geometry.coordinates)) {
        const coords = f.geometry.coordinates as [number, number];
        points.push([coords[1], coords[0]]);
        L.circleMarker([coords[1], coords[0]], { radius: 6, color: "#f59e0b", weight: 3 }).addTo(highlightLayer);
      }
    });
    if (points.length) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds.pad(0.25), { maxZoom: 12 });
      banner.textContent = `Focused on doc #${docId}`;
    } else {
      banner.textContent = "No geo points for this doc.";
    }
    try {
      const doc = await client.doc(docId);
      setDocDetail({
        id: doc.id,
        title: doc.title,
        theme: (doc as any).theme,
        doc_type: (doc as any).doc_type,
        summary: (doc as any).summary,
        snippet: (doc as any).snippet,
      });
    } catch (err: any) {
      setDocDetail(err?.message || "No doc detail available.");
    }
  };

  const featureLabel = (f: any): string => {
    const title = f?.properties?.title;
    const theme = f?.properties?.theme;
    const docId = f?.properties?.doc_id;
    const parts = [];
    if (docId) parts.push(`doc #${docId}`);
    if (theme) parts.push(`theme: ${theme}`);
    if (title) parts.push(title);
    return parts.join(" · ") || "Feature";
  };

  const renderResults = (items: SearchResult[]) => {
    resultsContainer.innerHTML = "";
    if (!items.length) {
      resultsContainer.textContent = "No results yet.";
      return;
    }
    for (const item of items) {
      const div = document.createElement("div");
      div.className = "result-item";
      const titleEl = document.createElement("div");
      titleEl.className = "result-item-title";
      titleEl.textContent = item.title || item.file_path || `doc #${item.id}`;
      const metaEl = document.createElement("div");
      metaEl.className = "small";
      const parts: string[] = [];
      parts.push(`doc #${item.id}`);
      if (item.theme) parts.push(`theme: ${item.theme}`);
      if (item.doc_type) parts.push(`type: ${item.doc_type}`);
      if (item.status) parts.push(`status: ${item.status}`);
      metaEl.textContent = parts.join(" · ");
      const snippetEl = document.createElement("div");
      snippetEl.className = "small";
      snippetEl.textContent = item.snippet || "";
      div.appendChild(titleEl);
      if (parts.length) div.appendChild(metaEl);
      if (snippetEl.textContent) div.appendChild(snippetEl);
      div.style.cursor = "pointer";
      div.onclick = () => {
        void focusDoc(item.id);
      };
      resultsContainer.appendChild(div);
    }
  };

  const renderGeo = (features: any[]) => {
    geoLayer.clearLayers();
    highlightLayer.clearLayers();
    if (features.length) {
      geoLayer.addData({ type: "FeatureCollection", features });
      geoLayer.eachLayer((layer: any) => {
        const fid = layer?.feature?.properties?.doc_id;
        if (fid) {
          layer.on("click", () => {
            void focusDoc(fid);
          });
        }
        const label = featureLabel(layer?.feature);
        if (layer.bindPopup) {
          layer.bindPopup(label);
        }
      });
    }
  };

  const reloadGeo = async () => {
    banner.textContent = "Loading map data...";
    try {
      const data = await client.geojson(options.limit ?? 100);
      lastGeo = data?.features || [];
      rebuildThemeFilter(lastGeo);
      const filtered = applyThemeFilter(lastGeo);
      renderGeo(filtered);
      if (filtered.length) {
        const bounds = geoLayer.getBounds();
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds.pad(0.2));
        }
        banner.textContent = `Loaded ${filtered.length} feature(s).`;
      } else {
        banner.textContent = "No geo features yet.";
      }
    } catch (err: any) {
      banner.textContent = err?.message || String(err);
    }
  };

  const runSearch = async () => {
    const q = searchInput.value.trim();
    if (!q) {
      banner.textContent = "Enter a search term first.";
      return;
    }
    searchBtn.disabled = true;
    banner.textContent = "Searching...";
    try {
      const res = await client.search(q, { limit: options.limit ?? 20 });
      lastResults = res.results || [];
      renderResults(applyThemeFilter(lastResults));
      banner.textContent = `Search returned ${lastResults.length} result(s).`;
    } catch (err: any) {
      banner.textContent = err?.message || String(err);
      renderResults([]);
    } finally {
      searchBtn.disabled = false;
    }
  };

  const recalcFiltered = () => {
    renderResults(applyThemeFilter(lastResults));
    const filteredGeo = applyThemeFilter(lastGeo as any);
    renderGeo(filteredGeo);
  };

  searchBtn.onclick = () => {
    void runSearch();
  };
  geoBtn.onclick = () => {
    void reloadGeo();
  };
  locateBtn.onclick = () => {
    if (!navigator.geolocation) {
      banner.textContent = "Geolocation not available in this browser.";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 8);
        banner.textContent = "Centered on your location.";
      },
      () => {
        banner.textContent = "Unable to get your location.";
      },
    );
  };
  themeFilter.onchange = () => {
    recalcFiltered();
  };

  if (options.initialQuery) {
    searchInput.value = options.initialQuery;
    void runSearch();
  }
  void reloadGeo();
}
