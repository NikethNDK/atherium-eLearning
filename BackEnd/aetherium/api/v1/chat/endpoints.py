from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Form
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.services.chat_service import ChatService
from aetherium.schemas.chat import (
    MessageCreate, ConversationCreate, ConversationResponse,
    ConversationListResponse, GroupedConversationListResponse, InstructorConversationListResponse,
    ChatMessageResponse, GroupedChatMessageResponse
)
from typing import List, Optional
from aetherium.sockets.websocket import manager
router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/conversations")
def get_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for the current user"""
    chat_service = ChatService(db)
    
    # Check if user is instructor or regular user
    if current_user.role.name == "instructor":
        result = chat_service.get_instructor_conversations(current_user.id, page, limit)
        return InstructorConversationListResponse(**result)
    else:
        result = chat_service.get_user_conversations(current_user.id, page, limit)
        return GroupedConversationListResponse(**result)

@router.get("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse)
def get_conversation_messages(
    conversation_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages for a specific conversation"""
    chat_service = ChatService(db)
    result = chat_service.get_conversation_messages(conversation_id, current_user.id, page, limit)
    return ChatMessageResponse(**result)

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation (only for users, not instructors)"""
    if current_user.role.name == "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructors cannot create conversations"
        )
    
    chat_service = ChatService(db)
    conversation = chat_service.get_or_create_conversation(current_user.id, conversation_data.course_id)
    
    # Get conversation details
    conv_details = chat_service.get_conversation_details(conversation, current_user.id)
    return ConversationResponse(**conv_details)

@router.post("/messages", response_model=dict)
def send_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a text message"""
    chat_service = ChatService(db)
    return chat_service.send_message(message_data, current_user.id)

@router.post("/messages/image")
def send_image_message(
    conversation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send an image message"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size must be less than 5MB"
        )
    
    chat_service = ChatService(db)
    return chat_service.upload_image(file, conversation_id, current_user.id)

@router.get("/courses/{course_id}/conversation")
def get_course_conversation(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get or create conversation for a specific course (for users only)"""
    if current_user.role.name == "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructors cannot access this endpoint"
        )
    
    chat_service = ChatService(db)
    conversation = chat_service.get_or_create_conversation(current_user.id, course_id)
    
    # Get conversation details
    conv_details = chat_service.get_conversation_details(conversation, current_user.id)
    return ConversationResponse(**conv_details)

@router.get("/instructors/{instructor_id}/messages", response_model=GroupedChatMessageResponse)
def get_instructor_messages(
    instructor_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages from all conversations with a specific instructor (for grouped conversations)"""
    if current_user.role.name == "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructors cannot access this endpoint"
        )
    
    chat_service = ChatService(db)
    result = chat_service.get_instructor_messages(current_user.id, instructor_id, page, limit)
    return GroupedChatMessageResponse(**result)

@router.get("/users/{user_id}/messages", response_model=GroupedChatMessageResponse)
def get_user_messages(
    user_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages from all conversations with a specific user (for instructors)"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can access this endpoint"
        )
    
    chat_service = ChatService(db)
    result = chat_service.get_instructor_user_messages(user_id, current_user.id, page, limit)
    return GroupedChatMessageResponse(**result)

@router.post("/instructors/messages", response_model=dict)
async def send_message_to_instructor(
    message_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to an instructor (for grouped conversations)"""
    if current_user.role.name == "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructors cannot send messages to other instructors"
        )
    
    chat_service = ChatService(db)
    return await chat_service.send_message_to_instructor(
        current_user.id, 
        message_data["instructor_id"], 
        message_data["content"], 
        message_data.get("message_type", "text")
    )

@router.post("/instructors/messages/image")
async def send_image_message_to_instructor(
    file: UploadFile = File(...),
    instructor_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send an image message to an instructor (for grouped conversations)"""
    if current_user.role.name == "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructors cannot send messages to other instructors"
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size must be less than 5MB"
        )
    
    chat_service = ChatService(db)
    return await chat_service.send_image_message_to_instructor(current_user.id, instructor_id, file)

@router.post("/users/messages", response_model=dict)
async def send_message_to_user(
    message_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to a user (for instructors)"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can send messages to users"
        )
    
    chat_service = ChatService(db)
    return await chat_service.send_message_to_instructor(
        message_data["user_id"], 
        current_user.id, 
        message_data["content"], 
        message_data.get("message_type", "text")
    )

@router.post("/users/messages/image")
async def send_image_message_to_user(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send an image message to a user (for instructors)"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can send messages to users"
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size must be less than 5MB"
        )
    
    chat_service = ChatService(db)
    return await chat_service.send_image_message_to_instructor(user_id, current_user.id, file)

@router.post("/conversations/{conversation_id}/mark-read")
def mark_conversation_messages_as_read(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all messages in a conversation as read"""
    chat_service = ChatService(db)
    return chat_service.mark_conversation_messages_as_read(conversation_id, current_user.id)

@router.post("/instructors/{instructor_id}/mark-read")
def mark_instructor_messages_as_read(
    instructor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all messages from an instructor as read (for users)"""
    if current_user.role.name == "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructors cannot access this endpoint"
        )
    chat_service = ChatService(db)
    return chat_service.mark_instructor_messages_as_read(instructor_id, current_user.id)

@router.post("/users/{user_id}/mark-read")
def mark_user_messages_as_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all messages from a user as read (for instructors)"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only instructors can access this endpoint"
        )
    chat_service = ChatService(db)
    return chat_service.mark_user_messages_as_read(user_id, current_user.id) 