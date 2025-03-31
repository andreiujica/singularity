import { test, expect } from '@playwright/test';

test.describe('Sidebar Functionality', () => {
  test('should allow creating a new conversation', async ({ page }) => {
    await page.goto('/');
    
    // Click on the "New Chat" button in the sidebar
    const newChatButton = page.getByTestId('new-chat-button');
    await newChatButton.click();
    
    // Wait for a conversation item to be visible (using first() to avoid strict mode violation)
    await page.waitForTimeout(1000);
    const conversationItems = page.getByTestId('conversation-item');
    await expect(conversationItems.first()).toBeVisible();
    
    // Type and send a message in the new conversation
    const chatTextarea = page.getByTestId('chat-textarea');
    await chatTextarea.fill('Message in new conversation');
    await chatTextarea.press('Enter');
    
    // Verify the message appears in the new conversation
    const userMessage = page.getByTestId('user-message');
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText('Message in new conversation');
  });
}); 