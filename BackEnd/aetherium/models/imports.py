from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,Text,DateTime,Float,Enum
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
from sqlalchemy.sql import func
from aetherium.database.db import get_db
import enum