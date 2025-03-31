import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  // Add a retry count for tests that depend on the backend
  test.beforeEach(async ({ page }) => {
    // Go to the homepage and wait for it to be fully loaded
    await page.goto('/');
    // Ensure the chat textarea is visible before proceeding
    await expect(page.getByTestId('chat-textarea')).toBeVisible({ timeout: 10000 });
  });

  test('should allow sending a message and receive a response', async ({ page }) => {
    // Type a message in the chat input
    const chatTextarea = page.getByTestId('chat-textarea');
    await chatTextarea.fill('Hello, this is a test message');
    
    // Send the message by pressing Enter
    await chatTextarea.press('Enter');
    
    // Verify the user message appears in the chat
    const userMessage = page.getByTestId('user-message');
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText('Hello, this is a test message');
    
    // Wait for the assistant response to appear
    const assistantMessage = page.getByTestId('assistant-message');
    await expect(assistantMessage).toBeVisible({ timeout: 15000 });  // Allow up to 15 seconds for response
  });

  test('should display message history after sending multiple messages', async ({ page }) => {
    // Function to send a message
    async function sendMessage(text: string) {
      const chatTextarea = page.getByTestId('chat-textarea');
      await chatTextarea.fill(text);
      await chatTextarea.press('Enter');
      
      // Wait for the message to be sent
      const userMessage = page.getByTestId('user-message').getByText(text);
      await expect(userMessage).toBeVisible();
      
      // Wait for the assistant response
      await page.waitForTimeout(300);
      const assistantMessages = page.getByTestId('assistant-message');
      const count = await assistantMessages.count();
      await expect(assistantMessages.nth(count - 1)).toBeVisible({ timeout: 15000 });
    }
    
    // Send multiple messages with retry logic
    try {
      await sendMessage('First test message');
      await sendMessage('Second test message');
      
      // Verify all messages are visible in the chat history
      const userMessages = page.getByTestId('user-message');
      await expect(userMessages).toHaveCount(2);
      
      await expect(userMessages.filter({ hasText: 'First test message' })).toBeVisible();
      await expect(userMessages.filter({ hasText: 'Second test message' })).toBeVisible();
      
      // Verify assistant responses
      const assistantMessages = page.getByTestId('assistant-message');
      await expect(assistantMessages).toHaveCount(2);
    } catch (error) {
      // Take a screenshot on failure for debugging
      await page.screenshot({ path: 'test-failure-messages.png' });
      throw error;
    }
  });
}); 