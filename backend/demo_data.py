#!/usr/bin/env python3
"""
backend/demo_data.py
--------------------
Utility script to seed high-fidelity cyber-defense demo data into the Neo4j Knowledge Graph.
This enables fully offline or highly stable live mock/Aura demonstrations with realistic
Indian banking infrastructure assets, CVEs, alerts, MITRE ATT&CK techniques, and simulation scenarios.
"""

import os
import sys
import logging
from datetime import datetime

# Add parent directory to sys.path to allow execution from either backend/ or root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import settings
from graph.neo4j_client import Neo4jClient

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sarathi.demo_data")

def seed_demo_data():
    _sep = "=" * 70
    print(f"\n{_sep}")
    print("  Sarathi Cyberdefense - High-Fidelity Demo Data Ingest Pipeline")
    print(_sep)

    # 1. Initialize Neo4j Client
    print("\n[1/7] Connecting to Cyber Knowledge Graph...")
    db = Neo4jClient()
    
    if db.mock_mode:
        print("  [WARN] Neo4j is operating in MOCK MODE (in-memory).")
        print("  Offline mock seed complete. Core services will fall back to local data.")
        print(f"{_sep}\n")
        return

    # 2. Reset the database to ensure clean, predictable data for judges
    print("\n[2/7] Clearing stale graph state (matching constraints)...")
    db.reset_graph(confirm=True)

    # 3. Seed Banking Infrastructure Assets
    print("\n[3/7] Seeding realistic banking infrastructure assets (Digital Twin Topology)...")
    assets = [
        {
            "id": "Asset_1",
            "name": "External Web Application Gateway",
            "type": "Gateway",
            "criticality": 10,
            "exposure": "Public",
            "owner": "SRE Platform Team",
            "environment": "Production",
            "ip_address": "10.100.1.10"
        },
        {
            "id": "Asset_2",
            "name": "IAM Authentication Router Service",
            "type": "Microservice",
            "criticality": 9,
            "exposure": "Internal",
            "owner": "Identity & Security Team",
            "environment": "Production",
            "ip_address": "10.200.2.15"
        },
        {
            "id": "Asset_3",
            "name": "Admin Control Dashboard Host",
            "type": "WebApp",
            "criticality": 8,
            "exposure": "Internal",
            "owner": "Engineering DevOps",
            "environment": "Production",
            "ip_address": "10.200.2.40"
        },
        {
            "id": "Asset_4",
            "name": "Core Customer Vault DB Cluster",
            "type": "Database",
            "criticality": 10,
            "exposure": "Private",
            "owner": "Data Platform Team",
            "environment": "Production",
            "ip_address": "10.300.5.100"
        },
        {
            "id": "Asset_5",
            "name": "SWIFT Transaction Gateway Host",
            "type": "Gateway",
            "criticality": 10,
            "exposure": "Private",
            "owner": "Core Banking Ops",
            "environment": "Production",
            "ip_address": "10.300.5.200"
        }
    ]

    asset_query = """
    MERGE (a:Asset {id: $id})
    SET a.name        = $name,
        a.type        = $type,
        a.criticality = $criticality,
        a.exposure    = $exposure,
        a.owner       = $owner,
        a.environment = $environment,
        a.ip_address  = $ip_address
    """
    for asset in assets:
        db.execute_write(asset_query, asset)
    print(f"  * Seeded {len(assets)} Asset nodes.")

    # 4. Wire Attack Propagation Paths (CONNECTS_TO)
    print("\n[4/7] Constructing lateral movement topology edges (Attack Paths)...")
    topology = [
        ("Asset_1", "Asset_2", "HTTP/REST"),
        ("Asset_1", "Asset_3", "HTTP/REST"),
        ("Asset_2", "Asset_4", "SQL/Bolt"),
        ("Asset_3", "Asset_4", "SSH/Internal"),
        ("Asset_3", "Asset_5", "SWIFT-API"),
        ("Asset_2", "Asset_5", "gRPC-Internal")
    ]
    
    topology_query = """
    MATCH (a:Asset {id: $from_id})
    MATCH (b:Asset {id: $to_id})
    MERGE (a)-[r:CONNECTS_TO]->(b)
    SET r.protocol = $protocol
    """
    for from_id, to_id, proto in topology:
        db.execute_write(topology_query, {"from_id": from_id, "to_id": to_id, "protocol": proto})
    print(f"  * Seeded {len(topology)} topological CONNECTS_TO relationships.")

    # 5. Seed CVEs (Vulnerabilities) & MITRE Techniques
    print("\n[5/7] Seeding CVEs, MITRE mappings, and Threat Actors...")
    cves = [
        {
            "cve_id": "CVE-2026-1043",
            "severity": "CRITICAL",
            "cvss_score": 9.8,
            "description": "Remote Code Execution (RCE) in Web Application Gateway via crafted HTTP requests.",
            "epss_score": 0.95,
            "epss_percentile": 99.1,
            "is_kev": True,
            "kev_due_date": "2026-06-01",
            "target_asset": "Asset_1"
        },
        {
            "cve_id": "CVE-2026-2090",
            "severity": "HIGH",
            "cvss_score": 8.8,
            "description": "SQL Injection in IAM Auth Module allows unauthenticated database schema exfiltration.",
            "epss_score": 0.72,
            "epss_percentile": 92.4,
            "is_kev": True,
            "kev_due_date": "2026-06-15",
            "target_asset": "Asset_2"
        },
        {
            "cve_id": "CVE-2026-3022",
            "severity": "HIGH",
            "cvss_score": 7.8,
            "description": "Privileged Session Hijacking in Admin Dashboard allows complete container breakout.",
            "epss_score": 0.35,
            "epss_percentile": 85.0,
            "is_kev": False,
            "kev_due_date": "",
            "target_asset": "Asset_3"
        },
        {
            "cve_id": "CVE-2026-4401",
            "severity": "MEDIUM",
            "cvss_score": 6.5,
            "description": "Buffer Overflow in legacy network packet buffers leading to memory resource exhaustion.",
            "epss_score": 0.08,
            "epss_percentile": 42.1,
            "is_kev": False,
            "kev_due_date": "",
            "target_asset": "Asset_5"
        }
    ]

    cve_query = """
    MERGE (v:Vulnerability {cve_id: $cve_id})
    SET v.cvss_score      = $cvss_score,
        v.severity        = $severity,
        v.description     = $description,
        v.epss_score      = $epss_score,
        v.epss_percentile = $epss_percentile,
        v.is_kev          = $is_kev,
        v.kev_due_date    = $kev_due_date
    """
    
    asset_cve_query = """
    MATCH (a:Asset {id: $asset_id})
    MATCH (v:Vulnerability {cve_id: $cve_id})
    MERGE (a)-[:HAS_VULNERABILITY]->(v)
    """

    for cve in cves:
        db.execute_write(cve_query, cve)
        db.execute_write(asset_cve_query, {"asset_id": cve["target_asset"], "cve_id": cve["cve_id"]})
    print(f"  * Seeded {len(cves)} Vulnerability nodes and associated asset exposure links.")

    # Seed MITRE Techniques
    techniques = [
        {"id": "T1190", "name": "Exploit Public-Facing Application", "tactic": "Initial Access", "capec_id": "CAPEC-115", "capec_name": "SQL Injection"},
        {"id": "T1110", "name": "Brute Force", "tactic": "Credential Access", "capec_id": "CAPEC-112", "capec_name": "Brute Force Password Cracking"},
        {"id": "T1078", "name": "Valid Accounts", "tactic": "Defense Evasion / Persistence", "capec_id": "CAPEC-70", "capec_name": "Privilege Escalation"},
        {"id": "T1498", "name": "Network Denial of Service", "tactic": "Impact", "capec_id": "CAPEC-125", "capec_name": "Flooding"},
        {"id": "T1021", "name": "Remote Services", "tactic": "Lateral Movement", "capec_id": "CAPEC-29", "capec_name": "Leveraging Remote Services"},
        {"id": "T1486", "name": "Data Encrypted for Impact", "tactic": "Impact", "capec_id": "CAPEC-220", "capec_name": "Ransomware encryption"}
    ]

    tech_query = """
    MERGE (t:Technique {technique_id: $id})
    SET t.name       = $name,
        t.tactic     = $tactic,
        t.capec_id   = $capec_id,
        t.capec_name = $capec_name
    """
    
    cve_tech_query = """
    MATCH (v:Vulnerability {cve_id: $cve_id})
    MATCH (t:Technique {technique_id: $tech_id})
    MERGE (v)-[:MAPS_TO_TECHNIQUE]->(t)
    """

    for tech in techniques:
        db.execute_write(tech_query, tech)

    # Link CVEs to MITRE Techniques
    mappings = [
        ("CVE-2026-1043", "T1190"),
        ("CVE-2026-2090", "T1190"),
        ("CVE-2026-3022", "T1078"),
        ("CVE-2026-4401", "T1498")
    ]
    for cve_id, tech_id in mappings:
        db.execute_write(cve_tech_query, {"cve_id": cve_id, "tech_id": tech_id})
        
    print(f"  * Seeded {len(techniques)} MITRE Technique nodes and linked mappings.")

    # Seed Threat Actors
    actors = [
        {"name": "APT29 (Cozy Bear)", "motivation": "Espionage", "sophistication": "Nation-State"},
        {"name": "FIN7 (Carbon Spider)", "motivation": "Financial Gain", "sophistication": "Organized Crime"}
    ]
    actor_query = """
    MERGE (ta:ThreatActor {name: $name})
    SET ta.motivation = $motivation,
        ta.sophistication = $sophistication
    """
    actor_tech_query = """
    MATCH (ta:ThreatActor {name: $actor_name})
    MATCH (t:Technique {technique_id: $tech_id})
    MERGE (ta)-[:USES_TECHNIQUE]->(t)
    """
    for actor in actors:
        db.execute_write(actor_query, actor)
    
    db.execute_write(actor_tech_query, {"actor_name": "APT29 (Cozy Bear)", "tech_id": "T1190"})
    db.execute_write(actor_tech_query, {"actor_name": "APT29 (Cozy Bear)", "tech_id": "T1021"})
    db.execute_write(actor_tech_query, {"actor_name": "FIN7 (Carbon Spider)", "tech_id": "T1110"})
    db.execute_write(actor_tech_query, {"actor_name": "FIN7 (Carbon Spider)", "tech_id": "T1486"})
    print(f"  * Seeded Threat Actor profiles and attribution links.")

    # 6. Seed Simulation Scenarios & Active Alerts
    print("\n[6/7] Seeding active alerts and simulated breach records in the graph...")
    alerts = [
        {
            "id": "alert_01",
            "timestamp": datetime.now().isoformat()[:19],
            "severity": "CRITICAL",
            "asset_id": "Asset_1",
            "message": "Reconnaissance scan: External port sweep detected targeting Platform Web Gateway",
            "status": "UNRESOLVED",
            "cve_id": "CVE-2026-1043",
            "technique_id": "T1190"
        },
        {
            "id": "alert_02",
            "timestamp": datetime.now().isoformat()[:19],
            "severity": "HIGH",
            "asset_id": "Asset_2",
            "message": "API Abuse: Unexpected brute force authorization requests against /api/v1/auth",
            "status": "UNRESOLVED",
            "cve_id": "CVE-2026-2090",
            "technique_id": "T1110"
        },
        {
            "id": "alert_03",
            "timestamp": datetime.now().isoformat()[:19],
            "severity": "HIGH",
            "asset_id": "Asset_3",
            "message": "Privilege Escalation: Administrator account accessed from unauthorized host segment",
            "status": "UNRESOLVED",
            "cve_id": "CVE-2026-3022",
            "technique_id": "T1078"
        }
    ]
    
    alert_query = """
    MERGE (al:Alert {id: $id})
    SET al.timestamp = $timestamp,
        al.severity = $severity,
        al.message = $message,
        al.status = $status,
        al.cve_id = $cve_id,
        al.technique_id = $technique_id
    """
    alert_asset_link = """
    MATCH (al:Alert {id: $id})
    MATCH (a:Asset {id: $asset_id})
    MERGE (al)-[:AFFECTS_ASSET]->(a)
    """
    alert_cve_link = """
    MATCH (al:Alert {id: $id})
    MATCH (v:Vulnerability {cve_id: $cve_id})
    MERGE (al)-[:RELATED_TO_CVE]->(v)
    """
    
    for alert in alerts:
        db.execute_write(alert_query, alert)
        db.execute_write(alert_asset_link, {"id": alert["id"], "asset_id": alert["asset_id"]})
        if alert["cve_id"]:
            db.execute_write(alert_cve_link, {"id": alert["id"], "cve_id": alert["cve_id"]})
            
    print(f"  * Seeded baseline incident Alerts and graph references.")

    # Seed Simulation Scenarios as nodes for visual correlation
    scenarios = [
        {"id": "lateral_movement", "name": "DMZ to Core Banking Lateral Movement", "difficulty": "HIGH", "start": "Asset_1", "target": "Asset_4"},
        {"id": "swift_fraud", "name": "SWIFT Gateway Compromise", "difficulty": "CRITICAL", "start": "Asset_3", "target": "Asset_5"},
        {"id": "ransomware_spread", "name": "Network-Wide Ransomware Propagation", "difficulty": "MEDIUM", "start": "Asset_3", "target": "Asset_4"}
    ]
    
    scenario_node_query = """
    MERGE (s:SimulationScenario {scenario_id: $id})
    SET s.name = $name,
        s.difficulty = $difficulty
    """
    scenario_start_query = """
    MATCH (s:SimulationScenario {scenario_id: $id})
    MATCH (a:Asset {id: $start})
    MERGE (s)-[:STARTS_AT]->(a)
    """
    scenario_target_query = """
    MATCH (s:SimulationScenario {scenario_id: $id})
    MATCH (a:Asset {id: $target})
    MERGE (s)-[:TARGETS]->(a)
    """
    
    for sc in scenarios:
        db.execute_write(scenario_node_query, sc)
        db.execute_write(scenario_start_query, sc)
        db.execute_write(scenario_target_query, sc)
        
    print(f"  * Seeded Red Team Simulation Scenario templates.")

    # 7. Print Seed Diagnostics
    print("\n[7/7] Verifying database seeding consistency...")
    counts = db.get_node_counts()
    print("\n  +- Seeded Node Statistics ----------------------------")
    for k, v in sorted(counts.items()):
        print(f"  |  {k:<20} : {v} nodes")
    print("  +-----------------------------------------------------")

    rel_counts = db.get_relationship_counts()
    print("\n  +- Seeded Relationship Statistics --------------------")
    for k, v in sorted(rel_counts.items()):
        print(f"  |  {k:<25} : {v} links")
    print("  +-----------------------------------------------------")

    print(f"\n{_sep}")
    print("  SUCCESS - CYBER KNOWLEDGE GRAPH FULLY STABILIZED & DEMO-READY!")
    print(f"{_sep}\n")

if __name__ == "__main__":
    seed_demo_data()
