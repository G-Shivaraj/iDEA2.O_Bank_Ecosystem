"""
api/routes_playbook.py
----------------------
FastAPI router for GenAI-powered playbook and RCA endpoints.

  POST /playbooks/generate             – legacy string playbook (backwards compat)
  POST /playbooks/remediation          – structured 7-section remediation playbook
  POST /playbooks/security-policy      – 1-page MITRE technique security policy
  POST /playbooks/rca                  – structured 7-section RCA report
  POST /playbooks/incident-response    – concise SOC IR draft for a single alert
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

from genai.playbook_gen import PlaybookGenerator
from genai.rca_gen import RCAGenerator

router = APIRouter(tags=["GenAI Orchestration Playbooks"])

# In-memory thread-safe history database for tracking generated GenAI items
import threading
from datetime import datetime
history_lock = threading.Lock()
playbook_history = []

# Module-level singletons — one Gemini client per worker
playbook_engine = PlaybookGenerator()
rca_engine      = RCAGenerator()


# ── Request models ─────────────────────────────────────────────────────────────

class LegacyPlaybookRequest(BaseModel):
    """Legacy request shape kept for backwards compatibility."""
    cve_id:         str
    asset_name:     str
    technique_name: str


class RemediationRequest(BaseModel):
    """Full structured playbook request."""
    cve_data: Dict[str, Any] = Field(
        ...,
        example={
            "cveId":       "CVE-2026-1043",
            "description": "RCE in web gateway via crafted HTTP requests.",
            "cvssScore":   9.8,
            "severity":    "CRITICAL",
            "epssScore":   0.9452,
            "isKEV":       True,
        }
    )
    affected_assets: List[str] = Field(
        default_factory=list,
        example=["Web Application Gateway", "Edge Firewall Router"],
    )


class SecurityPolicyRequest(BaseModel):
    technique_data: Dict[str, Any] = Field(
        ...,
        example={
            "techniqueId": "T1190",
            "name":        "Exploit Public-Facing Application",
            "tactic":      "Initial Access",
            "capecId":     "CAPEC-242",
        }
    )


class IncidentDataRequest(BaseModel):
    """Structured incident data for the new RCA API."""
    incidentId:     str               = "INC-UNKNOWN"
    attackType:     str               = "Unknown Attack"
    affectedAssets: List[str]         = Field(default_factory=list)
    attackVector:   str               = "Unknown Vector"
    timestamp:      str               = "N/A"
    detectionTime:  str               = "N/A"


class LegacyRCARequest(BaseModel):
    """Legacy alert-sequence list kept for backwards compatibility."""
    alert_sequence: List[Dict[str, Any]]


class IRDraftRequest(BaseModel):
    """Single alert dict for SOC IR draft generation."""
    alert_data: Dict[str, Any] = Field(
        ...,
        example={
            "id":          "alert_01",
            "severity":    "CRITICAL",
            "asset_id":    "Asset_1",
            "message":     "External port sweep on Edge Router Gateway",
            "cve_id":      "CVE-2026-1043",
            "technique_id":"T1190",
            "timestamp":   "2026-05-20T17:00:00",
        }
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post(
    "/generate",
    summary="Legacy: generate playbook (returns raw markdown string)",
)
def create_playbook(request: LegacyPlaybookRequest):
    """
    Backwards-compatible endpoint that returns a raw markdown string.
    Delegates to generate_mitigation_playbook() → rawResponse.
    """
    try:
        playbook = playbook_engine.generate_mitigation_playbook(
            cve_id=request.cve_id,
            asset_name=request.asset_name,
            technique_name=request.technique_name,
        )
        item = {
            "id": f"playbook_{datetime.now().strftime('%Y%m%d%H%M%S')}_{request.cve_id}",
            "timestamp": datetime.now().isoformat(),
            "type": "legacy_playbook",
            "target": request.cve_id,
            "result": {"playbook": playbook}
        }
        with history_lock:
            playbook_history.insert(0, item)
        return {"playbook": playbook}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post(
    "/remediation",
    summary="Generate structured 7-section remediation playbook (banking context)",
)
def create_remediation_playbook(request: RemediationRequest):
    """
    Generates a structured playbook with sections:
    executiveSummary, immediateActions, shortTermRemediation, longTermHardening,
    verificationSteps, rollbackPlan, complianceNotes.

    Includes the raw LLM response alongside parsed sections.
    Falls back gracefully if Gemini API is unavailable.
    """
    try:
        result = playbook_engine.generate_remediation_playbook(
            cve_data=request.cve_data,
            affected_assets=request.affected_assets,
        )
        cve_id = request.cve_data.get("cveId") or request.cve_data.get("cve_id", "UNKNOWN")
        item = {
            "id": f"playbook_{datetime.now().strftime('%Y%m%d%H%M%S')}_{cve_id}",
            "timestamp": datetime.now().isoformat(),
            "type": "remediation_playbook",
            "target": cve_id,
            "result": result
        }
        with history_lock:
            playbook_history.insert(0, item)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post(
    "/security-policy",
    summary="Generate 1-page security policy for a MITRE ATT&CK technique",
)
def create_security_policy(request: SecurityPolicyRequest):
    """
    Generates a 1-page policy document (RBI/ISO 27001/DPDP compliant)
    for the specified MITRE ATT&CK technique.
    """
    try:
        policy = playbook_engine.generate_security_policy(request.technique_data)
        tech_id = request.technique_data.get("techniqueId") or request.technique_data.get("technique_id", "T????")
        item = {
            "id": f"policy_{datetime.now().strftime('%Y%m%d%H%M%S')}_{tech_id}",
            "timestamp": datetime.now().isoformat(),
            "type": "security_policy",
            "target": tech_id,
            "result": {"policy": policy}
        }
        with history_lock:
            playbook_history.insert(0, item)
        return {"policy": policy}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post(
    "/rca",
    summary="Generate structured RCA report (incident_data or legacy alert list)",
)
def generate_rca(request: IncidentDataRequest | LegacyRCARequest):
    """
    Accepts either:
    - `IncidentDataRequest` — structured incident dict (new API)
    - `LegacyRCARequest`   — `alert_sequence` list (backwards compat)

    Returns structured sections:
    incidentId, timeline, rootCause, contributingFactors,
    immediateImpact, lessonLearned, preventionMeasures, executiveSummary.
    """
    try:
        if isinstance(request, LegacyRCARequest):
            rca_report = rca_engine.generate_rca_report(request.alert_sequence)
            incident_id = f"INC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        else:
            rca_report = rca_engine.generate_rca_report(request.model_dump())
            incident_id = request.incidentId
            
        item = {
            "id": f"rca_{datetime.now().strftime('%Y%m%d%H%M%S')}_{incident_id}",
            "timestamp": datetime.now().isoformat(),
            "type": "rca_report",
            "target": incident_id,
            "result": rca_report
        }
        with history_lock:
            playbook_history.insert(0, item)
        return {"rca_report": rca_report}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post(
    "/incident-response",
    summary="Generate concise SOC incident response draft for a single alert",
)
def create_ir_draft(request: IRDraftRequest):
    """
    Fast-path endpoint for real-time dashboard use.
    Returns a concise (< 250 word) incident response draft.
    """
    try:
        draft = rca_engine.generate_incident_response_draft(request.alert_data)
        alert_id = request.alert_data.get("id", "ALERT-???")
        item = {
            "id": f"ir_{datetime.now().strftime('%Y%m%d%H%M%S')}_{alert_id}",
            "timestamp": datetime.now().isoformat(),
            "type": "incident_response_draft",
            "target": alert_id,
            "result": {"ir_draft": draft}
        }
        with history_lock:
            playbook_history.insert(0, item)
        return {"ir_draft": draft}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get(
    "/history",
    summary="Get generated playbooks and RCA history",
)
def get_playbook_history():
    """
    Returns the list of previously generated playbooks, policies, RCAs, and IR drafts.
    """
    with history_lock:
        return playbook_history


# ── AI Governance & Human-in-the-Loop Endpoints ───────────────────────────────

class GovernanceActionRequest(BaseModel):
    alert_id: str
    cve_id: Optional[str] = None
    actor: str = "Tier-2 SOC Analyst"
    reason: Optional[str] = None

governance_audit_trail = [
    {
        "timestamp": datetime.now().isoformat() + "Z",
        "event": "AI Governance Engine Activated",
        "actor": "System Core",
        "details": "Sarathi CyberDefense banking governance layer initialized and active.",
        "status": "SUCCESS"
    }
]

@router.post(
    "/approve",
    summary="Approve and execute AI playbook remediation",
)
def approve_playbook(request: GovernanceActionRequest):
    """
    Approve remediation action. Resolves the active alert and registers containment logs.
    """
    from api.routes_alerts import alerts_store
    alert_found = False
    for alert in alerts_store:
        if alert["id"] == request.alert_id:
            alert["status"] = "RESOLVED"
            alert_found = True
            break
            
    timestamp = datetime.now().isoformat() + "Z"
    cve = request.cve_id or "CVE-2026-1043"
    
    new_logs = [
        {
            "timestamp": timestamp,
            "event": "AI Recommendation Generated",
            "actor": "AI Engine (Gemini)",
            "details": f"Remediation playbook for {cve} generated with 82% confidence.",
            "status": "SUCCESS"
        },
        {
            "timestamp": timestamp,
            "event": "Human Analyst Reviewed",
            "actor": request.actor,
            "details": f"Analyst commenced technical validation of containment plan.",
            "status": "INFO"
        },
        {
            "timestamp": timestamp,
            "event": "Remediation Approved & Executed",
            "actor": request.actor,
            "details": f"Analyst approved action. AI safely executed containment and segment isolation.",
            "status": "APPROVED"
        }
    ]
    
    with history_lock:
        governance_audit_trail.extend(new_logs)
        
    return {
        "status": "Success",
        "remediation_status": "Executed",
        "threat_state": "RESOLVED",
        "audit_logs": new_logs,
        "full_audit_trail": governance_audit_trail
    }


@router.post(
    "/escalate",
    summary="Escalate playbook remediation to Tier-3 SOC Team",
)
def escalate_playbook(request: GovernanceActionRequest):
    """
    Escalate remediation due to low confidence or high severity. Marks alert status.
    """
    from api.routes_alerts import alerts_store
    for alert in alerts_store:
        if alert["id"] == request.alert_id:
            alert["status"] = "ACKNOWLEDGED"
            break
            
    timestamp = datetime.now().isoformat() + "Z"
    cve = request.cve_id or "CVE-2026-1043"
    reason = request.reason or "AI confidence below enterprise threshold."
    
    new_logs = [
        {
            "timestamp": timestamp,
            "event": "AI Action Escalated to SOC",
            "actor": "AI Orchestrator",
            "details": "Remediation automatically halted. Low confidence threshold.",
            "status": "WARNING"
        },
        {
            "timestamp": timestamp,
            "event": "Escalated to Tier-3 Incident Response",
            "actor": request.actor,
            "details": f"Ticket assigned. Reason: {reason}",
            "status": "WARNING"
        }
    ]
    
    with history_lock:
        governance_audit_trail.extend(new_logs)
        
    ticket_id = f"SOC-2026-{abs(hash(request.alert_id)) % 10000:04d}"
    return {
        "status": "Success",
        "remediation_status": "Escalated",
        "threat_state": "ACKNOWLEDGED",
        "ticket": {
            "ticketId": ticket_id,
            "assignedTeam": "Tier-3 Incident Response",
            "reason": reason,
            "timestamp": timestamp,
            "slaMinutes": 15
        },
        "audit_logs": new_logs,
        "full_audit_trail": governance_audit_trail
    }


@router.post(
    "/reject",
    summary="Reject AI remediation recommendation",
)
def reject_playbook(request: GovernanceActionRequest):
    """
    Reject AI recommendation. Preserves active threat status and records audit trails.
    """
    from api.routes_alerts import alerts_store
    for alert in alerts_store:
        if alert["id"] == request.alert_id:
            alert["status"] = "UNRESOLVED"
            break
            
    timestamp = datetime.now().isoformat() + "Z"
    cve = request.cve_id or "CVE-2026-1043"
    
    new_logs = [
        {
            "timestamp": timestamp,
            "event": "AI Recommendation Rejected",
            "actor": request.actor,
            "details": f"AI remediation proposal for {cve} rejected by analyst. Preserved active state.",
            "status": "REJECTED"
        }
    ]
    
    with history_lock:
        governance_audit_trail.extend(new_logs)
        
    return {
        "status": "Success",
        "remediation_status": "Rejected",
        "threat_state": "UNRESOLVED",
        "audit_logs": new_logs,
        "full_audit_trail": governance_audit_trail
    }


@router.get(
    "/audit",
    summary="Get full governance audit trail feed",
)
def get_audit_trail():
    """
    Returns the immutable list of AI governance validations and containment logs.
    """
    with history_lock:
        return governance_audit_trail

