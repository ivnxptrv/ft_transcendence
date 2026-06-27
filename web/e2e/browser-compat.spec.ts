import { test, expect } from "@playwright/test";

test.describe("Cross-browser CSS compatibility", () => {
  test("body has correct font-family via Geist sans variable", async ({ page }) => {
    await page.goto("/en/login");
    const body = page.locator("body");
    await expect(body).toHaveCSS("font-family", /Geist/);
  });

  test("backdrop-blur CSS property is supported", async ({ page }) => {
    await page.goto("/en/login");
    const supported = await page.evaluate(() =>
      CSS.supports("backdrop-filter", "blur(1px)")
    );
    expect(supported).toBe(true);
  });

  test("password input is styled with dark background", async ({ page }) => {
    await page.goto("/en/login");
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveClass(/bg-white/);
  });
});

test.describe("Interactive elements", () => {
  test("first focusable element receives focus on Tab", async ({ page }) => {
    await page.goto("/en/login");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});

test.describe("Form validation rendering", () => {
  test("signup form submits with empty fields does not crash", async ({ page }) => {
    await page.goto("/en/signup");
    await page.getByRole("button", { name: "Create account" }).click();
    // Should still be on the signup page (HTML validation prevents submit)
    await expect(page).toHaveURL(/\/en\/signup/);
  });
});

test.describe("SVG favicon", () => {
  test("favicon link is present", async ({ page }) => {
    await page.goto("/en/login");
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /icon\.svg/);
  });
});
