from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.campaign import Campaign

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.get("")
def get_campaigns(session: Session = Depends(get_session)):
    campaigns = session.exec(select(Campaign)).all()
    return {"status": "success", "data": campaigns}


@router.get("/{campaign_id}")
def get_campaign(campaign_id: str, session: Session = Depends(get_session)):
    campaign = session.exec(select(Campaign).where(Campaign.id == campaign_id)).first()
    return {"status": "success", "data": campaign}
