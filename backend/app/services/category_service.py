from sqlalchemy.orm import Session

from app.models.category import Category


def list_categories(db: Session, organization_id):
    return (
        db.query(Category)
        .filter(Category.organization_id == organization_id)
        .order_by(Category.name.asc())
        .all()
    )
