import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should toggle between light and dark themes', async ({ page }) => {
    await page.goto('/');
    
    // Check initial theme state (we'll just verify the toggle exists rather than assuming default)
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Get current theme by checking the HTML class attribute
    const initialThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    // Check if it contains light or dark class
    const initialIsLight = initialThemeClass.includes('light');
    const initialIsDark = initialThemeClass.includes('dark');
    
    // Verify that exactly one theme class is present
    expect(initialIsLight || initialIsDark).toBeTruthy();
    expect(initialIsLight && initialIsDark).toBeFalsy();
    
    // Click the theme toggle
    await themeToggle.click();
    
    // Get the new theme class
    const newThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    // Check if the theme switched from light to dark or vice versa
    const newIsLight = newThemeClass.includes('light');
    const newIsDark = newThemeClass.includes('dark');
    
    // Verify that exactly one theme class is present and it's different from initial
    expect(newIsLight || newIsDark).toBeTruthy();
    expect(newIsLight && newIsDark).toBeFalsy();
    
    // If initial was light, new should be dark, and vice versa
    if (initialIsLight) {
      expect(newIsDark).toBeTruthy();
      expect(newIsLight).toBeFalsy();
    } else {
      expect(newIsLight).toBeTruthy();
      expect(newIsDark).toBeFalsy();
    }
    
    // Toggle back
    await themeToggle.click();
    
    // Get the final theme class
    const finalThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    // Verify we're back to the initial theme
    const finalIsLight = finalThemeClass.includes('light');
    const finalIsDark = finalThemeClass.includes('dark');
    
    if (initialIsLight) {
      expect(finalIsLight).toBeTruthy();
      expect(finalIsDark).toBeFalsy();
    } else {
      expect(finalIsDark).toBeTruthy();
      expect(finalIsLight).toBeFalsy();
    }
  });
  
  test('should persist theme selection across page reload', async ({ page }) => {
    await page.goto('/');
    
    // Get initial theme
    const initialThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    const initialIsLight = initialThemeClass.includes('light');
    const initialIsDark = initialThemeClass.includes('dark');
    
    // Toggle theme
    await page.getByTestId('theme-toggle').click();
    
    // Get the new theme
    const newThemeClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    const newIsLight = newThemeClass.includes('light');
    const newIsDark = newThemeClass.includes('dark');
    
    // Verify theme changed
    if (initialIsLight) {
      expect(newIsDark).toBeTruthy();
      expect(newIsLight).toBeFalsy();
    } else {
      expect(newIsLight).toBeTruthy();
      expect(newIsDark).toBeFalsy();
    }
    
    // Reload the page
    await page.reload();
    
    // Check that theme persisted
    const themeAfterReloadClass = await page.evaluate(() => {
      return document.documentElement.className;
    });
    
    const afterReloadIsLight = themeAfterReloadClass.includes('light');
    const afterReloadIsDark = themeAfterReloadClass.includes('dark');
    
    // Verify theme persisted through reload
    if (newIsLight) {
      expect(afterReloadIsLight).toBeTruthy();
      expect(afterReloadIsDark).toBeFalsy();
    } else {
      expect(afterReloadIsDark).toBeTruthy();
      expect(afterReloadIsLight).toBeFalsy();
    }
  });
}); 