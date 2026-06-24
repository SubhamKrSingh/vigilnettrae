from sqlmodel import SQLModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import JSON


class IntelPackage(SQLModel, table=True):
    __tablename__ = "intel_packages"

    id: str = Field(primary_key=True)
    campaign_id: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    classification: str
    campaign_summary: str
    entity_list: List[Dict[str, Any]] = Field(sa_type=JSON)
    evidence_chain: List[Dict[str, Any]] = Field(sa_type=JSON)
    timeline: List[Dict[str, Any]] = Field(sa_type=JSON)
    legal_pathway: Dict[str, Any] = Field(sa_type=JSON)
    dispatch_targets: List[str] = Field(sa_type=JSON)
    estimated_victims: int
    financial_exposure: str
    geographic_clusters: List[Dict[str, Any]] = Field(sa_type=JSON)
    lead_time_hours: int
    sim_ranges: List[str] = Field(sa_type=JSON)
    account_clusters: List[str] = Field(sa_type=JSON)
    domains: List[str] = Field(sa_type=JSON)
