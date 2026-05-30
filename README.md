# 🛡️ Sarathi Cyberdefense

Sarathi Cyberdefense is an intelligent, full-stack, enterprise-grade Cyber Digital Twin and Security Operations Center (SOC) dashboard. The platform integrates a **Neo4j Cyber Knowledge Graph**, a **hybrid ML Risk Scoring Engine**, an **Attack Path Analyzer**, a **Controlled Red Team Breach Simulator**, and **Gemini 1.5 Pro GenAI Orchestration** to simulate, detect, and instantly mitigate network threat vectors before they compromise critical banking infrastructure.

---

## 🚀 USP and Novel Attributes

Sarathi is a highly orchestrated pipeline of advanced algorithms, real-time rendering, and AI logic designed to impress at the highest technical levels. Here are the core engineering marvels under the hood:

- **Graph-Powered Predictive Lateral Movement:** Relational databases fail at complex, multi-hop network analysis. Sarathi uses a **Neo4j Knowledge Graph** integrated with **NetworkX**. It calculates Dijkstra's shortest paths where edge weights are inversely proportional to asset criticality, predicting an attacker's exact lateral movement trajectory (the "Blast Radius") in sub-milliseconds before they reach the core vault.
- **Hybrid Deterministic & ML Risk Engine:** Risk isn't just theoretical CVSS. Our engine calculates a composite score combining **CVSS (Severity)**, **EPSS (Real-world Probability of Exploit)**, and **CISA KEV (Known Exploited status)**. In parallel, a **RandomForest ML Classifier** categorizes these multi-dimensional vectors into highly accurate threat tiers, drastically reducing SOC alert fatigue.
- **Bulletproof GenAI Orchestration:** We don't just blindly prompt an LLM. **Gemini 1.5 Pro** acts as a strict Bank CISO, ingesting live graph parameters (Node Criticality, CVE details). A custom **Deterministic Regex Section Splitter** guarantees the LLM's markdown output is safely parsed into a strict 7-section JSON object without ever breaking the React UI containers. Includes dynamic fallback to Gemini Flash or an offline cache if API limits are hit.
- **High-Performance 3D Digital Twin:** Engineered for smooth 60 FPS performance, the 3D twin leverages direct WebGL capabilities. It features dynamic geometry generation, synchronized cinematic timelines, and utilizes native browser **SpeechSynthesis APIs** for real-time robotic incident narration during complex, multi-particle attack simulations.
- **Deterministic Red Team Simulation:** The adversary emulation engine utilizes **deterministic random seeding** mapped to scenario IDs. This guarantees repeatable, flawless presentations during live hackathon judging, while mathematically computing successful compromise hops based on actual underlying node vulnerability risk scores.

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
