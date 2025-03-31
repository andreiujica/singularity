"use client";

import { v4 as uuidv4 } from "uuid";

interface WebSocketMessage {
  request_id: string;
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface WebSocketResponse {
  request_id: string;
  content: string;
  finished: boolean;
  error?: string;
}

type MessageHandler = (data: WebSocketResponse) => void;
type ErrorHandler = (error: Event | Error) => void;
type StateChangeHandler = () => void;

// Global event names
const WS_EVENT = {
  MESSAGE: 'websocket:message',
  ERROR: 'websocket:error',
  OPEN: 'websocket:open',
  CLOSE: 'websocket:close',
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private url: string;
  private isConnecting = false;

  constructor(url: string) {
    this.url = url;
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.clearReconnectTimeout();

    // Close any existing socket
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // Ignore errors during close
      }
      this.socket = null;
    }

    this.isConnecting = true;
    console.log(`Connecting to WebSocket: ${this.url}`);

    try {
      const socket = new WebSocket(this.url);
      this.socket = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.dispatchEvent(WS_EVENT.OPEN);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.debug("WebSocket received:", data);
          this.dispatchEvent(WS_EVENT.MESSAGE, data);
        } catch (error) {
          this.dispatchEvent(WS_EVENT.ERROR, new Error("Failed to parse WebSocket message"));
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.dispatchEvent(WS_EVENT.ERROR, error);
      };

      socket.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        this.isConnecting = false;
        this.socket = null;
        this.dispatchEvent(WS_EVENT.CLOSE);
        
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("WebSocket connection creation failed:", error);
      this.isConnecting = false;
      this.dispatchEvent(WS_EVENT.ERROR, error instanceof Error 
        ? error 
        : new Error("WebSocket connection failed"));
      
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached. Giving up.');
      return;
    }

    const backoffTime = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${backoffTime}ms`);
    
    this.clearReconnectTimeout();
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, backoffTime);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

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

  public resetConnection(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 100);
  }

  public sendMessage(message: WebSocketMessage): void {
    if (!this.socket) {
      throw new Error("WebSocket is not initialized");
    }
    
    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error(`WebSocket is not connected (state: ${this.socket.readyState})`);
    }

    this.socket.send(JSON.stringify(message));
  }

  public sendChatMessage(
    messages: WebSocketMessage["messages"], 
    model = "gpt-4o-mini", 
    temperature = 0.7
  ): string {
    const requestId = uuidv4();
    
    const message: WebSocketMessage = {
      request_id: requestId,
      model,
      messages,
      temperature,
      stream: true,
    };

    this.sendMessage(message);
    return requestId;
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private dispatchEvent(eventName: string, detail?: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  public onMessage(handler: MessageHandler): () => void {
    const wrappedHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handler(customEvent.detail);
    };
    
    window.addEventListener(WS_EVENT.MESSAGE, wrappedHandler);
    return () => window.removeEventListener(WS_EVENT.MESSAGE, wrappedHandler);
  }

  public onError(handler: ErrorHandler): () => void {
    const wrappedHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handler(customEvent.detail);
    };
    
    window.addEventListener(WS_EVENT.ERROR, wrappedHandler);
    return () => window.removeEventListener(WS_EVENT.ERROR, wrappedHandler);
  }

  public onOpen(handler: StateChangeHandler): () => void {
    window.addEventListener(WS_EVENT.OPEN, handler);
    return () => window.removeEventListener(WS_EVENT.OPEN, handler);
  }

  public onClose(handler: StateChangeHandler): () => void {
    window.addEventListener(WS_EVENT.CLOSE, handler);
    return () => window.removeEventListener(WS_EVENT.CLOSE, handler);
  }
}

// Create a singleton instance
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/api/v1/ws";
export const websocketService = new WebSocketService(WS_URL); 