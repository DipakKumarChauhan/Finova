from pydantic import BaseModel, field_validator
from datetime import date, datetime
from uuid import UUID
from typing import Optional


class RecordCreate(BaseModel):

    organization_id: UUID
    category_name: str
    amount: float
    transaction_type: str
    transaction_date: date
    description: Optional[str] = None

    @field_validator("category_name")
    @classmethod
    def normalize_category_name(cls, value: str):
        normalized = value.strip()
        if not normalized:
            raise ValueError("category_name cannot be empty")
        return normalized

    @field_validator("transaction_date", mode="before")
    @classmethod
    def normalize_transaction_date(cls, value):
        if isinstance(value, datetime):
            return value.date()

        if isinstance(value, str) and ("T" in value or " " in value):
            parsed_value = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed_value.date()

        return value

    class Config:
        json_schema_extra = {
            "example": {
                "organization_id": "6f40ff13-a4ee-4bd7-91ba-6364bfec3568",
                "category_name": "Subscriptions",
                "amount": 960,
                "transaction_type": "income",
                "transaction_date": "2026-04-06",
                "description": "subscription",
            }
        }


class RecordUpdate(BaseModel):

    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    amount: Optional[float] = None
    transaction_type: Optional[str] = None
    transaction_date: Optional[date] = None
    description: Optional[str] = None

    @field_validator("transaction_date", mode="before")
    @classmethod
    def normalize_transaction_date(cls, value):
        if isinstance(value, datetime):
            return value.date()

        if isinstance(value, str) and ("T" in value or " " in value):
            parsed_value = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed_value.date()

        return value

    @field_validator("category_name")
    @classmethod
    def normalize_optional_category_name(cls, value):
        if value is None:
            return value

        normalized = value.strip()
        if not normalized:
            raise ValueError("category_name cannot be empty")

        return normalized


class RecordResponse(BaseModel):

    id: UUID
    organization_id: UUID
    category_name: Optional[str]
    amount: float
    transaction_type: str
    transaction_date: datetime
    description: Optional[str]

    class Config:
        from_attributes = True