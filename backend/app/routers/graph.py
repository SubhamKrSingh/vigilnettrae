from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.entity import Entity
from app.services.graph_builder import build_graph

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/{campaign_id}")
def get_graph(campaign_id: str, session: Session = Depends(get_session)):
    entities = session.exec(select(Entity).where(Entity.campaign_id == campaign_id)).all()
    graph_data = build_graph(entities)
    return {"status": "success", "data": graph_data}
