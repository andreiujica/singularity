import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display welcome screen on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Check that welcome screen is visible
    const welcomeScreen = page.getByTestId('welcome-screen');
    await expect(welcomeScreen).toBeVisible();
    
    // Check that suggestions are displayed
    const suggestions = page.getByTestId('suggestion-button');
    await expect(suggestions.first()).toBeVisible();
  });

  test('should show suggestions that can be clicked', async ({ page }) => {
    await page.goto('/');
    
    // Get the first suggestion button
    const suggestionButton = page.getByTestId('suggestion-button').first();
    await expect(suggestionButton).toBeVisible();
    
    // Verify the component exists and can be clicked
    await suggestionButton.click();
    
    // After clicking, the welcome screen should no longer be visible
    // because user interactions should transition to chat view
    await expect(page.getByTestId('welcome-screen')).not.toBeVisible({ timeout: 5000 });
    
    // After clicking a suggestion, user message should appear
    const userMessage = page.getByTestId('user-message');
    await expect(userMessage).toBeVisible({ timeout: 5000 });
  });
}); 