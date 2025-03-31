"use client";

import { v4 as uuidv4 } from "uuid";
import { 
  WebSocketMessage, 
  WebSocketResponse, 
  MessageHandler, 
  ErrorHandler, 
  StateChangeHandler 
} from "@/types/websocket";
import { 
  WS_EVENT, 
  DEFAULT_WS_URL, 
  RECONNECT_CONFIG,
  WS_STATE
} from "@/constants/websocket";
import { createWebSocketMessage, calculateBackoff, isBrowser } from "@/utils/websocket";

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = RECONNECT_CONFIG.MAX_ATTEMPTS;
  private url: string;
  private isConnecting = false;

  constructor(url: string = DEFAULT_WS_URL) {
    this.url = url;
  }

  /**
   * Attempt to establish a WebSocket connection
   */
  public connect(): void {
    // Don't try to connect if we're already connected or connecting
    if (this.socket?.readyState === WS_STATE.OPEN || this.isConnecting) {
      return;
    }

    this.clearReconnectTimeout();

    // Clean up any existing socket
    this.cleanupExistingSocket();

    this.isConnecting = true;
    console.log(`Connecting to WebSocket: ${this.url}`);

    try {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      this.attachSocketEventHandlers(socket);
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * Clean up existing socket connection
   */
  private cleanupExistingSocket(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // Ignore errors during close
      }
      this.socket = null;
    }
  }

  /**
   * Attach event handlers to the socket
   */
  private attachSocketEventHandlers(socket: WebSocket): void {
    socket.onopen = this.handleSocketOpen.bind(this);
    socket.onmessage = this.handleSocketMessage.bind(this);
    socket.onerror = this.handleSocketError.bind(this);
    socket.onclose = this.handleSocketClose.bind(this);
  }

  /**
   * Handle socket open event
   */
  private handleSocketOpen(): void {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.dispatchEvent(WS_EVENT.OPEN);
  }

  /**
   * Handle socket message event
   */
  private handleSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.debug("WebSocket received:", data);
      this.dispatchEvent(WS_EVENT.MESSAGE, data);
    } catch (error) {
      this.dispatchEvent(WS_EVENT.ERROR, new Error("Failed to parse WebSocket message"));
    }
  }

  /**
   * Handle socket error event
   */
  private handleSocketError(error: Event): void {
    console.error("WebSocket error:", error);
    this.isConnecting = false;
    this.dispatchEvent(WS_EVENT.ERROR, error);
  }

  /**
   * Handle socket close event
   */
  private handleSocketClose(event: CloseEvent): void {
    console.log(`WebSocket closed: ${event.code} ${event.reason}`);
    this.isConnecting = false;
    this.socket = null;
    this.dispatchEvent(WS_EVENT.CLOSE);
    
    this.scheduleReconnect();
  }

  /**
   * Handle connection creation error
   */
  private handleConnectionError(error: unknown): void {
    console.error("WebSocket connection creation failed:", error);
    this.isConnecting = false;
    this.dispatchEvent(WS_EVENT.ERROR, error instanceof Error 
      ? error 
      : new Error("WebSocket connection failed"));
    
    this.scheduleReconnect();
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached. Giving up.');
      return;
    }

    const backoffTime = calculateBackoff(
      this.reconnectAttempts, 
      RECONNECT_CONFIG.MIN_BACKOFF, 
      RECONNECT_CONFIG.MAX_BACKOFF
    );
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${backoffTime}ms`);
    
    this.clearReconnectTimeout();
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, backoffTime);
  }

  /**
   * Clear any pending reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Disconnect the WebSocket
   */
  public disconnect(): void {
    this.clearReconnectTimeout();
    this.reconnectAttempts = 0;
    
    if (this.socket) {
      try {
        this.socket.close(1000, "Disconnect requested");
      } catch (e) {
        // Ignore errors during close
      }
      this.socket = null;
    }
  }

  /**
   * Reset the connection (disconnect and reconnect)
   */
  public resetConnection(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 100);
  }

  /**
   * Send a raw WebSocket message
   */
  public sendMessage(message: WebSocketMessage): void {
    if (!this.socket) {
      throw new Error("WebSocket is not initialized");
    }
    
    if (this.socket.readyState !== WS_STATE.OPEN) {
      throw new Error(`WebSocket is not connected (state: ${this.socket.readyState})`);
    }

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Send a chat message and return the request ID
   */
  public sendChatMessage(
    messages: WebSocketMessage["messages"], 
    model = "gpt-4o-mini", 
    temperature = 0.7
  ): string {
    const message = createWebSocketMessage(messages, model, temperature, true);
    this.sendMessage(message);
    return message.request_id;
  }

  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WS_STATE.OPEN;
  }

  /**
   * Dispatch a custom event
   */
  private dispatchEvent(eventName: string, detail?: any): void {
    if (isBrowser()) {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  /**
   * Register a message handler
   */
  public onMessage(handler: MessageHandler): () => void {
    const wrappedHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handler(customEvent.detail);
    };
    
    window.addEventListener(WS_EVENT.MESSAGE, wrappedHandler);
    return () => window.removeEventListener(WS_EVENT.MESSAGE, wrappedHandler);
  }

  /**
   * Register an error handler
   */
  public onError(handler: ErrorHandler): () => void {
    const wrappedHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handler(customEvent.detail);
    };
    
    window.addEventListener(WS_EVENT.ERROR, wrappedHandler);
    return () => window.removeEventListener(WS_EVENT.ERROR, wrappedHandler);
  }

  /**
   * Register an open handler
   */
  public onOpen(handler: StateChangeHandler): () => void {
    window.addEventListener(WS_EVENT.OPEN, handler);
    return () => window.removeEventListener(WS_EVENT.OPEN, handler);
  }

  /**
   * Register a close handler
   */
  public onClose(handler: StateChangeHandler): () => void {
    window.addEventListener(WS_EVENT.CLOSE, handler);
    return () => window.removeEventListener(WS_EVENT.CLOSE, handler);
  }
}

// Create a singleton instance
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS_URL;
export const websocketService = new WebSocketService(WS_URL); 