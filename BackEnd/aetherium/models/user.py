from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
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



    courses = relationship("Course", back_populates="instructor")
    co_instructed_courses = relationship("CourseInstructor", back_populates="instructor")