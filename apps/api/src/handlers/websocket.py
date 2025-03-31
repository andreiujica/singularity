import json
import time
from typing import Any, Dict, List, Optional

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect
from openai.types.chat import ChatCompletionChunk

from src.models.chat import ChatCompletionRequest, ChatMessage, ErrorResponse, StreamChunk
from src.adapters.openai import OpenAIAdapter
from src.utils.app_resources import logger


class WebSocketHandler:
    """Handler for WebSocket operations related to chat completion."""

    def __init__(self, openai_adapter: OpenAIAdapter):
        """Initialize the WebSocket handler with dependencies.
        
        Args:
            openai_adapter: Adapter for interacting with the OpenAI API
        """
        self.openai_adapter = openai_adapter

    async def send_chunk(
        self,
        websocket: WebSocket, 
        request_id: str, 
        content: str, 
        finished: bool,
        metrics: Optional[Dict[str, Any]] = None
    ) -> None:
        """Send a chunk of the response to the WebSocket client.
        
        Args:
            websocket: The active WebSocket connection
            request_id: Unique identifier for the request
            content: Text content to send to the client
            finished: Flag indicating if this is the final chunk
            metrics: Optional performance metrics to include
        """
        try:
            await websocket.send_json(
                StreamChunk(
                    request_id=str(request_id),
                    content=content,
                    finished=finished,
                    metrics=metrics
                ).model_dump()
            )
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected during send for request {request_id}")
            raise
        except Exception as e:
            logger.error(f"Error sending chunk to WebSocket for request {request_id}: {str(e)}")
            raise

    async def handle_error(
        self,
        websocket: WebSocket, 
        request_data: Dict[str, Any], 
        error: Exception
    ) -> None:
        """Handle errors during request processing.
        
        Args:
            websocket: The active WebSocket connection
            request_data: The original request data
            error: The exception that was raised
        """
        logger.error(f"Error processing request: {str(error)}")
        request_id = request_data.get("request_id", "unknown")
        
        # Ensure request_id is a string
        request_id = str(request_id) if hasattr(request_id, "__str__") else "unknown"
        
        error_response = ErrorResponse(
            request_id=request_id,
            error=str(error)
        )
        
        try:
            await websocket.send_json(error_response.model_dump())
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected during error handling for request {request_id}")
        except RuntimeError as re:
            # This happens when trying to send after connection is closed
            logger.info(f"Cannot send error response: {str(re)}")
        except Exception as e:
            logger.error(f"Error sending error response for request {request_id}: {str(e)}")

    def _prepare_metrics(self, start_time: float, content_length: int) -> Dict[str, int]:
        """Calculate performance metrics for the request.
        
        Args:
            start_time: Timestamp when processing started
            content_length: Length of the generated content
            
        Returns:
            Dictionary containing performance metrics
        """
        response_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        return {
            "responseTime": response_time,
            "length": content_length
        }
    
    def _format_messages_for_openai(self, messages: List[ChatMessage]) -> List[Dict[str, str]]:
        """Convert our message models to the format OpenAI expects.
        
        Args:
            messages: List of ChatMessage objects
            
        Returns:
            List of dictionaries in OpenAI's expected format
        """
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    async def handle_chat_completion(
        self,
        websocket: WebSocket,
        chat_request: ChatCompletionRequest
    ) -> Optional[str]:
        """Process chat completion request and handle streaming response.
        
        Args:
            websocket: The active WebSocket connection
            chat_request: The validated chat completion request
            
        Returns:
            The complete generated content if successful, None otherwise
            
        Raises:
            Exception: Any error that occurs during processing is logged and re-raised
        """
        try:
            start_time = time.time()
            
            # Convert our message models to the format OpenAI expects
            messages = self._format_messages_for_openai(chat_request.messages)
            
            # Get streaming response from OpenAI
            stream = await self.openai_adapter.generate_chat_completion(
                messages=messages,
                model=chat_request.model,
                temperature=chat_request.temperature,
                max_tokens=chat_request.max_tokens,
                stream=True
            )
            
            # Process the streaming response
            collected_content = await self._process_stream(websocket, chat_request.request_id, stream)
            
            # Check if connection is still active before sending final message
            metrics = self._prepare_metrics(start_time, len(collected_content))
            try:
                await self.send_chunk(
                    websocket,
                    chat_request.request_id,
                    "",
                    True,
                    metrics
                )
                
                # Log completion
                logger.info(f"Completed streaming response for request {chat_request.request_id} in {metrics['responseTime']}ms with {metrics['length']} chars")
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected before final message for request {chat_request.request_id}")
            
            return collected_content
            
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected during chat completion for request {chat_request.request_id}")
            return None
        except Exception as e:
            logger.error(f"Error in chat completion: {str(e)}")
            raise

    async def _process_stream(
        self, 
        websocket: WebSocket, 
        request_id: str, 
        stream: Any
    ) -> str:
        """Process the streaming response from OpenAI.
        
        Args:
            websocket: The active WebSocket connection
            request_id: Unique identifier for the request
            stream: The async stream from OpenAI
            
        Returns:
            The complete collected content from all chunks
        """
        collected_content = ""
        try:
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    collected_content += content
                    
                    # Send the chunk to the client
                    await self.send_chunk(
                        websocket, 
                        request_id, 
                        content, 
                        False
                    )
            
            return collected_content
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected during streaming for request {request_id}")
            # Return what we collected so far
            return collected_content
        except Exception as e:
            logger.error(f"Error processing stream for request {request_id}: {str(e)}")
            raise

    async def process_message(
        self,
        websocket: WebSocket,
        data: str
    ) -> None:
        """Process a message received from the client.
        
        Args:
            websocket: The active WebSocket connection
            data: The raw JSON string from the client
        """
        request_data = {}
        try:
            # Parse the incoming JSON data
            request_data = json.loads(data)
            chat_request = ChatCompletionRequest(**request_data)
            
            # Handle the chat completion
            await self.handle_chat_completion(websocket, chat_request)
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {str(e)}")
            await self.handle_error(websocket, request_data, Exception("Invalid JSON format"))
        except WebSocketDisconnect:
            # No need to handle error for a disconnected client
            logger.info("WebSocket client disconnected during message processing")
        except Exception as e:
            await self.handle_error(websocket, request_data, e) 