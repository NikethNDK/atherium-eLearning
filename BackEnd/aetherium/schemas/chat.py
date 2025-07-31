from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageCreate(BaseModel):
    conversation_id: int
    content: str
    message_type: str = "text"

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    sender_profile_picture: Optional[str]
    message_type: str
    content: str
    is_read: bool
    created_at: datetime

class ConversationCreate(BaseModel):
    course_id: int
    instructor_id: int

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    instructor_id: int
    course_id: int
    course_title: str
    instructor_name: str
    instructor_profile_picture: Optional[str]
    user_name: str
    user_profile_picture: Optional[str]
    last_message: Optional[MessageResponse]
    unread_count: int
    created_at: datetime
    updated_at: datetime

class GroupedConversationResponse(BaseModel):
    id: str  # Format: "instructor_{instructor_id}"
    user_id: int
    instructor_id: int
    instructor_name: str
    instructor_profile_picture: Optional[str]
    user_name: str
    user_profile_picture: Optional[str]
    course_titles: List[str]
    last_message: Optional[MessageResponse]
    unread_count: int
    created_at: datetime
    updated_at: datetime
    conversation_count: int

class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int

class GroupedConversationListResponse(BaseModel):
    conversations: List[GroupedConversationResponse]
    total: int

class ChatMessageResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    conversation: ConversationResponse

class GroupedChatMessageResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    conversation: GroupedConversationResponse

class InstructorConversationResponse(BaseModel):
    id: str  # Format: "user_{user_id}"
    user_id: int
    instructor_id: int
    instructor_name: str
    instructor_profile_picture: Optional[str]
    user_name: str
    user_profile_picture: Optional[str]
    course_titles: List[str]
    last_message: Optional[MessageResponse]
    unread_count: int
    created_at: datetime
    updated_at: datetime
    conversation_count: int

class InstructorConversationListResponse(BaseModel):
    conversations: List[InstructorConversationResponse]
    total: int 