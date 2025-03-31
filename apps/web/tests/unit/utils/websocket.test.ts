import { describe, it, expect, vi } from 'vitest';
import { createWebSocketMessage, calculateBackoff, isBrowser } from '@/utils/websocket';

// Mock UUID to ensure predictable request IDs
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}));

describe('WebSocket Utils', () => {
  describe('createWebSocketMessage', () => {
    it('should create a correctly formatted message', () => {
      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant.' },
        { role: 'user' as const, content: 'Hello!' }
      ];
      
      const result = createWebSocketMessage(messages, 'gpt-4', 0.5, true);
      
      expect(result).toEqual({
        request_id: 'test-uuid-1234',
        model: 'gpt-4',
        messages,
        temperature: 0.5,
        stream: true
      });
    });
  });
  
  describe('calculateBackoff', () => {
    it('should return exponential backoff with jitter', () => {
      expect(calculateBackoff(0, 1000, 30000)).toBe(1000); // 1000 * 2^0 = 1000
      expect(calculateBackoff(1, 1000, 30000)).toBe(2000); // 1000 * 2^1 = 2000
      expect(calculateBackoff(2, 1000, 30000)).toBe(4000); // 1000 * 2^2 = 4000
      expect(calculateBackoff(3, 1000, 30000)).toBe(8000); // 1000 * 2^3 = 8000
    });
    
    it('should respect max backoff limit', () => {
      // 1000 * 2^10 = 1024000, but max is 30000
      expect(calculateBackoff(10, 1000, 30000)).toBe(30000);
    });
  });
  
  describe('isBrowser', () => {
    it('should return true in browser environment', () => {
      // In the test environment, window is defined (or we mocked it)
      expect(isBrowser()).toBe(true);
    });
    
    it('should return false in non-browser environment', () => {
      // Mock window as undefined
      const originalWindow = global.window;
      // @ts-ignore - deliberately setting to undefined for test
      global.window = undefined;
      
      expect(isBrowser()).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });
}); 