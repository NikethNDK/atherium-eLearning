from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime,Float
from datetime import datetime,timezone
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
# from imports import *
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String)
    lastname = Column(String)
    username = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String(15), nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    is_emailverified = Column(Boolean, default=False)
    title = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    personal_website = Column(String, nullable=True)
    facebook = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    youtube = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)  
   
    role = relationship("Role", back_populates="users")
    courses = relationship("Course", back_populates="instructor", cascade="all, delete-orphan")
    co_instructed_courses = relationship("CourseInstructor", back_populates="instructor")
    purchases = relationship("Purchase", back_populates="user")
    cart_items = relationship("Cart", back_populates="user")
    wishlist_items=relationship("Wishlist",back_populates="user")
    course_progress = relationship("CourseProgress", back_populates="user")
    course_reviews = relationship("CourseReview", back_populates="user")
    lesson_progress=relationship("LessonProgress",back_populates="user",cascade="all, delete-orphan")
    section_progress=relationship("SectionProgress",back_populates="user",cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    
    # Chat relationships
    user_conversations = relationship("Conversation", foreign_keys="[Conversation.user_id]", back_populates="user")
    instructor_conversations = relationship("Conversation", foreign_keys="[Conversation.instructor_id]", back_populates="instructor")
    sent_messages = relationship("Message", back_populates="sender")

class Wallet(Base):
    __tablename__ = "wallets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="wallet")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    transaction_type = Column(String(20), nullable=False) 
    amount = Column(Float, nullable=False)
    description = Column(String(255))
    reference_id = Column(String(100))  
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    wallet = relationship("Wallet")