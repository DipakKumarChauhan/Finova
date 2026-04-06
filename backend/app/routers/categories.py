from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.roles import Role
from app.db.session import get_db
from app.middleware.rbac import require_role
from app.schemas.category import CategoryResponse
from app.services import category_service


router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    org_id: UUID,
    db: Session = Depends(get_db),
    membership=Depends(require_role(Role.viewer)),
):
    return category_service.list_categories(db, org_id)
