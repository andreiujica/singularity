import pytest
from typing import List

from src.models.chat import ChatMessage, ChatCompletionRequest, StreamChunk, ErrorResponse

def test_chat_message():
    """Test the ChatMessage model."""
    # Test with valid roles
    for role in ["system", "user", "assistant"]:
        message = ChatMessage(role=role, content="Test content")
        assert message.role == role
        assert message.content == "Test content"
    
    # Test with invalid role
    with pytest.raises(ValueError):
        ChatMessage(role="invalid", content="Test content")

def test_chat_completion_request():
    """Test the ChatCompletionRequest model."""
    messages = [
        ChatMessage(role="user", content="Hello"),
        ChatMessage(role="assistant", content="Hi there!")
    ]
    
    # Test with default values
    request = ChatCompletionRequest(request_id="123", messages=messages)
    assert request.request_id == "123"
    assert request.model == "gpt-4o-mini"
    assert request.messages == messages
    assert request.temperature == 0.7
    assert request.max_tokens is None
    assert request.stream is True
    
    # Test with custom values
    request = ChatCompletionRequest(
        request_id="456",
        model="gpt-4",
        messages=messages,
        temperature=0.5,
        max_tokens=100,
        stream=False
    )
    assert request.request_id == "456"
    assert request.model == "gpt-4"
    assert request.temperature == 0.5
    assert request.max_tokens == 100
    assert request.stream is False

def test_stream_chunk():
    """Test the StreamChunk model."""
    # Test with minimal fields
    chunk = StreamChunk(request_id="123", content="Text chunk", finished=False)
    assert chunk.request_id == "123"
    assert chunk.content == "Text chunk"
    assert chunk.finished is False
    assert chunk.metrics is None
    
    # Test with all fields
    metrics = {"tokens": 10, "time_ms": 200}
    chunk = StreamChunk(request_id="456", content="Last chunk", finished=True, metrics=metrics)
    assert chunk.request_id == "456"
    assert chunk.content == "Last chunk"
    assert chunk.finished is True
    assert chunk.metrics == metrics

def test_error_response():
    """Test the ErrorResponse model."""
    error = ErrorResponse(request_id="123", error="Something went wrong")
    assert error.request_id == "123"
    assert error.error == "Something went wrong" 