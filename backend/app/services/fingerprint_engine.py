from typing import Dict, Any, List


def compute_confidence_score(features: Dict[str, Any], campaign_type: str) -> float:
    score = 0
    max_score = 10

    signatures = {
        "Type 7 Multi-Agent Digital Arrest": [
            ("sim_count > 200", 2),
            ("account_count > 40", 2),
            ("domain_count >= 2", 2),
            ("geo_concentration > 0.7", 2),
            ("graph_density > 0.3", 2),
        ],
        "Type 3 SIM Swap UPI Fraud": [
            ("sim_count > 70", 2),
            ("account_count > 20", 2),
            ("sim_account_ratio > 3", 2),
            ("clustering_coefficient > 0.5", 2),
            ("max_component_ratio > 0.8", 2),
        ],
        "Type 12 Investment Scam": [
            ("sim_count > 100", 2),
            ("account_count > 25", 2),
            ("domain_count >= 2", 2),
            ("temporal_density > 0.6", 2),
            ("connected_components < 3", 2),
        ],
    }

    rules = signatures.get(campaign_type, [])

    for rule, points in rules:
        parts = rule.split()
        key = parts[0]
        op = parts[1]
        val = float(parts[2])
        feat_val = features.get(key, 0)

        if op == ">" and feat_val > val:
            score += points
        elif op == ">=" and feat_val >= val:
            score += points
        elif op == "<" and feat_val < val:
            score += points

    return min(score / max_score, 1.0)


def classify_campaign(features: Dict[str, Any]) -> tuple[str, float]:
    types = [
        "Type 7 Multi-Agent Digital Arrest",
        "Type 3 SIM Swap UPI Fraud",
        "Type 12 Investment Scam",
    ]

    best_type = types[0]
    best_score = 0

    for campaign_type in types:
        score = compute_confidence_score(features, campaign_type)
        if score > best_score:
            best_score = score
            best_type = campaign_type

    return best_type, best_score


def generate_evidence_chain(
    features: Dict[str, Any], campaign_type: str
) -> List[Dict[str, Any]]:
    evidence = []

    evidence.append(
        {
            "feature": "SIM Count",
            "value": features["sim_count"],
            "description": f"Detected {features['sim_count']} activated SIMs in the cluster",
            "weight": 0.2,
        }
    )
    evidence.append(
        {
            "feature": "Account Count",
            "value": features["account_count"],
            "description": f"Identified {features['account_count']} linked mule accounts",
            "weight": 0.2,
        }
    )
    evidence.append(
        {
            "feature": "Domain Count",
            "value": features["domain_count"],
            "description": f"Registered {features['domain_count']} suspicious domains",
            "weight": 0.15,
        }
    )
    evidence.append(
        {
            "feature": "Geographic Concentration",
            "value": round(features["geo_concentration"], 2),
            "description": "Entities tightly clustered geographically",
            "weight": 0.15,
        }
    )
    evidence.append(
        {
            "feature": "Graph Density",
            "value": round(features["graph_density"], 2),
            "description": "High interconnection between entities",
            "weight": 0.15,
        }
    )
    evidence.append(
        {
            "feature": "Clustering Coefficient",
            "value": round(features["clustering_coefficient"], 2),
            "description": "Strong local connectivity patterns",
            "weight": 0.15,
        }
    )

    return evidence
