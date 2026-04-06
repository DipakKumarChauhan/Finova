"""
Invites Router

HTTP endpoints for managing invite requests and responses.

Operations:
- GET /invites: List pending organization invites for current user
- POST /invites/{invite_id}: Accept or reject an invite

Users receive invites from organization admins. They can see pending invites
and respond (accept to join or reject to decline).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.middleware.auth_dependency import get_current_user
from app.schemas.invite import InviteRespondRequest, InviteResponse
from app.schemas.membership import MemberResponse
from app.services import invite_service

router = APIRouter(prefix="/invites", tags=["invites"])

@router.get("/", response_model=list[InviteResponse])
def list_pending_invites(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    List all pending organization invites for current user.

    Shows invites awaiting response (accept/reject).
    Filtered by current user's email address.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        list[InviteResponse] with pending invite details
    """

    # Current user ke sare pending invites list karte hain
    return invite_service.get_pending_invites_for_user(db, current_user.email)


@router.post("/{invite_id}")
def respond_to_invite(
    invite_id: UUID,
    data: InviteRespondRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Accept or reject an organization invite.

    User action: accept (join organization with assigned role) or
    reject (decline invite and remain non-member).
    Creates notification to inform inviter of decision.

    Args:
        invite_id: UUID of the invite
        data: InviteRespondRequest with action ('accept' or 'reject')
        db: Database session
        current_user: Current authenticated user (invite recipient)

    Returns:
        MemberResponse on accept; InviteResponse on reject

    Raises:
        HTTPException 404: if invite not found
        HTTPException 400: if invalid action
    """

    # Invite accept ya reject karte hain
    result = invite_service.respond_to_invite(
        db,
        invite_id,
        current_user,
        data.action.value,
    )

    # Accept par membership return karte hain, reject par invite return karte hain
    if data.action.value == "accept":
        return MemberResponse.model_validate(result)

    return InviteResponse.model_validate(result)

