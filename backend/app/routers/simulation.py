from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


@router.post("/run")
def run_simulation():
    new_campaign = {
        "id": "CAMP-2024-TN-DEMO",
        "campaign_type": "Type 7 Multi-Agent Digital Arrest",
        "name": "Demo Campaign - Tamil Nadu",
        "location": "Tamil Nadu",
        "center_lat": 11.0168,
        "center_lng": 76.9558,
        "radius_km": 35,
        "confidence": 0.92,
        "sim_count": 250,
        "account_count": 40,
        "domain_count": 2,
        "lead_time_hours": 72,
        "timeline": [
            {"time": -96, "event": "SIM acquisition"},
            {"time": -72, "event": "Mule onboarding"},
            {"time": -48, "event": "Domains registered"},
            {"time": -24, "event": "Agent briefing"},
        ],
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"status": "success", "data": {"campaign": new_campaign}}


@router.get("/metrics")
def get_metrics():
    metrics = {
        "campaigns_detected": 3,
        "entities_mapped": 312 + 47 + 2 + 85 + 23 + 156 + 31 + 3,
        "avg_confidence": 0.84,
        "lead_time_avg": 60,
    }
    return {"status": "success", "data": metrics}
