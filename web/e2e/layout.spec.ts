import { test, expect } from "@playwright/test";

test.describe("Footer", () => {
  test("renders privacy and terms links on login page", async ({ page }) => {
    await page.goto("/en/login");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText("Privacy Policy")).toBeVisible();
    await expect(footer.getByText("Terms of Service")).toBeVisible();
  });

  test("privacy footer link navigates to /en/privacy", async ({ page }) => {
    await page.goto("/en/login");
    const footer = page.locator("footer");
    await footer.getByText("Privacy Policy").click();
    await expect(page).toHaveURL(/\/en\/privacy/);
  });

  test("terms footer link navigates to /en/terms", async ({ page }) => {
    await page.goto("/en/login");
    const footer = page.locator("footer");
    await footer.getByText("Terms of Service").click();
    await page.waitForURL(/\/en\/terms/, { timeout: 10000 });
  });
});
