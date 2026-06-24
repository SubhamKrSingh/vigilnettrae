from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables, get_session
from app.services.synthetic_data import seed_campaigns
from app.services.graph_builder import build_graph
from app.services.fingerprint_engine import compute_confidence_score
from sqlmodel import Session, select
from app.models.campaign import Campaign
from app.models.entity import Entity
from app.routers import campaigns, entities, graph, intelligence, simulation

app = FastAPI(title="VigilNet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaigns.router)
app.include_router(entities.router)
app.include_router(graph.router)
app.include_router(intelligence.router)
app.include_router(simulation.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    session = next(get_session())
    seed_campaigns(session)

    campaigns_list = session.exec(select(Campaign)).all()
    for campaign in campaigns_list:
        entities = session.exec(select(Entity).where(Entity.campaign_id == campaign.id)).all()
        graph_data = build_graph(entities)
        features = graph_data["features"]
        campaign.features = features
        confidence = compute_confidence_score(features, campaign.campaign_type)
        campaign.confidence = confidence
    session.commit()


@app.get("/")
def root():
    return {"message": "VigilNet Predictive Fraud Intelligence System"}
