# dependencies.py (or in your existing file)
from fastapi import Request
from aetherium.sockets.websocket import NotificationManager
def get_manager(request: Request)->NotificationManager:
    """Dependency to get the notification manager"""
    return request.app.state.notification_manager