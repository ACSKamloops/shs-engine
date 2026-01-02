import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("pukaist-tour-seen-v2-nav", "true");
      localStorage.setItem(
        "pukaist-app-store",
        JSON.stringify({ state: { useLiveApi: true, showConfidence: true }, version: 0 }),
      );
    } catch {
      /* ignore */
    }
  });
  await page.route("**/status", (route) => route.fulfill({ json: { queue: {} } }));
  await page.route("**/tasks/flagged", (route) => route.fulfill({ json: { tasks: [] } }));
  await page.route("**/jobs", (route) => route.fulfill({ json: { jobs: [] } }));
});

test("pipeline map interactions with mocked data", async ({ page }) => {
  // Mock docs list + doc detail
  await page.route("**/docs**", (route) => {
    const url = route.request().url();
    if (url.match(/\/docs\/\d+/)) {
      route.fulfill({
        json: { id: 1, file_path: "sample.txt", title: "Demo Doc", theme: "demo", doc_type: "text", summary: "sum", status: "done", lat: 10, lng: 20 },
      });
      return;
    }
    route.fulfill({
      json: {
        docs: [
          { id: 1, file_path: "sample.txt", title: "Demo Doc", theme: "demo", doc_type: "text", summary: "sum", status: "done", lat: 10, lng: 20 },
        ],
      },
    });
  });
  await page.route("**/docs/1/suggestions", (route) =>
    route.fulfill({
      json: {
        suggestions: [
          { id: "201", title: "Suggested", lat: 11, lng: 21, confidence: "high" },
        ],
      },
    }),
  );
  await page.route("**/geo/layers/**", (route) => {
    const url = route.request().url();
    if (url.includes("bc_territories")) {
      route.fulfill({
        json: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Polygon", coordinates: [[[-123, 49], [-122, 49], [-122, 50], [-123, 50], [-123, 49]]] },
              properties: { name: "Sample Territory" },
            },
          ],
        },
      });
      return;
    }
    if (url.includes("bc_first_nations_locations")) {
      route.fulfill({
        json: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [-123.1, 49.25] },
              properties: { name: "Example First Nation" },
            },
          ],
        },
      });
      return;
    }
    route.fulfill({ json: { type: "FeatureCollection", features: [] } });
  });
  await page.route("**/aoi/**", (route) =>
    route.fulfill({ json: { type: "FeatureCollection", features: [] } }),
  );

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/");
  await page.getByRole("link", { name: "Map Explorer" }).click();
  await expect(page).toHaveURL(/\/map/);
  await expect(page.locator(".leaflet-container").first()).toBeVisible({ timeout: 10000 });

  // Verify map controls render layer UI and layer labels
  const layerPanel = page
    .locator(".panel")
    .filter({ has: page.getByRole("heading", { name: "Layers" }) })
    .first();
  await expect(layerPanel.getByRole("heading", { name: "Layers" })).toBeVisible();
  await expect(layerPanel.getByText("Documents", { exact: true })).toBeVisible();
  await expect(layerPanel.getByText("AOI", { exact: true })).toBeVisible();
  await expect(layerPanel.getByText("POI", { exact: true })).toBeVisible();
  await expect(layerPanel.getByText("Dim", { exact: true })).toBeVisible();
  await expect(layerPanel.getByRole("button", { name: "Territories" })).toBeVisible();

  // Verify layer toggles impact map geometry (BC SOI hide)
  const pathLocator = page.locator("path.leaflet-interactive");
  await expect.poll(async () => await pathLocator.count()).toBeGreaterThan(0);
  const beforeCount = await pathLocator.count();
  await layerPanel.getByRole("button", { name: "Territories" }).click();
  await page.waitForTimeout(500);
  const afterCount = await pathLocator.count();
  expect(afterCount).toBeLessThanOrEqual(beforeCount);
});
