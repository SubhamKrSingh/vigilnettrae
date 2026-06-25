from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.campaign import Campaign
from app.models.entity import Entity
from app.models.intel_package import IntelPackage
from app.services.package_generator import generate_intelligence_package
from app.services.graph_builder import build_graph_response

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


@router.post("/generate/{campaign_id}")
def generate_package(campaign_id: str, session: Session = Depends(get_session)):
    campaign = session.exec(select(Campaign).where(Campaign.id == campaign_id)).first()
    entities = session.exec(select(Entity).where(Entity.campaign_id == campaign_id)).all()
    graph_data = build_graph_response(campaign, entities)
    package = generate_intelligence_package(campaign, entities, graph_data["features"])
    session.add(package)
    session.commit()
    session.refresh(package)
    return {"status": "success", "data": package}


@router.get("/{package_id}")
def get_package(package_id: str, session: Session = Depends(get_session)):
    package = session.exec(select(IntelPackage).where(IntelPackage.id == package_id)).first()
    return {"status": "success", "data": package}
