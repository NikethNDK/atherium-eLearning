from .auth.endpoints import router as auth_router
from .admin.endpoints import router as admin_router
from .admin.admin_bank_endpoints import router as admin_bank_router
from .admin.admin_withdrawal_endpoints import router as admin_withdrawal_request_router
from .instructor.endpoints import router as instructor_router
# from .user.endpoints import router as user_router
from .user import user_router
from .chat.endpoints import router as chat_router
__all__ = ["auth_router","admin_router","admin_bank_router","admin_withdrawal_request_router","instructor_router","user_router","chat_router"]