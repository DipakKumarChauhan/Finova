import uuid
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.membership import OrganizationMembership


def create_organization(db: Session, name: str, user_id):

    org = Organization(
        name=name,
        created_by=user_id
    )

    db.add(org)
    db.commit()
    db.refresh(org)

    # creator becomes admin
    membership = OrganizationMembership(
        organization_id=org.id,
        user_id=user_id,
        role="admin"
    )

    db.add(membership)
    db.commit()

    return org

def get_user_organizations(db: Session, user_id):

    memberships = (
        db.query(OrganizationMembership)
        .filter(OrganizationMembership.user_id == user_id)
        .all()
    )

    org_ids = [m.organization_id for m in memberships]

    organizations = (
        db.query(Organization)
        .filter(Organization.id.in_(org_ids))
        .all()
    )

    return organizations

