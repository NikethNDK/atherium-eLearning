from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc
from typing import List, Optional
from fastapi import HTTPException, status,Depends
from datetime import datetime
from aetherium.models.chat import Conversation, Message
from aetherium.models.user import User
from aetherium.models.courses import Course
from aetherium.models.user_course import Purchase
from aetherium.models.enum import PurchaseStatus
from aetherium.schemas.chat import MessageCreate, ConversationCreate
from aetherium.services.cloudinary_service import cloudinary_service
import os
import uuid

from datetime import datetime
from aetherium.core.dependency import get_manager
from aetherium.sockets.websocket import NotificationManager
from aetherium.core.logger import logger

class ChatService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_conversation(self, user_id: int, course_id: int) -> Conversation:
        """Get existing conversation or create new one if user has purchased the course"""
        
        # Check if user has purchased the course
        purchase = self.db.query(Purchase).filter(
            and_(
                Purchase.user_id == user_id,
                Purchase.course_id == course_id,
                Purchase.status == PurchaseStatus.COMPLETED
            )
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must purchase this course to chat with the instructor"
            )
        
        # Get course to find instructor
        course = self.db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Check if conversation already exists
        conversation = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.course_id == course_id
            )
        ).first()
        
        if not conversation:
            # Create new conversation
            conversation = Conversation(
                user_id=user_id,
                instructor_id=course.instructor_id,
                course_id=course_id,
                updated_at=datetime.utcnow()
            )
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)
        
        return conversation

    def get_conversation_details(self, conversation: Conversation, user_id: int) -> dict:
        """Get conversation details in the format expected by ConversationResponse"""
        
        # Get last message
        last_message = self.db.query(Message).options(
            joinedload(Message.sender)
        ).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).first()
        
        # Get unread count
        unread_count = self.db.query(Message).filter(
            and_(
                Message.conversation_id == conversation.id,
                Message.sender_id != user_id,
                Message.is_read == False
            )
        ).count()
        
        # Ensure updated_at is never None
        updated_at = conversation.updated_at or conversation.created_at
        
        return {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "instructor_id": conversation.instructor_id,
            "course_id": conversation.course_id,
            "course_title": conversation.course.title,
            "instructor_name": f"{conversation.instructor.firstname} {conversation.instructor.lastname}",
            "instructor_profile_picture": conversation.instructor.profile_picture,
            "user_name": f"{conversation.user.firstname} {conversation.user.lastname}",
            "user_profile_picture": conversation.user.profile_picture,
            "last_message": {
                "id": last_message.id,
                "conversation_id": conversation.id,
                "content": last_message.content,
                "message_type": last_message.message_type,
                "created_at": last_message.created_at,
                "sender_id": last_message.sender_id,
                "sender_name": f"{last_message.sender.firstname} {last_message.sender.lastname}",
                "sender_profile_picture": last_message.sender.profile_picture,
                "is_read": last_message.is_read
            } if last_message else None,
            "unread_count": unread_count,
            "created_at": conversation.created_at,
            "updated_at": updated_at
        }

    def get_user_conversations(self, user_id: int, page: int = 1, limit: int = 20) -> dict:
        """Get all conversations for a user, grouped by instructor"""
        
        offset = (page - 1) * limit
        
        # Get all conversations for the user
        all_conversations = self.db.query(Conversation).options(
            joinedload(Conversation.course),
            joinedload(Conversation.instructor),
            joinedload(Conversation.user),
            joinedload(Conversation.messages)
        ).filter(
            Conversation.user_id == user_id
        ).all()
        
        # Group conversations by instructor
        instructor_conversations = {}
        for conv in all_conversations:
            instructor_id = conv.instructor_id
            if instructor_id not in instructor_conversations:
                instructor_conversations[instructor_id] = {
                    "instructor_id": instructor_id,
                    "instructor_name": f"{conv.instructor.firstname} {conv.instructor.lastname}",
                    "instructor_profile_picture": conv.instructor.profile_picture,
                    "user_id": conv.user_id,
                    "user_name": f"{conv.user.firstname} {conv.user.lastname}",
                    "user_profile_picture": conv.user.profile_picture,
                    "conversations": [],
                    "total_unread": 0,
                    "latest_message": None,
                    "latest_updated_at": conv.created_at
                }
            
            # Get last message for this conversation
            last_message = self.db.query(Message).options(
                joinedload(Message.sender)
            ).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at.desc()).first()
            
            # Get unread count for this conversation
            unread_count = self.db.query(Message).filter(
                and_(
                    Message.conversation_id == conv.id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                )
            ).count()
            
            # Add conversation to instructor's list
            instructor_conversations[instructor_id]["conversations"].append({
                "id": conv.id,
                "course_id": conv.course_id,
                "course_title": conv.course.title,
                "last_message": {
                    "id": last_message.id,
                    "conversation_id": conv.id,
                    "content": last_message.content,
                    "message_type": last_message.message_type,
                    "created_at": last_message.created_at,
                    "sender_id": last_message.sender_id,
                    "sender_name": f"{last_message.sender.firstname} {last_message.sender.lastname}",
                    "sender_profile_picture": last_message.sender.profile_picture,
                    "is_read": last_message.is_read
                } if last_message else None,
                "unread_count": unread_count,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at or conv.created_at
            })
            
            # Update total unread count
            instructor_conversations[instructor_id]["total_unread"] += unread_count
            
            # Update latest message and updated_at
            if last_message and (instructor_conversations[instructor_id]["latest_message"] is None or 
                               last_message.created_at > instructor_conversations[instructor_id]["latest_message"]["created_at"]):
                instructor_conversations[instructor_id]["latest_message"] = {
                    "id": last_message.id,
                    "conversation_id": conv.id,
                    "content": last_message.content,
                    "message_type": last_message.message_type,
                    "created_at": last_message.created_at,
                    "sender_id": last_message.sender_id,
                    "sender_name": f"{last_message.sender.firstname} {last_message.sender.lastname}",
                    "sender_profile_picture": last_message.sender.profile_picture,
                    "is_read": last_message.is_read
                }
                instructor_conversations[instructor_id]["latest_updated_at"] = last_message.created_at
            
            if conv.updated_at and conv.updated_at > instructor_conversations[instructor_id]["latest_updated_at"]:
                instructor_conversations[instructor_id]["latest_updated_at"] = conv.updated_at
        
        # Convert to list and sort by latest activity
        result = []
        for instructor_data in instructor_conversations.values():
            result.append({
                "id": f"instructor_{instructor_data['instructor_id']}",  # Use instructor ID as conversation ID
                "user_id": instructor_data["user_id"],
                "instructor_id": instructor_data["instructor_id"],
                "instructor_name": instructor_data["instructor_name"],
                "instructor_profile_picture": instructor_data["instructor_profile_picture"],
                "user_name": instructor_data["user_name"],
                "user_profile_picture": instructor_data["user_profile_picture"],
                "course_titles": [conv["course_title"] for conv in instructor_data["conversations"]],
                "last_message": instructor_data["latest_message"],
                "unread_count": instructor_data["total_unread"],
                "created_at": instructor_data["conversations"][0]["created_at"],
                "updated_at": instructor_data["latest_updated_at"],
                "conversation_count": len(instructor_data["conversations"])
            })
        
        # Sort by latest activity and apply pagination
        result.sort(key=lambda x: x["updated_at"], reverse=True)
        paginated_result = result[offset:offset + limit]
        
        return {
            "conversations": paginated_result,
            "total": len(result)
        }

    def get_instructor_messages(self, user_id: int, instructor_id: int, page: int = 1, limit: int = 50) -> dict:
        """Get all messages from all conversations with a specific instructor"""
        
        offset = (page - 1) * limit
        
        # Get all conversations between user and instructor
        conversations = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.instructor_id == instructor_id
            )
        ).all()
        
        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No conversations found with this instructor"
            )
        
        # Get all messages from all conversations
        conversation_ids = [conv.id for conv in conversations]
        messages = self.db.query(Message).options(
            joinedload(Message.sender)
        ).filter(
            Message.conversation_id.in_(conversation_ids)
        ).order_by(Message.created_at.desc()).offset(offset).limit(limit).all()  # Changed to desc() to get newest first
        
        total = self.db.query(Message).filter(
            Message.conversation_id.in_(conversation_ids)
        ).count()
        
        # Mark messages as read
        self.db.query(Message).filter(
            and_(
                Message.conversation_id.in_(conversation_ids),
                Message.sender_id != user_id,
                Message.is_read == False
            )
        ).update({"is_read": True})
        self.db.commit()
        
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "sender_name": f"{msg.sender.firstname} {msg.sender.lastname}",
                "sender_profile_picture": msg.sender.profile_picture,
                "message_type": msg.message_type,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at
            })
        
        # Get instructor details for conversation info
        instructor = self.db.query(User).filter(User.id == instructor_id).first()
        user = self.db.query(User).filter(User.id == user_id).first()
        
        # Get course titles
        course_titles = []
        for conv in conversations:
            course = self.db.query(Course).filter(Course.id == conv.course_id).first()
            if course:
                course_titles.append(course.title)
        
        # Get the latest message across all conversations
        latest_message = None
        latest_message_time = None
        total_unread = 0
        
        for conv in conversations:
            # Get last message for this conversation
            last_msg = self.db.query(Message).options(
                joinedload(Message.sender)
            ).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at.desc()).first()
            
            if last_msg and (latest_message is None or last_msg.created_at > latest_message_time):
                latest_message = {
                    "id": last_msg.id,
                    "conversation_id": conv.id,
                    "content": last_msg.content,
                    "message_type": last_msg.message_type,
                    "created_at": last_msg.created_at,
                    "sender_id": last_msg.sender_id,
                    "sender_name": f"{last_msg.sender.firstname} {last_msg.sender.lastname}",
                    "sender_profile_picture": last_msg.sender.profile_picture,
                    "is_read": last_msg.is_read
                }
                latest_message_time = last_msg.created_at
            
            # Get unread count for this conversation
            unread_count = self.db.query(Message).filter(
                and_(
                    Message.conversation_id == conv.id,
                    Message.sender_id != user_id,
                    Message.is_read == False
                )
            ).count()
            total_unread += unread_count
        
        conv_details = {
            "id": f"instructor_{instructor_id}",
            "user_id": user_id,
            "instructor_id": instructor_id,
            "course_titles": course_titles,
            "instructor_name": f"{instructor.firstname} {instructor.lastname}",
            "instructor_profile_picture": instructor.profile_picture,
            "user_name": f"{user.firstname} {user.lastname}",
            "user_profile_picture": user.profile_picture,
            "last_message": latest_message,
            "unread_count": total_unread,
            "conversation_count": len(conversations),
            "created_at": conversations[0].created_at,
            "updated_at": max([conv.updated_at or conv.created_at for conv in conversations])
        }
        
        return {
            "messages": result,
            "total": total,
            "conversation": conv_details
        }

    def get_instructor_user_messages(self, user_id: int, instructor_id: int, page: int = 1, limit: int = 50) -> dict:
        """Get all messages from all conversations with a specific user (for instructors)"""
        
        offset = (page - 1) * limit
        
        # Get all conversations between user and instructor
        conversations = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.instructor_id == instructor_id
            )
        ).order_by(Conversation.updated_at.desc()).all()
        
        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No conversations found with this user"
            )
        
        # Get all messages from all conversations
        conversation_ids = [conv.id for conv in conversations]
        messages = self.db.query(Message).options(
            joinedload(Message.sender)
        ).filter(
            Message.conversation_id.in_(conversation_ids)
        ).order_by(Message.created_at.desc()).offset(offset).limit(limit).all()  # Changed to desc() to get newest first
        
        total = self.db.query(Message).filter(
            Message.conversation_id.in_(conversation_ids)
        ).count()
        
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "sender_name": f"{msg.sender.firstname} {msg.sender.lastname}",
                "sender_profile_picture": msg.sender.profile_picture,
                "message_type": msg.message_type,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at
            })
        
        # Get instructor details for conversation info
        instructor = self.db.query(User).filter(User.id == instructor_id).first()
        user = self.db.query(User).filter(User.id == user_id).first()
        
        # Get course titles
        course_titles = []
        for conv in conversations:
            course = self.db.query(Course).filter(Course.id == conv.course_id).first()
            if course:
                course_titles.append(course.title)
        
        # Get the latest message across all conversations
        latest_message = None
        latest_message_time = None
        total_unread = 0
        
        for conv in conversations:
            # Get last message for this conversation
            last_msg = self.db.query(Message).options(
                joinedload(Message.sender)
            ).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at.desc()).first()
            
            if last_msg and (latest_message is None or last_msg.created_at > latest_message_time):
                latest_message = {
                    "id": last_msg.id,
                    "conversation_id": conv.id,
                    "content": last_msg.content,
                    "message_type": last_msg.message_type,
                    "created_at": last_msg.created_at,
                    "sender_id": last_msg.sender_id,
                    "sender_name": f"{last_msg.sender.firstname} {last_msg.sender.lastname}",
                    "sender_profile_picture": last_msg.sender.profile_picture,
                    "is_read": last_msg.is_read
                }
                latest_message_time = last_msg.created_at
            
            # Get unread count for this conversation
            unread_count = self.db.query(Message).filter(
                and_(
                    Message.conversation_id == conv.id,
                    Message.sender_id != instructor_id,
                    Message.is_read == False
                )
            ).count()
            total_unread += unread_count
        
        conv_details = {
            "id": f"user_{user_id}",
            "user_id": user_id,
            "instructor_id": instructor_id,
            "course_titles": course_titles,
            "instructor_name": f"{instructor.firstname} {instructor.lastname}",
            "instructor_profile_picture": instructor.profile_picture,
            "user_name": f"{user.firstname} {user.lastname}",
            "user_profile_picture": user.profile_picture,
            "last_message": latest_message,
            "unread_count": total_unread,
            "conversation_count": len(conversations),
            "created_at": conversations[0].created_at,
            "updated_at": max([conv.updated_at or conv.created_at for conv in conversations])
        }
        
        return {
            "messages": result,
            "total": total,
            "conversation": conv_details
        }

    async def send_message_to_instructor(self, user_id: int, instructor_id: int, content: str, message_type: str = "text") -> dict:
        """Send a message to an instructor (for grouped conversations)"""
        from aetherium.models.user import User
        # from aetherium.models.courses.conversation import Conversation
        # from aetherium.models.courses.message import Message
        from datetime import datetime

        # Get all conversations between user and instructor
        conversations = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.instructor_id == instructor_id
            )
        ).order_by(Conversation.updated_at.desc()).all()

        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No conversations found with this instructor"
            )

        # Use the most recent conversation or create a new one with the first course
        conversation = conversations[0]

        # The sender is always the current user (from dependency)
        import inspect
        import fastapi
        frame = inspect.currentframe()
        while frame:
            if 'current_user' in frame.f_locals:
                current_user = frame.f_locals['current_user']
                break
            frame = frame.f_back
        else:
            current_user = None
        sender_id = current_user.id if current_user else user_id

        # Create the message
        message = Message(
            conversation_id=conversation.id,
            sender_id=sender_id,
            content=content,
            message_type=message_type
        )

        self.db.add(message)
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(message)

        sender = self.db.query(User).filter(User.id == sender_id).first()

        # Send WebSocket notification to both participants
        ws_message = {
            "type": "chat_message",
            "id": message.id,
            "conversation_id": message.conversation_id,
            "sender_id": message.sender_id,
            "sender_name": f"{sender.firstname} {sender.lastname}",
            "sender_profile_picture": sender.profile_picture,
            "message_type": message.message_type,
            "content": message.content,
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat()
        }
        try:
            # Determine the recipient based on who is sending the message
            # For grouped conversations, we need to send to the other participant
            if sender_id == user_id:
                # User is sending to instructor
                recipient_id = instructor_id
            else:
                # Instructor is sending to user
                recipient_id = user_id
            
            # Simple WebSocket message sending - import at function level
            try:
                from aetherium.sockets.websocket import manager
                # Use asyncio to send message without making function async
                import asyncio
                
                # Try to get the current event loop
                try:
                    loop = asyncio.get_running_loop()
                    print(f"✅ Using existing event loop for WebSocket message to user {recipient_id}")
                except RuntimeError:
                    # No running loop, create a new one
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    print(f"✅ Created new event loop for WebSocket message to user {recipient_id}")
                
                # Send the WebSocket message
                task = loop.create_task(manager.send_chat_message(recipient_id, ws_message))
                print(f"✅ WebSocket message task created for user {recipient_id}")
                
                # Wait for the task to complete (with timeout)
                try:
                    await asyncio.wait_for(task, timeout=5.0)
                    print(f"✅ WebSocket message sent successfully to user {recipient_id}")
                except asyncio.TimeoutError:
                    print(f"⚠️ WebSocket message timeout for user {recipient_id}")
                except Exception as task_error:
                    print(f"❌ WebSocket message task error for user {recipient_id}: {task_error}")
                    
            except Exception as ws_error:
                print(f"❌ WebSocket error (non-critical): {ws_error}")
                import traceback
                traceback.print_exc()
                # Continue anyway - message was saved to DB
                
        except Exception as e:
            print(f"❌ Error in message processing: {e}")
            import traceback
            traceback.print_exc()

        return ws_message

    async def send_image_message_to_instructor(self, user_id: int, instructor_id: int, file) -> dict:
        from aetherium.models.user import User
        from aetherium.models.chat import Conversation
        from aetherium.models.chat import Message
        from datetime import datetime
        from aetherium.services.cloudinary_service import cloudinary_service

        # Get all conversations between user and instructor
        conversations = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.instructor_id == instructor_id
            )
        ).order_by(Conversation.updated_at.desc()).all()

        if not conversations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No conversations found with this instructor"
            )

        conversation = conversations[0]

        # The sender is always the current user (from dependency)
        import inspect
        import fastapi
        frame = inspect.currentframe()
        while frame:
            if 'current_user' in frame.f_locals:
                current_user = frame.f_locals['current_user']
                break
            frame = frame.f_back
        else:
            current_user = None
        sender_id = current_user.id if current_user else user_id

        # Upload image to Cloudinary
        try:
            file_content = file.file.read()
            file.file.seek(0)
            upload_result = cloudinary_service.upload_image(file_content, folder="chat_images")
            image_url = upload_result.get("secure_url")
            if not image_url:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to upload image"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading image: {str(e)}"
            )

        # Create the message
        message = Message(
            conversation_id=conversation.id,
            sender_id=sender_id,
            content=image_url,
            message_type="image"
        )
        self.db.add(message)
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(message)

        sender = self.db.query(User).filter(User.id == sender_id).first()

        ws_message = {
            "type": "chat_message",
            "id": message.id,
            "conversation_id": message.conversation_id,
            "sender_id": message.sender_id,
            "sender_name": f"{sender.firstname} {sender.lastname}",
            "sender_profile_picture": sender.profile_picture,
            "message_type": message.message_type,
            "content": message.content,
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat()
        }
        try:
            # Determine the recipient based on who is sending the message
            if sender_id == user_id:
                # User is sending to instructor
                recipient_id = instructor_id
            else:
                # Instructor is sending to user
                recipient_id = user_id
            
            # Simple WebSocket message sending - import at function level
            try:
                from aetherium.sockets.websocket import manager
                # Use asyncio to send message without making function async
                import asyncio
                
                # Try to get the current event loop
                try:
                    loop = asyncio.get_running_loop()
                    print(f"✅ Using existing event loop for WebSocket image message to user {recipient_id}")
                except RuntimeError:
                    # No running loop, create a new one
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    print(f"✅ Created new event loop for WebSocket image message to user {recipient_id}")
                
                # Send the WebSocket message
                task = loop.create_task(manager.send_chat_message(recipient_id, ws_message))
                print(f"✅ WebSocket image message task created for user {recipient_id}")
                
                # Wait for the task to complete (with timeout)
                try:
                    await asyncio.wait_for(task, timeout=5.0)
                    print(f"✅ WebSocket image message sent successfully to user {recipient_id}")
                except asyncio.TimeoutError:
                    print(f"⚠️ WebSocket image message timeout for user {recipient_id}")
                except Exception as task_error:
                    print(f"❌ WebSocket image message task error for user {recipient_id}: {task_error}")
                    
            except Exception as ws_error:
                print(f"❌ WebSocket error (non-critical): {ws_error}")
                import traceback
                traceback.print_exc()
                # Continue anyway - message was saved to DB
                
        except Exception as e:
            print(f"Error in image message processing: {e}")

        return ws_message

    def get_instructor_conversations(self, instructor_id: int, page: int = 1, limit: int = 20) -> dict:
        """Get all conversations for an instructor, grouped by user"""
        
        # Get all conversations for the instructor
        all_conversations = self.db.query(Conversation).options(
            joinedload(Conversation.course),
            joinedload(Conversation.instructor),
            joinedload(Conversation.user),
            joinedload(Conversation.messages)
        ).filter(
            Conversation.instructor_id == instructor_id
        ).all()
        
        # Group conversations by user
        user_conversations = {}
        for conv in all_conversations:
            user_id = conv.user_id
            if user_id not in user_conversations:
                user_conversations[user_id] = {
                    "user_id": user_id,
                    "user_name": f"{conv.user.firstname} {conv.user.lastname}",
                    "user_profile_picture": conv.user.profile_picture,
                    "instructor_id": conv.instructor_id,
                    "instructor_name": f"{conv.instructor.firstname} {conv.instructor.lastname}",
                    "instructor_profile_picture": conv.instructor.profile_picture,
                    "conversations": [],
                    "total_unread": 0,
                    "latest_message": None,
                    "latest_updated_at": conv.created_at
                }
            
            # Get last message for this conversation
            last_message = self.db.query(Message).options(
                joinedload(Message.sender)
            ).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at.desc()).first()
            
            # Get unread count for this conversation
            unread_count = self.db.query(Message).filter(
                and_(
                    Message.conversation_id == conv.id,
                    Message.sender_id != instructor_id,
                    Message.is_read == False
                )
            ).count()
            
            # Add conversation to user's list
            user_conversations[user_id]["conversations"].append({
                "id": conv.id,
                "course_id": conv.course_id,
                "course_title": conv.course.title,
                "last_message": {
                    "id": last_message.id,
                    "conversation_id": conv.id,
                    "content": last_message.content,
                    "message_type": last_message.message_type,
                    "created_at": last_message.created_at,
                    "sender_id": last_message.sender_id,
                    "sender_name": f"{last_message.sender.firstname} {last_message.sender.lastname}",
                    "sender_profile_picture": last_message.sender.profile_picture,
                    "is_read": last_message.is_read
                } if last_message else None,
                "unread_count": unread_count,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at or conv.created_at
            })
            
            # Update total unread count
            user_conversations[user_id]["total_unread"] += unread_count
            
            # Update latest message and updated_at
            if last_message and (user_conversations[user_id]["latest_message"] is None or 
                               last_message.created_at > user_conversations[user_id]["latest_message"]["created_at"]):
                user_conversations[user_id]["latest_message"] = {
                    "id": last_message.id,
                    "conversation_id": conv.id,
                    "content": last_message.content,
                    "message_type": last_message.message_type,
                    "created_at": last_message.created_at,
                    "sender_id": last_message.sender_id,
                    "sender_name": f"{last_message.sender.firstname} {last_message.sender.lastname}",
                    "sender_profile_picture": last_message.sender.profile_picture,
                    "is_read": last_message.is_read
                }
                user_conversations[user_id]["latest_updated_at"] = last_message.created_at
            
            if conv.updated_at and conv.updated_at > user_conversations[user_id]["latest_updated_at"]:
                user_conversations[user_id]["latest_updated_at"] = conv.updated_at
        
        # Convert to list and sort by latest activity
        result = []
        for user_data in user_conversations.values():
            result.append({
                "id": f"user_{user_data['user_id']}",  # Use user ID as conversation ID
                "user_id": user_data["user_id"],
                "instructor_id": user_data["instructor_id"],
                "instructor_name": user_data["instructor_name"],
                "instructor_profile_picture": user_data["instructor_profile_picture"],
                "user_name": user_data["user_name"],
                "user_profile_picture": user_data["user_profile_picture"],
                "course_titles": [conv["course_title"] for conv in user_data["conversations"]],
                "last_message": user_data["latest_message"],
                "unread_count": user_data["total_unread"],
                "created_at": user_data["conversations"][0]["created_at"],
                "updated_at": user_data["latest_updated_at"],
                "conversation_count": len(user_data["conversations"])
            })
        
        # Sort by latest activity and apply pagination
        result.sort(key=lambda x: x["updated_at"], reverse=True)
        total = len(result)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        result = result[start_idx:end_idx]
        
        return {
            "conversations": result,
            "total": total
        }

    def get_conversation_messages(self, conversation_id: int, user_id: int, page: int = 1, limit: int = 50) -> dict:
        """Get messages for a specific conversation"""
        
        # Verify user has access to this conversation
        conversation = self.db.query(Conversation).filter(
            and_(
                Conversation.id == conversation_id,
                (Conversation.user_id == user_id) | (Conversation.instructor_id == user_id)
            )
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        offset = (page - 1) * limit
        
        # Get messages with sender info
        messages = self.db.query(Message).options(
            joinedload(Message.sender)
        ).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.desc()).offset(offset).limit(limit).all()  # Changed to desc() to get newest first
        
        total = self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).count()
        
        # Mark messages as read
        self.db.query(Message).filter(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read == False
            )
        ).update({"is_read": True})
        self.db.commit()
        
        result = []
        for msg in messages:
            result.append({
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "sender_name": f"{msg.sender.firstname} {msg.sender.lastname}",
                "sender_profile_picture": msg.sender.profile_picture,
                "message_type": msg.message_type,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at
            })
        
        # Get conversation details
        conv_details = {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "instructor_id": conversation.instructor_id,
            "course_id": conversation.course_id,
            "course_title": conversation.course.title,
            "instructor_name": f"{conversation.instructor.firstname} {conversation.instructor.lastname}",
            "instructor_profile_picture": conversation.instructor.profile_picture,
            "user_name": f"{conversation.user.firstname} {conversation.user.lastname}",
            "user_profile_picture": conversation.user.profile_picture,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }
        
        return {
            "messages": result,
            "total": total,
            "conversation": conv_details
        }

    def mark_conversation_messages_as_read(self, conversation_id: int, user_id: int) -> dict:
        """Mark all messages in a conversation as read"""
        # Mark all messages from other users as read
        self.db.query(Message).filter(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read == False
            )
        ).update({"is_read": True})
        
        self.db.commit()
        return {"message": "Messages marked as read"}

    def mark_instructor_messages_as_read(self, instructor_id: int, user_id: int) -> dict:
        """Mark all messages from an instructor as read (for users)"""
        # Get all conversations between user and instructor
        conversations = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.instructor_id == instructor_id
            )
        ).all()
        
        conversation_ids = [conv.id for conv in conversations]
        
        # Mark all messages from instructor as read
        self.db.query(Message).filter(
            and_(
                Message.conversation_id.in_(conversation_ids),
                Message.sender_id == instructor_id,
                Message.is_read == False
            )
        ).update({"is_read": True})
        
        self.db.commit()
        return {"message": "Messages marked as read"}

    def mark_user_messages_as_read(self, user_id: int, instructor_id: int) -> dict:
        """Mark all messages from a user as read (for instructors)"""
        # Get all conversations between user and instructor
        conversations = self.db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.instructor_id == instructor_id
            )
        ).all()
        
        conversation_ids = [conv.id for conv in conversations]
        
        # Mark all messages from user as read
        self.db.query(Message).filter(
            and_(
                Message.conversation_id.in_(conversation_ids),
                Message.sender_id == user_id,
                Message.is_read == False
            )
        ).update({"is_read": True})
        
        self.db.commit()
        return {"message": "Messages marked as read"}

    # async def send_message(self, message_data: MessageCreate, sender_id: int,manager:NotificationManager) -> dict:
    #     """Send a new message"""
    #     # Verify sender has access to this conversation
    #     conversation = self.db.query(Conversation).filter(
    #         and_(
    #             Conversation.id == message_data.conversation_id,
    #             (Conversation.user_id == sender_id) | (Conversation.instructor_id == sender_id)
    #         )
    #     ).first()
        
    #     if not conversation:
    #         raise HTTPException(
    #             status_code=status.HTTP_404_NOT_FOUND,
    #             detail="Conversation not found"
    #         )
        
    #     # Create new message
    #     message = Message(
    #         conversation_id=message_data.conversation_id,
    #         sender_id=sender_id,
    #         message_type=message_data.message_type,
    #         content=message_data.content
    #     )
        
    #     self.db.add(message)
        
    #     # Update conversation timestamp
    #     conversation.updated_at = func.now()
        
    #     self.db.commit()
    #     self.db.refresh(message)
        
    #     # Get sender info
    #     sender = self.db.query(User).filter(User.id == sender_id).first()
        
    #     message_response = {
    #         "id": message.id,
    #         "conversation_id": message.conversation_id,
    #         "sender_id": message.sender_id,
    #                         "sender_name": f"{sender.firstname} {sender.lastname}",
    #             "sender_profile_picture": sender.profile_picture,
    #             "message_type": message.message_type,
    #             "content": message.content,
    #             "is_read": message.is_read,
    #             "created_at": message.created_at
    #         }
            
    #         # Send WebSocket notification to the other participant
    #     recipient_id = conversation.user_id if sender_id == conversation.instructor_id else conversation.instructor_id
        
    #     # Import asyncio to run the async function
    #     import asyncio
    #     try:
    #         loop = asyncio.get_event_loop()
    #     except RuntimeError:
    #         loop = asyncio.new_event_loop()
    #         asyncio.set_event_loop(loop)
        
    #     # Send WebSocket message
    #     loop.create_task(manager.send_chat_message(recipient_id, message_response))
        
    #     return message_response

    async def send_message(
    self, 
    message_data: MessageCreate, 
    sender_id: int,
    manager: NotificationManager  # Now properly passed from endpoint
) -> dict:
        """Send a new message"""
        # Verify sender has access to this conversation
        conversation = self.db.query(Conversation).filter(
            and_(
                Conversation.id == message_data.conversation_id,
                (Conversation.user_id == sender_id) | (Conversation.instructor_id == sender_id)
            )
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Create new message
        message = Message(
            conversation_id=message_data.conversation_id,
            sender_id=sender_id,
            message_type=message_data.message_type,
            content=message_data.content
        )
        
        self.db.add(message)
        
        # Update conversation timestamp
        conversation.updated_at = func.now()
        
        self.db.commit()
        self.db.refresh(message)
        
        # Get sender info
        sender = self.db.query(User).filter(User.id == sender_id).first()
        
        message_response = {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "sender_id": message.sender_id,
                            "sender_name": f"{sender.firstname} {sender.lastname}",
                "sender_profile_picture": sender.profile_picture,
                "message_type": message.message_type,
                "content": message.content,
                "is_read": message.is_read,
                "created_at": message.created_at
            }
            
            # Send WebSocket notification to the other participant
        recipient_id = conversation.user_id if sender_id == conversation.instructor_id else conversation.instructor_id
        
        try:
            # Simple WebSocket message sending - import at function level
            try:
                from aetherium.sockets.websocket import manager
                await manager.send_chat_message(recipient_id, message_response)
            except Exception as ws_error:
                print(f"WebSocket error (non-critical): {ws_error}")
                # Continue anyway - the message was saved to DB
        except Exception as e:
            logger.error(f"Failed to send WebSocket notification: {e}")
            # Continue anyway - the message was saved to DB
        
        return message_response

    def upload_image(self, file, conversation_id: int, sender_id: int) -> dict:
        """Upload and send an image message"""
        
        # Verify sender has access to this conversation
        conversation = self.db.query(Conversation).filter(
            and_(
                Conversation.id == conversation_id,
                (Conversation.user_id == sender_id) | (Conversation.instructor_id == sender_id)
            )
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Upload to Cloudinary
        try:
            upload_result = cloudinary_service.upload_file(file, folder="chat_images")
            image_url = upload_result.get('secure_url')
            
            if not image_url:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to upload image"
                )
            
            # Create message with image URL
            message = Message(
                conversation_id=conversation_id,
                sender_id=sender_id,
                message_type="image",
                content=image_url
            )
            
            self.db.add(message)
            
            # Update conversation timestamp
            conversation.updated_at = func.now()
            
            self.db.commit()
            self.db.refresh(message)
            
            # Get sender info
            sender = self.db.query(User).filter(User.id == sender_id).first()
            
            message_response = {
                "id": message.id,
                "conversation_id": message.conversation_id,
                "sender_id": message.sender_id,
                "sender_name": f"{sender.firstname} {sender.lastname}",
                "sender_profile_picture": sender.profile_picture,
                "message_type": message.message_type,
                "content": message.content,
                "is_read": message.is_read,
                "created_at": message.created_at
            }
            
            # Send WebSocket notification to the other participant
            recipient_id = conversation.user_id if sender_id == conversation.instructor_id else conversation.instructor_id
            
            # Use asyncio to send WebSocket message without making function async
            import asyncio
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Import manager and send WebSocket message
            from aetherium.sockets.websocket import manager
            try:
            # Send WebSocket message
                loop.create_task(manager.send_chat_message(recipient_id, message_response))
            except Exception as e:
                print(f"Failed to send WebSocket notification: {e}")
                # Continue anyway - the message was saved to DB
            
            return message_response
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image: {str(e)}"
            ) 