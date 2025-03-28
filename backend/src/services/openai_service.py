"""Service for interacting with the OpenAI API."""
from typing import AsyncGenerator, Dict, List, Optional

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionChunk

from src.settings import Settings

settings = Settings()


class OpenAIService:
    """Service for interacting with the OpenAI API."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the OpenAI service with an API key.
        
        Args:
            api_key: OpenAI API key, defaults to the one in settings
        """
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.client = AsyncOpenAI(api_key=self.api_key)

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = True,
    ) -> AsyncGenerator[ChatCompletionChunk, None]:
        """
        Generate a chat completion from OpenAI.
        
        Args:
            messages: List of message objects with role and content
            model: The model to use for generation
            temperature: Controls randomness (higher = more random)
            max_tokens: Maximum number of tokens to generate
            stream: Whether to stream the response
            
        Returns:
            An async generator yielding completion chunks
        """
        # Common parameters for all models
        params = {
            "model": model,
            "messages": messages,
            "stream": stream,
        }
        
        # o3-mini has different parameter requirements
        if model == "o3-mini":
            # o3-mini doesn't support temperature
            # Uses max_completion_tokens instead of max_tokens
            if max_tokens is not None:
                params["max_completion_tokens"] = max_tokens
            else:
                params["max_completion_tokens"] = 4096  # Default value
        else:
            # For other models (like gpt-4o series)
            params["temperature"] = temperature
            params["max_tokens"] = max_tokens
            
        return await self.client.chat.completions.create(**params) 