from aetherium.database.db import get_db
from aetherium.models.notification import Notification
import json
from sqlalchemy.orm import Session 
from aetherium.sockets.websocket import NotificationManager
from aetherium.core.dependency import get_manager 
from aetherium.core.logger import logger
from fastapi import Depends

async def create_notification(db:Session,recipient_id:int , message:str, notification_type:str,related_data:dict=None,manager: NotificationManager = Depends(get_manager)):
    notification=Notification(
        recipient_id=recipient_id,
        message=message,
        type=notification_type,
        related_data=json.dumps(related_data) if related_data else None,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)  # Get the ID and other auto-generated fields
        
    logger.info(f"Notification created in database for user {recipient_id}")

    notification_payload = {
        "id": notification.id,  # Include the DB ID
        "message": message,
        "type": notification_type,
        "related_data": related_data,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
        "is_read": notification.is_read
    }
    # await manager.send_notification(reciepient_id,notification)
    try:
        await manager.send_notification(recipient_id, notification_payload)
    except Exception as e:
        logger.error(f"Failed to send websocket notification to the user {recipient_id}: {e}")
    
    return notification