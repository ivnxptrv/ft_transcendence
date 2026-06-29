import { test, expect } from "@playwright/test";

test.describe("Privacy page", () => {
  test("renders legal content", async ({ page }) => {
    await page.goto("/en/privacy");
    await expect(page.locator("h1, h2, h3").first()).toBeVisible();
    const body = page.locator("body");
    await expect(body).not.toHaveText("");
  });
});

test.describe("Terms page", () => {
  test("renders legal content", async ({ page }) => {
    await page.goto("/en/terms");
    await expect(page.locator("h1, h2, h3").first()).toBeVisible();
    const body = page.locator("body");
    await expect(body).not.toHaveText("");
  });
});

test.describe("Guest redirect", () => {
  test("unauthenticated user at /en redirects to /en/login", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test("unauthenticated user at / redirects to /en/login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
