from datetime import datetime
from pydantic import BaseModel, EmailStr
from uuid import UUID

from app.core.roles import Role


class AddMemberRequest(BaseModel):
    email: EmailStr
    role: Role


class UpdateMemberRole(BaseModel):
    role: Role


class MemberResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    role: Role
    joined_at: datetime

    class Config:
        from_attributes = True