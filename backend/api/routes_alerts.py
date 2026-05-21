from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["Threat Alerts Panel"])

# Realistic simulated banking alerts (stored in-memory for the demo session)
alerts_store = [
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
    },
    {
        "id": "alert_04",
        "timestamp": datetime.now().isoformat()[:19],
        "severity": "CRITICAL",
        "asset_id": "Asset_4",
        "message": "Database Ingress: SQL Injection exploit attempted on crown-jewel database cluster",
        "status": "ACKNOWLEDGED",
        "cve_id": "CVE-2026-2090",
        "technique_id": "T1190"
    },
    {
        "id": "alert_05",
        "timestamp": datetime.now().isoformat()[:19],
        "severity": "MEDIUM",
        "asset_id": "Asset_5",
        "message": "DoS Anomaly: Unexpected spike in high-frequency incomplete TLS handshake frames",
        "status": "RESOLVED",
        "cve_id": "CVE-2026-4401",
        "technique_id": "T1498"
    }
]

class AlertUpdate(BaseModel):
    status: str

@router.get("", summary="List all security alerts")
def list_alerts():
    """
    Returns active security incident alerts.
    """
    return alerts_store

@router.post("/{alert_id}/acknowledge", summary="Acknowledge alert")
def acknowledge_alert(alert_id: str):
    """
    Mark an active alert's status as ACKNOWLEDGED.
    """
    for alert in alerts_store:
        if alert["id"] == alert_id:
            alert["status"] = "ACKNOWLEDGED"
            return {"status": "Success", "alert": alert}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/{alert_id}/resolve", summary="Resolve alert (frontend compatible)")
def resolve_alert(alert_id: str, payload: AlertUpdate = None):
    """
    Acknowledge or resolve an active alert with custom payload status (supporting frontend calls).
    """
    status = payload.status if payload else "RESOLVED"
    for alert in alerts_store:
        if alert["id"] == alert_id:
            alert["status"] = status
            return {"status": "Success", "alert": alert}
    raise HTTPException(status_code=404, detail="Alert not found")

@router.get("/stats", summary="Alert metrics and counts")
def get_alerts_stats():
    """
    Compiles stats for the alerts dashboard grouped by severity and status.
    """
    total = len(alerts_store)
    severities = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    statuses = {"UNRESOLVED": 0, "ACKNOWLEDGED": 0, "RESOLVED": 0}
    
    for alert in alerts_store:
        sev = alert.get("severity", "MEDIUM").upper()
        stat = alert.get("status", "UNRESOLVED").upper()
        
        if sev in severities:
            severities[sev] += 1
        else:
            severities["MEDIUM"] += 1
            
        if stat in statuses:
            statuses[stat] += 1
        else:
            statuses["UNRESOLVED"] += 1
            
    return {
        "total": total,
        "severities": severities,
        "statuses": statuses
    }
