import { test, expect } from "@playwright/test";

test.describe("NewDataHubPage", () => {
  test("should load the page and submit a new Data Hub", async ({ page }) => {
    // Go to the page where the NewDataHubPage component is rendered
    await page.goto("http://localhost:5173/data-hub/new"); // Update URL if necessary

    // Wait for the form to load
    await page.waitForSelector("form");

    // Fill out the form fields
    await page.fill('input[placeholder="Enter the hub name"]', "Test Data Hub");
    await page.click("text=Select a language");
    await page.click("text=English"); // Select language
    await page.fill(
      'textarea[placeholder="Enter a brief description"]',
      "A brief description of the data hub."
    );

    // Submit the form
    await page.click('button:has-text("Save Data Hub")');

    // Assert that the user is redirected back to the dashboard page
    await expect(page).toHaveURL("http://localhost:5173/data-hub/dashboard");
  });

  test("should edit an existing Data Hub", async ({ page }) => {
    // Navigate to an edit page with an existing Data Hub ID
    await page.goto("http://localhost:5173/data-hub/edit/1"); // Replace `1` with a valid ID for testing

    // Wait for the data to load
    await page.waitForSelector('input[placeholder="Enter the hub name"]');

    // Ensure existing data is loaded in the form fields
    const hubName = await page.inputValue(
      'input[placeholder="Enter the hub name"]'
    );
    expect(hubName).toBe("Existing Data Hub"); // Update with expected existing value

    // Change the name
    await page.fill(
      'input[placeholder="Enter the hub name"]',
      "Updated Data Hub Name"
    );

    // Select a new language
    await page.click("text=Select a language");
    await page.click("text=Spanish");

    // Update the description
    await page.fill(
      'textarea[placeholder="Enter a brief description"]',
      "Updated description."
    );

    // Submit the form
    await page.click('button:has-text("Save Data Hub")');

    // Verify redirection to the dashboard
    await expect(page).toHaveURL("http://localhost:5173/data-hub/dashboard");
  });

  test("should display validation errors", async ({ page }) => {
    // Navigate to the new Data Hub page
    await page.goto("http://localhost:5173/data-hub/new");

    // Try to submit the form without filling in the required fields
    await page.click('button:has-text("Save Data Hub")');

    // Check for validation error messages
    const errorMessage = await page.textContent(".text-red-500");
    expect(errorMessage).toContain("Name is required");
  });

  test("should cancel form submission and navigate back to dashboard", async ({
    page,
  }) => {
    // Navigate to the new Data Hub page
    await page.goto("http://localhost:5173/data-hub/new");

    // Click on the Cancel button
    await page.click('button:has-text("Cancel")');

    // Ensure that it navigates back to the dashboard
    await expect(page).toHaveURL("http://localhost:5173/data-hub/dashboard");
  });
});
