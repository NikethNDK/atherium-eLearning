from .auth.endpoints import router as auth_router
from .admin.endpoints import router as admin_router
from .instructor.endpoints import router as instructor_router
# from .user.endpoints import router as user_router
from .user import user_router
from .chat.endpoints import router as chat_router
__all__ = ["auth_router","admin_router","instructor_router","user_router","chat_router"]