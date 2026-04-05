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

    organizations = organization_service.get_user_organizations(
        db,
        current_user.id
    )

    return organizations