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
});

test("jobs list renders and expands tasks", async ({ page }) => {
  await page.route("**/jobs", (route) =>
    route.fulfill({
      json: {
        jobs: [
          { id: 1, status: "done", created_at: Date.now() / 1000 - 600, updated_at: Date.now() / 1000 - 500 },
          { id: 2, status: "flagged", last_error: "validation failed", created_at: Date.now() / 1000 - 1200, updated_at: Date.now() / 1000 - 1100 },
        ],
      },
    }),
  );
  await page.route("**/jobs/1/tasks", (route) =>
    route.fulfill({
      json: {
        tasks: [
          { id: 101, status: "done", theme: "demo", created_at: Date.now() / 1000 - 580, updated_at: Date.now() / 1000 - 550 },
        ],
      },
    }),
  );
  await page.route("**/jobs/2/tasks", (route) =>
    route.fulfill({
      json: {
        tasks: [
          { id: 201, status: "flagged", theme: "claims", created_at: Date.now() / 1000 - 1180, updated_at: Date.now() / 1000 - 1120 },
        ],
      },
    }),
  );
  await page.route("**/docs**", (route) => {
    const url = route.request().url();
    if (url.match(/\/docs\/\d+$/)) {
      route.fulfill({
        json: {
          id: 1,
          file_path: "sample.txt",
          title: "Demo Doc",
          theme: "demo",
          doc_type: "text",
          summary: "sum",
          status: "done",
        },
      });
      return;
    }
    route.fulfill({
      json: {
        docs: [
          {
            id: 1,
            file_path: "sample.txt",
            title: "Demo Doc",
            theme: "demo",
            doc_type: "text",
            summary: "sum",
            status: "done",
          },
        ],
      },
    });
  });
  await page.route("**/docs/1/artifact", (route) =>
    route.fulfill({
      json: {
        task_id: 10,
        file_path: "sample.txt",
        metadata: {},
        summary: "sum",
        insights: {},
        content_preview: "preview",
      },
    }),
  );
  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/documents");
  await expect(page.getByText("Demo Doc")).toBeVisible();
  await page.getByRole("button", { name: "Jobs" }).click();
  await page.getByRole("button", { name: "Reload" }).click();
  await expect(page.getByText("job #1", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("job #2", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "View tasks" }).nth(1).click();
  await expect(page.getByText("task #201", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("validation failed")).toBeVisible();
});
