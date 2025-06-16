from .auth.endpoints import router as auth_router
from .admin.endpoints import router as admin_router

__all__ = ["auth_router","admin_router"]