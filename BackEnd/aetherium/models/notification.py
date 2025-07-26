from sqlalchemy import Column, Integer,String ,DateTime,Boolean
from datetime import datetime
from aetherium.database.db import Base



class Notification(Base):
    __tablename__="notifications"

    id = Column(Integer, primary_key=True)
    recipient_id=Column(Integer)
    message=Column(String)
    type=Column(String)
    is_read=Column(Boolean,default=False)
    created_at=Column(DateTime, default=lambda: datetime.now().astimezone())
    related_data=Column(String)