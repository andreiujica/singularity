import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketService } from '@/lib/websocket-service';
import { WS_EVENT, WS_STATE } from '@/constants/websocket';

// Mock UUID to ensure predictable request IDs
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}));

// Mock window for browser check
vi.stubGlobal('window', {
  dispatchEvent: vi.fn(),
});

class MockWebSocket {
  url: string;
  readyState: number = WS_STATE.CONNECTING;
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  
  constructor(url: string) {
    this.url = url;
  }
  
  send = vi.fn();
  close = vi.fn();
  
  // Helper methods to simulate WebSocket events
  simulateOpen() {
    this.readyState = WS_STATE.OPEN;
    if (this.onopen) this.onopen.call(this as any, new Event('open'));
  }
  
  simulateMessage(data: any) {
    if (this.onmessage) {
      const event = {
        data: JSON.stringify(data)
      } as MessageEvent;
      this.onmessage.call(this as any, event);
    }
  }
  
  simulateError() {
    if (this.onerror) this.onerror.call(this as any, new Event('error'));
  }
  
  simulateClose(code = 1000, reason = '') {
    this.readyState = WS_STATE.CLOSED;
    if (this.onclose) {
      const event = {
        code,
        reason,
        wasClean: code === 1000
      } as CloseEvent;
      this.onclose.call(this as any, event);
    }
  }
}

describe('WebSocketService', () => {
  let mockWebSocket: MockWebSocket;
  let originalWebSocket: any;
  let service: WebSocketService;
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Store original WebSocket and replace with mock
    originalWebSocket = global.WebSocket;
    mockWebSocket = new MockWebSocket('ws://test-url');
    global.WebSocket = vi.fn(() => mockWebSocket) as any;
    
    // Clear mocks between tests
    vi.clearAllMocks();
    
    // Create a new service for each test
    service = new WebSocketService('ws://test-url');
  });
  
  afterEach(() => {
    // Restore WebSocket
    global.WebSocket = originalWebSocket;
    vi.useRealTimers();
  });
  
  it('should create a new WebSocket when connect is called', () => {
    service.connect();
    expect(global.WebSocket).toHaveBeenCalledWith('ws://test-url');
  });
  
  it('should not reconnect if already connected', () => {
    service.connect();
    mockWebSocket.simulateOpen();
    
    // Clear the mock calls count
    vi.mocked(global.WebSocket).mockClear();
    
    // Try to connect again
    service.connect();
    
    // Should not create a new WebSocket
    expect(global.WebSocket).not.toHaveBeenCalled();
  });
  
  it('should dispatch open event when connection opens', () => {
    const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent');
    
    service.connect();
    mockWebSocket.simulateOpen();
    
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: WS_EVENT.OPEN
      })
    );
  });
  
  it('should attempt to reconnect after connection closes', () => {
    service.connect();
    mockWebSocket.simulateOpen();
    
    // Clear the mock calls count
    vi.mocked(global.WebSocket).mockClear();
    
    // Simulate connection close
    mockWebSocket.simulateClose(1006, 'Connection lost');
    
    // Fast-forward past the backoff time
    vi.advanceTimersByTime(1000);
    
    // Should attempt to reconnect
    expect(global.WebSocket).toHaveBeenCalledTimes(1);
  });
  
  it('should send messages with correct format', () => {
    service.connect();
    mockWebSocket.simulateOpen();
    
    const messages = [
      { role: 'user' as const, content: 'Hello' }
    ];
    
    // Send a chat message
    const requestId = service.sendChatMessage(messages);
    
    // Check request ID
    expect(requestId).toBe('test-uuid-1234');
    
    // Check what was sent to the WebSocket
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        request_id: 'test-uuid-1234',
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        stream: true
      })
    );
  });
  
  it('should throw an error if sending a message when not connected', () => {
    expect(() => {
      service.sendMessage({
        request_id: 'test',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }]
      });
    }).toThrow('WebSocket is not initialized');
  });
  
  it('should properly disconnect and clean up', () => {
    service.connect();
    mockWebSocket.simulateOpen();
    
    service.disconnect();
    
    expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Disconnect requested');
  });
  
  it('should properly reset connection', () => {
    service.connect();
    mockWebSocket.simulateOpen();
    
    // Clear mock counts
    vi.mocked(global.WebSocket).mockClear();
    
    service.resetConnection();
    
    // Should have closed the connection
    expect(mockWebSocket.close).toHaveBeenCalled();
    
    // Advance timer to trigger reconnect
    vi.advanceTimersByTime(100);
    
    // Should create a new connection
    expect(global.WebSocket).toHaveBeenCalledTimes(1);
  });
  
  it('should correctly report connection status', () => {
    expect(service.isConnected()).toBe(false);
    
    service.connect();
    expect(service.isConnected()).toBe(false);
    
    mockWebSocket.simulateOpen();
    expect(service.isConnected()).toBe(true);
    
    mockWebSocket.simulateClose();
    expect(service.isConnected()).toBe(false);
  });
}); 