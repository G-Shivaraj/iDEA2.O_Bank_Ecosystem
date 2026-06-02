<div align="center">

<br/>

```
███████╗ █████╗ ██████╗  █████╗ ████████╗██╗  ██╗██╗
██╔════╝██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██║
███████╗███████║██████╔╝███████║   ██║   ███████║██║
╚════██║██╔══██║██╔══██╗██╔══██║   ██║   ██╔══██║██║
███████║██║  ██║██║  ██║██║  ██║   ██║   ██║  ██║██║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝
```

### **Cyberdefense AI**
*A Generative AI Framework for Banking Security & Remidiation*

<br/>

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Neo4j](https://img.shields.io/badge/Neo4j-008CC1?style=flat-square&logo=neo4j&logoColor=white)](https://neo4j.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/gemini)
[![iDEA 2.0](https://img.shields.io/badge/iDEA_2.0-Phase_2-orange?style=flat-square)](/)

<br/>

> **Shifting banking security from reactive response to proactive, AI-driven threat prediction and containment.**

<br/>

</div>



##  Problem Statement

**PS10 — Using Generative AI for Attack Prediction and Remediation**

Modern banks face an asymmetric threat landscape: attackers need to succeed once, defenders must succeed every time. Sarathi flips this equation by **predicting attacks before they happen**, autonomously generating remediation playbooks, and safely validating security changes inside a 3D Digital Twin — all powered by a live knowledge graph and Gemini AI.



##  Core Capabilities

| Module | Description |
|--------|-------------|
| 🕸️ **Live Security Knowledge Graph** | Neo4j-powered graph of banking infrastructure across 4 security zones — updated continuously |
| 🤖 **ML Risk Forecasting** | Random Forest classifier scores every vulnerability using CVSS, EPSS, KEV status & asset criticality |
| 🔍 **Attack Path Analysis** | Dijkstra-based shortest-path engine (NetworkX) finds top-5 lateral movement routes up to 6 hops deep |
| 📋 **Autonomous Remediation** | Gemini generates step-by-step playbooks tailored to each threat, with root cause analysis |
| 🏛️ **3D Digital Twin** | Immersive Three.js simulation — safely run red team attacks and validate security changes |
| 🎙️ **Voice Narration** | Web Speech API narrates threat findings in real-time inside the SOC dashboard |



##  Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SARATHI PLATFORM                          │
├──────────────────────────┬──────────────────────────────────────┤
│       FRONTEND           │              BACKEND                  │
│                          │                                       │
│  React 18 + Vite         │   FastAPI + Uvicorn                  │
│  Tailwind CSS            │   Pydantic (validation)              │
│  Three.js (Digital Twin) │   Streaming API responses            │
│  React Three Fiber       │                                       │
│  Web Speech API          │   ┌──────────────────────────────┐   │
│                          │   │     ML / AI LAYER            │   │
│                          │   │  Random Forest (scikit-learn) │   │
│                          │   │  NetworkX (Dijkstra paths)    │   │
│                          │   │  Google Gemini SDK           │   │
│                          │   │  (Flash 3.5 / Flash-Lite /   │   │
│                          │   │   2.5 Flash Cascade)         │   │
│                          │   └──────────────────────────────┘   │
│                          │                                       │
│                          │   ┌──────────────────────────────┐   │
│                          │   │     DATA LAYER               │   │
│                          │   │  Neo4j Aura DB (Graph)       │   │
│                          │   │  NVD + EPSS + CISA KEV feeds │   │
│                          │   │  MITRE ATT&CK Framework      │   │
│                          │   └──────────────────────────────┘   │
└──────────────────────────┴──────────────────────────────────────┘
```



##  Project Structure

```
sarathi-cyberdefense/
│
├── backend/
│   ├── run.py                  # FastAPI server entrypoint
│   ├── demo_data.py            # Synthetic banking infrastructure seeder
│   ├── requirements.txt
│   │
│   ├── ml/
│   │   ├── risk_scorer.py      # Random Forest risk classification
│   │   └── attack_paths.py     # Dijkstra attack path analyzer (NetworkX)
│   │
│   └── genai/
│       ├── playbook_gen.py     # Gemini remediation playbook generator
│       └── rca_gen.py          # Root Cause Analysis generator
│
└── frontend/
    ├── src/
    │   └── components/
    │       └── twin/           # Three.js Cyber Digital Twin
    ├── package.json
    └── vite.config.js
```



##  Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A [Neo4j Aura](https://neo4j.com/cloud/aura/) free-tier instance
- A [Google Gemini API key](https://aistudio.google.com/)

### 1 — Clone the Repository

```bash
git clone [repository-url]
cd sarathi-cyberdefense
```

### 2 — Configure Environment Variables

Copy `.env.example` to `.env` in the **root folder** and fill in your credentials:

```env
NEO4J_URI=neo4j+s://your-database-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-aura-password
GEMINI_API_KEY=your-google-gemini-key
```

### 3 — Start the Backend

```bash
cd backend
pip install -r requirements.txt

# Seed Neo4j with synthetic banking infrastructure
python demo_data.py

# Launch the FastAPI server
python run.py
```

> 📡 Backend runs at **http://localhost:8000**
> 📖 Interactive API docs at **http://localhost:8000/docs**

### 4 — Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

>  Dashboard available at **http://localhost:5173**



##  Model Performance

### Hybrid Risk Scoring Engine
*Random Forest + Deterministic Formula*

- Evaluates **CVSS**, **EPSS**, **KEV status**, and **Asset Criticality** jointly
- Deterministically stratifies vulnerabilities into `CRITICAL` → `HIGH` → `MEDIUM` → `LOW` tiers
- Enables accurate, explainable prioritization for SOC analysts

### Dijkstra Attack Path Analyzer
*NetworkX — Weighted Graph Pathfinding*

| Metric | Result |
|--------|--------|
| Pathfinding Latency | **Sub-millisecond** |
| Max Hop Depth | **6 hops** |
| Top Paths Returned | **Top 5** lateral movement routes |
| Weighting Strategy | Inverse asset criticality (path of least resistance) |

>  **Note:** Models are trained on a POC-scale curated dataset (12 records) for demonstration. Production deployment requires retraining on **10,000+ labeled records**.



##  Dataset & Compliance

All **internal banking telemetry is 100% synthetic**, generated via `demo_data.py` to comply with:

- 🇮🇳 **DPDP Act 2023** — Digital Personal Data Protection Act
- 🏦 **RBI Data Localization Guidelines**

The synthetic environment simulates a realistic banking infrastructure:

- **4 Security Zones** — DMZ, Middleware, Core, Management
- **12 Key Assets** — including Core Vault DB and SWIFT Gateway

**External threat intelligence is 100% real:**

| Feed | Source |
|------|--------|
| 🔍 NVD | National Vulnerability Database |
| 📊 EPSS | Exploit Prediction Scoring System |
| 🚨 CISA KEV | Known Exploited Vulnerabilities Catalog |
| 🛡️ MITRE ATT&CK | Enterprise Tactics & Techniques Framework |



##  Known Limitations

| Area | Current State | Production Path |
|------|--------------|-----------------|
| **Data** | Synthetic internal telemetry (SIEM/EDR simulated) | Integrate live Kafka streams |
| **Ingestion** | Batch graph load on startup | Real-time event streaming pipeline |
| **ML Scale** | 12-record POC dataset | Retrain on 10,000+ labeled records |
| **Auth** | No RBAC or MFA on dashboard | Implement enterprise SSO + RBAC |
| **Digital Twin** | Visualises graph state; no live PCAP | Integrate raw packet capture feeds |



## Team Information

**Team Name:** Sarathi

**Institute:** C.R. Rao Advanced Institute of Mathematics, Statistics and Computer Science (AIMSCS)

**Competition:** iDEA 2.0 – Phase 2 Submission

</div>

<br/>

| Member | Role |
|--------|------|
| **Subbarayudu** | AI & ML Strategy — Risk scoring models & Gemini prompt engineering |
| **Shivaraj** | Cybersecurity Architecture — Red team simulation, pipeline integration & project coordination |
| **Taufeeq** | Full-Stack Implementation — React SOC dashboard, Three.js Digital Twin, FastAPI backend & documentation |
| **Varun** | Python Backend Infrastructure — Data ingestion pipelines & system testing |

<br/>



<div align="center">

*Together, we transformed our proposal from a concept into a working, enterprise-grade cyber defense platform —*
*shifting banking security from reactive response to proactive, AI-driven threat prediction and containment.*





## 🔗 Submission Links

| # | Deliverable | Link |
|---|-------------|------|
| 📄 | **D1 Brief** | [Project Brief (Google Docs)](https://docs.google.com/document/d/19Vu1fcX_gO3-Jz-0KiiaWzlZVtGu7ChE/edit?usp=sharing&ouid=102470806441105523356&rtpof=true&sd=true) |
| 🌐 | **D2 Deployed App** | [i-dea-2-o-bank-ecosystem.vercel.app](https://i-dea-2-o-bank-ecosystem.vercel.app/) |
| 🎬 | **D2 Demo Video** | [youtu.be/4msktUI9Dho](https://youtu.be/4msktUI9Dho) |
| 🗂️ | **D3 Architecture** | [Architecture Document (Google Docs)](https://docs.google.com/document/d/1vkL1Wx6Y0kI5H0ZtFIV_Bfegf0mCmrNh/edit?usp=sharing&ouid=102470806441105523356&rtpof=true&sd=true) |
| 💻 | **D4 GitHub** | [G-Shivaraj/iDEA2.0_Bank_Ecosystem](https://github.com/G-Shivaraj/iDEA2.O_Bank_Ecosystem) |
| 📊 | **D5 Deck** | [Presentation Deck (Google Slides)](https://docs.google.com/presentation/d/10SXQh7AITO2wT7rgY14yUm0RLxXPU0_s/edit?slide=id.p1#slide=id.p1) |
| 🎥 | **D5 Video** | [youtube.com/watch?v=auKhvGqp1oY](https://www.youtube.com/watch?v=auKhvGqp1oY) |


</div>
