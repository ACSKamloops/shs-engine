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
  await page.route("**/whoami", (route) =>
    route.fulfill({ json: { is_admin: true, roles: ["admin"], tenant: "local" } }),
  );
});

test("logs panel shows API/worker tails", async ({ page }) => {
  await page.route("**/logs**", (route) => {
    const url = route.request().url();
    if (url.includes("kind=worker")) {
      route.fulfill({
        json: { log: "worker", content: "worker-line", path: "/tmp/worker.log", limit: 200 },
      });
      return;
    }
    route.fulfill({ json: { log: "api", content: "line1\nline2\nline3", path: "/tmp/api.log", limit: 200 } });
  });

  const base = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173";
  await page.goto(base + "/admin");
  await page.getByRole("button", { name: "Logs" }).click();
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.getByText("line2")).toBeVisible();

  // Switch to worker logs
  await page.getByRole("combobox").selectOption("worker");
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.getByText("worker-line")).toBeVisible();
});
