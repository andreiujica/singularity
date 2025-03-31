"""Adapter for interacting with the OpenAI API."""
from enum import Enum
from typing import AsyncGenerator, Dict, List, Literal, Optional, Union, Any
import logging

from openai import AsyncOpenAI, APIError
from openai.types.chat import ChatCompletionChunk

from src.settings import Settings

# Configure logger
logger = logging.getLogger(__name__)


class OpenAIModel(str, Enum):
    """Supported OpenAI models."""
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    O3_MINI = "o3-mini"


class OpenAIAdapter:
    """Adapter for interacting with the OpenAI API."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the OpenAI adapter with an API key.
        
        Args:
            api_key: OpenAI API key, defaults to the one in settings
        """
        settings_instance = Settings()
        self.api_key = api_key or settings_instance.OPENAI_API_KEY
        self.client = AsyncOpenAI(api_key=self.api_key)

    def _prepare_completion_params(
        self,
        messages: List[Dict[str, str]],
        model: Union[str, OpenAIModel],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = True,
    ) -> Dict[str, Any]:
        """
        Prepare parameters for a chat completion based on the specified model.
        
        Args:
            messages: List of message objects with role and content
            model: The model to use for generation
            temperature: Controls randomness (higher = more random)
            max_tokens: Maximum number of tokens to generate
            stream: Whether to stream the response
            
        Returns:
            Dictionary of parameters for the API call
        """
        # Convert enum to string if needed
        model_name = model.value if isinstance(model, OpenAIModel) else model
        
        # Common parameters for all models
        params = {
            "model": model_name,
            "messages": messages,
            "stream": stream,
        }
        
        # Model-specific parameter handling
        is_o3_mini = model_name == OpenAIModel.O3_MINI.value
        
        # Add token limit parameter with the appropriate key
        if max_tokens is not None:
            params["max_completion_tokens" if is_o3_mini else "max_tokens"] = max_tokens
        elif is_o3_mini:
            params["max_completion_tokens"] = 4096  # Default for o3-mini
            
        # Add temperature only for non-o3-mini models
        if not is_o3_mini:
            params["temperature"] = temperature
            
        return params

    async def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Union[str, OpenAIModel] = OpenAIModel.GPT_4O_MINI,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = True,
    ) -> AsyncGenerator[ChatCompletionChunk, None]:
        """
        Generate a chat completion from OpenAI.
        
        Args:
            messages: List of message objects with role and content
            model: The model to use for generation (can be string or enum)
            temperature: Controls randomness (higher = more random)
            max_tokens: Maximum number of tokens to generate
            stream: Whether to stream the response
            
        Returns:
            An async generator yielding completion chunks
            
        Raises:
            APIError: When the OpenAI API returns an error
        """
        try:
            params = self._prepare_completion_params(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            
            return await self.client.chat.completions.create(**params)
        except APIError as e:
            logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
            raise 