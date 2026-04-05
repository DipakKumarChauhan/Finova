from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.schemas.record import RecordCreate, RecordUpdate, RecordResponse
from app.services import record_service
from app.middleware.rbac import require_role
from app.middleware.auth_dependency import get_current_user

router = APIRouter(prefix="/records", tags=["records"])

@router.post("/", response_model=RecordResponse)
def create_record(
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    membership = Depends(require_role("admin"))
):

    record = record_service.create_record(db, data, current_user.id)

    return record

@router.get("/")
def list_records(
    organization_id: UUID,
    start_date: str = None,
    end_date: str = None,
    category: UUID = None,
    transaction_type: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    membership = Depends(require_role("analyst"))
):

    records = record_service.list_records(
        db,
        organization_id,
        start_date,
        end_date,
        category,
        transaction_type,
        limit
    )

    return records

@router.get("/{record_id}", response_model=RecordResponse)
def get_record(
    record_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
    membership = Depends(require_role("analyst"))
):

    record = record_service.get_record(db, record_id, organization_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    return record

@router.patch("/{record_id}", response_model=RecordResponse)
def update_record(
    record_id: UUID,
    organization_id: UUID,
    data: RecordUpdate,
    db: Session = Depends(get_db),
    membership = Depends(require_role("admin"))
):

    record = record_service.get_record(db, record_id, organization_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    updated = record_service.update_record(db, record, data)

    return updated

@router.delete("/{record_id}")
def delete_record(
    record_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
    membership = Depends(require_role("admin"))
):

    record = record_service.get_record(db, record_id, organization_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record_service.delete_record(db, record)

    return {"message": "record deleted"}

