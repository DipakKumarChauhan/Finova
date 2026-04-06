"""
Financial Records Routes

Provides HTTP endpoints for CRUD operations on financial transactions.

Endpoints support:
- Creating records (admin only)
- Listing records with filter, pagination (analyst and up)
- Exporting records as CSV (analyst and up)
- Reading single records (analyst and up)
- Updating records (admin only)
- Soft-deleting records (admin only)

All endpoints enforce RBAC and tenant isolation.
"""

import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.roles import Role
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
    # Only admin can create records
    membership = Depends(require_role(Role.admin))
):
    """
    Create a new financial record.

    Only admin role can create records. The authenticated user
    is automatically tracked as the creator (created_by field).

    Args:
        data: RecordCreate schema
        db: Database session
        current_user: Authenticated user

    Returns:
        RecordResponse with created record details
    """

    record = record_service.create_record(db, data, current_user.id)

    return record

@router.get("/")
def list_records(
    org_id: UUID,
    start_date: str = None,
    end_date: str = None,
    category: UUID = None,
    transaction_type: str = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    # Analyst and above can view records
    membership = Depends(require_role(Role.analyst))
):
    """
    List financial records with filtering and pagination.

    Supports filtering by:
    - Date range (start_date, end_date)
    - Category
    - Transaction type ('income' or 'expense')

    Results are paginated with limit/offset to handle large datasets.
    Sorted by transaction_date DESC (most recent first).

    Args:
        org_id: UUID of the organization
        start_date: Optional start date (ISO format)
        end_date: Optional end date (ISO format)
        category: Optional category UUID
        transaction_type: Optional 'income' or 'expense'
        limit: Records per page (default 50)
        offset: Number of records to skip (default 0)
        db: Database session

    Returns:
        dict with keys:
        - records: list of transaction objects
        - limit: pagination limit
        - offset: pagination offset
    """

    # Use service layer to fetch filtered records
    records = record_service.list_records(
        db,
        org_id,
        start_date,
        end_date,
        category,
        transaction_type,
        limit,
        offset,
    )

    # Return pagination metadata
    return {
        "records": records,
        "limit": limit,
        "offset": offset,
    }


@router.get("/export")
def export_records(
    org_id: UUID,
    start_date: str = None,
    end_date: str = None,
    category: UUID = None,
    transaction_type: str = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    # Analyst and above can export records
    membership = Depends(require_role(Role.analyst)),
):
    """
    Export financial records as a CSV file.

    Parameters match list_records to support same filtering logic.
    CSV includes columns: date, type, amount, category, description
    File is streamed to client for download.

    Args:
        org_id: UUID of the organization
        start_date: Optional start date (ISO format)
        end_date: Optional end date (ISO format)
        category: Optional category UUID
        transaction_type: Optional 'income' or 'expense'
        limit: Records per export (default 50)
        offset: Number of records to skip (default 0)
        db: Database session

    Returns:
        StreamingResponse with CSV attachment
    """

    # Fetch records with category names JOIN
    rows = record_service.list_records_for_export(
        db,
        org_id,
        start_date,
        end_date,
        category,
        transaction_type,
        limit,
        offset,
    )

    # Build CSV in memory
    # io.StringIO use karke memory me CSV banate hain (file system pe nahi)
    output = io.StringIO()
    writer = csv.writer(output)
    # CSV header line
    writer.writerow(["date", "type", "amount", "category", "description"])

    # Write each record as a CSV row
    for record, category_name in rows:
        writer.writerow(
            [
                record.transaction_date.date().isoformat() if record.transaction_date else "",
                record.transaction_type,
                float(record.amount),
                category_name or "",
                record.description or "",
            ]
        )

    # Prepare CSV content for download
    output.seek(0)

    # Stream CSV file to client
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        # Browser will save as records.csv
        headers={"Content-Disposition": 'attachment; filename="records.csv"'},
    )

@router.get("/{record_id}", response_model=RecordResponse)
def get_record(
    record_id: UUID,
    organization_id: UUID,
    db: Session = Depends(get_db),
    # Analyst and above can view single records
    membership = Depends(require_role(Role.analyst))
):
    """
    Retrieve a single financial record by ID.

    Args:
        record_id: UUID of the record
        organization_id: UUID of the organization
        db: Database session

    Returns:
        RecordResponse with record details

    Raises:
        HTTPException 404: if record not found
    """

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
    # Only admin can update records
    membership = Depends(require_role(Role.admin))
):
    """
    Update a financial record.

    Allows partial updates (only specified fields are modified).

    Args:
        record_id: UUID of the record
        organization_id: UUID of the organization
        data: RecordUpdate schema with new values
        db: Database session

    Returns:
        Updated RecordResponse

    Raises:
        HTTPException 404: if record not found
    """

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
    # Only admin can delete records
    membership = Depends(require_role(Role.admin))
):
    """
    Delete (soft-delete) a financial record.

    Sets deleted_at timestamp. Record is not permanently removed
    from database for audit trail purposes.

    Args:
        record_id: UUID of the record
        organization_id: UUID of the organization
        db: Database session

    Returns:
        dict with success message

    Raises:
        HTTPException 404: if record not found
    """

    record = record_service.get_record(db, record_id, organization_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Soft delete: mark with timestamp
    record_service.delete_record(db, record)

    return {"message": "record deleted"}

