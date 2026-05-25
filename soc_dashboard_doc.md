# SOC Dashboard — Complete Beginner-Friendly Deep-Dive Documentation
## CyberDefense AI — Gen-AI Powered SOC + Digital Twin Platform

This document is a comprehensive, beginner-friendly operational guide written specifically for the **SOC Dashboard module** of the **CyberDefense AI** platform. It is structured to help you understand every visual element, mathematical calculation, back-end API, graph relationship, and AI operation running inside the dashboard, as well as how to test every component and deliver a winning presentation to hackathon judges.

---

## Table of Contents
1. [Section 1 — What is the SOC Dashboard?](#section-1--what-is-the-soc-dashboard)
2. [Section 2 — Full Dashboard Walkthrough (UI Layout)](#section-2--full-dashboard-walkthrough-ui-layout)
3. [Section 3 — Top Metric Cards Explained](#section-3--top-metric-cards-explained)
4. [Section 4 — Data Generation & Simulation Mechanics](#section-4--data-generation--simulation-mechanics)
5. [Section 5 — Gen-AI Threat Intelligence Analysis Panel](#section-5--gen-ai-threat-intelligence-analysis-panel)
6. [Section 6 — Risk Scoring Mathematics (Formula & Derivations)](#section-6--risk-scoring-mathematics-formula--derivations)
7. [Section 7 — Top 10 Risk-Scored CVEs Chart](#section-7--top-10-risk-scored-cves-chart)
8. [Section 8 — Live SOC Alerts Panel](#section-8--live-soc-alerts-panel)
9. [Section 9 — Backend API Documentation](#section-9--backend-api-documentation)
10. [Section 10 — Neo4j Graph Database Logic](#section-10--neo4j-graph-database-logic)
11. [Section 11 — AI vs. Rule-Based (Non-AI) Decoupling](#section-11--ai-vs-rule-based-non-ai-decoupling)
12. [Section 12 — What Happens If I Change the Dataset?](#section-12--what-happens-if-i-change-the-dataset)
13. [Section 13 — Ultimate Dashboard Live Demo Script](#section-13--ultimate-dashboard-live-demo-script)
14. [Section 14 — Technology Stack & Design Rationale](#section-14--technology-stack--design-rationale)
15. [Section 15 — Visual Operational Flow Diagrams](#section-15--visual-operational-flow-diagrams)
16. [Section 16 — How to Test Every Component & Feature](#section-16--how-to-test-every-component--feature)

---

## Section 1 — What is the SOC Dashboard?

To understand this dashboard, you must understand a few basic terms from the ground up:

### What does "SOC" mean?
**SOC** stands for **Security Operations Center**. Think of it as the real-time "control room" or "command center" of a company's cyber defenses. 
* **Analogy**: Imagine a modern airport control tower. Air traffic controllers sit in front of radar screens tracking airplanes, runway sensors, and weather maps to make sure flights take off and land safely without crashing. 
* A **SOC** is exactly like that airport tower, but instead of tracking airplanes, highly specialized cybersecurity analysts sit in front of monitors tracking **servers, databases, network connections, and security warnings** to make sure hackers don't break in, encrypt databases, or steal money.

### Why do SOC Dashboards exist?
Large enterprises—especially banks—have thousands of computers, applications, and firewalls running at the same time. Each of these systems constantly generates text logs (records of who logged in, what files were opened, and which connections were made). 
* A single bank can generate **millions of log lines every hour**. No human can read millions of lines of text to find a hacker.
* **SOC Dashboards** exist to aggregate, filter, and simplify this massive ocean of data into a single, high-fidelity visual summary. They highlight only the active alarms that actually require an analyst's attention.

### How Banks use SOC Dashboards
In a bank, the stakes are extremely high because compromised systems translate directly to lost funds or transaction systems shutting down. Analysts use dashboards to:
1. **Prioritize Vulnerabilities**: Find which security holes (CVEs) exist in the banking network and patch them before hackers can exploit them.
2. **Detect Live Breaches**: Catch active attacks (like brute-force password guessing or lateral malware spread) the instant they cross the bank's boundary.
3. **Trigger Containment**: Isolate compromised servers immediately to save downstream assets (like the core banking transactions database) from being encrypted or manipulated.

---

## Section 2 — Full Dashboard Walkthrough (UI Layout)

The **SOC Command Center Dashboard** is designed with high-end cyber aesthetics (dark mode gradients, vibrant severity indicators, and monospace terminal interfaces) to look premium, modern, and instantly impressive to judges.

### Visual Layout Map (ASCII Blueprint)

```
+───────────────────────────────────────────────────────────────────────────────────────────────+
| [⚡] CYBERDEFENSE AI                                             [↻ REFRESH FEED] [👤 Active] |
+───────────────────────────────────────────────────────────────────────────────────────────────+
|                                                                                               |
|  [ TOP METRICS ROW ]                                                                          |
|  +───────────────────+  +───────────────────+  +───────────────────+  +───────────────────+  |
|  | TOTAL CVEs MAPPED |  |CRITICALUNRESOLVED |  |CRITICALASSETS RISK|  | ATTACK PATHS FOUND|  |
|  |        12         |  |        04         |  |        05         |  |        05         |  |
|  | [🛡️ Mapped Graph] |  | [🔴 C:4 H:0 M:0]  |  | [💻 Exposure:High]|  | [🌐 Path Traversal|  |
|  +───────────────────+  +───────────────────+  +───────────────────+  +───────────────────+  |
|                                                                                               |
|  [ GEN-AI THREAT INTELLIGENCE ANALYSIS PANEL ]                                                 |
|  +─────────────────────────────────────────────────────────────────────────────────────────+  |
|  | 🤖 Gen-AI Threat Intelligence Analysis                                [⚡ RUN AI ANALYSIS] | |
|  | Ingests Neo4j CVE-asset graph and streams prioritised kill-chain analysis reports.     |  |
|  |                                                                                         |  |
|  | + Terminal Interface ─────────────────────────────────────────────────────────────────+ |  |
|  | | > ingesting CVE graph from Neo4j...                                                 | |  |
|  | | > correlating attack paths...                                                       | |  |
|  | | cyberdefense-ai | threat-intelligence-analysis | 14:15:31 [COMPLETE]                | |  |
|  | | ─────────────────────────────────────────────────────────────────────────────────── | |  |
|  | | [Gen-AI Report Text: "CRITICAL ALERT: Vulnerability CVE-2026-1043 on Web Gateway...| |  |
|  | +─────────────────────────────────────────────────────────────────────────────────────+ |  |
|  +─────────────────────────────────────────────────────────────────────────────────────────+  |
|                                                                                               |
|  [ MAIN TELEMETRY SECTION ]                                                                   |
|  +───────────────────────────────────────────────+ +───────────────────────────────────────+  |
|  | 📊 TOP 10 RISK-SCORED CVEs                   | | 🚨 LIVE SOC ALERTS FEED                 |  |
|  | Risk score calculated via CVSS, EPSS & Assets | | Real-time incident logging telemetry  |  |
|  |                                               | |                                       |  |
|  |  100 | [████████████████] CVE-2026-1043 (Red) | |  [14:15] [CRITICAL] Web App Gateway     |  |
|  |   82 | [█████████████]    CVE-2026-2090 (Red) | |           Exploitation attempt (Status:S)|  |
|  |   75 | [███████████]      CVE-2026-4401 (Amb) | |  [14:12] [HIGH] Authentication Router    |  |
|  |   60 | [█████████]        CVE-2026-3022 (Amb) | |           Privilege escalation (Status:S)|  |
|  +───────────────────────────────────────────────+ +───────────────────────────────────────+  |
+───────────────────────────────────────────────────────────────────────────────────────────────+
```

### Explaining What You See
1. **Header Panel**: Contains the navigation links, the pulsing cyber AI logo, and the **Refresh Feed** button that forces an immediate fetch of live telemetry APIs.
2. **Top Metrics Row**: Houses four KPI (Key Performance Indicator) telemetry metric cards, providing numerical totals of network exposure.
3. **Gen-AI Threat Intelligence Analysis Panel**: An interactive terminal widget where clicking the **RUN AI Analysis** button triggers Gemini to stream an attack prioritization report using a green-monospace typewriter style.
4. **Top 10 Risk-Scored CVEs Chart**: A customized bar chart that visualizes the vulnerability dataset, ranking them based on our custom risk index.
5. **Live SOC Alerts Feed**: A real-time incident queue displaying intrusion warnings as they are simulated by the red team simulator.

---

## Section 3 — Top Metric Cards Explained

The four cards across the top of the dashboard act as the primary operational check. Below is the exact implementation detail for each.

```
+───────────────────────+
|   TOTAL CVEs MAPPED   |
|          12           |
|  [🛡️ Mapped Graph]    |
+───────────────────────+
```
* **What it means**: The total count of unique software vulnerabilities currently mapped to physical banking assets inside the database.
* **Why it matters**: A high number indicates that the bank's servers are missing security patches, expanding the surface area for hackers to break in.
* **Where data comes from**: Mapped assets and vulnerability nodes in Neo4j.
* **Backend Endpoint**: `GET /api/graph/top-risks`
* **Calculation Logic**: The dashboard collects the results from the top-risks API, maps them to a unique set of CVE IDs using a JavaScript `Set()` to filter duplicates, and displays the total length:
```javascript
const uniqueCves = new Set(risksData.map(r => r.cveId));
totalCves = uniqueCves.size;
```

---

```
+───────────────────────+
|  CRITICAL UNRESOLVED  |
|          04           |
|   [🔴 C:4 H:0 M:0]    |
+───────────────────────+
```
* **What it means**: Alarms that indicate an ongoing, high-severity active attack that has not yet been isolated or resolved.
* **Why it matters**: Alarms labeled as `CRITICAL` or `HIGH` require immediate human intervention. The lower section `[C:4 H:0 M:0]` splits them by severity (Critical, High, Medium) so analysts can triage the worst incidents first.
* **Where data comes from**: Active threat alerts registered by the simulator.
* **Backend Endpoint**: `GET /api/alerts`
* **Calculation Logic**: Filters the live alerts list to include only unresolved alerts with a severity rating of `"CRITICAL"`:
```javascript
criticalAlerts = alertsData.filter(a => a.severity === 'CRITICAL' && a.status === 'UNRESOLVED').length
```

---

```
+───────────────────────+
| CRITICAL ASSETS RISK  |
|          05           |
|   [💻 Exposure:High]  |
+───────────────────────+
```
* **What it means**: Mapped bank servers classified as "High Business Value" (e.g., Core database or SWIFT transaction router) that are currently linked to unpatched security vulnerabilities.
* **Why it matters**: Represents direct impact risk. If a low-value server has a flaw, it is a moderate issue. If the core banking vault ledger has a flaw, it is an emergency.
* **Where data comes from**: Mapped Asset nodes in Neo4j.
* **Backend Endpoint**: `GET /api/graph/critical-assets?min_criticality=7`
* **Calculation Logic**: Queries Neo4j for all assets with a criticality rating of $\ge 7$ and returns the list length.

---

```
+───────────────────────+
|  ATTACK PATHS FOUND   |
|          05           |
|  [🌐 Path Traversal]  |
+───────────────────────+
```
* **What it means**: Calculated lateral traversal paths an attacker can take to traverse the network from the internet to the core bank database.
* **Why it matters**: Maps out the structural corridors in the network graph, revealing the most likely paths for intrusion propagation.
* **Where data comes from**: Computed using NetworkX path algorithms on the backend.
* **Backend Endpoint**: `GET /api/graph/attack-paths`
* **Calculation Logic**: Counts the total list length of simple connection paths returned from the NetworkX directed graph model.

---

## Section 4 — Data Generation & Simulation Mechanics

One of the most common questions hackathon judges ask is: **"Is your data real, fake, static, or dynamic?"** Here is exactly how our data architecture is designed.

```
                  [ HYBRID GRAPH DATABASE ARCHITECTURE ]
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
   [ Neo4j Aura Cloud ]                           [ In-Memory Local Mock ]
  (Queried if connected)                        (Vulnerability map fallbacks)
            │                                                 │
            └────────────────────────┬────────────────────────┘
                                     │
                                     ▼
                      [ Composite Risk Scorer (ML) ]
                                     │
                                     ▼
                    [ Top 10 Dashboard Visualiser ]
```

### Is the data fake or real?
It is **simulated and structured**. The assets (e.g., *Web Application Gateway*, *Authentication Router*, *Core Database*) and mapped vulnerabilities (e.g., `CVE-2026-1043` representing HTTP deserialization flaws) are modeled from real banking environments to create realistic threat scenarios.

### Where does the data come from?
The dashboard reads directly from **Neo4j** (using FastAPI cypher queries).
* If Neo4j is online, it queries the database graph in real time.
* If Neo4j is disconnected, the backend automatically falls back to an in-memory mock graph database (defined in [attack_path.py](file:///c:/Users/Banu/.gemini/antigravity/scratch/sarathi-cyberdefense/backend/ml/attack_path.py#L489-L538)) containing the same high-fidelity nodes and connections. This ensures your dashboard works flawlessly during live demos even without a database connection.

### Is the same dataset reused?
Yes, the core vulnerability dataset and network layout are stored as a persistent baseline graph. This allows the red team simulations to execute reliably and reproducibly.

### Why does the mapped CVE count show 10 on the chart?
The bar chart API utilizes a structural `limit=10` query parameter (`GET /api/graph/top-risks?limit=10`) to clean up the visual display.
* If you modify the Neo4j database to add a new vulnerability, the new record will be processed by the risk engine. If its risk score is high enough, it will dynamically push lower-scored items off the chart and occupy a top spot.

### Is there randomization?
* The **vulnerabilities and assets** are structured.
* The **Red Team Simulator** uses a deterministic random seed per scenario. This ensures that the generated attack propagation paths and alert messages are consistent and reliable for live demos, while still simulating realistic multi-stage breaches.

---

## Section 5 — Gen-AI Threat Intelligence Analysis Panel

When the operator clicks the **RUN AI Analysis** button in the dashboard, the platform triggers a complex data-flow sequence combining machine learning, graph querying, and Generative AI.

```
 [ User clicks "Run AI Analysis" ]
                 │
                 ▼
 [ Backend fetches CVE graph from Neo4j ]
                 │
                 ▼
 [ RiskScorer computes composite scores ]
                 │
                 ▼
 [ Format structured prompt containing CVE data ]
                 │
                 ▼
 [ Call Google Gemini API (gemini-1.5-pro) ]
                 │
                 ▼
 [ Stream Markdown analysis report to UI terminal ]
```

### Prompt Structure Sent to Gemini
The backend queries Neo4j for all asset-vulnerability links and constructs a prompt detailing the bank's active risk exposures. Gemini is instructed to act as the **Chief Information Security Officer (CISO)** of Union Bank of India and prioritize the vulnerabilities:

```text
You are the CISO of Union Bank of India.
Write a concise, high-impact threat intelligence analysis based on this vulnerability data:
- Assets: Web Application Gateway, IAM Router, SWIFT Gateway.
- Mapped vulnerabilities: CVE-2026-1043 (CVSS 9.8, KEV: true, EPSS 0.94)

The analysis must outline:
1. Executive Risk Briefing
2. Prioritized Attack Vector List (Ranked by Risk Score)
3. Predicted Kill Chain (DMZ -> Internal -> Core)
4. RBI & ISO 27001 Compliance Gaps
5. Urgent Mitigation Directives
```

### Key Cybersecurity Terms Explained
* **CVSS (Common Vulnerability Scoring System)**: A standard $0-10$ numerical score representing the severity of a software bug. A CVSS of 9.8 represents a critical bug that can be exploited over the network without passwords.
* **EPSS (Exploit Prediction Scoring System)**: A $0.0 - 1.0$ probability index that predicts the likelihood that a vulnerability will be actively exploited in the wild within the next 30 days. An EPSS of $0.94$ means there is a $94\%$ probability of active real-world exploitation.
* **CISA KEV (Known Exploited Vulnerabilities)**: A list maintained by the US Cybersecurity and Infrastructure Security Agency. If a CVE is on the KEV list, it means hackers are actively using it in real-world attacks.
* **MITRE ATT&CK**: A global knowledge base of hacker techniques (e.g., *Credential Stuffing*, *Lateral Movement*) that helps defense teams categorize and detect specific attack methods.

---

## Section 6 — Risk Scoring Mathematics (Formula & Derivations)

A primary differentiator of this platform is the **Composite Risk Scorer** inside [risk_scorer.py](file:///c:/Users/Banu/.gemini/antigravity/scratch/sarathi-cyberdefense/backend/ml/risk_scorer.py). Traditional security tools only look at the CVSS score, which is a static indicator that doesn't consider real-world exploitation or asset business value.

### The Real Composite Risk Scoring Formula
The platform computes a composite risk score on a $0 - 100$ scale using a weighted deterministic formula:

$$\text{Component Total} = (\text{CVSS} \times 0.30 \times 10) + (\text{EPSS} \times 0.40 \times 100) + (\text{Asset Criticality} \times 0.30 \times 10) + \text{KEV Bonus}$$

$$\text{Composite Risk Score} = \min(100.0, \text{Component Total})$$

Where:
* **CVSS Component (Max 30 pts)**: Multiplies the $0-10$ CVSS severity score by $3$.
* **EPSS Component (Max 40 pts)**: Multiplies the $0.0-1.0$ EPSS exploit probability by $40$.
* **Asset Criticality Component (Max 30 pts)**: Multiplies the $1-10$ business value rating of the asset by $3$.
* **KEV Bonus (+20 pts)**: Adds a $+20$ points emergency bonus if the vulnerability is actively exploited in the wild.

### Severity Classification Mapping
* **CRITICAL**: Score $> 80$
* **HIGH**: Score $60 - 80$
* **MEDIUM**: Score $40 - 60$
* **LOW**: Score $< 40$

---

### Step-by-Step Mathematical Examples

#### Example 1: Critical Threat on Gateway Asset
* **Asset**: Web Application Gateway (Business Criticality = $10/10$)
* **Vulnerability**: `CVE-2026-1043` (CVSS = $9.8$, EPSS = $0.9452$, KEV = `True`)
1. **CVSS Component**: $9.8 \times 0.30 \times 10 = 29.40$
2. **EPSS Component**: $0.9452 \times 0.40 \times 100 = 37.81$
3. **Asset Criticality Component**: $10 \times 0.30 \times 10 = 30.00$
4. **KEV Bonus**: $20.00$
5. **Raw Sum**: $29.40 + 37.81 + 30.00 + 20.00 = 117.21$
6. **Clamped Composite Score**: $\min(100.0, 117.21) = \mathbf{100.0} \rightarrow \mathbf{CRITICAL}$

#### Example 2: Moderate Threat on Admin Dashboard
* **Asset**: Admin Dashboard (Business Criticality = $8/10$)
* **Vulnerability**: `CVE-2026-3022` (CVSS = $6.5$, EPSS = $0.0841$, KEV = `False`)
1. **CVSS Component**: $6.5 \times 0.30 \times 10 = 19.50$
2. **EPSS Component**: $0.0841 \times 0.40 \times 100 = 3.36$
3. **Asset Criticality Component**: $8 \times 0.30 \times 10 = 24.00$
4. **KEV Bonus**: $0.00$
5. **Raw Sum**: $19.50 + 3.36 + 24.00 + 0 = 46.86$
6. **Composite Score**: $\min(100.0, 46.86) = \mathbf{46.86} \rightarrow \mathbf{MEDIUM}$

---

## Section 7 — Top 10 Risk-Scored CVEs Chart

The bar chart on the dashboard represents the prioritized vulnerability list mapped to physical banking assets.

```
100 ┼───────────────────────────────────────────────────────────┐  [CVE-2026-1043]
    │ ████████████████████████████████████████████████████████  │  Composite Score: 100
 80 ┼───────────────────────────────────────────────────────────┤  (Red: Critical Threshold)
    │ ████████████████████████████████████████████              │  [CVE-2026-2090]
 60 ┼───────────────────────────────────────────────────────────┤  Composite Score: 82
    │ ██████████████████████████████████                        │  [CVE-2026-4401]
 40 ┼───────────────────────────────────────────────────────────┤  Composite Score: 75 (Amber)
    │ ██████████────────────────────────────────────────────────┤  [CVE-2026-3022]
    └───────────────────────────────────────────────────────────┘  Composite Score: 46 (Blue)
```

### Chart Mechanics
* **Data Retrieval**: React makes a request to `GET /api/graph/top-risks?limit=10`.
* **Sorting & Ranking**: The backend scores every asset-vulnerability link and sorts the records in descending order by risk score, returning the top 10 items.
* **Vibrant Severity Coloring**: The chart renders using **Recharts custom cell coloring**. If a vulnerability's composite risk score is $>80$, it is styled in a high-intensity red (`#ef4444`). If it is between $60-80$, it uses warning amber (`#f59e0b`). Low-risk items use cyber-blue (`#3b82f6`).
* **Interactive Tooltip**: Hovering over a bar reveals a detailed tooltip showing the target asset, raw CVSS score, EPSS probability, and KEV indicators.

---

## Section 8 — Live SOC Alerts Panel

The **Live SOC Alerts** panel lists security incidents in chronological order, providing immediate visibility of ongoing threats.

```
+─────────────────────────────────────────────────────────────+
| 🚨 LIVE SOC ALERTS FEED                                     |
|                                                             |
| [14:15] [CRITICAL] Web App Gateway                          |
|         [T1110] 1847 credential stuffing attempts (Status:S)|
|                                                             |
| [14:12] [HIGH] Authentication Router                        |
|         [T1021] Lateral movement detected (Status:SUCCESS)  |
+─────────────────────────────────────────────────────────────+
```

### How alerts are generated
1. **Red Team Simulation**: When the analyst selects a simulation scenario (e.g., *SWIFT Transaction Hijack* or *Ransomware Spread*), the Red Team Simulator calculates the attack path nodes using NetworkX.
2. **Step-by-Step Traversal**: The simulator models the hacker pivoting from server to server. Each exploit step generates an alert containing a timestamp, threat severity, target asset, and a relevant MITRE ATT&CK technique code.
3. **Frontend Ingestion**: The dashboard polls the active alerts list and renders the new incidents at the top of the feed using Framer Motion exit/entrance transitions, creating a dynamic, real-time logging effect.

---

## Section 9 — Backend API Documentation

The dashboard is powered by high-performance REST APIs built with FastAPI. This section documents the four primary APIs that serve the dashboard.

### 1. Alert Status Metrics
* **Endpoint**: `GET /api/alerts/stats`
* **Purpose**: Fetches the high-level summary stats for the top metric cards.
* **Sample Response JSON**:
```json
{
  "total": 12,
  "severities": {
    "CRITICAL": 4,
    "HIGH": 0,
    "MEDIUM": 0,
    "LOW": 0
  }
}
```

### 2. Live Alerts Feed
* **Endpoint**: `GET /api/alerts`
* **Purpose**: Fetches the queue of unresolved cyber incidents for the live alert feed.
* **Sample Response JSON**:
```json
[
  {
    "id": "alert_1",
    "timestamp": "2026-05-25T14:15:31",
    "severity": "CRITICAL",
    "asset_id": "webgw",
    "message": "CVE-2026-1043 RCE exploit triggered on Web Gateway",
    "status": "UNRESOLVED",
    "technique_id": "T1190"
  }
]
```

### 3. Prioritized Risk List
* **Endpoint**: `GET /api/graph/top-risks?limit=10`
* **Purpose**: Ingests vulnerability relationships and returns the top 10 risks evaluated by the composite risk scoring model.
* **Sample Response JSON**:
```json
[
  {
    "cveId": "CVE-2026-1043",
    "cvssScore": 9.8,
    "epssScore": 0.9452,
    "isKEV": true,
    "assetName": "Web App Gateway",
    "assetId": "webgw",
    "riskScore": 100.0,
    "riskLevel": "CRITICAL",
    "explanation": "CVSS 9.8 contributes 29.4 pts. EPSS 0.95 contributes 37.8 pts. CISA KEV adds 20 pts. Criticality 10 adds 30 pts."
  }
]
```

### 4. Gen-AI Threat Analysis Report
* **Endpoint**: `POST /api/genai/analyse-threats`
* **Purpose**: Ingests the active vulnerability graph and streams a dynamic prioritised threat report using the Gemini API.
* **Sample Response JSON**:
```json
{
  "analysis": "# Executive Threat Briefing\nCritical exposure identified on perimeter gateways. Active exploit paths target the core database... ",
  "status": "SUCCESS"
}
```

---

## Section 10 — Neo4j Graph Database Logic

Traditional databases store records in flat tables. Neo4j stores data as **nodes** (circles) and **relationships** (connecting lines), which is ideal for modeling complex network relationships and lateral movement paths.

```
       (Asset {id: "webgw"}) ──[:CONNECTS_TO]──> (Asset {id: "iam"})
                 │
                 │ [:HAS_VULNERABILITY]
                 ▼
     (Vulnerability {cve_id: "CVE-2026-1043"})
```

### Nodes in our Graph
* **Asset Nodes**: Mapped assets representing physical banking servers. They store metadata like `id`, `name`, `type` (e.g., Database or WebServer), and `criticality` (ranging from $1$ to $10$).
* **Vulnerability Nodes**: Security bugs linked to assets, containing attributes like `cve_id`, `cvss_score`, `epss_score`, and `is_kev`.

### Relationships mapped in our Graph
* `[:HAS_VULNERABILITY]`: Directed edge from an Asset to a Vulnerability node, indicating that the server is vulnerable to that specific bug.
* `[:CONNECTS_TO]`: Directed network boundary between two Asset nodes, indicating that they are configured to communicate with each other. This is the pathway the NetworkX engine traverses to predict attack propagation.

---

## Section 11 — AI vs. Rule-Based (Non-AI) Decoupling

It is highly important to clearly separate **what is generated by Generative AI** versus **what is calculated by deterministic, rule-based algorithms**. 

| Project Feature | Logic Type | Underlying Engine | Why it is implemented this way |
| :--- | :--- | :--- | :--- |
| **Risk Scoring Index (0-100)** | **Rule-Based (Deterministic)** | Custom weighted formula in [risk_scorer.py](file:///c:/Users/Banu/.gemini/antigravity/scratch/sarathi-cyberdefense/backend/ml/risk_scorer.py) | Risk scores must be precise, verifiable, and mathematically consistent. AI would introduce unwanted variability (hallucinations) to mathematical calculations. |
| **Risk Tier Classification** | **Rule-Based / ML** | Scikit-learn Random Forest Classifier | Demonstrates traditional machine learning integration for threat classification, producing an AI confidence rating. |
| **Attack Path Traversal** | **Rule-Based (Graph Theory)** | NetworkX directed path mapping | Traversal paths represent absolute network borders. Graph logic calculates these routes with absolute topological accuracy. |
| **Threat Analysis Summary** | **Generative AI** | Google Gemini API (`gemini-1.5-pro`) | Translating technical risk databases into plain-english reports requires the reasoning and linguistic capabilities of a Large Language Model. |
| **Remediation Playbooks** | **Generative AI** | Google Gemini API (`gemini-1.5-pro`) | Playbooks must be contextual, detailed, and formatted to adapt to specific server OS platforms and banking regulatory compliance requirements. |

---

## Section 12 — What Happens If I Change the Dataset?

Since the platform is designed with a true decoupled, graph-based architecture, any changes to the underlying database dynamically propagate across all components.

```
 [ Modify Neo4j Graph (Add CVE / Asset) ]
                 │
                 ▼
 [ RiskScorer automatically evaluates new nodes ]
                 │
                 ▼
 [ Dashboard Bar Chart dynamically re-ranks items ]
                 │
                 ▼
 [ NetworkX recalculates predicted lateral attack paths ]
                 │
                 ▼
 [ Gemini ingests updated context & generates new playbooks ]
```

### 1. If you add a new critical CVE in Neo4j:
The `RiskScorer` will immediately score the new CVE. If the calculated score is high, it will automatically occupy a top spot on the dashboard chart.

### 2. If you increase an asset's Criticality or a CVE's EPSS score:
The calculated risk index for that asset will immediately increase, which may re-rank it in the dashboard chart and cause the `NetworkX` path analyzer to prioritize it as a high-value attack target.

### 3. If you add or remove network connections (`:CONNECTS_TO`):
The lateral path analyzer will immediately update its predicted traversal routes. The red team simulation will propagate along the new network boundaries, and Gemini will adapt its playbooks to reflect the updated topologies.

---

## Section 13 — Ultimate Dashboard Live Demo Script

Use this high-impact, step-by-step presentation script to wow judges during a live 5-minute hackathon demo.

### The Live Presentation Playbook

#### 1. The Hook (0:00 - 1:00)
* **What to Click**: Stand in front of the active **SOC Command Center Dashboard**.
* **What to Say**: *"Good afternoon, judges. Today, we are presenting CyberDefense AI. Traditional Security Operations Centers are overwhelmed by millions of flat log files, completely separated from visual topologies. Security teams cannot see how vulnerabilities connect to downstream high-value assets. CyberDefense AI resolves this by building a 3D Digital Twin that replicates banking infrastructure, integrates machine learning path predictions, and leverages Gemini AI to generate compliance-safe threat containment playbooks."*
* **What the Judge Sees**: A clean, premium dark-mode dashboard featuring telemetry metrics, vulnerability charts, and a monospace terminal widget.
* **Why it matters**: Captures attention immediately by defining a clear operational problem in banking security and introducing our unique solution.

#### 2. The Threat Analysis Stream (1:00 - 2:30)
* **What to Click**: Click the **RUN AI Analysis** button in the Gen-AI Threat Intelligence panel.
* **What to Say**: *"Let's evaluate our risk exposure. By clicking 'Run AI Analysis', we instruct Gemini to analyze our active vulnerability graph. The terminal displays real-time correlation logs as it ingests our Neo4j database. As you can see, Gemini is now streaming a prioritised risk report identifying our highest exposures. It highlights a critical bug on our Web Application Gateway—CVE-2026-1043—which has a high probability of real-world exploitation."*
* **What the Judge Sees**: Monospace terminal logs scrolling dynamically, followed by a green terminal text report streaming in real time.
* **Why it matters**: Showcases real, non-static AI integration that analyzes active database relationships and explains them in plain English.

#### 3. Explaining the Risk Chart (2:30 - 3:30)
* **What to Click**: Hover your mouse cursor over the red bar representing `CVE-2026-1043` in the **Top 10 Risk-Scored CVEs** chart.
* **What to Say**: *"Look at our Risk chart. Traditional security tools only look at the static CVSS score. CyberDefense AI implements a custom Composite Risk Scorer on our backend. It evaluates the CVSS severity, EPSS exploitation probability, CISA KEV indicators, and the asset's business value. CVE-2026-1043 is scored as a critical 100/100 because it exists on our public gateway and is actively exploited in the wild, requiring immediate containment."*
* **What the Judge Sees**: A detailed tooltip appearing with raw scores, and the bar colored in bright red to indicate a critical severity threshold.
* **Why it matters**: Demonstrates advanced security analysis and logical prioritization rather than a simple database list.

#### 4. Closing the Demo (3:30 - 5:00)
* **What to Click**: Click on **Digital Twin** in the top navigation bar to transition seamlessly to the 3D WebGL viewport.
* **What to Say**: *"Now, let's navigate to our 3D Digital Twin to visually trace this risk in our network topology and execute containment..."* (Proceed with the 3D Digital Twin demo flow).
* **Why it matters**: Connects the dashboard telemetry to our interactive 3D digital twin, demonstrating a unified, end-to-end security response platform.

---

## Section 14 — Technology Stack & Design Rationale

Our tech stack is selected to optimize rendering performance, API speed, and visual high-fidelity.

* **React**: Serves as our frontend framework, enabling modular component development, fast rendering, and clean UI state management.
* **FastAPI**: Selected for our backend API due to its incredible speed, native asynchronous support, and automatic OpenAPI validation.
* **Three.js**: Selected to render the WebGL-powered 3D Digital Twin canvas, enabling interactive, high-fidelity graphics.
* **Recharts**: A React-specific charting library selected for its responsive layout support, high-performance rendering, and clean custom styling integrations.
* **Framer Motion**: Selected to handle CSS transitions and terminal logs streaming animations, ensuring the UI feels alive.
* **Neo4j Aura / Local Graph**: Used as our core database, enabling high-speed lateral path queries that would be slow and inefficient in traditional SQL databases.
* **Google Gemini API**: Orchestrates our threat report summaries and remediation playbooks, chosen for its reasoning capabilities and large context window.

---

## Section 15 — Visual Operational Flow Diagrams

This section provides visual operational flowcharts mapping out the core backend systems.

### 1. End-to-End Threat Containment Loop
```
[React Client] ──(1. Run Simulation)──> [FastAPI Backend] ──(2. Query paths)──> [NetworkX Graph]
      ▲                                         │                                      │
      │                                    (Fires steps)                               │ (Computes hops)
      │                                         ▼                                      ▼
      │ <─────────(3. Stream Live Alerts)── [Alerts Queue] <───────────────────────────┘
      │
 (4. Generate Playbook)
      │
      ▼
[FastAPI Backend] ──(5. Prompt LLM)──> [Google Gemini API] ──(6. Return playbook)──> [React Client]
                                                                                            │
                                                                                    (7. Approve Playbook)
                                                                                            ▼
                                                                                   [Digital Twin 3D View]
                                                                                   * Green Shields Active
                                                                                   * Stops liability count
                                                                                   * DEFCON resets to 5
```

### 2. Composite Risk Scoring Logic
```
 [ Vulnerability Attributes ]
   - CVSS Score (0-10) ──────────> [x 0.30 x 10] ───> (Max 30 pts) ──┐
   - EPSS Score (0.0-1.0) ───────> [x 0.40 x 100] ──> (Max 40 pts) ──┼──> [ Sum Component Scores ]
   - CISA KEV (True/False) ──────> [+20 Bonus] ──────> (Max 20 pts) ──┤                  │
                                                                     │                  ▼
 [ Asset Attributes ]                                                │          [ Clamp Max 100 ]
   - Asset Criticality (1-10) ───> [x 0.30 x 10] ───> (Max 30 pts) ──┘                  │
                                                                                        ▼
                                                                               [ Composite Risk Score ]
```

---

## Section 16 — How to Test Every Component & Feature

Use this practical testing guide to verify the performance of every module, run manual checks, and confidently debug any issues that arise during preparation.

---

### SOC Dashboard Testing

#### 1. Dashboard Load & Stats Fetch
* **How to test**: Open your web browser and navigate to the dashboard url (typically `http://localhost:5173`).
* **What should happen**: The page loads with a dark radial background vignette. The four top metric cards should display numbers (`12`, `04`, `05`, `05`), and the Recharts bar chart should populate with ranked bars.
* **APIs Fired**:
  - `GET http://localhost:8000/api/alerts` (loads active alert list)
  - `GET http://localhost:8000/api/alerts/stats` (loads metric counts)
  - `GET http://localhost:8000/api/graph/top-risks?limit=10` (loads bar chart risks)
  - `GET http://localhost:8000/api/graph/critical-assets?min_criticality=7` (loads critical assets count)
  - `GET http://localhost:8000/api/graph/attack-paths` (loads attack paths)
* **What success looks like**: Telemetry counts are visible within $1$ second. No empty loading spinners remain.
* **What failure looks like**: Numeric values display as `0` or remain blank. 
* **Common bugs & how to fix them**:
  - *Symptom*: Top cards show `0` or charts are empty.
  - *Reason*: The backend FastAPI server is offline, or the Neo4j credentials in the `.env` file are incorrect.
  - *Fix*: Check that your backend is running (`uvicorn main:app --reload` on port 8000) and verify that your Neo4j database is active.

#### 2. Recharts Bar Chart Tooltips
* **How to test**: Hover your mouse cursor over the red bar representing `CVE-2026-1043` in the bar chart.
* **What should happen**: A structured tooltip box pops up displaying detailed risk metrics.
* **What success looks like**: The tooltip box displays detailed, high-contrast text identifying the asset name, raw CVSS score, EPSS probability, and KEV indicators.
* **What failure looks like**: Hovering does nothing, or the tooltip box displays empty parameters.

#### 3. Live SOC Alerts Feed
* **How to test**: Click on the **Refresh Feed** button in the dashboard header.
* **What should happen**: The dashboard initiates a parallel API fetch to reload all telemetry feeds.
* **APIs Fired**: Reloads the alerts queue (`GET /api/alerts`) and metric stats.
* **What success looks like**: The list of incidents reloads smoothly, and new simulated warnings are rendered at the top of the feed with entrance transitions.

---

### Gen-AI Analysis Panel Testing

#### 1. Threat Intel Generation
* **How to test**: Click on the **RUN AI Analysis** button in the threat analysis panel.
* **What should happen**: The terminal triggers simulated correlation logs (`> ingesting CVE graph...`), followed by a green typewriter effect streaming a detailed risk analysis report.
* **APIs Fired**: `POST http://localhost:8000/api/genai/analyse-threats`
* **What success looks like**: A detailed markdown report is printed inside the terminal container, identifying critical assets, attack paths, and regulatory compliance recommendations.
* **How to verify Gemini is working**: Check your backend terminal logs. If the API key is active, you will see logging indicating:
```text
INFO:     Gemini call [threats] using gemini-1.5-pro attempt 1/3 ...
INFO:     Gemini call [threats] succeeded.
```
* **How to verify Fallback Mode activated**: If your Gemini API key is missing or rate-limited, the backend will catch the error and return a pre-written threat report. In your backend terminal, you will see a warning:
```text
WARNING:  GEMINI_API_KEY missing — using fallback threat analysis report.
```
On the frontend, the terminal report will load instantly without throwing any blank screens.

---

### Alerts & Governance Playbook Testing

#### 1. Opening the Alerts Modal
* **How to test**: Click on an active alert card inside the **Live SOC Alerts Feed** (or navigate to the Alerts page in the navigation bar).
* **What should happen**: The playbook modal opens, showing the alert metadata and a loading spinner.
* **What success looks like**: The modal opens smoothly, and a loading message is displayed while the playbook is fetched.

#### 2. Playbook Generation
* **How to test**: Click on **Generate Playbook** inside the alerts modal.
* **What should happen**: React requests a remediation playbook for the targeted alert. The modal then renders seven structured, parsed tabs.
* **APIs Fired**: `POST http://localhost:8000/api/playbook/generate`
* **What success looks like**: The modal displays seven tabs (Executive Summary, Immediate Actions, Compliance Notes, etc.), providing detailed remediation steps, verification commands, and rollback procedures.
* **How to verify Fallback Mode**: Disable your internet connection. Clicking "Generate Playbook" will instantly load a pre-written, detailed playbook template. The modal will load without errors, proving the resilience of your fallback mechanism.

#### 3. Human-in-the-Loop Governance Actions
* **How to test**: Click on **Approve & Execute**, **Escalate**, or **Reject** in the governance footer of the playbook modal.
* **What should happen**:
  - Clicking **Approve & Execute**: Updates `governanceState` to `"executed"`, records a `"SUCCESS"` log in the audit trail, and fires the `ai-governance-remediate` event.
  - Clicking **Escalate**: Updates `governanceState` to `"escalated"`, triggers a $15$-minute SLA countdown timer, and records a `"WARNING"` log in the audit trail.
  - Clicking **Reject**: Updates `governanceState` to `"rejected"` and logs a rejection message in the audit trail.
* **What success looks like**: The buttons transition smoothly, the audit trail updates with high-contrast monospace lines, and no UI rendering crashes occur.

---

### Knowledge Graph Testing

#### 1. Neo4j Graph Verification
* **How to test**: Click on **Knowledge Graph** in the top navigation bar.
* **What should happen**: The page renders the interactive network topology map.
* **APIs Fired**: `GET http://localhost:8000/api/graph/topology`
* **What success looks like**: The graph displays distinct nodes for gateways, database servers, and firewalls, with directed lines representing configured network connections.
* **What failure looks like**: The page remains blank, or a database connection error message is displayed.
* **How to fix**: Verify that your Neo4j instance is running and that your credentials in the backend `.env` file are correct.

---

### Digital Twin Testing

#### 1. 3D WebGL Canvas Interactivity
* **How to test**: Click on **Digital Twin** in the top navigation bar.
* **What should happen**: The page renders the interactive 3D WebGL viewport canvas.
* **What success looks like**:
  - The model renders successfully on a deep dark vignette background.
  - Left-click drag rotates the model smoothly in 3D space.
  - Mouse wheel scrolls to zoom in and out.
  - Right-click drag pans the camera viewport.
  - Hovering your cursor over a node highlights it and displays a detailed pop-up tooltip.
  - Clicking a node opens a detailed telemetric side-panel on the right.
* **What failure looks like**: The screen remains completely black, or dragging causes extreme lag or rendering errors.
* **How to fix**: Check that your browser supports WebGL and has hardware acceleration enabled.

#### 2. Running an Attack Simulation
* **How to test**: Select **Ransomware Lateral Spread** from the dropdown in the sidebar and click **▶ SIMULATE ATTACK**.
* **What should happen**:
  - The simulation transitions `simState` to `"running"`.
  - Red particle streams propagate laterally along connection edges.
  - The active threat target node pulses in scale.
  - The bank's active DEFCON drops to 1, and the liability counter begins climbing.
* **What success looks like**: Glowing red particles animate smoothly along connection lines, target nodes pulse in size, and the live alerts feed updates dynamically as the threat moves across interfaces.

#### 3. AI Narrator Speech Check
* **How to test**: Run an attack simulation and listen to your computer's audio.
* **What should happen**: The AI Voice Narrator verbally announces the incident containment status.
* **What success looks like**: A synthetic voice reads aloud the threat status briefings, and the voice bob bobs dynamically in the top-right utility HUD.
* **How to test muting**: Click on the speaker icon inside the narration HUD to toggle mute/unmute.

#### 4. Forensic Replay Timeline
* **How to test**: Run a simulation and interact with the controllers in the **Forensic Attack Replay** panel.
* **What should happen**: Clicking **Pause** pauses the simulation, stops the red particle streams, and halts the liability counter. Clicking **Resume** continues the simulation, and clicking **Reset** restores the original topology.
* **What success looks like**: All player controls respond instantly and synchronize perfectly with the active simulation state.

#### 5. Layer Controls Filtering
* **How to test**: Toggle **Network Topology**, **Assets**, **Identities**, and **Vulnerabilities** inside the right control panel.
* **What should happen**: The digital twin dynamically filters the visibility of specific elements in the 3D scene (e.g., hiding identity links or vulnerability rings by setting their opacity to 0).
* **What success looks like**: Element visibilities toggle instantly, and active layer badges are displayed on the left side of the viewport.

---

### Red Team Simulator Testing

#### 1. Active Threat Simulations
* **How to test**: In your terminal, make a REST API request to execute an attack simulation scenario.
* **Method**: `POST`
* **URL**: `http://localhost:8000/api/redteam/simulate/ransomware_spread`
* **Expected Response JSON**:
```json
{
  "scenario": {
    "scenarioId": "ransomware_spread",
    "name": "Network-Wide Ransomware Propagation",
    "mitreTactics": ["TA0040", "TA0011"]
  },
  "steps": [
    {
      "stepId": "step_0_1",
      "asset": "Asset_3",
      "status": "SUCCESS",
      "finding": "Successfully compromised Asset_3"
    }
  ],
  "metrics": {
    "overall_success_rate": 0.85,
    "assets_compromised": ["Asset_3", "Asset_4"]
  }
}
```

---

### Database Testing & Schema Verification

#### 1. Verifying Mapped Nodes
* **How to test**: Open your Neo4j Browser and run a query to verify your active database nodes.
* **Cypher Query**:
```cypher
MATCH (n) RETURN count(n)
```
* **Expected Output**: Returns the total count of Asset and Vulnerability nodes mapped inside your database.

#### 2. Adding a new CVE
* **How to test**: Add a new vulnerability linked to an active asset in the Neo4j browser and verify that the dashboard updates dynamically.
* **Cypher Query**:
```cypher
MATCH (a:Asset {id: "Asset_1"})
CREATE (v:Vulnerability {cve_id: "CVE-2027-9999", cvss_score: 9.9, epss_score: 0.98, is_kev: true})
CREATE (a)-[:HAS_VULNERABILITY]->(v)
```
* **What should happen**: Click **Refresh Feed** on the dashboard. The bar chart will automatically display the new critical `CVE-2027-9999` at the top of the ranked list.

---

### Practical "What if I change data?" Experiments

This section provides four concrete experiments you can perform to demonstrate the dynamic, graph-based architecture of the platform to judges.

#### Experiment 1: The Criticality Shift
* **Action**: In the Neo4j browser, modify the business value rating of an asset (e.g., changing the Web App Gateway criticality from $10$ to $2$):
```cypher
MATCH (a:Asset {id: "Asset_1"}) SET a.criticality = 2
```
* **Expected Result**: Click **Refresh Feed** on the dashboard. The composite risk score for `CVE-2026-1043` on that gateway will instantly drop from $100.0$ to $76.0$, changing its severity level from `CRITICAL` (red) to `HIGH` (amber).

#### Experiment 2: The EPSS Threat Vector Shift
* **Action**: Modify the EPSS exploit probability of a vulnerability (e.g., lowering `CVE-2026-1043` EPSS from $0.94$ to $0.01$):
```cypher
MATCH (v:Vulnerability {cve_id: "CVE-2026-1043"}) SET v.epss_score = 0.01
```
* **Expected Result**: Click **Refresh Feed** on the dashboard. The composite risk score will drop to $81.0$.

#### Experiment 3: Introducing a New Vault Exposure
* **Action**: Connect a public asset directly to a secure core database asset:
```cypher
MATCH (a:Asset {id: "Asset_1"}), (b:Asset {id: "Asset_4"})
CREATE (a)-[:CONNECTS_TO]->(b)
```
* **Expected Result**: Trigger a simulation. The lateral path analyzer will immediately identify the new connection edge and route the red team simulation directly from the gateway to the core vault, reflecting the updated topology in real time.

---

### Demo Safety Checklist
Perform these checks 10 minutes before presenting to judges to ensure a flawless demo:

- [ ] **Backend Status**: Verify FastAPI is running (`python -m uvicorn main:app` responds on port 8000).
- [ ] **Frontend Status**: Verify React is running on port 5173.
- [ ] **Database Connection**: Open `http://localhost:7474` and verify the Neo4j database connection is active.
- [ ] **Gemini API Key**: Check that your `GEMINI_API_KEY` is configured in your backend `.env` file.
- [ ] **Fallback Validation**: Test a playbook generation with your internet connection disabled to confirm the offline fallback works perfectly.
- [ ] **Audio check**: Turn on your speakers and run a quick simulation to ensure the AI Voice Narrator is audible.
- [ ] **Three.js rendering check**: Navigate to the Digital Twin and orbit the camera to confirm the WebGL canvas renders smoothly.

---

### The Ultimate 5-Minute Hackathon Demo Flow
Use this high-impact presentation flow to maximize your score with judges:

```
[0:00 - 1:00] THE HOOK (SOC Command Center)
  * Explain the context separation problem in banking security.
  * Point out our real-time metrics, risk scoring charts, and incident feeds.
        │
        ▼
[1:00 - 2:00] THE AI BRAIN (Run AI Analysis)
  * Click "RUN AI Analysis" in the threat panel.
  * Show Gemini streaming a prioritized risk report in the green terminal widget.
        │
        ▼
[2:00 - 3:00] THE 3D WAR ROOM (Digital Twin Viewport)
  * Navigate to the Digital Twin and rotate the 3D topology.
  * Trigger a "SWIFT Transaction Hijack" red team simulation.
  * Show red attack particles propagating laterally as the liability counter climbs.
        │
        ▼
[3:00 - 4:00] THE CONTROL LAYER (HITL Governance)
  * Click on the pulsing compromised database node.
  * Generate a compliance-safe remediation playbook using Gemini.
  * Explain that the human operator must authorize containment to prevent disruptions.
        │
        ▼
[4:00 - 5:00] THE CLIMAX (Zero-Trust Containment)
  * Click "Approve & Execute".
  * Watch red particles disappear, green isolation shields expand, and metrics reset.
  * The narrator declares containment success, sealing a flawless visual demo.
```
