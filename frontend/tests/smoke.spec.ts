import { test, expect } from "@playwright/test";

// Simple smoke to ensure server serves and critical buttons respond.
test("loads dashboard and navigates to documents", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("pukaist-tour-seen-v1", "true");
      localStorage.setItem("pukaist-use-live-api", "false");
      localStorage.setItem(
        "pukaist-wizard-frame",
        JSON.stringify({ periodStart: "1800", periodEnd: "2025", theme: "" }),
      );
    } catch {
      /* ignore */
    }
  });
  await page.goto("/");
  
  // 1. Verify Dashboard Page
  await expect(page.locator("h1:has-text('Dashboard')")).toBeVisible();
  
  // 2. Verify Sidebar exists and has Documents link
  await expect(page.locator("nav")).toBeVisible();
  const docsLink = page.getByRole('link', { name: 'Documents' });
  await expect(docsLink).toBeVisible();

  // 3. Navigate to Documents page
  await docsLink.click();
  
  // 4. Verify Documents Page
  // We expect the Filter and Docs panels to be present
  // Use a more specific selector to avoid ambiguity with sidebar link
  await expect(page.locator("h2:has-text('Documents')")).toBeVisible();
  
  // 5. Verify Map Explorer Link works
  const mapLink = page.getByRole('link', { name: 'Map Explorer' });
  await mapLink.click();
  // Map panel usually has a title "Map" inside it
  await expect(page.locator("h2:has-text('Map')")).toBeVisible();
});