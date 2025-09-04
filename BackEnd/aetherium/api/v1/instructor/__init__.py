from .endpoints import router as instructor_router
from .withdrawal_endpoints import router as withdrawal_router

__all__ = ["instructor_router", "withdrawal_router"]
