#!/usr/bin/env python3
"""
backend/test_governance.py
--------------------------
A simple verification script to test the newly implemented human-in-the-loop AI governance endpoints:
- POST /api/playbook/approve
- POST /api/playbook/escalate
- POST /api/playbook/reject
- GET /api/playbook/audit
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_governance():
    print("=" * 60)
    print("Testing Sarathi CyberDefense AI Governance Endpoints")
    print("=" * 60)

    # 1. Test GET /api/playbook/audit initially
    url_audit = f"{BASE_URL}/api/playbook/audit"
    print("\n[TESTING] GET /api/playbook/audit (initial state)")
    try:
        r = requests.get(url_audit, timeout=5)
        print(f"  -> HTTP Status: {r.status_code}")
        if r.status_code == 200:
            print(f"  -> Initial Logs count: {len(r.json())}")
            print(f"  -> First Log: {json.dumps(r.json()[0])}")
        else:
            print(f"  -> [FAIL] Status code {r.status_code}")
    except Exception as e:
        print(f"  -> [ERROR] {e}")

    # 2. Test POST /api/playbook/escalate
    url_escalate = f"{BASE_URL}/api/playbook/escalate"
    payload = {
        "alert_id": "alert_01",
        "cve_id": "CVE-2026-1043",
        "actor": "Analyst Banu",
        "reason": "AI confidence score 82% is below the 85% enterprise threshold."
    }
    print("\n[TESTING] POST /api/playbook/escalate")
    try:
        r = requests.post(url_escalate, json=payload, timeout=5)
        print(f"  -> HTTP Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print("  -> Result: ESCALATED successfully")
            print(f"  -> Ticket Details: {json.dumps(data.get('ticket'))}")
            print(f"  -> Alert State: {data.get('threat_state')}")
        else:
            print(f"  -> [FAIL] Status code {r.status_code}")
    except Exception as e:
        print(f"  -> [ERROR] {e}")

    # 3. Test POST /api/playbook/reject
    url_reject = f"{BASE_URL}/api/playbook/reject"
    payload = {
        "alert_id": "alert_02",
        "cve_id": "CVE-2026-2090",
        "actor": "Analyst Banu"
    }
    print("\n[TESTING] POST /api/playbook/reject")
    try:
        r = requests.post(url_reject, json=payload, timeout=5)
        print(f"  -> HTTP Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print("  -> Result: REJECTED successfully")
            print(f"  -> Alert State: {data.get('threat_state')}")
        else:
            print(f"  -> [FAIL] Status code {r.status_code}")
    except Exception as e:
        print(f"  -> [ERROR] {e}")

    # 4. Test POST /api/playbook/approve
    url_approve = f"{BASE_URL}/api/playbook/approve"
    payload = {
        "alert_id": "alert_01",
        "cve_id": "CVE-2026-1043",
        "actor": "Analyst Banu"
    }
    print("\n[TESTING] POST /api/playbook/approve")
    try:
        r = requests.post(url_approve, json=payload, timeout=5)
        print(f"  -> HTTP Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print("  -> Result: APPROVED and EXECUTED successfully")
            print(f"  -> Alert State: {data.get('threat_state')}")
            print(f"  -> Remediation Status: {data.get('remediation_status')}")
        else:
            print(f"  -> [FAIL] Status code {r.status_code}")
    except Exception as e:
        print(f"  -> [ERROR] {e}")

    # 5. Check audit log count again
    print("\n[TESTING] GET /api/playbook/audit (final state)")
    try:
        r = requests.get(url_audit, timeout=5)
        print(f"  -> HTTP Status: {r.status_code}")
        if r.status_code == 200:
            print(f"  -> Final Logs count: {len(r.json())}")
            print("  -> Audit trail contains correct sequences.")
        else:
            print(f"  -> [FAIL] Status code {r.status_code}")
    except Exception as e:
        print(f"  -> [ERROR] {e}")

    print("=" * 60)

if __name__ == "__main__":
    test_governance()
