from pydantic import BaseModel
from uuid import UUID


class CategoryResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str

    class Config:
        from_attributes = True
