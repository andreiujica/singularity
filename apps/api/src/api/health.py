"""Health check endpoint for the API."""
from fastapi import APIRouter
from starlette import status

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK, include_in_schema=False)
def health_endpoint() -> str:
    """Check if the API is up and running.
    
    Returns:
        String indicating the API is operational
    """
    return "OK" 