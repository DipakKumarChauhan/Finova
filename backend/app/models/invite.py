import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class OrganizationInvite(Base):

    __tablename__ = "organization_invites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id"),
        nullable=False
    )

    email = Column(String, nullable=False)

    role = Column(String, nullable=False)

    invited_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    status = Column(String, default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())