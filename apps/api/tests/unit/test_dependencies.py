import pytest
from unittest.mock import MagicMock, patch

from src.api.dependencies import get_open_ai_adapter, get_websocket_handler
from src.adapters.openai import OpenAIAdapter
from src.handlers.websocket import WebSocketHandler

def test_get_open_ai_adapter():
    """Test the get_open_ai_adapter dependency."""
    adapter = get_open_ai_adapter()
    assert isinstance(adapter, OpenAIAdapter)

@patch('src.api.dependencies.OpenAIAdapter')
def test_get_websocket_handler(mock_openai_adapter):
    """Test the get_websocket_handler dependency."""
    # Create a mock adapter
    mock_adapter = MagicMock()
    
    # Test with passed adapter
    handler = get_websocket_handler(mock_adapter)
    assert isinstance(handler, WebSocketHandler)
    
    # Test with default dependencies
    mock_openai_adapter.return_value = mock_adapter
    handler = get_websocket_handler()
    assert isinstance(handler, WebSocketHandler) 