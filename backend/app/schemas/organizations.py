from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class OrganizationCreate(BaseModel):
    name: str


class OrganizationResponse(BaseModel):

    id: UUID
    name: str
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True