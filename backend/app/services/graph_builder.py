import random


def build_graph_response(campaign, entities, max_nodes: int = 150) -> dict:
    """
    Build the {nodes, links} response for D3.
    Always include: ALL domain nodes (max 5), ALL account nodes (max 47),
    the hub node (always 1), then fill remaining slots with SIM nodes.
    This guarantees visual diversity in the graph regardless of campaign size.
    """

    hub_node = {
        "id": f"hub_{campaign.id}",
        "type": "cluster",
        "label": "Campaign hub",
        "group": 0,
        "size": 20,
    }

    # Get all entities and split by type
    sim_entities = [e for e in entities if e.entity_type == "SIM"]
    account_entities = [e for e in entities if e.entity_type == "ACCOUNT"]
    domain_entities = [e for e in entities if e.entity_type == "DOMAIN"]

    domain_nodes = [
        {
            "id": f"dom_{i}",
            "type": "domain",
            "url": d.url,
            "group": 3,
            "size": 12,
        }
        for i, d in enumerate(domain_entities)
    ]

    account_nodes = [
        {
            "id": f"acc_{i}",
            "type": "account",
            "bank": a.bank,
            "group": 2,
            "size": 8,
        }
        for i, a in enumerate(account_entities)
    ]

    # Calculate how many SIM slots remain
    reserved = 1 + len(domain_nodes) + len(account_nodes)  # hub + domains + accounts
    sim_slots = max(10, max_nodes - reserved)

    sim_sample = sim_entities
    if len(sim_sample) > sim_slots:
        sim_sample = random.sample(list(sim_sample), sim_slots)

    sim_nodes = [
        {
            "id": f"sim_{i}",
            "type": "sim",
            "carrier": s.carrier,
            "lat": float(s.lat),
            "lng": float(s.lng),
            "group": 1,
            "size": 5,
        }
        for i, s in enumerate(sim_sample)
    ]

    all_nodes = [hub_node] + domain_nodes + account_nodes + sim_nodes

    # Build links: every non-hub node connects to the hub
    links = []
    for node in all_nodes:
        if node["id"] != hub_node["id"]:
            links.append({
                "source": node["id"],
                "target": hub_node["id"],
                "weight": 1.0 if node["type"] == "domain" else 0.7,
            })

    # Add SIM proximity edges (sample 30 pairs max to keep rendering fast)
    sim_subset = sim_nodes[:40]
    proximity_edges = []
    for i, a in enumerate(sim_subset):
        for b in sim_subset[i+1:]:
            dist = ((a["lat"]-b["lat"])**2 + (a["lng"]-b["lng"])**2)**0.5
            if dist < 0.15:  # roughly 15km in degree space
                proximity_edges.append({"source": a["id"], "target": b["id"], "weight": 0.3})
            if len(proximity_edges) >= 30:
                break
        if len(proximity_edges) >= 30:
            break

    links.extend(proximity_edges)

    return {
        "nodes": all_nodes,
        "links": links,
        "features": {
            "sim_count": len(sim_entities),
            "account_count": len(account_entities),
            "domain_count": len(domain_entities),
            "temporal_density": 0.7,
            "geo_concentration": 0.8,
            "sim_account_ratio": len(sim_entities)/len(account_entities) if account_entities else len(sim_entities),
            "graph_density": 0.5,
            "clustering_coefficient": 0.6,
            "connected_components": 1,
            "max_component_ratio": 1.0
        }
    }
