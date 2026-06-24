import networkx as nx
import math
from typing import List, Dict, Any
from app.models.entity import Entity


def haversine_distance(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def build_graph(entities: List[Entity]) -> Dict[str, Any]:
    G = nx.Graph()

    for entity in entities:
        G.add_node(
            entity.id,
            type=entity.entity_type,
            carrier=entity.carrier,
            bank=entity.bank,
            url=entity.url,
            lat=entity.lat,
            lng=entity.lng,
        )

    hub_id = "hub"
    G.add_node(hub_id, type="CLUSTER")

    sims = [e for e in entities if e.entity_type == "SIM"]
    accounts = [e for e in entities if e.entity_type == "ACCOUNT"]
    domains = [e for e in entities if e.entity_type == "DOMAIN"]

    for sim in sims:
        G.add_edge(sim.id, hub_id)
    for account in accounts:
        G.add_edge(account.id, hub_id)
    for domain in domains:
        G.add_edge(domain.id, hub_id)

    for i, sim1 in enumerate(sims):
        for sim2 in sims[i + 1 :]:
            dist = haversine_distance(sim1.lat, sim1.lng, sim2.lat, sim2.lng)
            if dist <= 5:
                G.add_edge(sim1.id, sim2.id)

    sim_count = len(sims)
    account_count = len(accounts)
    domain_count = len(domains)
    total_nodes = G.number_of_nodes()
    total_edges = G.number_of_edges()
    graph_density = nx.density(G) if total_nodes > 1 else 0
    clustering_coefficient = (
        nx.average_clustering(G) if total_nodes > 1 else 0
    )
    connected_components = list(nx.connected_components(G))
    max_component_size = (
        max(len(c) for c in connected_components) if connected_components else 0
    )
    max_component_ratio = (
        max_component_size / total_nodes if total_nodes > 0 else 0
    )
    temporal_density = 0.7
    geo_concentration = 0.8
    sim_account_ratio = sim_count / account_count if account_count > 0 else sim_count

    features = {
        "sim_count": sim_count,
        "account_count": account_count,
        "domain_count": domain_count,
        "temporal_density": temporal_density,
        "geo_concentration": geo_concentration,
        "sim_account_ratio": sim_account_ratio,
        "graph_density": graph_density,
        "clustering_coefficient": clustering_coefficient,
        "connected_components": len(connected_components),
        "max_component_ratio": max_component_ratio,
    }

    node_limit = 150
    nodes_subset = list(G.nodes())[:node_limit]
    G_sub = G.subgraph(nodes_subset).copy()

    nodes_data = []
    for node_id, data in G_sub.nodes(data=True):
        nodes_data.append({"id": node_id, **data})

    edges_data = []
    for u, v in G_sub.edges():
        edges_data.append({"source": u, "target": v})

    return {
        "nodes": nodes_data,
        "edges": edges_data,
        "features": features,
    }
