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

test("pipeline panels with mocked artifact and controls", async ({ page }) => {
  await page.route("**/docs**", (route) => {
    const url = route.request().url();
    if (url.match(/\/docs\/\d+$/)) {
      route.fulfill({
        json: {
          id: 1,
          task_id: 10,
          file_path: "sample.txt",
          theme: "demo",
          title: "Demo Doc",
          summary: "sum",
          doc_type: "text",
          status: "done",
        },
      });
      return;
    }
    route.fulfill({
      json: {
        docs: [
          { id: 1, file_path: "sample.txt", title: "Demo Doc", theme: "demo", doc_type: "text", summary: "sum", status: "done" },
        ],
      },
    });
  });
  await page.route("**/docs/1/artifact", (route) =>
    route.fulfill({
      json: {
        task_id: 10,
        file_path: "sample.txt",
        metadata: { doc_type: "text" },
        summary: "sum",
        insights: { key: "val" },
        content_preview: "preview text",
      },
    }),
  );

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  await expect(page.getByText("Demo Doc")).toBeVisible();
  const inspector = page.locator('[data-tour="inspector"]');
  await expect(inspector.getByText("preview text")).toBeVisible();

  await page.getByRole("button", { name: "Meta" }).click();
  await expect(inspector.getByText('"doc_type": "text"')).toBeVisible();

  await page.getByRole("button", { name: "AI" }).click();
  await expect(inspector.getByText("sum", { exact: true })).toBeVisible();
  await expect(inspector.getByText('"key": "val"')).toBeVisible();

  await page.getByRole("button", { name: "Geo", exact: true }).click();
  await expect(inspector.getByText("Document has no location")).toBeVisible();

  await page.getByRole("button", { name: "Pipeline" }).click();
  await expect(inspector.getByText("Document processing pipeline")).toBeVisible();
  await expect(inspector.getByText("Uploaded")).toBeVisible();
});

test("kmz import control surfaces success banner", async ({ page }) => {
  await page.route("**/docs**", (route) => route.fulfill({ json: { docs: [] } }));
  await page.route("**/aoi/import_kmz", (route) =>
    route.fulfill({ json: { features: 2 } }),
  );

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  await expect(page.getByTitle("Import KMZ/KML/GeoJSON")).toBeVisible();
  const fileInput = page.locator('input[type="file"][accept=".kmz,.kml,.geojson,.json"]').first();
  await fileInput.setInputFiles({ name: "demo.kmz", mimeType: "application/vnd.google-earth.kmz", buffer: Buffer.from("dummy") });
  await expect(page.getByText("Imported 2 features from demo.kmz")).toBeVisible({ timeout: 10000 });
});

test("empty documents show inspector prompt", async ({ page }) => {
  await page.route("**/docs**", (route) => route.fulfill({ json: { docs: [] } }));

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  await expect(page.getByText("Select a document to view details")).toBeVisible();
});

test("kmz upload error surfaces banner", async ({ page }) => {
  await page.route("**/docs**", (route) => route.fulfill({ json: { docs: [] } }));
  await page.route("**/aoi/import_kmz**", (route) =>
    route.fulfill({
      status: 400,
      body: "invalid kmz",
    }),
  );

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  const fileInput = page.locator('input[type="file"][accept=".kmz,.kml,.geojson,.json"]').first();
  await fileInput.setInputFiles({ name: "bad.kmz", mimeType: "application/octet-stream", buffer: Buffer.from("oops") });
  await expect(page.getByText("Import failed: invalid kmz")).toBeVisible({ timeout: 10000 });
});

test("kmz upload success refreshes banner", async ({ page }) => {
  await page.route("**/docs**", (route) => route.fulfill({ json: { docs: [] } }));
  await page.route("**/aoi/import_kmz**", (route) =>
    route.fulfill({
      json: { features: 1 },
    }),
  );

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  const fileInput = page.locator('input[type="file"][accept=".kmz,.kml,.geojson,.json"]').first();
  await fileInput.setInputFiles({ name: "good.kmz", mimeType: "application/vnd.google-earth.kmz", buffer: Buffer.from("dummy") });
  await expect(page.getByText("Imported 1 features from good.kmz")).toBeVisible({ timeout: 10000 });
});
