from faker import Faker
import random
import math
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.models.entity import Entity
from app.models.campaign import Campaign

fake = Faker("en_IN")


def generate_point_in_circle(center_lat, center_lng, radius_km):
    radius_deg = radius_km / 111.32
    u = random.uniform(0, 1)
    v = random.uniform(0, 1)
    w = radius_deg * math.sqrt(u)
    t = 2 * math.pi * v
    x = w * math.cos(t)
    y = w * math.sin(t)
    new_lat = center_lat + y
    new_lng = center_lng + x / math.cos(math.radians(center_lat))
    return (new_lat, new_lng)


def create_synthetic_entities(
    campaign_id: str,
    sim_count: int,
    account_count: int,
    domain_count: int,
    center_lat: float,
    center_lng: float,
    radius_km: float,
) -> List[Entity]:
    entities = []

    carriers = ["Airtel", "Jio", "Vodafone Idea", "BSNL"]
    banks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak"]

    for _ in range(sim_count):
        lat, lng = generate_point_in_circle(center_lat, center_lng, radius_km)
        entities.append(
            Entity(
                campaign_id=campaign_id,
                entity_type="SIM",
                carrier=random.choice(carriers),
                phone=fake.phone_number(),
                lat=lat,
                lng=lng,
            )
        )

    for _ in range(account_count):
        lat, lng = generate_point_in_circle(center_lat, center_lng, radius_km)
        entities.append(
            Entity(
                campaign_id=campaign_id,
                entity_type="ACCOUNT",
                bank=random.choice(banks),
                account_no=fake.iban(),
                lat=lat,
                lng=lng,
            )
        )

    return entities


def seed_campaigns(session):
    if session.query(Campaign).count() > 0:
        return

    campaigns_data = [
        {
            "id": "CAMP-2024-TN-0047",
            "campaign_type": "Type 7 Multi-Agent Digital Arrest",
            "name": "Chennai–Coimbatore Digital Arrest Campaign",
            "location": "Chennai–Coimbatore corridor",
            "center_lat": 11.0168,
            "center_lng": 76.9558,
            "radius_km": 40,
            "sim_count": 312,
            "account_count": 47,
            "domain_count": 2,
            "lead_time_hours": 72,
            "timeline": [
                {"time": -96, "event": "SIM acquisition"},
                {"time": -72, "event": "Mule onboarding"},
                {"time": -48, "event": "Domains registered"},
                {"time": -24, "event": "Agent briefing"},
                {"time": 0, "event": "Victim contact prevented"},
            ],
            "domains": [
                "income-tax-verification-india.net",
                "cbijustice-portal.co.in",
            ],
        },
        {
            "id": "CAMP-2024-MH-0012",
            "campaign_type": "Type 3 SIM Swap UPI Fraud",
            "name": "Mumbai SIM Swap Network",
            "location": "Mumbai",
            "center_lat": 19.0760,
            "center_lng": 72.8777,
            "radius_km": 30,
            "sim_count": 85,
            "account_count": 23,
            "domain_count": 0,
            "lead_time_hours": 48,
            "timeline": [
                {"time": -72, "event": "SIM acquisition"},
                {"time": -48, "event": "Account setup"},
                {"time": -24, "event": "Swap preparation"},
            ],
            "domains": [],
        },
        {
            "id": "CAMP-2024-DL-0089",
            "campaign_type": "Type 12 Investment Scam",
            "name": "Delhi NCR Investment Ring",
            "location": "Delhi NCR",
            "center_lat": 28.6139,
            "center_lng": 77.2090,
            "radius_km": 50,
            "sim_count": 156,
            "account_count": 31,
            "domain_count": 3,
            "lead_time_hours": 60,
            "timeline": [
                {"time": -96, "event": "SIM activation"},
                {"time": -72, "event": "Domain registration"},
                {"time": -48, "event": "Social media setup"},
                {"time": -24, "event": "Victim outreach planned"},
            ],
            "domains": [
                "cryptoinvestindia.com",
                "fixedreturnindia.in",
                "wealthguru-india.org",
            ],
        },
    ]

    for data in campaigns_data:
        campaign = Campaign(
            id=data["id"],
            campaign_type=data["campaign_type"],
            name=data["name"],
            location=data["location"],
            center_lat=data["center_lat"],
            center_lng=data["center_lng"],
            radius_km=data["radius_km"],
            sim_count=data["sim_count"],
            account_count=data["account_count"],
            domain_count=data["domain_count"],
            lead_time_hours=data["lead_time_hours"],
            timeline=data["timeline"],
        )
        session.add(campaign)

        entities = create_synthetic_entities(
            data["id"],
            data["sim_count"],
            data["account_count"],
            data["domain_count"],
            data["center_lat"],
            data["center_lng"],
            data["radius_km"],
        )
        for domain in data["domains"]:
            lat, lng = generate_point_in_circle(
                data["center_lat"], data["center_lng"], data["radius_km"]
            )
            entities.append(
                Entity(
                    campaign_id=data["id"],
                    entity_type="DOMAIN",
                    url=domain,
                    lat=lat,
                    lng=lng,
                )
            )

        for entity in entities:
            session.add(entity)

    session.commit()
