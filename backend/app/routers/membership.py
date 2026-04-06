"""
Membership Router

HTTP endpoints for managing organization members.

Operations:
- GET /organizations/{org_id}/members: List all members (requires viewer)
- POST /organizations/{org_id}/members: Send invite and create membership (requires admin)
- PATCH /organizations/{org_id}/members/{email}: Update member role (requires admin)
- DELETE /organizations/{org_id}/members/{email}: Revoke membership (requires admin)

All endpoints require the user to be an active member of the organization.
Additional role checks enforce who can modify memberships (admin only).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.roles import Role
from app.db.session import get_db
from app.schemas.membership import AddMemberRequest, UpdateMemberRole, MemberResponse
from app.schemas.invite import InviteResponse
from app.services import membership_services
from app.services import invite_service
from app.middleware.rbac import require_role
from app.middleware.auth_dependency import get_current_user

router = APIRouter(prefix="/organizations/{org_id}/members", tags=["memberships"])

@router.get("", response_model=list[MemberResponse])
def list_members(
    org_id: UUID,
    db: Session = Depends(get_db),
    membership = Depends(require_role(Role.viewer))
):
    """
    List all members of an organization.

    Returns all members (active and inactive) with their email, role, and join date.
    Accessible to viewers and above.

    Args:
        org_id: UUID of the organization
        db: Database session
        membership: RBAC enforcement (viewer role minimum)

    Returns:
        list[MemberResponse] with member details
    """

    # RBAC enforcement: require_role ensures user is at least viewer in this org
    return membership_services.get_members(db, org_id)


@router.post("", response_model=InviteResponse)
def invite_member(
    org_id: UUID,
    data: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    membership = Depends(require_role(Role.admin))
):
    """
    Invite a new member to the organization.

    Sends an invite to the email address and assigns a role.
    Automatically creates membership if user exists in system.
    Notifies user if already registered.
    Admin action only.

    Args:
        org_id: UUID of the organization
        data: AddMemberRequest with email and role
        db: Database session
        current_user: Current authenticated user (inviter)
        membership: RBAC enforcement (admin role required)

    Returns:
        InviteResponse with invite details and status
    """

    # RBAC enforcement: only admins can invite
    return invite_service.create_invite(
        db,
        org_id,
        data.email,
        data.role,
        current_user.id,
    )

@router.patch("/{email}", response_model=MemberResponse)
def update_role(
    org_id: UUID,
    email: str,
    data: UpdateMemberRole,
    db: Session = Depends(get_db),
    membership = Depends(require_role(Role.admin))
):
    """
    Update a member's role in the organization.

    Changes role from viewer → analyst → admin (escalation only,
    no demotion in this implementation).
    Admin action only.

    Args:
        org_id: UUID of the organization
        email: Email of the member to update
        data: UpdateMemberRole with new role
        db: Database session
        membership: RBAC enforcement (admin role required)

    Returns:
        MemberResponse with updated member details

    Raises:
        HTTPException 400: if invalid role
        HTTPException 404: if member not found
    """

    # RBAC enforcement: only admins can update roles
    return membership_services.update_member_role(
        db,
        org_id,
        email,
        data.role
    )


@router.delete("/{email}")
def remove_member(
    org_id: UUID,
    email: str,
    db: Session = Depends(get_db),
    membership = Depends(require_role(Role.admin))
):
    """
    Revoke a member's membership in the organization.

    Removes the user's access to the organization, creates notification
    to inform the removed user. Admin action only.

    Args:
        org_id: UUID of the organization
        email: Email of the member to remove
        db: Database session
        membership: RBAC enforcement (admin role required)

    Returns:
        dict with success message

    Raises:
        HTTPException 404: if member not found
    """

    # RBAC enforcement: only admins can remove members
    membership_services.remove_member(
        db,
        org_id,
        email
    )

    return {"message": "member removed"}
