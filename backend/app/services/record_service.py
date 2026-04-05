from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

from app.models.record import FinancialRecord


def create_record(db: Session, data, user_id):

    record = FinancialRecord(
        organization_id=data.organization_id,
        category_id=data.category_id,
        amount=data.amount,
        transaction_type=data.transaction_type,
        transaction_date=data.transaction_date,
        description=data.description,
        created_by=user_id
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record

def list_records(
    db: Session,
    organization_id,
    start_date=None,
    end_date=None,
    category=None,
    transaction_type=None,
    limit=50
):

    query = db.query(FinancialRecord).filter(
        FinancialRecord.organization_id == organization_id,
        FinancialRecord.deleted_at == None
    )

    if start_date:
        query = query.filter(FinancialRecord.transaction_date >= start_date)

    if end_date:
        query = query.filter(FinancialRecord.transaction_date <= end_date)

    if category:
        query = query.filter(FinancialRecord.category_id == category)

    if transaction_type:
        query = query.filter(FinancialRecord.transaction_type == transaction_type)

    records = query.order_by(
        FinancialRecord.transaction_date.desc()
    ).limit(limit).all()

    return records

def get_record(db: Session, record_id, organization_id):

    return db.query(FinancialRecord).filter(
        FinancialRecord.id == record_id,
        FinancialRecord.organization_id == organization_id,
        FinancialRecord.deleted_at == None
    ).first()

def update_record(db: Session, record, data):

    for field, value in data.dict(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)

    return record

def delete_record(db: Session, record):

    record.deleted_at = datetime.utcnow()

    db.commit()