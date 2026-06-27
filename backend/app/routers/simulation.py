from fastapi import APIRouter, Depends
from sqlmodel import Session, select, delete
from datetime import datetime, timedelta
import random
import numpy as np
from app.database import get_session
from app.models.campaign import Campaign
from app.models.entity import Entity

router = APIRouter(prefix="/api/simulation", tags=["simulation"])

# Pool of cities not already used (Delhi, Mumbai, Coimbatore are taken)
DEMO_CITIES = [
    {"name": "Hyderabad",  "location": "Hyderabad, Telangana",   "lat": 17.3850, "lng": 78.4867},
    {"name": "Kolkata",    "location": "Kolkata, West Bengal",    "lat": 22.5726, "lng": 88.3639},
    {"name": "Bengaluru",  "location": "Bengaluru, Karnataka",    "lat": 12.9716, "lng": 77.5946},
    {"name": "Pune",       "location": "Pune, Maharashtra",       "lat": 18.5204, "lng": 73.8567},
    {"name": "Ahmedabad",  "location": "Ahmedabad, Gujarat",      "lat": 23.0225, "lng": 72.5714},
    {"name": "Jaipur",     "location": "Jaipur, Rajasthan",       "lat": 26.9124, "lng": 75.7873},
    {"name": "Lucknow",    "location": "Lucknow, Uttar Pradesh",  "lat": 26.8467, "lng": 80.9462},
    {"name": "Bhopal",     "location": "Bhopal, Madhya Pradesh",  "lat": 23.2599, "lng": 77.4126},
    {"name": "Nagpur",     "location": "Nagpur, Maharashtra",     "lat": 21.1458, "lng": 79.0882},
    {"name": "Surat",      "location": "Surat, Gujarat",          "lat": 21.1702, "lng": 72.8311},
]


@router.post("/run")
def run_simulation(session: Session = Depends(get_session)):
    """
    Generate a new Type 7 Digital Arrest campaign at a random city.
    Adds it to the DB without removing existing campaigns.
    Returns the new campaign object immediately.
    """
    # Pick a city not already used in this session
    # Check which locations are already in DB
    existing = session.exec(select(Campaign)).all()
    used_locs = {c.location for c in existing}
    available = [c for c in DEMO_CITIES if c["location"] not in used_locs]
    if not available:
        available = DEMO_CITIES  # all used, just pick random

    city = random.choice(available)

    # Campaign timing: kickoff was 80 hours ago
    now = datetime.utcnow()
    kickoff = now - timedelta(hours=80)

    # Generate SIM data
    np.random.seed(None)
    n_sims = random.randint(180, 280)
    sim_spread = 0.35  # degrees ~ 35km

    sim_lats = np.random.normal(city["lat"], sim_spread, n_sims).tolist()
    sim_lngs = np.random.normal(city["lng"], sim_spread, n_sims).tolist()
    # Timestamps: Gaussian burst centred 72h ago
    sim_offsets = np.random.normal(-72, 14, n_sims)  # hours from now

    n_accounts = random.randint(35, 55)
    n_domains = random.randint(1, 3)
    confidence = round(random.uniform(0.82, 0.94), 2)
    lead_time = int((now - kickoff).total_seconds() / 3600)

    # Build campaign ID with timestamp for uniqueness
    ts = now.strftime("%Y%m%d%H%M%S")
    campaign_id = f"CAMP-LIVE-{city['name'].upper()[:3]}-{ts}"

    # Delete any previous LIVE campaign to keep list clean
    old_live = session.exec(
        select(Campaign).where(Campaign.id.like("CAMP-LIVE-%"))
    ).all()
    for old in old_live:
        # also delete their entities
        session.exec(delete(Entity).where(Entity.campaign_id == old.id))
        session.delete(old)
    session.commit()

    # Create new campaign record
    campaign = Campaign(
        id=campaign_id,
        type_code=7,
        campaign_type="Type 7: Multi-Agent Digital Arrest",
        location=city["location"],
        center_lat=city["lat"],
        center_lng=city["lng"],
        radius_km=35,
        confidence=confidence,
        sim_count=n_sims,
        account_count=n_accounts,
        domain_count=n_domains,
        entity_total=n_sims + n_accounts + n_domains,
        lead_time_hours=lead_time,
        detected_at=now.isoformat() + "Z",
        status="live",
        is_demo=True,
        timeline=[
            {"time": -96, "event": "SIM acquisition"},
            {"time": -72, "event": "Mule onboarding"},
            {"time": -48, "event": "Domains registered"},
            {"time": -24, "event": "Agent briefing"},
            {"time": 0, "event": "Victim contact prevented"},
        ],
    )
    session.add(campaign)

    # Create SIM records
    carriers = ["Airtel", "Jio", "BSNL", "Vi"]
    for i in range(n_sims):
        sim = Entity(
            campaign_id=campaign_id,
            entity_type="SIM",
            carrier=random.choice(carriers),
            lat=sim_lats[i],
            lng=sim_lngs[i],
        )
        session.add(sim)

    # Create mule account records
    banks = ["HDFC", "ICICI", "Axis", "SBI", "Kotak", "IndusInd"]
    for i in range(n_accounts):
        acc = Entity(
            campaign_id=campaign_id,
            entity_type="ACCOUNT",
            bank=random.choice(banks),
            lat=np.random.normal(city["lat"], sim_spread),
            lng=np.random.normal(city["lng"], sim_spread),
        )
        session.add(acc)

    # Create domain records
    domain_templates = [
        f"cbi-justice-{city['name'].lower()}.net",
        f"income-tax-verify-{city['name'].lower()}.co.in",
        f"ed-notice-portal-{city['name'].lower()}.org",
    ]
    for i in range(n_domains):
        dom = Entity(
            campaign_id=campaign_id,
            entity_type="DOMAIN",
            url=domain_templates[i % len(domain_templates)],
            lat=np.random.normal(city["lat"], sim_spread),
            lng=np.random.normal(city["lng"], sim_spread),
        )
        session.add(dom)

    session.commit()
    session.refresh(campaign)

    return {
        "status": "success",
        "data": {
            "id": campaign.id,
            "type_code": campaign.type_code,
            "campaign_type": campaign.campaign_type,
            "location": campaign.location,
            "lat": campaign.center_lat,
            "lng": campaign.center_lng,
            "confidence": campaign.confidence,
            "sim_count": campaign.sim_count,
            "account_count": campaign.account_count,
            "domain_count": campaign.domain_count,
            "entity_total": campaign.entity_total,
            "lead_time_hours": campaign.lead_time_hours,
            "detected_at": campaign.detected_at,
            "status": campaign.status,
            "is_demo": True,
            "city_name": city["name"],
        }
    }


@router.get("/metrics")
def get_metrics(session: Session = Depends(get_session)):
    campaigns = session.exec(select(Campaign)).all()
    total_entities = sum(c.sim_count + c.account_count + c.domain_count for c in campaigns)
    avg_confidence = sum(c.confidence for c in campaigns) / len(campaigns) if campaigns else 0
    avg_lead_time = sum(c.lead_time_hours for c in campaigns) / len(campaigns) if campaigns else 0

    metrics = {
        "campaigns_detected": len(campaigns),
        "entities_mapped": total_entities,
        "avg_confidence": round(avg_confidence, 2),
        "lead_time_avg": round(avg_lead_time, 0),
    }
    return {"status": "success", "data": metrics}
