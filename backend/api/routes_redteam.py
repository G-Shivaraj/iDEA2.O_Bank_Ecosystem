import asyncio
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from redteam.simulator import RedTeamSimulator
from api.routes_alerts import alerts_store

router = APIRouter(prefix="/redteam", tags=["Red Team Attack Simulator"])
simulator = RedTeamSimulator()

class SimulationRequest(BaseModel):
    scenario: str

@router.get("/scenarios", summary="Get all breach scenarios")
def get_scenarios():
    """
    Lists available pre-defined breach simulation scenarios.
    """
    return {"scenarios": simulator.get_available_scenarios()}

@router.post("/simulate", summary="Trigger red team breach simulation (standard)")
async def simulate_breach(request: SimulationRequest):
    """
    Simulates a red team breach campaign with a realistic 2-second delay
    and injects the resulting multi-stage events as active alerts.
    """
    scenarios = simulator.get_available_scenarios()
    if request.scenario not in scenarios:
        raise HTTPException(status_code=400, detail="Scenario not supported.")
        
    # Introduce 2-second simulation delay
    await asyncio.sleep(2)
        
    simulated_events = simulator.start_simulation(request.scenario)
    
    # Map simulated events into active alert panel storage
    added_alerts = []
    for idx, event in enumerate(simulated_events):
        alert_item = {
            "id": f"sim_{str(uuid.uuid4())[:8]}",
            "timestamp": event["timestamp"],
            "severity": event["severity"],
            "asset_id": event["asset_id"],
            "message": event["message"],
            "status": "UNRESOLVED",
            # Standardize linkages
            "cve_id": "CVE-2026-1043" if "Asset_1" in event["asset_id"] else "CVE-2026-2090",
            "technique_id": "T1190" if "Asset_1" in event["asset_id"] else "T1110"
        }
        alerts_store.insert(0, alert_item) # Insert at front
        added_alerts.append(alert_item)
        
    return {
        "status": "Breach campaign initiated",
        "scenario": request.scenario,
        "alerts_injected": len(added_alerts),
        "injected_details": added_alerts
    }

@router.post("/trigger", summary="Trigger red team breach simulation (frontend compatible)")
async def trigger_breach(request: SimulationRequest):
    """
    Backwards compatible endpoint for the React frontend dashboard that invokes
    the breach simulation with the standard 2-second delay.
    """
    return await simulate_breach(request)
