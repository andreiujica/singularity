import pytest
from unittest.mock import patch, MagicMock
import os

from src.settings import Settings

@patch.dict(os.environ, {
    "API_NAME": "Test API",
    "API_VERSION": "1.0.0",
    "API_DESCRIPTION": "Test Description",
    "LOGGING_LEVEL": "INFO",
    "OPENAI_API_KEY": "test-api-key"
})
def test_settings_from_env():
    """Test settings are loaded correctly from environment variables."""
    settings = Settings()
    
    assert settings.API_NAME == "Test API"
    assert settings.API_VERSION == "1.0.0"
    assert settings.API_DESCRIPTION == "Test Description"
    assert settings.LOGGING_LEVEL == "INFO"
    assert settings.OPENAI_API_KEY == "test-api-key"

def test_settings_validation():
    """Test settings validation."""
    # Valid logging level
    settings = Settings(
        API_NAME="Test",
        API_VERSION="1.0",
        API_DESCRIPTION="Test",
        LOGGING_LEVEL="DEBUG",
        OPENAI_API_KEY="key"
    )
    assert settings.LOGGING_LEVEL == "DEBUG"
    
    # Invalid logging level
    with pytest.raises(ValueError):
        Settings(
            API_NAME="Test",
            API_VERSION="1.0",
            API_DESCRIPTION="Test",
            LOGGING_LEVEL="INVALID",
            OPENAI_API_KEY="key"
        )

def test_settings_singleton():
    """Test the settings singleton instance."""
    from src.settings import settings
    
    assert isinstance(settings, Settings)
    
    # The settings instance should be the same when imported multiple times
    with patch.dict(os.environ, {
        "API_NAME": "Modified API",
        "API_VERSION": "1.0.0",
        "API_DESCRIPTION": "Test Description",
        "LOGGING_LEVEL": "INFO",
        "OPENAI_API_KEY": "test-api-key"
    }):
        from importlib import reload
        from src import settings as settings_module
        reload(settings_module)
        from src.settings import settings as reloaded_settings
        
        assert reloaded_settings.API_NAME == "Modified API" 