from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.membership import OrganizationMembership


def get_membership(db: Session, user_id, organization_id):

    membership = db.query(OrganizationMembership).filter(
        OrganizationMembership.user_id == user_id,
        OrganizationMembership.organization_id == organization_id,
        OrganizationMembership.status == "active"
    ).first()

    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this organization")

    return membership