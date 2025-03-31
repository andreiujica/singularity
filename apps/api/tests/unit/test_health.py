import pytest
from starlette import status

from src.api.health import health_endpoint

def test_health_endpoint():
    """Test the health endpoint returns OK"""
    response = health_endpoint()
    assert response == "OK" 