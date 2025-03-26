#!/usr/bin/env python3
import asyncio
import json
import uuid
import sys
import websockets


async def test_websocket():
    """Test the WebSocket endpoint with OpenAI streaming."""
    uri = "ws://localhost:8081/api/v1/ws"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            # Generate a unique request ID
            request_id = str(uuid.uuid4())
            
            # Create a test message
            message = {
                "request_id": request_id,
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant. Keep responses brief."
                    },
                    {
                        "role": "user",
                        "content": "Tell me a short joke about programming."
                    }
                ],
                "temperature": 0.7
            }
            
            print(f"Sending request with ID: {request_id}")
            print("Prompt: Tell me a short joke about programming.")
            
            # Send the message
            await websocket.send(json.dumps(message))
            print("Request sent, waiting for response...")
            
            # Collect and print the streaming response
            print("\nResponse:")
            print("=========")
            complete_response = ""
            
            try:
                while True:
                    # Receive the next message with a timeout
                    response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                    response_data = json.loads(response)
                    
                    # Check for errors
                    if "error" in response_data:
                        print(f"\nError: {response_data['error']}")
                        break
                    
                    # Check if the stream is finished
                    if response_data.get("finished", False):
                        print("\nStream finished.")
                        break
                    
                    # Get and print the content
                    content = response_data.get("content", "")
                    if content:
                        complete_response += content
                        print(content, end="", flush=True)
            
            except asyncio.TimeoutError:
                print("\nTimeout: No response received within the time limit.")
            except websockets.exceptions.ConnectionClosedError as e:
                print(f"\nConnection closed: {e}")
            
            print("\n=========")
            print(f"Complete response: {complete_response}")
            print(f"Total length: {len(complete_response)} characters")
    
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = asyncio.run(test_websocket())
    if not success:
        sys.exit(1) 