from fastapi import WebSocket, APIRouter,Depends
import json
import asyncio
from aetherium.core.logger import logger

class NotificationManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected to WebSocket.")
    
    async def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from WebSocket.")
    
    async def send_notification(self, user_id: int, notification: dict):
        if user_id in self.active_connections:
            try:
                websocket = self.active_connections[user_id]
                await websocket.send_text(json.dumps(notification))
                logger.info(f"Notification sent to user {user_id}")
            except Exception as e:
                logger.error(f"Failed to send notification to user {user_id}: {e}")
                # Remove the connection if it's broken
                await self.disconnect(user_id)
        else:
            logger.warning(f"User {user_id} is not connected. Notification skipped.")
    
    async def send_chat_message(self, user_id: int, message: dict):
        """Send chat message to specific user"""
        user_id = int(user_id)
        if user_id in self.active_connections:
            try:
                logger.info(f"user sending message {user_id}")
                websocket = self.active_connections[user_id]
                chat_data = {
                    "type": "chat_message",
                    "data": message
                }
                await websocket.send_text(json.dumps(chat_data))
                logger.info(f"Chat message sent to user {user_id}")
            except Exception as e:
                logger.error(f"Failed to send chat message to user {user_id}: {e}")
                await self.disconnect(user_id)
        else:
            logger.warning(f"User {user_id} is not connected. Chat message skipped.")

    async def send_typing_indicator(self, user_id: int, typing_data: dict):
        """Send typing indicator to specific user"""
        user_id = int(user_id)
        if user_id in self.active_connections:
            try:
                websocket = self.active_connections[user_id]
                typing_message = {
                    "type": typing_data.get("action", "typing_start"),  # typing_start or typing_stop
                    "data": typing_data
                }
                await websocket.send_text(json.dumps(typing_message))
                logger.info(f"Typing indicator sent to user {user_id}: {typing_data.get('action')}")
            except Exception as e:
                logger.error(f"Failed to send typing indicator to user {user_id}: {e}")
                await self.disconnect(user_id)
        else:
            logger.warning(f"User {user_id} is not connected. Typing indicator skipped.")

# Global manager instance - this is what other modules import
manager = NotificationManager()

def get_notification_manager()->NotificationManager:
    """Dependency that provides the NotificationManager instance"""
    return manager

router = APIRouter()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    # Use the global manager instance directly
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass 
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        await manager.disconnect(user_id)