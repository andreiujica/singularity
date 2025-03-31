from typing import List, Literal, Optional

from pydantic import BaseModel


class ChatMessage(BaseModel):
    """Represents a message in a chat conversation."""
    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    """Request model for chat completion API."""
    request_id: str
    model: str = "gpt-4o-mini"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None
    stream: bool = True


class StreamChunk(BaseModel):
    """Represents a chunk of streamed response data."""
    request_id: str
    content: str
    finished: bool
    metrics: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Response model for error conditions."""
    request_id: str
    error: str 