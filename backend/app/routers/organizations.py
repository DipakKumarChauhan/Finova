"""
Organizations Router

HTTP endpoints for creating and listing organizations.

Operations:
- POST /organizations: Create new organization (requires authentication)
- GET /organizations: List organizations for current user (requires authentication)

Authenticated users can see all organizations they are a member of.
Organization creation automatically adds the creator as an admin member.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth_dependency import get_current_user
from app.schemas.organizations import OrganizationCreate, OrganizationResponse
from app.services import organization_service

router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.post("/", response_model=OrganizationResponse)
def create_organization(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new organization.

    Creates organization and automatically adds creator as an admin member.
    Requires authentication but no specific role.

    Args:
        data: OrganizationCreate with organization name
        db: Database session
        current_user: Current authenticated user (organization creator)

    Returns:
        OrganizationResponse with new organization details and metadata
    """

    # User ko admin banate hain by default
    org = organization_service.create_organization(
        db,
        data.name,
        current_user.id
    )

    return org

@router.get("/", response_model=list[OrganizationResponse])
def list_organizations(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    List all organizations where current user is a member.

    Returns organizations the user participates in, regardless of role.
    Authenticated access only.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        list[OrganizationResponse] with all organizations for user
    """

    # Current user ke sare organizations fetch karte hain
    organizations = organization_service.get_user_organizations(
        db,
        current_user.id
    )

    return organizations