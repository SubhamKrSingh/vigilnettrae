from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.entity import Entity
from app.models.campaign import Campaign
from app.services.graph_builder import build_graph_response

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/{campaign_id}")
def get_graph(campaign_id: str, session: Session = Depends(get_session)):
    campaign = session.exec(select(Campaign).where(Campaign.id == campaign_id)).first()
    entities = session.exec(select(Entity).where(Entity.campaign_id == campaign_id)).all()
    graph_data = build_graph_response(campaign, entities)
    return {"status": "success", "data": graph_data}
