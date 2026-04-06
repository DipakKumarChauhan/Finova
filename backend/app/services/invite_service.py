"""
Invite Service

Manages the organization membership invitation workflow:
1. Admin creates invites for emails
2. Invited users accept or reject
3. Notifications are sent at key points

All operations enforce organization-level permissions and
tenant isolation.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.roles import ROLES, Role
from app.models.organization import Organization
from app.models.invite import OrganizationInvite
from app.models.membership import OrganizationMembership
from app.models.user import User
from app.services.notification_service import create_notification

def create_invite(db: Session, org_id, email, role, invited_by):
    """
    Create an invitation for a user to join an organization.

    Validates that:
    - Role is valid
    - User is not already a member
    - No pending invite exists for this email
    - Organization exists

    If the invited email corresponds to an existing user,
    a notification is sent to them.

    Args:
        db: Database session
        org_id: UUID of the organization
        email: Email of user to invite
        role: Role to assign ('viewer', 'analyst', 'admin')
        invited_by: UUID of admin creating the invite

    Returns:
        OrganizationInvite object (newly created)

    Raises:
        HTTPException 400: if user already member or invalid role
        HTTPException 404: if organization not found
    """

    # Normalize role to string
    role_value = role.value if isinstance(role, Role) else role

    # Validate role is in allowed set
    if role_value not in ROLES:
        raise HTTPException(400, "Invalid role")

    # Check if user is already a member (active status)
    member = db.query(OrganizationMembership).join(User).filter(
        OrganizationMembership.organization_id == org_id,
        User.email == email,
        OrganizationMembership.status == "active"
    ).first()

    if member:
        raise HTTPException(400, "User already member")

    # Check if a pending invite already exists (avoid duplicates)
    existing_invite = db.query(OrganizationInvite).filter(
        OrganizationInvite.organization_id == org_id,
        OrganizationInvite.email == email,
        OrganizationInvite.status == "pending"
    ).first()

    if existing_invite:
        raise HTTPException(400, "Invite already exists")

    # Verify organization exists before creating invite
    organization = db.query(Organization).filter(Organization.id == org_id).first()

    if not organization:
        raise HTTPException(404, "Organization not found")

    # Create the invite record
    invite = OrganizationInvite(
        organization_id=org_id,
        email=email,
        role=role_value,
        invited_by=invited_by
    )

    # If the invited email has an active user account, send notification
    recipient = db.query(User).filter(User.email == email).first()

    if recipient:
        create_notification(
            db,
            recipient.id,
            message=(
                f"You were invited to join organization {organization.name} "
                f"with role {role_value}"
            ),
        )

    db.add(invite)
    db.commit()
    db.refresh(invite)

    return invite

def get_pending_invites_for_user(db: Session, email):
    """
    Retrieve pending invitations for a user's email address.

    Used by the user to see organizations they've been invited to.

    Args:
        db: Database session
        email: Email address to lookup invites for

    Returns:
        list[OrganizationInvite] with status='pending'
    """

    invites = db.query(OrganizationInvite).filter(
        OrganizationInvite.email == email,
        OrganizationInvite.status == "pending"
    ).all()

    return invites

def respond_to_invite(db: Session, invite_id, user, action):
    """
    User accepts or rejects a pending invitation.

    For rejection:
    - Mark invite as 'rejected'
    - Notify the inviter

    For acceptance:
    - Create membership record
    - Mark invite as 'accepted'
    - Notify the inviter

    Args:
        db: Database session
        invite_id: UUID of the invitation
        user: User object responding to invite
        action: 'accept' or 'reject'

    Returns:
        For rejection: OrganizationInvite (updated)
        For acceptance: dict with membership info (user_id, email, role, joined_at)

    Raises:
        HTTPException 404: if invite not found
        HTTPException 403: if invite doesn't belong to user
        HTTPException 400: if invite not pending or user already member
    """

    invite = db.query(OrganizationInvite).filter(
        OrganizationInvite.id == invite_id
    ).first()

    if not invite:
        raise HTTPException(404, "Invite not found")

    # Ensure invite belongs to the current user
    if invite.email != user.email:
        raise HTTPException(403, "Invite does not belong to you")

    # Must be in pending status to respond
    if invite.status != "pending":
        raise HTTPException(400, "Invite is not pending")

    organization = db.query(Organization).filter(
        Organization.id == invite.organization_id
    ).first()
    organization_name = organization.name if organization else str(invite.organization_id)

    # ----------------------
    # Invite Rejection Flow
    # ----------------------
    # jab user invite reject karta hai:
    # 1. invite status ko 'rejected' mark kar do
    # 2. admin ko notification dedo
    if action == "reject":
        invite.status = "rejected"

        # Notify inviter about rejection
        create_notification(
            db,
            invite.invited_by,
            message=(
                f"{user.email} rejected the invite to join organization "
                f"{organization_name}"
            ),
        )

        db.add(invite)
        db.commit()
        db.refresh(invite)

        return invite

    # ----------------------
    # Invite Acceptance Flow
    # ----------------------
    # jab user accept karta hai:
    # 1. membership create hoti hai
    # 2. invite status update hota hai
    # 3. admin ko notification send hota hai

    # Check for existing membership (edge case)
    existing_membership = db.query(OrganizationMembership).filter(
        OrganizationMembership.organization_id == invite.organization_id,
        OrganizationMembership.user_id == user.id
    ).first()

    if existing_membership:
        raise HTTPException(400, "User already member")

    # Create membership record with role from invite
    membership = OrganizationMembership(
        organization_id=invite.organization_id,
        user_id=user.id,
        role=invite.role
    )

    # Mark invite as accepted
    invite.status = "accepted"

    # Notify inviter of acceptance
    create_notification(
        db,
        invite.invited_by,
        message=(
            f"{user.email} accepted the invite to join organization "
            f"{organization_name}"
        ),
    )

    # Persist all changes
    db.add(membership)
    db.add(invite)
    db.commit()
    db.refresh(membership)

    return {
        "user_id": membership.user_id,
        "email": user.email,
        "role": membership.role,
        "joined_at": membership.joined_at,
    }


