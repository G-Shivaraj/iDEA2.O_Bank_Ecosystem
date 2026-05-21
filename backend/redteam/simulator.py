import hashlib
import random
from typing import List, Dict, Any
from datetime import datetime

from ml.attack_path import AttackPathAnalyzer

class RedTeamSimulator:
    """
    Simulates automated red team scenarios (e.g. ransomware propagation, lateral movement).
    Generates realistic multi-stage alerts and execution metrics.
    """
    def __init__(self):
        self.scenarios = {
            "lateral_movement": {
                "scenarioId": "lateral_movement",
                "name": "DMZ to Core Banking Lateral Movement",
                "description": "Attacker moves from DMZ to core banking systems.",
                "mitreTactics": ["TA0008", "TA0004"], # Lateral Movement, Privilege Escalation
                "targetAsset": "Asset_4",
                "attackerStartPoint": "Asset_1",
                "difficulty": "HIGH"
            },
            "credential_stuffing": {
                "scenarioId": "credential_stuffing",
                "name": "IAM Infrastructure Credential Stuffing",
                "description": "Brute-force attack against IAM infrastructure.",
                "mitreTactics": ["TA0006", "TA0008"], # Credential Access, Lateral Movement
                "targetAsset": "Asset_2",
                "attackerStartPoint": "Asset_1",
                "difficulty": "LOW"
            },
            "swift_fraud": {
                "scenarioId": "swift_fraud",
                "name": "SWIFT Gateway Compromise",
                "description": "Compromise targeting SWIFT gateway.",
                "mitreTactics": ["TA0040", "TA0003"], # Impact, Persistence
                "targetAsset": "Asset_5",
                "attackerStartPoint": "Asset_3",
                "difficulty": "CRITICAL"
            },
            "ransomware_spread": {
                "scenarioId": "ransomware_spread",
                "name": "Network-Wide Ransomware Propagation",
                "description": "Ransomware propagation across banking network.",
                "mitreTactics": ["TA0040", "TA0011"], # Impact, Command and Control
                "targetAsset": "Asset_4", # Used as the final target in the path calculation
                "attackerStartPoint": "Asset_3",
                "difficulty": "MEDIUM"
            },
            "insider_threat": {
                "scenarioId": "insider_threat",
                "name": "Privileged Insider Abuse",
                "description": "Privileged user abusing access to sensitive systems.",
                "mitreTactics": ["TA0004", "TA0005"], # Privilege Escalation, Defense Evasion
                "targetAsset": "Asset_4",
                "attackerStartPoint": "Asset_2",
                "difficulty": "HIGH"
            }
        }

    def get_all_scenarios(self) -> Dict[str, Any]:
        """Returns all detailed scenarios."""
        return self.scenarios

    def get_available_scenarios(self) -> List[str]:
        """Maintains backward compatibility for routes_redteam.py"""
        return list(self.scenarios.keys())

    def simulate_attack(self, scenario_id: str, neo4j_client) -> Dict[str, Any]:
        """
        Executes a step-by-step red team simulation for a given scenario using deterministic randomness.
        """
        if scenario_id not in self.scenarios:
            raise ValueError(f"Scenario {scenario_id} not found.")

        scenario = self.scenarios[scenario_id]

        # Use deterministic random seed per scenario for reproducible demos
        seed_val = int(hashlib.md5(scenario_id.encode('utf-8')).hexdigest(), 16) % (2**32)
        rng = random.Random(seed_val)

        analyzer = AttackPathAnalyzer(neo4j_client)
        source = scenario["attackerStartPoint"]
        target = scenario["targetAsset"]

        # Retrieve attack path using existing analyzer
        paths = analyzer.find_attack_paths(neo4j_client, source=source, target=target)
        
        path_nodes = []
        if paths and len(paths) > 0:
            path_nodes = paths[0].get("path_nodes", [])

        # Fallback if no valid path was found from graph
        if not path_nodes:
            path_nodes = [source, target]

        steps = []
        success_count = 0
        total_steps = len(path_nodes) * 2

        assets_compromised = set()
        techniques_used = set()
        vulns_discovered = set()
        
        now_ms = int(datetime.now().timestamp() * 1000)

        for idx, asset in enumerate(path_nodes):
            # Stage 1: Exploitation / Access at current asset
            roll = rng.random()
            if roll < 0.70:
                status = "SUCCESS"
                success_count += 1
                assets_compromised.add(asset)
                finding = f"Successfully compromised {asset}"
            elif roll < 0.90:
                status = "DETECTED"
                finding = f"Suspicious activity detected at {asset}, attempting evasion"
            else:
                status = "BLOCKED"
                finding = f"Exploit attempt blocked at {asset} by endpoint defenses"

            technique = rng.choice(scenario["mitreTactics"])
            techniques_used.add(technique)
            
            if status == "SUCCESS":
                vulns_discovered.add(f"CVE-2026-{rng.randint(1000, 9999)}")

            steps.append({
                "stepId": f"step_{idx}_1",
                "technique": technique,
                "asset": asset,
                "status": status,
                "timeMs": 150 + rng.randint(10, 100),
                "timestamp": datetime.fromtimestamp(now_ms / 1000.0).isoformat()[:19],
                "finding": finding
            })
            now_ms += rng.randint(1000, 5000)

            # Stage 2: Lateral Movement / Pivot (except for the last node)
            if idx < len(path_nodes) - 1:
                roll = rng.random()
                if roll < 0.70:
                    status = "SUCCESS"
                    success_count += 1
                    finding = f"Successfully pivoted from {asset} to next hop"
                elif roll < 0.90:
                    status = "DETECTED"
                    finding = f"Lateral movement from {asset} detected by network sensors"
                else:
                    status = "BLOCKED"
                    finding = f"Pivoting blocked at {asset} egress interface"

                technique = rng.choice(scenario["mitreTactics"])
                techniques_used.add(technique)

                steps.append({
                    "stepId": f"step_{idx}_2",
                    "technique": technique,
                    "asset": asset,
                    "status": status,
                    "timeMs": 250 + rng.randint(20, 150),
                    "timestamp": datetime.fromtimestamp(now_ms / 1000.0).isoformat()[:19],
                    "finding": finding
                })
                now_ms += rng.randint(1000, 5000)

        # Calculate overall success metrics
        overall_success_rate = success_count / total_steps if total_steps > 0 else 0.0

        if overall_success_rate > 0.6:
            verdict = "CRITICAL GAPS FOUND"
        elif overall_success_rate >= 0.3:
            verdict = "MODERATE GAPS"
        else:
            verdict = "DEFENCES HOLDING"

        exec_summary = (
            f"Simulation of '{scenario['name']}' executed across {len(path_nodes)} hops. "
            f"The attack campaign yielded an overall success rate of {overall_success_rate*100:.1f}%. "
            f"A total of {len(assets_compromised)} assets were compromised using techniques: {', '.join(techniques_used)}."
        )

        return {
            "scenario": scenario,
            "steps": steps,
            "metrics": {
                "overall_success_rate": round(overall_success_rate, 2),
                "assets_compromised": list(assets_compromised),
                "techniques_used": list(techniques_used)
            },
            "vulnerabilities_discovered": list(vulns_discovered),
            "attack_findings": [s["finding"] for s in steps],
            "executive_simulation_summary": exec_summary,
            "overall_verdict": verdict
        }

    def start_simulation(self, scenario_name: str) -> List[Dict[str, Any]]:
        """
        Backwards compatibility for routes_redteam.py 
        Translates the new simulate_attack format into the old alert format.
        """
        if scenario_name not in self.scenarios:
            return []
            
        from graph.neo4j_client import Neo4jClient
        db = Neo4jClient()
        
        sim_result = self.simulate_attack(scenario_name, db)
        
        events = []
        for step in sim_result.get("steps", []):
            sev = "HIGH" if step["status"] != "SUCCESS" else "CRITICAL"
            events.append({
                "stage": len(events) + 1,
                "timestamp": step["timestamp"],
                "severity": sev,
                "asset_id": step["asset"],
                "message": f"[{step['technique']}] {step['finding']} (Status: {step['status']})",
                "status": "TRIGGERED"
            })
            
        return events
