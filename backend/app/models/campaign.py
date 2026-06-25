from sqlmodel import SQLModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import JSON


class Campaign(SQLModel, table=True):
    __tablename__ = "campaigns"

    id: str = Field(primary_key=True)
    campaign_type: str  # full string e.g. "Type 7: Multi-Agent Digital Arrest"
    type_code: int
    name: Optional[str] = None
    location: str
    center_lat: float
    center_lng: float
    radius_km: float
    confidence: float = Field(default=0.75)
    sim_count: int
    account_count: int
    domain_count: int
    lead_time_hours: int
    timeline: List[Dict[str, Any]] = Field(default_factory=list, sa_type=JSON)
    features: Optional[Dict[str, Any]] = Field(default=None, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"
