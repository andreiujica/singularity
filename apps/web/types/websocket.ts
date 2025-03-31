export interface WebSocketMessage {
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

export interface WebSocketResponse {
  request_id: string;
  content: string;
  finished: boolean;
  error?: string;
}

export type MessageHandler = (data: WebSocketResponse) => void;
export type ErrorHandler = (error: Event | Error) => void;
export type StateChangeHandler = () => void; 