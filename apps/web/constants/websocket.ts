// Global event names
export const WS_EVENT = {
  MESSAGE: 'websocket:message',
  ERROR: 'websocket:error',
  OPEN: 'websocket:open',
  CLOSE: 'websocket:close',
};

// Default WebSocket URL
export const DEFAULT_WS_URL = "ws://localhost:8081/api/v1/ws";

// Reconnection configuration
export const RECONNECT_CONFIG = {
  MAX_ATTEMPTS: 5,
  MIN_BACKOFF: 1000,  // 1 second
  MAX_BACKOFF: 30000, // 30 seconds
};

// WebSocket states (mirroring the WebSocket constants)
export const WS_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}; 