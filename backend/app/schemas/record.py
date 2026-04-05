from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class RecordCreate(BaseModel):

    organization_id: UUID
    category_id: Optional[UUID]
    amount: float
    transaction_type: str
    transaction_date: datetime
    description: Optional[str]


class RecordUpdate(BaseModel):

    category_id: Optional[UUID]
    amount: Optional[float]
    transaction_type: Optional[str]
    transaction_date: Optional[datetime]
    description: Optional[str]


class RecordResponse(BaseModel):

    id: UUID
    organization_id: UUID
    category_id: Optional[UUID]
    amount: float
    transaction_type: str
    transaction_date: datetime
    description: Optional[str]

    class Config:
        from_attributes = True