"""
Notification Service

Handles creation and retrieval of user notifications.
Notifications are created during key events:
- Organization invite created
- Invite accepted/rejected
- Membership revoked

All notifications are user-scoped and sorted chronologically.
"""

from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(db: Session, user_id, message: str):
    """
    Create a notification record for a user.

    Called from invite and membership services to notify users
    of important events.

    Args:
        db: Database session
        user_id: UUID of the user to notify
        message: Notification message text

    Returns:
        Notification object (not committed, caller handles commit)
    """
    notification = Notification(user_id=user_id, message=message)
    db.add(notification)
    return notification


def get_user_notifications(db: Session, user_id, limit: int = 50):
    """
    Retrieve notifications for a user.

    Returns notifications sorted by creation date descending (newest first).
    Results are limited to avoid overwhelming the UI.

    Args:
        db: Database session
        user_id: UUID of the user
        limit: Maximum number of notifications to return

    Returns:
        list[Notification] ordered by created_at DESC
    """
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        # Sort by newest first for dashboard widget
        .order_by(Notification.created_at.desc())
        # Apply pagination limit
        .limit(limit)
        .all()
    )