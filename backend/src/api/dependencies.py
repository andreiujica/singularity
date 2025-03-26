"""Dependency injection for FastAPI."""
from fastapi import Depends

from src.handlers.websocket_handler import WebSocketHandler
from src.services.openai_service import OpenAIService


def get_openai_service() -> OpenAIService:
    """Provide OpenAI service instance.
    
    Returns:
        An instance of the OpenAI service
    """
    return OpenAIService()


def get_websocket_handler(
    openai_service: OpenAIService = Depends(get_openai_service)
) -> WebSocketHandler:
    """Provide WebSocket handler instance with dependencies.
    
    Args:
        openai_service: Service for interacting with OpenAI
        
    Returns:
        An instance of the WebSocket handler
    """
    return WebSocketHandler(openai_service) 