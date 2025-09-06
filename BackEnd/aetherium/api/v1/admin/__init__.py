from .endpoints import router as admin_router
from .withdrawal_endpoints import router as admin_withdrawal_router
from .admin_bank_endpoints import router as admin_bank_router
from .admin_withdrawal_endpoints import router as admin_withdrawal_request_router

__all__ = ["admin_router", "admin_withdrawal_router", "admin_bank_router", "admin_withdrawal_request_router"]
