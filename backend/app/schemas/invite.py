from datetime import datetime
from pydantic import BaseModel, EmailStr
from uuid import UUID
from enum import Enum

from app.core.roles import Role


class InviteAction(str, Enum):
    accept = "accept"
    reject = "reject"


class InviteCreate(BaseModel):
    email: EmailStr
    role: Role


class InviteRespondRequest(BaseModel):
    action: InviteAction


class InviteResponse(BaseModel):

    id: UUID
    organization_id: UUID
    email: EmailStr
    role: Role
    status: str
    created_at: datetime

    class Config:
        from_attributes = True