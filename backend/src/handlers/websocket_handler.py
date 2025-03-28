import json
import time
from typing import Any, Dict, Optional

from fastapi import WebSocket
from openai.types.chat import ChatCompletionChunk

from src.models.chat import ChatCompletionRequest, ErrorResponse, StreamChunk
from src.services.openai_service import OpenAIService
from src.utils.app_resources import logger


class WebSocketHandler:
    """Handler for WebSocket operations related to chat completion."""

    def __init__(self, openai_service: OpenAIService):
        """Initialize the WebSocket handler with dependencies.
        
        Args:
            openai_service: Service for interacting with the OpenAI API
        """
        self.openai_service = openai_service

    async def send_chunk(
        self,
        websocket: WebSocket, 
        request_id: str, 
        content: str, 
        finished: bool,
        metrics: Optional[dict] = None
    ) -> None:
        """Send a chunk of the response to the WebSocket client."""
        await websocket.send_json(
            StreamChunk(
                request_id=str(request_id),
                content=content,
                finished=finished,
                metrics=metrics
            ).model_dump()
        )

    async def handle_error(
        self,
        websocket: WebSocket, 
        request_data: Dict[str, Any], 
        error: Exception
    ) -> None:
        """Handle errors during request processing."""
        logger.error(f"Error processing request: {str(error)}")
        request_id = request_data.get("request_id", "unknown")
        
        # Ensure request_id is a string
        if hasattr(request_id, "__str__"):
            request_id = str(request_id)
            
        error_response = ErrorResponse(
            request_id=request_id,
            error=str(error)
        )
        await websocket.send_json(error_response.model_dump())

    async def handle_chat_completion(
        self,
        websocket: WebSocket,
        chat_request: ChatCompletionRequest
    ) -> Optional[str]:
        """Process chat completion request and handle streaming response."""
        try:
            # Start timing
            start_time = time.time()
            
            # Convert our message models to the format OpenAI expects
            messages = [{"role": msg.role, "content": msg.content} for msg in chat_request.messages]
            
            # Get streaming response from OpenAI
            stream = await self.openai_service.generate_chat_completion(
                messages=messages,
                model=chat_request.model,
                temperature=chat_request.temperature,
                max_tokens=chat_request.max_tokens,
                stream=True
            )
            
            # Process the streaming response
            collected_content = ""
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    collected_content += content
                    
                    # Send the chunk to the client
                    await self.send_chunk(
                        websocket, 
                        chat_request.request_id, 
                        content, 
                        False
                    )
            
            # Calculate metrics
            response_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
            content_length = len(collected_content)
            
            metrics = {
                "responseTime": response_time,
                "length": content_length
            }
            
            # Send a final message to indicate completion with metrics
            await self.send_chunk(
                websocket,
                chat_request.request_id,
                "",
                True,
                metrics
            )
            
            # Log completion
            logger.info(f"Completed streaming response for request {chat_request.request_id} in {response_time}ms with {content_length} chars")
            return collected_content
            
        except Exception as e:
            logger.error(f"Error in chat completion: {str(e)}")
            raise

    async def process_message(
        self,
        websocket: WebSocket,
        data: str
    ) -> None:
        """Process a message received from the client."""
        try:
            # Parse the incoming JSON data
            request_data = json.loads(data)
            chat_request = ChatCompletionRequest(**request_data)
            
            # Handle the chat completion
            await self.handle_chat_completion(websocket, chat_request)
            
        except Exception as e:
            # Parse request_data if possible, otherwise use empty dict
            request_data = {}
            try:
                request_data = json.loads(data)
            except:
                pass
                
            await self.handle_error(websocket, request_data, e) 