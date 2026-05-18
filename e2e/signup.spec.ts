import { test, expect } from "@playwright/test";

test.describe("User signup", () => {
  test("creates account from /signup form", async ({ page }) => {
    const runId = Date.now();
    const email = `tambua.ui.${runId}@mailinator.com`;
    const password = `UiTest#${runId}`;

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();

    const acceptCookies = page.getByRole("button", { name: "Accept" });
    if (await acceptCookies.isVisible().catch(() => false)) {
      await acceptCookies.click();
    }

    await page.getByPlaceholder("John Doe").fill("UI Signup Test");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Min. 6 characters").fill(password);
    const signupResponse = page.waitForResponse(
      (res) => res.url().includes("/auth/v1/signup") && res.request().method() === "POST",
      { timeout: 20_000 },
    );
    await page.getByRole("button", { name: "Create Account" }).click();
    const res = await signupResponse;
    expect(res.status(), await res.text()).toBeLessThan(400);

    await expect(
      page.locator("[data-sonner-toast]").filter({ hasText: /account created|check your email|verify/i }),
    ).toBeVisible({ timeout: 10_000 });
  });
});
