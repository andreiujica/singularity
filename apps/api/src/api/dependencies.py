"""Dependency injection for FastAPI."""
from fastapi import Depends

from src.adapters.openai import OpenAIAdapter
from src.handlers.websocket import WebSocketHandler



def get_open_ai_adapter() -> OpenAIAdapter:
    """Provide OpenAI adapter instance.
    
    Returns:
        An instance of the OpenAI adapter
    """
    return OpenAIAdapter()


def get_websocket_handler(
    openai_adapter: OpenAIAdapter = Depends(get_open_ai_adapter)
) -> WebSocketHandler:
    """Provide WebSocket handler instance with dependencies.
    
    Args:
        openai_adapter: Adapter for interacting with OpenAI
        
    Returns:
        An instance of the WebSocket handler
    """
    return WebSocketHandler(openai_adapter) 