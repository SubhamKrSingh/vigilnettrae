from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Entity(SQLModel, table=True):
    __tablename__ = "entities"

    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: str = Field(index=True)
    entity_type: str
    carrier: Optional[str] = None
    bank: Optional[str] = None
    url: Optional[str] = None
    phone: Optional[str] = None
    account_no: Optional[str] = None
    lat: float
    lng: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
