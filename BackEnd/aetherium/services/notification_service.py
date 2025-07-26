from aetherium.database.db import get_db
from aetherium.models.notification import Notification
import json
from sqlalchemy.orm import Session
from aetherium.sockets.websocket import manager
from aetherium.core.logger import logger

async def create_notification(db:Session,recipient_id:int , message:str, notification_type:str,related_data:dict=None):
    notification=Notification(
        recipient_id=recipient_id,
        message=message,
        type=notification_type,
        related_data=json.dumps(related_data) if related_data else None
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)  # Get the ID and other auto-generated fields
        
    logger.info(f"Notification created in database for user {recipient_id}")

    # await manager.send_notification(reciepient_id,notification)
    await manager.send_notification(recipient_id, {
        "message": message,
        "type": notification_type,
        "related_data": related_data
    })