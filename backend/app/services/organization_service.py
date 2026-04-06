"""
Organization Service

Manages organization creation and membership queries.

Functions:
- create_organization: Create new organization and add creator as admin member
- get_user_organizations: List all organizations a user is a member of

Organizations are multi-tenant containers. Each user can be a member of
multiple organizations with different roles (viewer, analyst, admin).
"""

import uuid
from sqlalchemy.orm import Session

from app.core.roles import Role
from app.models.organization import Organization
from app.models.membership import OrganizationMembership


def create_organization(db: Session, name: str, user_id):
    """
    Create a new organization.

    Creates the organization record and automatically adds the creator
    as an admin member with full access.

    Args:
        db: Database session
        name: Organization name
        user_id: UUID of the creator (becomes admin)

    Returns:
        Organization object with generated UUID and metadata
    """

    # Naya organization create karte hain
    org = Organization(
        name=name,
        created_by=user_id
    )

    db.add(org)
    db.commit()
    db.refresh(org)

    # Creator ko automatically admin member banate hain
    membership = OrganizationMembership(
        organization_id=org.id,
        user_id=user_id,
        role=Role.admin.value
    )

    db.add(membership)
    db.commit()

    return org

def get_user_organizations(db: Session, user_id):
    """
    List all organizations where user is a member.

    Queries memberships table to find organizations, then returns
    organization objects for those IDs.

    Args:
        db: Database session
        user_id: UUID of the user

    Returns:
        list[Organization] that user is a member of (without role filtering)
    """

    # User ke memberships find karte hain
    memberships = (
        db.query(OrganizationMembership)
        .filter(OrganizationMembership.user_id == user_id)
        .all()
    )

    # Org IDs extract karte hain membership records se
    org_ids = [m.organization_id for m in memberships]

    # Organizations fetch karte hain (role-agnostic, bas membership check karte hain)
    organizations = (
        db.query(Organization)
        .filter(Organization.id.in_(org_ids))
        .all()
    )

    return organizations

