import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders heading, form fields, and social button", async ({ page }) => {
    await page.goto("/en/login");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/continue with google/i)).toBeVisible();
    await expect(page.getByText(/new here/i)).toBeVisible();
    await expect(page.getByText("Create an account")).toBeVisible();
  });

  test("toggles password visibility", async ({ page }) => {
    await page.goto("/en/login");
    const passwordInput = page.getByPlaceholder(/password/i);
    await expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = page.getByRole("button", { name: "Show password" });
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    const hideButton = page.getByRole("button", { name: "Hide password" });
    await hideButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("link to signup navigates correctly", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByText("Create an account").click();
    await expect(page).toHaveURL(/\/en\/signup/);
  });

  test("OAuth error code shown in URL is displayed", async ({ page }) => {
    await page.goto("/en/login?error=oauth_failed");
    await expect(page.getByText("Google sign-in failed, please try again.")).toBeVisible();
  });
});

test.describe("Signup page", () => {
  test("renders form with role selection", async ({ page }) => {
    await page.goto("/en/signup");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByPlaceholder(/first name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/last name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();

    await expect(page.getByText(/client/i)).toBeVisible();
    await expect(page.getByText(/insider/i)).toBeVisible();
  });

  test("toggles role selection between client and insider", async ({ page }) => {
    await page.goto("/en/signup");

    const clientBtn = page.getByText(/client/i).first();
    const insiderBtn = page.getByText(/insider/i).first();

    await clientBtn.click();
    await expect(clientBtn).toBeVisible();

    await insiderBtn.click();
    await expect(insiderBtn).toBeVisible();
  });

  test("link to login navigates correctly", async ({ page }) => {
    await page.goto("/en/signup");
    await page.getByText(/sign in/i).click();
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
