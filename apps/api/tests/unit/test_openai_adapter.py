import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.adapters.openai import OpenAIAdapter, OpenAIModel


def test_openai_model_enum():
    """Test the OpenAIModel enum."""
    assert OpenAIModel.GPT_4O.value == "gpt-4o"
    assert OpenAIModel.GPT_4O_MINI.value == "gpt-4o-mini"
    assert OpenAIModel.O3_MINI.value == "o3-mini"


class TestOpenAIAdapter:
    """Test suite for the OpenAIAdapter class."""
    
    @patch('src.adapters.openai.AsyncOpenAI')
    @patch('src.adapters.openai.Settings')
    def test_init_with_default_api_key(self, mock_settings, mock_async_openai):
        """Test initialization with the default API key from settings."""
        # Setup mock
        mock_settings_instance = MagicMock()
        mock_settings_instance.OPENAI_API_KEY = "test-api-key"
        mock_settings.return_value = mock_settings_instance
        
        # Initialize adapter
        adapter = OpenAIAdapter()
        
        # Verify
        assert adapter.api_key == "test-api-key"
        mock_async_openai.assert_called_once_with(api_key="test-api-key")
    
    @patch('src.adapters.openai.AsyncOpenAI')
    def test_init_with_custom_api_key(self, mock_async_openai):
        """Test initialization with a custom API key."""
        adapter = OpenAIAdapter(api_key="custom-api-key")
        
        assert adapter.api_key == "custom-api-key"
        mock_async_openai.assert_called_once_with(api_key="custom-api-key")
    
    def test_prepare_completion_params_with_model_enum(self):
        """Test the _prepare_completion_params method with a model enum."""
        adapter = OpenAIAdapter(api_key="dummy")
        
        messages = [{"role": "user", "content": "Hello"}]
        params = adapter._prepare_completion_params(
            messages=messages,
            model=OpenAIModel.GPT_4O,
            temperature=0.5,
            max_tokens=100,
            stream=True
        )
        
        assert params["model"] == "gpt-4o"
        assert params["messages"] == messages
        assert params["temperature"] == 0.5
        assert params["max_tokens"] == 100
        assert params["stream"] is True
    
    def test_prepare_completion_params_with_model_string(self):
        """Test the _prepare_completion_params method with a model string."""
        adapter = OpenAIAdapter(api_key="dummy")
        
        messages = [{"role": "user", "content": "Hello"}]
        params = adapter._prepare_completion_params(
            messages=messages,
            model="gpt-4",
            temperature=0.8,
            max_tokens=200,
            stream=False
        )
        
        assert params["model"] == "gpt-4"
        assert params["messages"] == messages
        assert params["temperature"] == 0.8
        assert params["max_tokens"] == 200
        assert params["stream"] is False
    
    def test_prepare_completion_params_for_o3_mini(self):
        """Test the _prepare_completion_params method for o3-mini model."""
        adapter = OpenAIAdapter(api_key="dummy")
        
        messages = [{"role": "user", "content": "Hello"}]
        params = adapter._prepare_completion_params(
            messages=messages,
            model=OpenAIModel.O3_MINI,
            temperature=0.7,  # This should be ignored for o3-mini
            max_tokens=300,
            stream=True
        )
        
        assert params["model"] == "o3-mini"
        assert params["messages"] == messages
        assert "temperature" not in params  # Temperature shouldn't be used for o3-mini
        assert params["max_completion_tokens"] == 300  # Should use max_completion_tokens
        assert params["stream"] is True
    
    def test_prepare_completion_params_for_o3_mini_no_max_tokens(self):
        """Test the _prepare_completion_params for o3-mini without max_tokens."""
        adapter = OpenAIAdapter(api_key="dummy")
        
        messages = [{"role": "user", "content": "Hello"}]
        params = adapter._prepare_completion_params(
            messages=messages,
            model=OpenAIModel.O3_MINI,
            stream=True
        )
        
        assert params["model"] == "o3-mini"
        assert params["messages"] == messages
        assert params["max_completion_tokens"] == 4096  # Default value

    @pytest.mark.asyncio
    @patch('src.adapters.openai.AsyncOpenAI')
    async def test_generate_chat_completion(self, mock_async_openai):
        """Test the generate_chat_completion method."""
        # Setup mock
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock()
        mock_async_openai.return_value = mock_client
        
        # Initialize adapter
        adapter = OpenAIAdapter(api_key="test-key")
        
        # Test generating completion
        messages = [{"role": "user", "content": "Hello"}]
        await adapter.generate_chat_completion(
            messages=messages,
            model=OpenAIModel.GPT_4O_MINI,
            temperature=0.7,
            max_tokens=100,
            stream=True
        )
        
        # Verify correct parameters were passed
        mock_client.chat.completions.create.assert_called_once_with(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=100,
            stream=True
        )

    @pytest.mark.asyncio
    @patch('src.adapters.openai.AsyncOpenAI')
    @patch('src.adapters.openai.logger')
    async def test_generate_chat_completion_error(self, mock_logger, mock_async_openai):
        """Test error handling in generate_chat_completion."""
        # Setup mock to raise an error
        mock_client = MagicMock()
        mock_client.chat.completions.create = AsyncMock(side_effect=Exception("API error"))
        mock_async_openai.return_value = mock_client
        
        # Initialize adapter
        adapter = OpenAIAdapter(api_key="test-key")
        
        # Test error handling
        messages = [{"role": "user", "content": "Hello"}]
        with pytest.raises(Exception):
            await adapter.generate_chat_completion(messages=messages) 