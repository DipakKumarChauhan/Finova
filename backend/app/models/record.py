import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)

    amount = Column(Numeric(18, 2), nullable=False)

    transaction_type = Column(String, nullable=False)  # income / expense

    transaction_date = Column(DateTime(timezone=True), nullable=False)

    description = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    deleted_at = Column(DateTime(timezone=True))

    organization = relationship("Organization", back_populates="records")

    __table_args__ = (
        Index("idx_org_date", "organization_id", "transaction_date"),
        Index("idx_org_type", "organization_id", "transaction_type"),
        Index("idx_org_category", "organization_id", "category_id"),
    )