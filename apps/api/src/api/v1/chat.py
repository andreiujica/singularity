"""Chat API endpoints for WebSocket communication."""
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from src.handlers.websocket import WebSocketHandler
from src.api.dependencies import get_websocket_handler
from src.utils.app_resources import logger

router = APIRouter(prefix="/api/v1")


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    handler: WebSocketHandler = Depends(get_websocket_handler)
):
    """WebSocket endpoint for chat completions with streaming responses."""
    await websocket.accept()
    
    try:
        while True:
            # Receive message from WebSocket
            data = await websocket.receive_text()
            
            # Process the message using our handler
            await handler.process_message(websocket, data)
    
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected") 