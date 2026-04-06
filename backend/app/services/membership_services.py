"""
Membership Services

Manages organization memberships and member relationships.

Functions:
- get_membership: Used by RBAC middleware to validate org membership
- get_members: List all members of an organization
- update_member_role: Change a member's role (admin action)
- remove_member: Revoke membership and notify user

All functions enforce role validation and create notifications
at appropriate points in the workflow.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.roles import ROLES, Role
from app.models.membership import OrganizationMembership
from app.models.user import User
from app.services.notification_service import create_notification


def get_membership(db: Session, user_id, organization_id):
    """
    Retrieve a user's active membership in an organization.

    Used by RBAC middleware to check if user is a member
    before allowing access to organization resources.

    Args:
        db: Database session
        user_id: UUID of the user
        organization_id: UUID of the organization

    Returns:
        OrganizationMembership object if user is active member

    Raises:
        HTTPException 403: if not a member or membership inactive
    """

    # Check if user has active membership in this organization
    membership = db.query(OrganizationMembership).filter(
        OrganizationMembership.user_id == user_id,
        OrganizationMembership.organization_id == organization_id,
        # Only active memberships count
        OrganizationMembership.status == "active"
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this organization")

    return membership


def get_members(db: Session, organization_id):
    """
    List all members (active and inactive) of an organization.

    Returns member details including email and role assignment.

    Args:
        db: Database session
        organization_id: UUID of the organization

    Returns:
        list[dict] with keys: user_id, email, role, joined_at
    """

    # JOIN with users table to get email addresses
    members = db.query(OrganizationMembership).join(User).filter(
        OrganizationMembership.organization_id == organization_id
    ).all()

    # Convert to JSON-safe dictionaries
    return [
        {
            "user_id": member.user_id,
            "email": member.user.email,
            "role": member.role,
            "joined_at": member.joined_at,
        }
        for member in members
    ]


def update_member_role(db: Session, organization_id, email, role):
    """
    Update a member's role within an organization.

    Admin action to reassign roles (viewer → analyst → admin).

    Args:
        db: Database session
        organization_id: UUID of the organization
        email: Email of the user whose role is changing
        role: New role ('viewer', 'analyst', or 'admin')

    Returns:
        dict with updated membership details

    Raises:
        HTTPException 400: if invalid role
        HTTPException 404: if user or membership not found
    """

    # Normalize role to string
    role_value = role.value if isinstance(role, Role) else role

    # Validate role exists
    if role_value not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find user's membership in this organization
    membership = db.query(OrganizationMembership).filter(
        OrganizationMembership.organization_id == organization_id,
        OrganizationMembership.user_id == user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Update role
    membership.role = role_value

    db.commit()
    db.refresh(membership)

    return {
        "user_id": membership.user_id,
        "email": user.email,
        "role": membership.role,
        "joined_at": membership.joined_at,
    }


def remove_member(db: Session, organization_id, email):
    """
    Revoke a user's membership in an organization.

    Admin action. Creates notification to inform the removed user.
    Membership record is hard-deleted (not soft-deleted).

    Args:
        db: Database session
        organization_id: UUID of the organization
        email: Email of the user to remove

    Raises:
        HTTPException 404: if user or membership not found
    """

    # Find user by email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find user's membership in this organization
    membership = db.query(OrganizationMembership).filter(
        OrganizationMembership.organization_id == organization_id,
        OrganizationMembership.user_id == user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    # Notify user of removal
    # User ko batate hain ki unka membership revoke ho gaya
    create_notification(
        db,
        user.id,
        f"Your membership was revoked from organization {organization_id}",
    )

    # Hard delete membership (unlike financial records which are soft-deleted)
    db.delete(membership)
    db.commit()