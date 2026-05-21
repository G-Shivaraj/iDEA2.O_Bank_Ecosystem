import json
from graph.neo4j_client import Neo4jClient
from redteam.simulator import RedTeamSimulator

def main():
    db = Neo4jClient()
    simulator = RedTeamSimulator()
    
    scenarios = simulator.get_available_scenarios()
    
    for s_id in scenarios:
        print(f"\n{'='*50}")
        print(f"EXECUTING SCENARIO: {s_id}")
        print(f"{'='*50}")
        
        result = simulator.simulate_attack(s_id, db)
        
        print(f"Name: {result['scenario']['name']}")
        print(f"Target: {result['scenario']['targetAsset']} | Start: {result['scenario']['attackerStartPoint']}")
        print(f"Steps executed: {len(result['steps'])}")
        
        print("\n--- FINDINGS ---")
        for finding in result['attack_findings']:
            print(f" > {finding}")
            
        print("\n--- METRICS ---")
        print(f"Overall Success Rate: {result['metrics']['overall_success_rate']}")
        print(f"Assets Compromised: {result['metrics']['assets_compromised']}")
        print(f"Techniques Used: {result['metrics']['techniques_used']}")
        print(f"Vulnerabilities Discovered: {result['vulnerabilities_discovered']}")
        
        print("\n--- EXECUTIVE SUMMARY ---")
        print(result['executive_simulation_summary'])
        print(f"\n>>> VERDICT: {result['overall_verdict']} <<<")
        
    print("\n\nTesting API backwards compatibility (start_simulation):")
    legacy_events = simulator.start_simulation("lateral_movement")
    print(f"Generated {len(legacy_events)} legacy events for 'lateral_movement'.")
    if legacy_events:
        print(json.dumps(legacy_events[0], indent=2))
        
if __name__ == "__main__":
    main()
