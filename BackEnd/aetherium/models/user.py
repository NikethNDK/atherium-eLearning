from sqlalchemy import Column,Integer,String,ForeignKey,Boolean
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class Role(Base):
    __tablename__="roles"
    id= Column(Integer,primary_key=True,index=True)
    name=Column(String,unique=True,index=True)
    users=relationship("User",back_populates="role")

class User(Base):
    __tablename__ = "users"
    firstname=Column(String)
    lastname=Column(String)
    id = Column(Integer, primary_key=True, index=True)
    phone_number=Column(Integer)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    is_emailverified=Column(Boolean,default=False)
    title = Column(String, nullable=True)  
    designation = Column(String, nullable=True)  
    google_id = Column(String, unique=True, nullable=True) 
    role = relationship("Role", back_populates="users")

