from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.entity import Entity

router = APIRouter(prefix="/api/entities", tags=["entities"])


@router.get("/campaign/{campaign_id}")
def get_entities_by_campaign(campaign_id: str, session: Session = Depends(get_session)):
    entities = session.exec(select(Entity).where(Entity.campaign_id == campaign_id)).all()
    return {"status": "success", "data": entities}
