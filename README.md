# 🛡️ Sarathi Cyberdefense

Sarathi Cyberdefense is an intelligent, full-stack, enterprise-grade Cyber Digital Twin and Security Operations Center (SOC) dashboard. The platform integrates a **Neo4j Cyber Knowledge Graph**, a **hybrid ML Risk Scoring Engine**, an **Attack Path Analyzer**, a **Controlled Red Team Breach Simulator**, and **Gemini 1.5 Pro GenAI Orchestration** to simulate, detect, and instantly mitigate network threat vectors before they compromise critical banking infrastructure.

---

## 🚀 Hackathon & Demo Highlights

- **Interactive Cyber Digital Twin:** Immersive SVG topology visualizing real-time threat states, lateral penetration stages, and live neon-pulsing flow lines representing attack propagation.
- **Neo4j Cyber Knowledge Graph:** Live ingestion correlates threat actor motives, MITRE ATT&CK techniques, CVEs, and digital assets. Operates on a live Aura DB with automated in-memory mock fallback for network-isolated environments.
- **Deterministic Adversary Emulation:** Simulates advanced multi-stage breach campaigns (e.g. SWIFT gateway fraud, Core DB lateral movement) with a progressive interactive console terminal.
- **GenAI Remediation Studio:** Generates structured, downloadable containment playbooks, incident Root Cause Analysis (RCA) reports, and compliance policies (RBI CSF, ISO 27001).
- **FastAPI / React Architecture:** Pure, high-performance execution. Builds cleanly, supports CORS out-of-the-box, and uses polling mechanisms to update threat telemetry dynamically.

---

## 📐 Architecture Overview

```
          Threat Intel Feeds (NVD, MITRE ATT&CK, EPSS, KEV)
                                  ↓
                       Neo4j Knowledge Graph
                                  ↓
                         Risk Scoring Engine
                                  ↓
                        Attack Path Analysis
                                  ↓
                         GenAI Orchestration
                                  ↓
                         Red Team Simulation
                                  ↓
                     Cyber Digital Twin Dashboard
```

### Flow Explanation
1. **Threat Intel Feeds:** Ingestion pulls from NVD vulnerabilities, MITRE techniques, EPSS scoring, and CISA KEV (Known Exploited Vulnerabilities).
2. **Neo4j Knowledge Graph:** Maps logical linkages: `(Asset)-[:HAS_VULNERABILITY]->(CVE)-[:MAPS_TO_TECHNIQUE]->(MITRE Technique)`.
3. **Risk Scoring Engine:** Employs a deterministic formula (CVSS, EPSS, KEV, asset criticality) to score risk levels on a 0-100 gauge.
4. **Attack Path Analysis:** Discovers multi-hop lateral movement vectors between any gateway node and private database core targets.
5. **GenAI Orchestration:** Converts technical graph vulnerability states into human-digestible containing policies using Gemini 1.5 Pro.
6. **Red Team Simulation:** Evaluates defensive coverage by executing campaign trials and logging defensive breach points.
7. **Cyber Digital Twin Dashboard:** Aggregates graph states, risk ratings, DEFCON levels, and terminal event streams into a cinematic UI.

---

## 🛠️ Stack & Technologies

* **Frontend:** React, React Router v6, Tailwind CSS, Recharts (visualizations), Framer Motion (cinematic transition layouts), Lucide React.
* **Backend:** FastAPI (Python), Uvicorn, Neo4j Official Bolt Driver, Gemini (Google GenAI SDK), Pydantic v2.
* **Database:** Neo4j Aura DB / In-Memory Mock database fallback.

---

## ⚙️ Quick Start & Setup

### Prerequisites
* Python 3.9+ installed.
* Node.js v18+ installed.

### 1. Environment Configuration
Copy `.env.example` in the root folder to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your credentials:
```env
NEO4J_URI=neo4j+s://your-database-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-aura-password
GEMINI_API_KEY=your-google-gemini-key
```

