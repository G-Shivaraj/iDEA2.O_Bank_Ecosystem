<div align="center">

<br/>



### **Cyberdefense AI**
**Title:** *A Generative AI Framework for Predictive Cyber Defense and Autonomous Remediation in Banking Systems*

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


## Problem Statement

This project addresses **PS10: Using Generative AI for Attack Prediction and Remediation**. Sarathi predicts cyberattacks before they occur by combining a live Neo4j security knowledge graph, ML-based risk forecasting, and Google Gemini AI to autonomously generate remediation playbooks — shifting banking security from reactive response to proactive, AI-driven threat prediction and containment.

## Live Demo

🌐 **Deployed App:** [i-dea-2-o-bank-ecosystem.vercel.app](https://i-dea-2-o-bank-ecosystem.vercel.app/)

🎥 **Demo Video:** [youtu.be/4msktUI9Dho](https://youtu.be/4msktUI9Dho)

## Tech Stack

- Python 3.9+
- React 18 + Vite (SOC dashboard frontend)
- FastAPI + Uvicorn (backend API server)
- Neo4j Aura DB (live security knowledge graph)
- Google Gemini SDK — Flash 3.5 / Flash-Lite / 2.5 Flash Cascade (generative AI)
- Scikit-learn — Random Forest (ML risk scoring)
- NetworkX — Dijkstra algorithm (attack path analysis)
- Three.js + React Three Fiber (3D Digital Twin simulation)
- Web Speech API (real-time voice narration)
- NVD, EPSS, CISA KEV, MITRE ATT&CK (external threat intelligence feeds)
- Tailwind CSS (styling)

## How to Run Locally

1. Clone the repository:
   ```
   git clone https://github.com/G-Shivaraj/iDEA2.O_Bank_Ecosystem
   cd sarathi-cyberdefense
   ```

2. Configure environment variables — copy `.env.example` to `.env` and fill in your credentials:
   ```
   NEO4J_URI=neo4j+s://your-database-id.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your-aura-password
   GEMINI_API_KEY=your-google-gemini-key
   ```

3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. Seed Neo4j with synthetic banking infrastructure:
   ```
   python demo_data.py
   ```

5. Launch the FastAPI backend server:
   ```
   python run.py
   ```
   Backend runs at `http://localhost:8000` — interactive API docs at `http://localhost:8000/docs`

6. In a new terminal, install and start the frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```

7. Open the dashboard at: `http://localhost:5173`

## Project Structure

```
sarathi-cyberdefense/
├── backend/
│   ├── run.py               — FastAPI server entrypoint
│   ├── demo_data.py         — Synthetic banking infrastructure seeder
│   ├── requirements.txt
│   ├── ml/
│   │   ├── risk_scorer.py   — Random Forest risk classification
│   │   └── attack_paths.py  — Dijkstra attack path analyzer (NetworkX)
│   └── genai/
│       ├── playbook_gen.py  — Gemini remediation playbook generator
│       └── rca_gen.py       — Root Cause Analysis generator
└── frontend/
    ├── src/
    │   └── components/
    │       └── twin/        — Three.js Cyber Digital Twin
    ├── package.json
    └── vite.config.js
```

## Dataset

All internal banking telemetry is **100% synthetic**, generated via `demo_data.py` to comply with the DPDP Act 2023 and RBI Data Localization Guidelines. The synthetic environment simulates:

- 4 Security Zones — DMZ, Middleware, Core, Management
- 12 Key Assets — including Core Vault DB and SWIFT Gateway
- Vulnerability records with CVSS scores, EPSS probabilities, and KEV status
- Lateral movement attack paths across up to 6 hops

External threat intelligence is **100% real**, sourced from:

- NVD — National Vulnerability Database
- EPSS — Exploit Prediction Scoring System
- CISA KEV — Known Exploited Vulnerabilities Catalog
- MITRE ATT&CK — Enterprise Tactics & Techniques Framework

## Model Performance (on Synthetic Test Set)

**Hybrid Risk Scoring Engine — Random Forest + Deterministic Formula:**

- Evaluates CVSS, EPSS, KEV status, and Asset Criticality jointly
- Stratifies vulnerabilities into CRITICAL → HIGH → MEDIUM → LOW tiers
- Provides explainable prioritization for SOC analysts

**Dijkstra Attack Path Analyzer — NetworkX Weighted Graph Pathfinding:**

- Pathfinding Latency: Sub-millisecond
- Max Hop Depth: 6 hops
- Top Paths Returned: Top 5 lateral movement routes
- Weighting Strategy: Inverse asset criticality (path of least resistance)

Note: Models are trained on a POC-scale curated dataset (12 records) for demonstration. Production deployment requires retraining on 10,000+ labeled records.

## Known Limitations

- Trained only on synthetic data (SIEM/EDR simulated); live Kafka stream integration required for production.
- Graph is loaded in batch on startup; real-time event streaming pipeline not yet implemented.
- ML model uses a 12-record POC dataset; needs retraining on 10,000+ labeled records for production accuracy.
- No RBAC or MFA on the dashboard; enterprise SSO + RBAC required for deployment.
- Digital Twin visualises graph state only; no live PCAP integration yet.

## Team

| Member | Role |
|--------|------|
| **Subbarayudu** | AI & ML Strategy — Risk scoring models & Gemini prompt engineering |
| **Shivaraj** | Cybersecurity Architecture — Red team simulation, pipeline integration & project coordination |
| **Taufeeq** | Full-Stack Implementation — React SOC dashboard, Three.js Digital Twin, FastAPI backend & documentation |
| **Varun** | Python Backend Infrastructure — Data ingestion pipelines & system testing |

## Contact

**Team Name:** Sarathi

**Institute:** C.R. Rao Advanced Institute of Mathematics, Statistics and Computer Science (AIMSCS)

**iDEA 2.0 — Phase 2 Submission**


<div align="center">
Submission Links

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
