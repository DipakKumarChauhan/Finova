"""
Financial Record Service

Handles CRUD operations on financial records (transactions).
All operations enforce tenant isolation (organization_id filtering)
and soft deletion (deleted_at field).

Supports:
- Record creation with creator tracking
- Filtered listing with pagination and export
- Single record retrieval
- Updates (PATCH)
- Soft deletion

Includes helper functions for composing common filters.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import date as date_type
from datetime import datetime, timezone

from app.models.category import Category
from app.models.record import FinancialRecord


def _serialize_record(record: FinancialRecord, category_name):
    return {
        "id": record.id,
        "organization_id": record.organization_id,
        "amount": float(record.amount),
        "transaction_type": record.transaction_type,
        "transaction_date": record.transaction_date,
        "description": record.description,
        "category_name": category_name,
    }


def _records_with_category_query(db: Session):
    return db.query(FinancialRecord, Category.name.label("category_name")).outerjoin(
        Category,
        FinancialRecord.category_id == Category.id,
    )


def _normalize_transaction_datetime(value):
    if value is None:
        return None

    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value

    if isinstance(value, date_type):
        return datetime(value.year, value.month, value.day, tzinfo=timezone.utc)

    raise ValueError("Invalid transaction_date value")


def resolve_category(db: Session, organization_id, category_name: str):
    normalized_name = category_name.strip().lower()

    category = db.query(Category).filter(
        Category.organization_id == organization_id,
        func.lower(Category.name) == normalized_name,
    ).first()

    if category:
        return category

    category = Category(
        organization_id=organization_id,
        name=category_name.strip(),
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def create_record(db: Session, data, user_id):
    """
    Create a new financial record.

    Records are created with:
    - creator (user_id)
    - organization scope
    - creation timestamp
    - no deletion flag (soft delete)

    Args:
        db: Database session
        data: RecordCreate schema with transaction details
        user_id: UUID of user creating the record

    Returns:
        FinancialRecord object (persisted to database)
    """

    category = resolve_category(db, data.organization_id, data.category_name)

    record = FinancialRecord(
        organization_id=data.organization_id,
        category_id=category.id,
        amount=data.amount,
        transaction_type=data.transaction_type,
        transaction_date=_normalize_transaction_datetime(data.transaction_date),
        description=data.description,
        created_by=user_id,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _serialize_record(record, category.name)


def _build_filtered_records_query(
    db: Session,
    org_id,
    start_date=None,
    end_date=None,
    category=None,
    transaction_type=None,
):
    """
    Build a filtered SQLAlchemy query for financial records.

    Reusable helper that applies common filters:
    - Tenant isolation: only this organization's records
    - Soft deletion: exclude deleted_at IS NOT NULL
    - Date range: optional start/end date filters
    - Category: optional category_id filter
    - Type: optional transaction_type filter

    Args:
        db: Database session
        org_id: UUID of the organization (required for isolation)
        start_date: Optional ISO format start date
        end_date: Optional ISO format end date
        category: Optional UUID of category
        transaction_type: Optional 'income' or 'expense'

    Returns:
        SQLAlchemy Query object (not executed)
    """

    # Apply core filter: tenant isolation + soft deletion
    query = _records_with_category_query(db).filter(
        # Tenant isolation: yaha iss organization ka data hi fetch ho
        FinancialRecord.organization_id == org_id,
        # Soft deletion protection: deleted records ko exclude kar
        FinancialRecord.deleted_at == None
    )

    if start_date:
        query = query.filter(FinancialRecord.transaction_date >= start_date)

    if end_date:
        query = query.filter(FinancialRecord.transaction_date <= end_date)

    if category:
        normalized_category = category.strip().lower()
        query = query.filter(func.lower(func.coalesce(Category.name, "")).contains(normalized_category))

    if transaction_type:
        query = query.filter(FinancialRecord.transaction_type == transaction_type)

    return query

def list_records(
    db: Session,
    org_id,
    start_date=None,
    end_date=None,
    category=None,
    transaction_type=None,
    limit=50,
    offset=0
):
    """
    List financial records with pagination.

    Returns records sorted by transaction_date DESC (most recent first).
    Supports filtering by date range, category, and transaction type.
    Pagination with limit/offset prevents loading entire record set.

    Args:
        db: Database session
        org_id: UUID of organization
        start_date: Optional ISO format start date
        end_date: Optional ISO format end date
        category: Optional UUID of category
        transaction_type: Optional 'income' or 'expense'
        limit: Max records per page (default 50)
        offset: Number of records to skip (default 0)

    Returns:
        list[FinancialRecord] sorted DESC by transaction_date
    """

    # Use shared filter builder
    query = _build_filtered_records_query(
        db,
        org_id,
        start_date,
        end_date,
        category,
        transaction_type,
    )

    # Apply pagination to prevent memory overload
    # offset ke baad se limit records ko fetch kar
    rows = query.order_by(
        FinancialRecord.transaction_date.desc()
    ).limit(limit).offset(offset).all()

    return [_serialize_record(record, category_name) for record, category_name in rows]


def list_records_for_export(
    db: Session,
    org_id,
    start_date=None,
    end_date=None,
    category=None,
    transaction_type=None,
    limit=50,
    offset=0,
):
    """
    List records with category names for CSV export.

    Similar to list_records but includes category.name via JOIN.
    Useful for generating human-readable CSV downloads.

    Args:
        db: Database session
        org_id: UUID of organization
        start_date: Optional ISO format start date
        end_date: Optional ISO format end date
        category: Optional UUID of category
        transaction_type: Optional 'income' or 'expense'
        limit: Max records per page (default 50)
        offset: Number of records to skip (default 0)

    Returns:
        list[(FinancialRecord, category_name)] with category names included
    """

    # LEFT JOIN dengan categories table to get category names
    # OUTER JOIN karke category_name NULL handling kar sakte hain
    query = (
        db.query(FinancialRecord, Category.name.label("category_name"))
        .outerjoin(Category, FinancialRecord.category_id == Category.id)
        .filter(
            FinancialRecord.organization_id == org_id,
            FinancialRecord.deleted_at == None,
        )
    )

    if start_date:
        query = query.filter(FinancialRecord.transaction_date >= start_date)

    if end_date:
        query = query.filter(FinancialRecord.transaction_date <= end_date)

    if category:
        normalized_category = category.strip().lower()
        query = query.filter(func.lower(func.coalesce(Category.name, "")).contains(normalized_category))

    if transaction_type:
        query = query.filter(FinancialRecord.transaction_type == transaction_type)

    return (
        query.order_by(FinancialRecord.transaction_date.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

def get_record(db: Session, record_id, organization_id):
    """
    Retrieve a single record by ID with tenant isolation.

    Args:
        db: Database session
        record_id: UUID of the record
        organization_id: UUID of the organization (for isolation check)

    Returns:
        FinancialRecord object or None if not found
    """

    # Tenant isolation: ensure record belongs to this organization
    return db.query(FinancialRecord).filter(
        FinancialRecord.id == record_id,
        FinancialRecord.organization_id == organization_id,
        FinancialRecord.deleted_at == None
    ).first()


def get_record_with_category(db: Session, record_id, organization_id):
    row = _records_with_category_query(db).filter(
        FinancialRecord.id == record_id,
        FinancialRecord.organization_id == organization_id,
        FinancialRecord.deleted_at == None,
    ).first()

    if not row:
        return None

    record, category_name = row
    return _serialize_record(record, category_name)

def update_record(db: Session, record, data):
    """
    Update a financial record's mutable fields.

    Updates only the fields provided in the update schema
    (exclude_unset=True) to allow partial updates.

    Args:
        db: Database session
        record: FinancialRecord object to update
        data: RecordUpdate schema with new values

    Returns:
        Updated FinancialRecord object
    """

    # Update only provided fields (not all fields)
    for field, value in data.dict(exclude_unset=True).items():
        if field == "category_name":
            category = resolve_category(db, record.organization_id, value)
            record.category_id = category.id
            continue
        if field == "transaction_date":
            value = _normalize_transaction_datetime(value)
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    category_name = db.query(Category.name).filter(Category.id == record.category_id).scalar()
    return _serialize_record(record, category_name)

def delete_record(db: Session, record):
    """
    Soft-delete a financial record.

    Sets deleted_at timestamp instead of removing from database.
    Allows recovery and maintains audit trail.

    Args:
        db: Database session
        record: FinancialRecord object to delete
    """

    # Soft delete: mark with current timestamp
    # yaha record ko physically delete nahi kar rahe, sirf timestamp set kar rahe
    record.deleted_at = datetime.utcnow()

    db.commit()