### 2. Backend Setup
Navigate to the `backend` directory, install packages, and initialize/seed the demo data:
```bash
cd backend
pip install -r requirements.txt

# Run the high-fidelity demo database seeder
python demo_data.py
```
To run the backend FastAPI server:
```bash
# Starts on http://localhost:8000
python run.py
# OR
uvicorn main:app --reload --port 8000
```
Verify the backend starts correctly by opening:
* FastAPI Docs: `http://localhost:8000/docs`
* Health Check API: `http://localhost:8000/health`

### 3. Frontend Setup
Open a new terminal session, navigate to the `frontend` directory, install dependencies, and launch:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to:
* React UI: `http://localhost:5173`

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Core system & database connection status |
| **GET** | `/api/graph/nodes` | Graph node layout for topological visualization |
| **GET** | `/api/graph/top-risks` | List of top CVE-Asset pairs ranked by risk score |
| **GET** | `/api/graph/critical-assets` | Inventory of assets exceeding criticality thresholds |
| **GET** | `/api/graph/attack-paths` | Identifies multi-hop risk-ranked paths |
| **GET** | `/api/alerts` | Active incident threat events list |
| **GET** | `/api/alerts/stats` | Status and severity counters for dashboard stats cards |
| **POST** | `/api/alerts/{id}/acknowledge` | Marks a critical incident as acknowledged |
| **POST** | `/api/alerts/{id}/resolve` | Standardizes and closes active threat alerts |
| **GET** | `/api/redteam/scenarios` | Lists available adversary breach campaigns |
| **POST** | `/api/redteam/trigger` | Triggers a simulated scenario and logs response alerts |
| **POST** | `/api/playbooks/remediation` | Generates a structured GenAI containment guide for a CVE |
| **POST** | `/api/playbooks/rca` | Generates a structured Root Cause Analysis retrospection |

---

## 🌐 Cyber Digital Twin Topology Map

The interactive digital twin represents **Indian Banking Infrastructure** divided into five sectors:

```
[External Web Application Gateway] (Asset_1)
        │                 │
        │                 ├──────────────────────────────┐
        ▼                 ▼                              ▼
[IAM Auth Service] (Asset_2)                 [Admin Control Host] (Asset_3)
        │                 │                              │              │
        │                 ├──────────────┐               │              │
        ▼                 ▼              ▼               ▼              ▼
[Core Vault DB Cluster] (Asset_4) <───> [SWIFT Transaction Gateway Host] (Asset_5)
```

### Node Threat States:
- **Healthy (Cyan/Green Glow):** Segment is operational with zero alerts.
- **Vulnerable (Yellow Glow):** Exploit vulnerability present (has associated CVE).
- **Under Attack (Orange Pulsing Shield):** Active low-to-medium alerts logged against the host.
- **Compromised (Red Pulsing Skull):** Breach executed successfully.

---

## 📸 Demo Screenshots (Placeholders)

### 📊 SOC Incident Dashboard
*Placeholder: Premium dark-themed SOC layout showing risk metrics, top CVEs chart, and active real-time threat incident logger.*

### 🕸️ Interactive Threat Knowledge Graph
*Placeholder: Cinematic force-directed network topology showing asset exposures, vulnerability CVEs, and gold particle paths representing lateral penetration.*

### 🤖 GenAI Playbook & Containment Studio
*Placeholder: Double-pane interface generating structured containment guides, Root Cause Analysis forms, and regulatory compliance documents.*

### 🎭 Breach Adversary Simulator
*Placeholder: Progress timeline console tracking simulated lateral movement campaigns step-by-step from DMZ gateway into internal bank database sectors.*

### 🖥️ Immersive Digital Twin HUD
*Placeholder: Neon-colored network HUD showing live traffic sensors, DEFCON levels, financial liability gauges, and terminal log feeds.*

---

## 🛡️ License & Team
Developed for **Sarathi Cyberdefense Hackathon Demo Execution**. Stabilized, validated, and packaged for high-fidelity live judging.
