"""
Notifications Routes

Provides endpoints for retrieving user notifications.
Notifications are created automatically when:
- User receives an invite
- Invite is accepted/rejected
- Membership is revoked

All endpoints return notifications scoped to current authenticated user.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth_dependency import get_current_user
from app.schemas.notification import NotificationResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    # Pagination: limit number of notifications (1-200)
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    # Only return notifications for current user
    current_user=Depends(get_current_user),
):
    """
    Get notifications for the authenticated user.

    Returns notifications sorted by creation date (newest first).
    Results are paginated with configurable limit.

    Args:
        limit: Maximum number of notifications to return (default 50)
        db: Database session
        current_user: Authenticated user from JWT token

    Returns:
        list[dict] with notification details (id, message, created_at)
    """
    return notification_service.get_user_notifications(db, current_user.id, limit)