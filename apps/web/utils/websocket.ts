import { WebSocketMessage } from "@/types/websocket";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a WebSocket message with the given parameters
 */
export function createWebSocketMessage(
  messages: WebSocketMessage["messages"],
  model: string,
  temperature?: number,
  stream?: boolean
): WebSocketMessage {
  return {
    request_id: uuidv4(),
    model,
    messages,
    temperature,
    stream
  };
}

/**
 * Calculate reconnection backoff time
 */
export function calculateBackoff(
  attempt: number, 
  minBackoff: number, 
  maxBackoff: number
): number {
  return Math.min(minBackoff * Math.pow(2, attempt), maxBackoff);
}

/**
 * Check if running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
} 