from typing import Dict, Any, List
from datetime import datetime
from app.models.intel_package import IntelPackage
from app.models.campaign import Campaign
from app.models.entity import Entity
from app.services.fingerprint_engine import generate_evidence_chain


def generate_intelligence_package(
    campaign: Campaign, entities: List[Entity], features: Dict[str, Any]
) -> IntelPackage:
    package_id = f"PKG-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    entity_list = []
    domains = []
    for entity in entities:
        entity_list.append(
            {
                "id": entity.id,
                "type": entity.entity_type,
                "carrier": entity.carrier,
                "bank": entity.bank,
                "url": entity.url,
                "lat": entity.lat,
                "lng": entity.lng,
            }
        )
        if entity.entity_type == "DOMAIN" and entity.url:
            domains.append(entity.url)

    evidence_chain = generate_evidence_chain(features, campaign.campaign_type)

    estimated_victims = {
        "Type 7 Multi-Agent Digital Arrest": 400,
        "Type 3 SIM Swap UPI Fraud": 150,
        "Type 12 Investment Scam": 250,
    }.get(campaign.campaign_type, 200)

    financial_exposure = {
        "Type 7 Multi-Agent Digital Arrest": "₹60 Crore",
        "Type 3 SIM Swap UPI Fraud": "₹15 Crore",
        "Type 12 Investment Scam": "₹35 Crore",
    }.get(campaign.campaign_type, "₹25 Crore")

    legal_pathway = {
        "recommended_fir_sections": ["420 IPC", "467 IPC", "468 IPC", "471 IPC", "66 IT Act"],
        "cdr_scope": f"All SIMs in {campaign.location} cluster",
        "pmla_scope": "All linked bank accounts",
        "cert_in_action": "Suspicious domain takedown request",
    }

    return IntelPackage(
        id=package_id,
        campaign_id=campaign.id,
        classification=campaign.campaign_type,
        campaign_summary=f"{campaign.campaign_type} campaign detected in {campaign.location} with {campaign.sim_count} SIMs, {campaign.account_count} accounts, and {campaign.domain_count} domains. Estimated lead time: {campaign.lead_time_hours} hours.",
        entity_list=entity_list,
        evidence_chain=evidence_chain,
        timeline=campaign.timeline,
        legal_pathway=legal_pathway,
        dispatch_targets=["I4C", "TRAI", "Banks"],
        estimated_victims=estimated_victims,
        financial_exposure=financial_exposure,
        geographic_clusters=[{"lat": campaign.center_lat, "lng": campaign.center_lng, "radius_km": campaign.radius_km}],
        lead_time_hours=campaign.lead_time_hours,
        sim_ranges=["98XXXXXXXXX", "99XXXXXXXXX"],
        account_clusters=["SBI XXXXXX", "HDFC XXXXXX"],
        domains=domains,
    )
