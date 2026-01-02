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

test("artifact panels render with data and copy", async ({ page }) => {
  await page.route("**/docs**", (route) => {
    const url = route.request().url();
    if (url.match(/\/docs\/\d+$/)) {
      route.fulfill({
        json: {
          id: 1,
          task_id: 10,
          file_path: "artifact.txt",
          theme: "demo",
          title: "Artifact Doc",
          summary: "artifact summary",
          doc_type: "text",
          status: "done",
          created_at: Date.now() / 1000,
        },
      });
      return;
    }
    route.fulfill({
      json: {
        docs: [
          {
            id: 1,
            file_path: "artifact.txt",
            title: "Artifact Doc",
            theme: "demo",
            doc_type: "text",
            summary: "artifact summary",
            status: "done",
            created_at: Date.now() / 1000,
          },
        ],
      },
    });
  });
  await page.route("**/docs/1/artifact", (route) =>
    route.fulfill({
      json: {
        task_id: 10,
        file_path: "artifact.txt",
        metadata: { doc_type: "text", inferred_date: "2024-01-01" },
        summary: "artifact summary",
        insights: { key: "val" },
        content_preview: "artifact preview content",
      },
    }),
  );

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  await expect(page.getByText("Artifact Doc")).toBeVisible();

  const inspector = page.locator('[data-tour="inspector"]');
  await expect(inspector.getByText("artifact preview content")).toBeVisible();
  await page.getByRole("button", { name: "Meta" }).click();
  await expect(inspector.getByText('"inferred_date": "2024-01-01"')).toBeVisible();
  await page.getByRole("button", { name: "AI" }).click();
  await expect(inspector.getByText("artifact summary")).toBeVisible();
  await expect(inspector.getByText('"key": "val"')).toBeVisible();
  await page.getByRole("button", { name: "Copy" }).first().click();
});
