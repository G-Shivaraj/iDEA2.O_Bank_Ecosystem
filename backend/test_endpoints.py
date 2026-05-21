#!/usr/bin/env python3
"""
backend/test_endpoints.py
-------------------------
A validation utility that executes HTTP requests against all primary FastAPI endpoints
to verify response codes, JSON validity, and database connectivity.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_all():
    endpoints = [
        {"method": "GET",  "path": "/health",                 "payload": None, "desc": "System Health Status"},
        {"method": "GET",  "path": "/api/graph/nodes",         "payload": None, "desc": "Knowledge Graph Nodes & Links"},
        {"method": "GET",  "path": "/api/alerts",              "payload": None, "desc": "SOC Active Alerts Feed"},
        {"method": "GET",  "path": "/api/graph/top-risks",     "payload": None, "desc": "Top Risk CVEs Ranked"},
        {"method": "GET",  "path": "/api/redteam/scenarios",   "payload": None, "desc": "Simulation Scenarios list"},
        {"method": "GET",  "path": "/api/graph/attack-paths",  "payload": {"source": "Asset_1", "target": "Asset_4"}, "desc": "Lateral Attack Paths Discoverer"},
        {"method": "GET",  "path": "/api/graph/critical-assets", "payload": None, "desc": "Critical Assets Inventory"},
        {
            "method": "POST",
            "path": "/api/playbooks/remediation",
            "payload": {
                "cve_data": {
                    "cveId": "CVE-2026-1043",
                    "description": "RCE in Web Gateway via crafted HTTP requests.",
                    "cvssScore": 9.8,
                    "severity": "CRITICAL"
                },
                "affected_assets": ["Asset_1"]
            },
            "desc": "GenAI Playbook Generation"
        },
        {
            "method": "POST",
            "path": "/api/playbooks/rca",
            "payload": {
                "incidentId": "INC-88",
                "attackType": "SQL Injection",
                "affectedAssets": ["Asset_2"],
                "attackVector": "REST"
            },
            "desc": "GenAI Root Cause Analysis (RCA)"
        }
    ]

    _sep = "=" * 80
    print(f"\n{_sep}")
    print("  Sarathi Cyberdefense API Verification Engine")
    print(_sep)

    all_passed = True

    for ep in endpoints:
        method = ep["method"]
        path = ep["path"]
        payload = ep["payload"]
        desc = ep["desc"]

        url = f"{BASE_URL}{path}"
        print(f"\n[TESTING] {method} {path} - {desc}")

        try:
            if method == "GET":
                response = requests.get(url, params=payload, timeout=40)
            elif method == "POST":
                response = requests.post(url, json=payload, timeout=40)
            
            status = response.status_code
            print(f"  -> HTTP Status: {status}")

            if status == 200:
                data = response.json()
                print("  -> Result: VALID JSON")
                # Print a brief snippet
                snippet = json.dumps(data)
                if len(snippet) > 120:
                    snippet = snippet[:117] + "..."
                print(f"  -> Snippet: {snippet}")
            else:
                print(f"  -> [FAIL] Response failed with status {status}")
                print(f"  -> Content: {response.text[:200]}")
                all_passed = False

        except Exception as e:
            print(f"  -> [ERROR] Request failed: {e}")
            all_passed = False

    print(f"\n{_sep}")
    if all_passed:
        print("  ALL API ENDPOINTS RETURNING 200 OK & VALID JSON. READY FOR DEPLOYMENT!")
    else:
        print("  SOME API ENDPOINTS ENCOUNTERED ERRORS. PLEASE REVIEW DIAGNOSTICS.")
    print(f"{_sep}\n")

if __name__ == "__main__":
    test_all()
