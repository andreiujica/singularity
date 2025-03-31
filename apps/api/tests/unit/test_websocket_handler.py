import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.handlers.websocket import WebSocketHandler
from src.models.chat import ChatCompletionRequest, ChatMessage, StreamChunk


class TestWebSocketHandler:
    """Test suite for the WebSocketHandler class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.mock_openai_adapter = MagicMock()
        self.handler = WebSocketHandler(self.mock_openai_adapter)
        self.mock_websocket = MagicMock()
        self.mock_websocket.send_json = AsyncMock()
    
    @pytest.mark.asyncio
    async def test_send_chunk(self):
        """Test the send_chunk method."""
        # Test with minimal parameters
        await self.handler.send_chunk(
            self.mock_websocket,
            request_id="123",
            content="Hello",
            finished=False
        )
        
        # Verify that send_json was called correctly
        expected_data = StreamChunk(
            request_id="123",
            content="Hello",
            finished=False
        ).model_dump()
        self.mock_websocket.send_json.assert_called_once_with(expected_data)
        
        # Reset the mock and test with metrics
        self.mock_websocket.send_json.reset_mock()
        metrics = {"responseTime": 200, "length": 5}
        
        await self.handler.send_chunk(
            self.mock_websocket,
            request_id="456",
            content="World",
            finished=True,
            metrics=metrics
        )
        
        expected_data = StreamChunk(
            request_id="456",
            content="World",
            finished=True,
            metrics=metrics
        ).model_dump()
        self.mock_websocket.send_json.assert_called_once_with(expected_data)

    @pytest.mark.asyncio
    async def test_handle_error(self):
        """Test the handle_error method."""
        request_data = {"request_id": "123"}
        error = Exception("Test error")
        
        await self.handler.handle_error(self.mock_websocket, request_data, error)
        
        # Check that send_json was called with the correct error response
        self.mock_websocket.send_json.assert_called_once()
        called_arg = self.mock_websocket.send_json.call_args[0][0]
        assert called_arg["request_id"] == "123"
        assert called_arg["error"] == "Test error"
        
        # Test with missing request_id
        self.mock_websocket.send_json.reset_mock()
        await self.handler.handle_error(self.mock_websocket, {}, error)
        
        called_arg = self.mock_websocket.send_json.call_args[0][0]
        assert called_arg["request_id"] == "unknown"

    def test_prepare_metrics(self):
        """Test the _prepare_metrics method."""
        start_time = 1000.0  # Mock timestamp
        with patch('time.time', return_value=1001.0):  # 1 second later
            metrics = self.handler._prepare_metrics(start_time, 100)
            
            assert metrics["responseTime"] == 1000  # 1 second = 1000ms
            assert metrics["length"] == 100

    def test_format_messages_for_openai(self):
        """Test the _format_messages_for_openai method."""
        messages = [
            ChatMessage(role="system", content="You are an AI"),
            ChatMessage(role="user", content="Hello"),
            ChatMessage(role="assistant", content="Hi there")
        ]
        
        formatted = self.handler._format_messages_for_openai(messages)
        
        assert len(formatted) == 3
        assert formatted[0] == {"role": "system", "content": "You are an AI"}
        assert formatted[1] == {"role": "user", "content": "Hello"}
        assert formatted[2] == {"role": "assistant", "content": "Hi there"}

    @pytest.mark.asyncio
    async def test_process_stream(self):
        """Test the _process_stream method."""
        # Create mock OpenAI chunks
        mock_chunk1 = MagicMock()
        mock_chunk1.choices = [MagicMock()]
        mock_chunk1.choices[0].delta.content = "Hello"
        
        mock_chunk2 = MagicMock()
        mock_chunk2.choices = [MagicMock()]
        mock_chunk2.choices[0].delta.content = " World"
        
        mock_chunk3 = MagicMock()
        mock_chunk3.choices = [MagicMock()]
        mock_chunk3.choices[0].delta.content = ""  # Empty content shouldn't be sent
        
        # Create mock stream
        mock_stream = AsyncMock()
        mock_stream.__aiter__.return_value = [mock_chunk1, mock_chunk2, mock_chunk3]
        
        # Process the stream
        content = await self.handler._process_stream(self.mock_websocket, "123", mock_stream)
        
        # Verify results
        assert content == "Hello World"
        
        # The send_chunk should have been called twice (once for each non-empty chunk)
        assert self.mock_websocket.send_json.call_count == 2

    @pytest.mark.asyncio
    async def test_handle_chat_completion(self):
        """Test the handle_chat_completion method."""
        # Mock the OpenAI adapter
        mock_stream = AsyncMock()
        self.mock_openai_adapter.generate_chat_completion = AsyncMock(return_value=mock_stream)
        
        # Mock the _process_stream method
        with patch.object(self.handler, '_process_stream', AsyncMock(return_value="Generated content")) as mock_process:
            # Create a mock request
            chat_request = ChatCompletionRequest(
                request_id="123",
                model="gpt-4o-mini",
                messages=[ChatMessage(role="user", content="Hello")],
                stream=True
            )
            
            # Call the method
            result = await self.handler.handle_chat_completion(self.mock_websocket, chat_request)
            
            # Verify the result
            assert result == "Generated content"
            
            # Verify the adapter was called correctly
            self.mock_openai_adapter.generate_chat_completion.assert_called_once()
            
            # Verify _process_stream was called
            mock_process.assert_called_once()
            
            # Verify a final chunk was sent with metrics
            last_call = self.mock_websocket.send_json.call_args_list[-1]
            last_chunk = last_call[0][0]
            assert last_chunk["request_id"] == "123"
            assert last_chunk["finished"] is True
            assert "responseTime" in last_chunk["metrics"]
            assert last_chunk["metrics"]["length"] == len("Generated content")

    @pytest.mark.asyncio
    async def test_process_message_success(self):
        """Test the process_message method with successful processing."""
        # Mock handle_chat_completion
        self.handler.handle_chat_completion = AsyncMock()
        
        # Create valid request data
        request_data = {
            "request_id": "123",
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": "Hello"}]
        }
        
        # Call the method
        await self.handler.process_message(self.mock_websocket, json.dumps(request_data))
        
        # Verify handle_chat_completion was called
        self.handler.handle_chat_completion.assert_called_once()

    @pytest.mark.asyncio
    async def test_process_message_invalid_json(self):
        """Test the process_message method with invalid JSON."""
        # Mock handle_error
        self.handler.handle_error = AsyncMock()
        
        # Call with invalid JSON
        await self.handler.process_message(self.mock_websocket, "{invalid json}")
        
        # Verify handle_error was called
        self.handler.handle_error.assert_called_once()
        assert "Invalid JSON format" in str(self.handler.handle_error.call_args[0][2])

    @pytest.mark.asyncio
    async def test_process_message_validation_error(self):
        """Test the process_message method with invalid request data."""
        # Mock handle_error
        self.handler.handle_error = AsyncMock()
        
        # Call with invalid request (missing required fields)
        await self.handler.process_message(self.mock_websocket, '{"model": "gpt-4"}')
        
        # Verify handle_error was called
        self.handler.handle_error.assert_called_once() 