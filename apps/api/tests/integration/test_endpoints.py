import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock

from src.main import application
from src.models.chat import ChatMessage

client = TestClient(application)

def test_health_endpoint():
    """Test the health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.text == '"OK"'

def test_websocket_connection():
    """Test that the WebSocket endpoint accepts connections."""
    with client.websocket_connect("/api/v1/ws") as websocket:
        # If we get here without an exception, the connection was accepted
        assert True

@patch('src.handlers.websocket.WebSocketHandler.handle_chat_completion')
def test_websocket_chat_request(mock_handle_chat_completion):
    """Test sending a chat request through WebSocket."""
    # Setup mock to handle the request
    async def async_mock(*args, **kwargs):
        return "Generated response"
    
    mock_handle_chat_completion.side_effect = async_mock
    
    # Create test request
    request_data = {
        "request_id": "test-123",
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "user", "content": "Hello, world!"}
        ]
    }
    
    with client.websocket_connect("/api/v1/ws") as websocket:
        # Send request data
        websocket.send_text(json.dumps(request_data))
        
        # We don't need to receive anything since we've mocked the handler
        # The test is successful if the WebSocket connection remains open
        # Verify the handler was called with the expected arguments
        mock_handle_chat_completion.assert_called_once()
        call_args = mock_handle_chat_completion.call_args
        
        # The first argument should be the websocket
        assert call_args[0][0] is not None
        
        # The second argument should be the chat request
        chat_request = call_args[0][1]
        assert chat_request.request_id == "test-123"
        assert chat_request.model == "gpt-4o-mini"
        assert len(chat_request.messages) == 1
        assert chat_request.messages[0].role == "user"
        assert chat_request.messages[0].content == "Hello, world!"

def test_websocket_invalid_request():
    """Test sending an invalid request through WebSocket."""
    # Instead of trying to mock internal methods, we'll use the actual client behavior
    # and just verify the error response from the WebSocket
    with client.websocket_connect("/api/v1/ws") as websocket:
        # Send invalid JSON
        websocket.send_text("{invalid json}")
        
        # We should receive an error response
        response = websocket.receive_json()
        
        # The response should be an error message
        assert "error" in response
        assert "Invalid JSON" in response["error"]
        assert "request_id" in response  # Should have request_id even for errors

@patch('src.adapters.openai.OpenAIAdapter.generate_chat_completion')
def test_websocket_end_to_end(mock_generate):
    """Test a complete WebSocket chat flow from request to response."""
    # Create mock OpenAI response chunks
    chunk1 = MagicMock()
    chunk1.choices = [MagicMock()]
    chunk1.choices[0].delta.content = "Hello"
    
    chunk2 = MagicMock()
    chunk2.choices = [MagicMock()]
    chunk2.choices[0].delta.content = " world!"
    
    chunk3 = MagicMock()
    chunk3.choices = [MagicMock()]
    chunk3.choices[0].delta.content = ""
    
    # Setup mock to return an async generator
    async def mock_generator(*args, **kwargs):
        yield chunk1
        yield chunk2
        yield chunk3
    
    mock_generate.return_value = mock_generator()
    
    # Create test request
    request_data = {
        "request_id": "test-456",
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say hello!"}
        ]
    }
    
    with client.websocket_connect("/api/v1/ws") as websocket:
        # Send request
        websocket.send_text(json.dumps(request_data))
        
        # We should receive 3 responses:
        # 1. First chunk: "Hello"
        # 2. Second chunk: " world!"
        # 3. Final message with metrics
        
        # First chunk
        response1 = websocket.receive_json()
        assert response1["request_id"] == "test-456"
        assert response1["content"] == "Hello"
        assert response1["finished"] is False
        
        # Second chunk
        response2 = websocket.receive_json()
        assert response2["request_id"] == "test-456"
        assert response2["content"] == " world!"
        assert response2["finished"] is False
        
        # Final message with metrics
        response3 = websocket.receive_json()
        assert response3["request_id"] == "test-456"
        assert response3["content"] == ""
        assert response3["finished"] is True
        assert "metrics" in response3
        assert "responseTime" in response3["metrics"]
        assert response3["metrics"]["length"] == len("Hello world!")