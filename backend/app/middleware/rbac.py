from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.auth_dependency import get_current_user
from app.services.membership_services import get_membership


ROLE_HIERARCHY = {
    "viewer": 1,
    "analyst": 2,
    "admin": 3
}


def require_role(min_role: str):

    def role_checker(
        organization_id: str,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
    ):

        membership = get_membership(db, current_user.id, organization_id)

        user_role_level = ROLE_HIERARCHY[membership.role]
        required_role_level = ROLE_HIERARCHY[min_role]

        if user_role_level < required_role_level:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        return membership

    return role_checker