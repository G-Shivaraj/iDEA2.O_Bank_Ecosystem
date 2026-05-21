import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';
import AttackReplayTimeline from './AttackReplayTimeline';
import { voiceNarrator } from '../utils/voiceNarrator';

// ─────────────────────────────────────────────
// DATA DEFINITIONS
// ─────────────────────────────────────────────

const ZONES = [
  { id: 'internet',  label: 'INTERNET',          color: 0xff3333, y:  13.5, z: 0 },
  { id: 'dmz',       label: 'DMZ ZONE',           color: 0x3b82f6, y:  3.75, z: 0 },
  { id: 'internal',  label: 'INTERNAL NETWORK',   color: 0x22c55e, y: -3.75, z: 0 },
  { id: 'core',      label: 'CORE BANKING ZONE',  color: 0xeab308, y: -11.25,z: 0 },
];

const NODES = [
  // Internet zone
  { id: 'internet',    label: 'INTERNET',                   ip: '0.0.0.0',       type: 'External',         zone: 'internet',  shape: 'sphere',   color: 0xff3333, size: 1.0, criticality: 3, os: 'N/A',        ports: 'N/A',   cve: null },
  // Firewall
  { id: 'firewall',    label: 'Firewall',                   ip: '10.0.0.1',      type: 'Network Device',   zone: 'dmz',       shape: 'box',      color: 0x94a3b8, size: 0.7, criticality: 8, os: 'FortiOS',    ports: '443,22',cve: null },
  // DMZ nodes
  { id: 'webgw',       label: 'Web App Gateway',            ip: '10.0.1.10',     type: 'Web Application',  zone: 'dmz',       shape: 'sphere',   color: 0x3b82f6, size: 0.65,criticality: 7, os: 'Ubuntu 22',  ports: '80,443',cve: 'CVE-2026-1043' },
  { id: 'apigw',       label: 'API Gateway',                ip: '10.0.1.11',     type: 'API/Gateway',      zone: 'dmz',       shape: 'sphere',   color: 0xa855f7, size: 0.6, criticality: 7, os: 'Alpine 3.18',ports: '8080',  cve: null },
  { id: 'lb',          label: 'Load Balancer',              ip: '10.0.1.12',     type: 'Network Device',   zone: 'dmz',       shape: 'sphere',   color: 0x94a3b8, size: 0.55,criticality: 5, os: 'HAProxy',    ports: '80,443',cve: null },
  // Internal nodes
  { id: 'iam',         label: 'IAM Auth Router',            ip: '10.0.2.10',     type: 'Auth Service',     zone: 'internal',  shape: 'sphere',   color: 0x22c55e, size: 0.65,criticality: 9, os: 'RHEL 8.6',   ports: '636,389',cve:'CVE-2026-2090' },
  { id: 'app1',        label: 'App Server 1',               ip: '10.0.2.11',     type: 'Server',           zone: 'internal',  shape: 'sphere',   color: 0x22c55e, size: 0.55,criticality: 6, os: 'Ubuntu 22',  ports: '8080',  cve: 'CVE-2026-3022' },
  { id: 'app2',        label: 'App Server 2',               ip: '10.0.2.12',     type: 'Server',           zone: 'internal',  shape: 'sphere',   color: 0x22c55e, size: 0.55,criticality: 6, os: 'Ubuntu 22',  ports: '8080',  cve: null },
  // Core Banking nodes
  { id: 'coredb',      label: 'Core Banking DB',            ip: '10.0.3.10',     type: 'Database',         zone: 'core',      shape: 'sphere',   color: 0xeab308, size: 1.0, criticality: 10,os: 'RHEL 8.6',   ports: '1521',  cve: null },
  { id: 'swift',       label: 'SWIFT Gateway',              ip: '10.0.3.11',     type: 'Payment Gateway',  zone: 'core',      shape: 'sphere',   color: 0xeab308, size: 0.7, criticality: 10,os: 'Solaris 11', ports: '3021',  cve: 'CVE-2026-4401' },
  { id: 'backup',      label: 'Backup Server',              ip: '10.0.3.12',     type: 'Server',           zone: 'core',      shape: 'sphere',   color: 0xeab308, size: 0.55,criticality: 7, os: 'RHEL 8.6',   ports: '22,873',cve: null },
];

// 3D positions [x, y, z] scaled by 1.5x for wider and cleaner topology
const NODE_POSITIONS = {
  internet: [0,    13.5, 0],
  firewall: [0,    9,    0],
  webgw:    [-5.25, 3.75, 0],
  apigw:    [0,    3.75, 0],
  lb:       [5.25, 3.75, 0],
  iam:      [-5.25,-3.75, 0],
  app1:     [0,    -3.75, 0],
  app2:     [5.25, -3.75, 0],
  coredb:   [-3.75,-11.25,0],
  swift:    [0,    -11.25,0],
  backup:   [3.75, -11.25,0],
};

// Network connections
const CONNECTIONS = [
  ['internet','firewall'],
  ['firewall','webgw'],['firewall','apigw'],['firewall','lb'],
  ['webgw','iam'],['apigw','iam'],['apigw','app1'],['lb','app1'],['lb','app2'],
  ['iam','coredb'],['iam','swift'],['app1','coredb'],['app2','coredb'],
  ['coredb','swift'],['coredb','backup'],
];

// Identities layer
const IDENTITIES = [
  { id: 'admin_user',   label: 'admin_user',   role: 'ROOT',      color: '#ef4444', targets: ['coredb','swift'] },
  { id: 'svc_finacle',  label: 'svc_finacle',  role: 'SERVICE',   color: '#f97316', targets: ['coredb'] },
  { id: 'api_user',     label: 'api_user',     role: 'READ-ONLY', color: '#22c55e', targets: ['apigw','app1'] },
  { id: 'backup_agent', label: 'backup_agent', role: 'READ-ONLY', color: '#22c55e', targets: ['backup'] },
];

// CVE data
const CVES = {
  'CVE-2026-1043': { cvss: 9.8, epss: 0.9452, isKEV: true,  severity: 'CRITICAL', node: 'webgw',  desc: 'RCE via HTTP deserialization in web gateway' },
  'CVE-2026-2090': { cvss: 8.8, epss: 0.87,   isKEV: true,  severity: 'CRITICAL', node: 'iam',    desc: 'Privilege escalation via token manipulation' },
  'CVE-2026-3022': { cvss: 7.2, epss: 0.55,   isKEV: false, severity: 'HIGH',     node: 'app1',   desc: 'Admin dashboard CSRF allowing config manipulation' },
  'CVE-2026-4401': { cvss: 8.1, epss: 0.71,   isKEV: true,  severity: 'CRITICAL', node: 'swift',  desc: 'SWIFT gateway TLS downgrade allowing MITM' },
};

// Attack scenarios
const SCENARIOS = {
  credential: {
    name: 'Credential Stuffing via API Gateway',
    path: ['internet','firewall','apigw','iam','coredb'],
    logTemplate: [
      { type:'ATTACK', src:'0.0.0.0',   dst:'10.0.1.11', msg:'1847 credential pairs submitted to /auth endpoint' },
      { type:'ATTACK', src:'10.0.1.11', dst:'10.0.2.10', msg:'Credential validation bypass — token forged' },
      { type:'ATTACK', src:'10.0.2.10', dst:'10.0.3.10', msg:'Lateral movement via stolen session token' },
      { type:'ATTACK', src:'10.0.3.10', dst:'10.0.3.11', msg:'Privileged DB access leveraged for SWIFT queries' },
    ],
  },
  swift: {
    name: 'SWIFT Transaction Hijack',
    path: ['internet','firewall','webgw','iam','swift'],
    logTemplate: [
      { type:'ATTACK', src:'0.0.0.0',   dst:'10.0.1.10', msg:'CVE-2026-1043 RCE exploit triggered on Web Gateway' },
      { type:'ATTACK', src:'10.0.1.10', dst:'10.0.2.10', msg:'Shell spawned — pivoting to IAM Router' },
      { type:'ATTACK', src:'10.0.2.10', dst:'10.0.3.11', msg:'SWIFT msg tampering: MT103 fraudulent transfer injected' },
    ],
  },
  ransomware: {
    name: 'Ransomware Lateral Spread',
    path: ['internet','firewall','lb','app1','app2','coredb','backup'],
    logTemplate: [
      { type:'ATTACK', src:'0.0.0.0',   dst:'10.0.1.12', msg:'Malicious payload staged via load-balancer health endpoint' },
      { type:'ATTACK', src:'10.0.1.12', dst:'10.0.2.11', msg:'Payload executed — App Server 1 encrypted' },
      { type:'ATTACK', src:'10.0.2.11', dst:'10.0.2.12', msg:'SMB lateral spread — App Server 2 infected' },
      { type:'ATTACK', src:'10.0.2.12', dst:'10.0.3.10', msg:'Ransomware reached Core Banking DB — LOCKDOWN' },
    ],
  },
  insider: {
    name: 'Insider Threat: Privilege Abuse',
    path: ['iam','coredb','swift','backup'],
    logTemplate: [
      { type:'SUSPICIOUS', src:'10.0.2.10', dst:'10.0.3.10', msg:'admin_user accessed 12,400 records outside business hours' },
      { type:'ATTACK',     src:'10.0.2.10', dst:'10.0.3.11', msg:'SWIFT API called with modified beneficiary fields' },
      { type:'ATTACK',     src:'10.0.3.10', dst:'10.0.3.12', msg:'Bulk data exfil to backup server — DNS tunneling detected' },
    ],
  },
};

// Normal traffic log pool
const NORMAL_LOGS = [
  { type:'NORMAL', src:'10.0.1.10', dst:'10.0.2.10', msg:'HTTP GET /api/auth' },
  { type:'NORMAL', src:'10.0.2.11', dst:'10.0.3.10', msg:'DB Query (SELECT users WHERE active=1)' },
  { type:'NORMAL', src:'10.0.1.11', dst:'10.0.2.11', msg:'POST /api/v2/transactions' },
  { type:'NORMAL', src:'10.0.2.12', dst:'10.0.3.10', msg:'DB heartbeat ping' },
  { type:'NORMAL', src:'10.0.1.12', dst:'10.0.2.11', msg:'Health check 200 OK' },
  { type:'SUSPICIOUS', src:'10.0.1.11', dst:'10.0.2.10', msg:'47 failed auth attempts from single IP' },
];

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
const pad2 = n => String(n).padStart(2,'0');
const nowStr = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

// High-fidelity node labels rendered as Billboard Sprites in Three.js
const createLabelSprite = (text, colorHex) => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  // Semi-transparent dark background
  ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4;
  
  // Rounded box
  const r = 10;
  const w = 400;
  const h = 100;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Premium, highly legible typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.0, 1.0, 1);
  return sprite;
};

// Cinematic 3D status badge floating plate
const createBadgeSprite = (text, colorHex) => {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 60;
  const ctx = canvas.getContext('2d');

  // Background and border
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  
  const r = 6;
  const w = 240;
  const h = 60;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Monospace badge typography
  ctx.fillStyle = colorHex;
  ctx.font = '900 16px "JetBrains Mono", "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.4, 0.6, 1);
  return sprite;
};

// Scenario path phase splitter
const parsePathPhases = (path) => {
  if (!path || path.length === 0) return null;

  const isInsider = path[0] !== 'internet';
  let gatewayNode = '';
  let perimeterEdges = [];
  let intermediateNodes = [];
  let lateralEdges = [];
  let targetNode = path[path.length - 1];
  let targetEdges = [];

  if (isInsider) {
    gatewayNode = path[0];
    const targetIdx = path.length - 1;
    
    for (let i = 1; i < targetIdx; i++) {
      intermediateNodes.push(path[i]);
    }
    for (let i = 0; i < targetIdx - 1; i++) {
      lateralEdges.push([path[i], path[i+1]]);
    }
    targetEdges.push([path[targetIdx - 1], targetNode]);
  } else {
    gatewayNode = path[2] || path[0];
    perimeterEdges.push([path[0], path[1]]);
    if (path[2]) {
      perimeterEdges.push([path[1], path[2]]);
    }
    
    const gatewayIdx = path.indexOf(gatewayNode);
    const targetIdx = path.length - 1;
    
    for (let i = gatewayIdx + 1; i < targetIdx; i++) {
      intermediateNodes.push(path[i]);
    }
    for (let i = gatewayIdx; i < targetIdx - 1; i++) {
      lateralEdges.push([path[i], path[i+1]]);
    }
    targetEdges.push([path[targetIdx - 1], targetNode]);
  }

  return {
    gatewayNode,
    perimeterEdges,
    intermediateNodes,
    lateralEdges,
    targetNode,
    targetEdges
  };
};


// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function DigitalTwin() {
  // --- TEMPORARY MOUNT DEBUG LOGS ---
  console.log("%c[DigitalTwin] Mounting/Rendering...", "color: #3b82f6; font-weight: bold;");

  const mountRef   = useRef(null);
  const sceneRef   = useRef(null);
  const cameraRef  = useRef(null);
  const rendererRef = useRef(null);
  const frameRef   = useRef(null);
  const meshMapRef = useRef({});          // nodeId → THREE.Mesh
  const lineMapRef = useRef({});          // 'src-dst' → THREE.Line
  const particleSystemsRef = useRef([]);  // particle groups
  const ringMapRef = useRef({});          // nodeId → ring mesh
  const identityMeshesRef = useRef([]);   // identity sphere meshes
  const identityLineMapRef = useRef([]);  // dotted lines for identities
  const zonePlanesRef = useRef([]);       // zone label objects
  const orbitRef   = useRef({ theta: 0.3, phi: Math.PI/2.8, radius: 18, dragging: false, lastX: 0, lastY: 0 }); // Camera closer (radius 18)
  const clockRef   = useRef(0);
  const simTimeRef = useRef(0);
  const compromisedBadgesRef = useRef({});
  const remediationShieldsRef = useRef([]);

  const [layers, setLayers] = useState({ network: true, assets: false, identities: false, vulns: false, logs: false });
  const [voiceState, setVoiceState] = useState({ isMuted: false, isSpeaking: false });
  const [selectedScenario, setSelectedScenario] = useState('credential');
  const [simState, setSimState] = useState('idle');   // idle | running | breach | remediated
  const [defcon, setDefcon] = useState(5);
  const [activeCVEs, setActiveCVEs] = useState(4);
  const [compromisedIds, setCompromisedIds] = useState(0);
  const [anomalousTx, setAnomalousTx] = useState(0);
  const [liability, setLiability] = useState(0);
  const [logLines, setLogLines] = useState([]);
  const [attackPathNodes, setAttackPathNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedCVE, setSelectedCVE] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });

  const simStateRef = useRef('idle');
  const attackPathRef = useRef([]);
  const logLinesRef = useRef([]);
  const liabilityRef = useRef(0);
  const liabilityIntervalRef = useRef(null);
  const normalLogIntervalRef = useRef(null);
  const attackLogIntervalRef = useRef(null);
  const breachTimerRef = useRef(null);
  const remTimerRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    simStateRef.current = simState;
    console.log(`%c[DigitalTwin] State Synced -> simStateRef: ${simState}`, "color: #a855f7; font-weight: bold;");
  }, [simState]);

  // Subscribe to voice state changes
  useEffect(() => {
    const unsubscribe = voiceNarrator.subscribe(state => {
      setVoiceState(state);
    });
    return unsubscribe;
  }, []);

  // ── AI Voice Narration Triggers ──────────────────────────────────────────
  useEffect(() => {
    if (simState === 'running') {
      voiceNarrator.cancel();
      voiceNarrator.speak("Critical threat detected. CVE-2026-1043 is being actively exploited. Predicted attack path targets the core banking database.");
      voiceNarrator.speak("Attack propagation detected. Monitoring lateral movement.");
    } else if (simState === 'breach') {
      voiceNarrator.speak("Critical infrastructure under attack.");
    } else if (simState === 'remediated') {
      voiceNarrator.speak("AI remediation successful. Threat contained.");
    } else if (simState === 'idle') {
      voiceNarrator.cancel();
    }
  }, [simState]);

  // ── Badge & Shield Helpers ────────────────────────────────────────────────
  const addBadgeToNode = (nodeId, text, colorHex) => {
    if (compromisedBadgesRef.current[nodeId]) {
      removeBadgeFromNode(nodeId);
    }
    const node = NODES.find(n => n.id === nodeId);
    if (!node) return;
    const group = meshMapRef.current[nodeId];
    if (!group) return;

    const badgeSprite = createBadgeSprite(text, colorHex);
    // Track colorHex dynamically to detect transitions
    badgeSprite.material.colorHex = colorHex;
    
    // Position badge relative to label sprite Y offset
    let labelY = node.size * 1.5;
    if (nodeId === 'webgw' || nodeId === 'lb') {
      labelY = 0;
    } else if (nodeId === 'coredb' || nodeId === 'swift' || nodeId === 'backup') {
      labelY = -node.size * 1.6;
    } else if (nodeId === 'internet') {
      labelY = 1.8;
    }

    // Place badge slightly offsetted from the label
    let badgeY = labelY > 0 ? labelY + 0.95 : labelY - 0.95;
    let badgeX = 0;
    if (nodeId === 'webgw') {
      badgeX = -2.3;
      badgeY = -0.7;
    } else if (nodeId === 'lb') {
      badgeX = 2.3;
      badgeY = -0.7;
    }
    
    badgeSprite.position.set(badgeX, badgeY, 0);
    group.add(badgeSprite);
    compromisedBadgesRef.current[nodeId] = badgeSprite;
  };

  const removeBadgeFromNode = (nodeId) => {
    const badgeSprite = compromisedBadgesRef.current[nodeId];
    if (!badgeSprite) return;
    const group = meshMapRef.current[nodeId];
    if (group) {
      group.remove(badgeSprite);
    }
    if (badgeSprite.material) {
      if (badgeSprite.material.map) badgeSprite.material.map.dispose();
      badgeSprite.material.dispose();
    }
    delete compromisedBadgesRef.current[nodeId];
  };

  const clearAllBadges = () => {
    Object.keys(compromisedBadgesRef.current).forEach(nodeId => {
      removeBadgeFromNode(nodeId);
    });
  };

  const spawnRemediationShield = (nodeId) => {
    const node = NODES.find(n => n.id === nodeId);
    if (!node) return;
    const pos = NODE_POSITIONS[nodeId];
    if (!pos) return;

    // Start with a small sphere mesh
    const geo = new THREE.SphereGeometry(node.size * 0.5, 24, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Premium green
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const shield = new THREE.Mesh(geo, mat);
    shield.position.set(...pos);
    
    if (sceneRef.current) {
      sceneRef.current.add(shield);
    }

    remediationShieldsRef.current.push({
      mesh: shield,
      maxScale: 3.5,
      scaleSpeed: 0.04 + Math.random() * 0.02,
      fadeSpeed: 0.015,
    });
  };


  // ── Three.js scene setup ──────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      console.warn("[DigitalTwin] mountRef.current is null on setup. Skipping Three.js initialization.");
      return;
    }
    const W = container.clientWidth || 800;
    const H = container.clientHeight || 600;
    const aspect = H > 0 ? W / H : 1.33;

    // Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.error("[DigitalTwin] WebGL initialization failed:", e);
      return;
    }
    
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x020617, 1); // Darker cyber background matching vignette
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Subtle atmospheric fog
    scene.fog = new THREE.FogExp2(0x020617, 0.022);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 200);
    cameraRef.current = camera;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dLight.position.set(10, 20, 10);
    scene.add(dLight);
    
    // Cyber color point lights for deep background illumination
    const pLight1 = new THREE.PointLight(0x3b82f6, 2.5, 35);
    pLight1.position.set(0, 5, 5);
    scene.add(pLight1);
    const pLight2 = new THREE.PointLight(0xeab308, 1.8, 30);
    pLight2.position.set(0, -10, 5);
    scene.add(pLight2);

    // Deep grid floor moved lower for better visual balance and depth
    const grid = new THREE.GridHelper(60, 40, 0x1e3a5f, 0x0f172a);
    grid.position.y = -16;
    grid.material.opacity = 0.15; // Softer background grid opacity
    grid.material.transparent = true;
    scene.add(grid);

    // Build nodes
    NODES.forEach(node => {
      const pos = NODE_POSITIONS[node.id];
      const group = new THREE.Group();
      group.position.set(...pos);
      group.userData = { nodeId: node.id };

      // Core sphere/box
      let geo;
      if (node.shape === 'box') {
        geo = new THREE.BoxGeometry(node.size * 1.4, node.size * 1.4, node.size * 1.4);
      } else {
        geo = new THREE.SphereGeometry(node.size * 0.85, 32, 32);
      }
      
      const isCritical = node.criticality >= 8;
      const mat = new THREE.MeshPhongMaterial({
        color: node.id === 'internet' ? 0xff3333 : node.color,
        emissive: node.color,
        emissiveIntensity: isCritical ? 0.75 : 0.35, // Stronger glow on critical nodes
        transparent: true,
        opacity: 0.92,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { nodeId: node.id };
      group.add(mesh);

      // Wireframe shell (larger for critical nodes for tech-SOC feel)
      let wireGeo;
      if (node.shape === 'box') {
        wireGeo = new THREE.BoxGeometry(node.size * (isCritical ? 2.0 : 1.7), node.size * (isCritical ? 2.0 : 1.7), node.size * (isCritical ? 2.0 : 1.7));
      } else {
        wireGeo = new THREE.SphereGeometry(node.size * (isCritical ? 1.45 : 1.15), 16, 16);
      }
      const wireMat = new THREE.MeshBasicMaterial({ 
        color: node.color, 
        wireframe: true, 
        transparent: true, 
        opacity: isCritical ? 0.22 : 0.1 
      });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.userData = { isWire: true };
      group.add(wire);

      // Pulsing glow ring for internet node
      if (node.id === 'internet') {
        const ringGeo = new THREE.RingGeometry(node.size * 1.5, node.size * 1.8, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      }

      // Add high-contrast billboard label sprite with intelligent offsets
      const colorHex = '#' + (node.id === 'internet' ? 'ff3333' : node.color.toString(16).padStart(6, '0'));
      const labelSprite = createLabelSprite(node.label, colorHex);
      
      let labelY = node.size * 1.5;
      let labelX = 0;
      if (node.id === 'webgw') {
        labelX = -1.6;
        labelY = 0;
      } else if (node.id === 'lb') {
        labelX = 1.6;
        labelY = 0;
      } else if (node.id === 'coredb' || node.id === 'swift' || node.id === 'backup') {
        labelY = -node.size * 1.6; // Below bottom nodes
      } else if (node.id === 'internet') {
        labelY = 1.8;
      }
      labelSprite.position.set(labelX, labelY, 0);
      group.add(labelSprite);

      scene.add(group);
      meshMapRef.current[node.id] = group;
    });

    // Build connection lines
    CONNECTIONS.forEach(([a, b]) => {
      const posA = new THREE.Vector3(...NODE_POSITIONS[a]);
      const posB = new THREE.Vector3(...NODE_POSITIONS[b]);
      const pts = [posA, posB];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.65 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      lineMapRef.current[`${a}-${b}`] = line;
    });

    // Zone label planes scaled by 1.5x
    const zoneData = [
      { y: 3.75,  color: 0x3b82f6, label: 'DMZ ZONE',         w: 16.5, h: 5.25 },
      { y: -3.75, color: 0x22c55e, label: 'INTERNAL NETWORK',  w: 16.5, h: 5.25 },
      { y: -11.25,color: 0xeab308, label: 'CORE BANKING ZONE', w: 16.5, h: 5.25 },
    ];
    zoneData.forEach(z => {
      const geo = new THREE.PlaneGeometry(z.w, z.h);
      const mat = new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.04, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(geo, mat);
      plane.position.set(0, z.y, -0.5);
      scene.add(plane);
      zonePlanesRef.current.push(plane);

      // Zone border
      const edges = new THREE.EdgesGeometry(geo);
      const edgeMat = new THREE.LineBasicMaterial({ color: z.color, transparent: true, opacity: 0.16 });
      const edgeLine = new THREE.LineSegments(edges, edgeMat);
      edgeLine.position.set(0, z.y, -0.5);
      scene.add(edgeLine);
    });

    // CVE pulsing rings (Layer 4) - Scaled for 1.5x topology
    Object.entries(CVES).forEach(([cveId, data]) => {
      const node = NODES.find(n => n.id === data.node);
      if (!node) return;
      const pos = NODE_POSITIONS[data.node];
      const sz = node.size * 2.3;
      const isCrit = data.severity === 'CRITICAL';
      const ringColor = isCrit ? 0xff2222 : 0xf97316;
      const geo = new THREE.RingGeometry(sz, sz + 0.25, 48);
      const mat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.0, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.set(...pos);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { cveId, isCrit };
      scene.add(ring);
      ringMapRef.current[cveId] = ring;
    });

    // Identity meshes (Layer 3) - Scaled 1.5x
    const identityOffsets = {
      admin_user:   [[-4.8, -12.75, 1.5], [1.2, -12.75, 1.5]],
      svc_finacle:  [[-3.75, -13.8, 2.0]],
      api_user:     [[1.2, 4.8, 2.0], [0, -4.8, 2.0]],
      backup_agent: [[3.75, -12.3, 2.0]],
    };
    IDENTITIES.forEach(id => {
      const offsets = identityOffsets[id.id] || [];
      offsets.forEach(offset => {
        const geo = new THREE.SphereGeometry(0.24, 16, 16);
        const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color(id.color), emissive: new THREE.Color(id.color), emissiveIntensity: 0.7, transparent: true, opacity: 0.0 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...offset);
        mesh.userData = { identityId: id.id, label: id.label, role: id.role };
        scene.add(mesh);
        identityMeshesRef.current.push(mesh);
      });
    });

    // Particle systems for each connection (Layer 5)
    CONNECTIONS.forEach(([a, b]) => {
      const posA = new THREE.Vector3(...NODE_POSITIONS[a]);
      const posB = new THREE.Vector3(...NODE_POSITIONS[b]);
      const count = 5;
      const positions = new Float32Array(count * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.1, transparent: true, opacity: 0.0 });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      particleSystemsRef.current.push({ points, mat, posA, posB, offsets: Array.from({ length: count }, (_, i) => i / count), speed: 0.003, src: a, dst: b, type: 'normal' });
    });

    // Camera position (Centers the scaled graph)
    const updateCamera = () => {
      const { theta, phi, radius } = orbitRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0); // Centered graph vertically/horizontally
    };
    updateCamera();

    let hasLoggedAnimateStart = false;

    // Animation loop
    const animate = () => {
      try {
        if (!hasLoggedAnimateStart) {
          console.log("%c[DigitalTwin] Three.js animation loop started successfully.", "color: #3b82f6; font-weight: bold;");
          hasLoggedAnimateStart = true;
        }

        frameRef.current = requestAnimationFrame(animate);
        clockRef.current += 0.016;
        const t = clockRef.current;

        // Update camera safely
        if (cameraRef.current) {
          updateCamera();
        }

        // Pulse internet node safely
        const inetGroup = meshMapRef.current ? meshMapRef.current['internet'] : null;
        if (inetGroup && inetGroup.children) {
          const scale = 1 + Math.sin(t * 2.5) * 0.12;
          if (inetGroup.children[0]) {
            if (inetGroup.children[0].scale) {
              inetGroup.children[0].scale.setScalar(scale);
            }
            if (inetGroup.children[0].rotation) {
              inetGroup.children[0].rotation.y += 0.01;
            }
          }
          if (inetGroup.children[2] && inetGroup.children[2].material) {
            inetGroup.children[2].material.opacity = 0.15 + Math.sin(t * 2) * 0.12;
          }
        }

        // Gently pulse all nodes safely
        NODES.forEach(node => {
          if (node.id === 'internet') return;
          const group = meshMapRef.current ? meshMapRef.current[node.id] : null;
          if (!group || !group.children) return;
          const pulse = 1 + Math.sin(t * 1.2 + node.id.charCodeAt(0)) * 0.03;
          if (group.children[0] && group.children[0].scale) {
            group.children[0].scale.setScalar(pulse);
          }
          if (group.children[1] && group.children[1].rotation) {
            group.children[1].rotation.y += 0.004;
          }
        });

        // Pulse attack path nodes red safely
        if (attackPathRef.current) {
          attackPathRef.current.forEach(nodeId => {
            const group = meshMapRef.current[nodeId];
            if (!group || !group.children) return;
            const pulse = 1 + Math.sin(t * 5) * 0.15;
            if (group.children[0] && group.children[0].scale) {
              group.children[0].scale.setScalar(pulse);
            }
          });
        }

        // CVE rings pulse safely
        if (ringMapRef.current) {
          Object.entries(ringMapRef.current).forEach(([cveId, ring]) => {
            if (ring && ring.material && ring.material.opacity > 0) {
              const data = CVES[cveId];
              if (data) {
                const speed = data.severity === 'CRITICAL' ? 4 : 2;
                const baseOp = data.severity === 'CRITICAL' ? 0.7 : 0.5;
                ring.material.opacity = baseOp * (0.5 + Math.sin(t * speed) * 0.5);
                if (ring.scale) {
                  ring.scale.setScalar(1 + Math.sin(t * speed * 0.5) * 0.08);
                }
              }
            }
          });
        }

        // Particle animation safely
        if (particleSystemsRef.current) {
          particleSystemsRef.current.forEach(ps => {
            if (!ps || !ps.mat || ps.mat.opacity <= 0) return;
            if (!ps.points || !ps.points.geometry || !ps.points.geometry.attributes || !ps.points.geometry.attributes.position) return;
            const positions = ps.points.geometry.attributes.position;
            if (!ps.offsets || !ps.posA || !ps.posB) return;
            for (let i = 0; i < ps.offsets.length; i++) {
              ps.offsets[i] = (ps.offsets[i] + ps.speed) % 1;
              const t2 = ps.offsets[i];
              positions.setXYZ(i,
                ps.posA.x + (ps.posB.x - ps.posA.x) * t2,
                ps.posA.y + (ps.posB.y - ps.posA.y) * t2,
                ps.posA.z + (ps.posB.z - ps.posA.z) * t2,
              );
            }
            positions.needsUpdate = true;
          });
        }

        // Animate remediation shields safely
        if (remediationShieldsRef.current) {
          remediationShieldsRef.current.forEach(item => {
            if (!item || !item.mesh) return;
            if (item.mesh.scale) {
              item.mesh.scale.addScalar(item.scaleSpeed || 0.01);
            }
            if (item.mesh.material) {
              item.mesh.material.opacity -= (item.fadeSpeed || 0.015);
            }
            if (item.mesh.material && item.mesh.material.opacity <= 0) {
              if (sceneRef.current) {
                sceneRef.current.remove(item.mesh);
              }
              if (item.mesh.geometry) item.mesh.geometry.dispose();
              if (item.mesh.material) item.mesh.material.dispose();
            }
          });
          remediationShieldsRef.current = remediationShieldsRef.current.filter(item => item && item.mesh && item.mesh.material && item.mesh.material.opacity > 0);
        }

        // --- DYNAMIC FIVE-STAGE PROPAGATION ENGINE ---
        if (simStateRef.current !== 'idle') {
          simTimeRef.current += 0.016;
        } else {
          simTimeRef.current = 0;
        }
        
        const elapsed = simTimeRef.current;
        const path = attackPathRef.current;
        const phases = parsePathPhases(path);

        if (simStateRef.current !== 'idle' && phases) {
          const isBreached = elapsed >= 5.0 && elapsed < 8.0;
          const isRemediated = elapsed >= 8.0;

          // Ambient lighting adjustments based on attack stage safely
          if (pLight1 && pLight1.color) {
            if (isBreached) {
              pLight1.color.setHex(0xff1111);
              pLight1.intensity = 4.0;
            } else if (isRemediated) {
              pLight1.color.setHex(0x10b981);
              pLight1.intensity = 3.0;
            } else {
              pLight1.color.setHex(0x3b82f6);
              pLight1.intensity = 2.5;
            }
          }
          if (sceneRef.current && sceneRef.current.fog) {
            sceneRef.current.fog.density = isBreached ? 0.03 : 0.022;
          }

          // Helper to find lines and particle systems safely
          const getEdgeElements = (a, b) => {
            const key1 = `${a}-${b}`;
            const key2 = `${b}-${a}`;
            const line = lineMapRef.current ? (lineMapRef.current[key1] || lineMapRef.current[key2]) : undefined;
            const ps = particleSystemsRef.current ? particleSystemsRef.current.find(p => p && ((p.src === a && p.dst === b) || (p.src === b && p.dst === a))) : undefined;
            return { line, ps };
          };

          // STAGE 1: Reconnaissance (0.0s - 1.5s)
          if (elapsed < 1.5) {
            const nodeData = NODES.find(n => n.id === phases.gatewayNode);
            if (nodeData && nodeData.cve && ringMapRef.current) {
              const ring = ringMapRef.current[nodeData.cve];
              if (ring && ring.material && ring.scale) {
                const progress = (elapsed * 1.5) % 1.0;
                ring.material.opacity = 0.85 * (1.0 - progress);
                ring.scale.setScalar(0.8 + progress * 2.5);
              }
            }
          }

          // STAGE 2: Gateway Intrusion (1.5s - 3.0s)
          if (elapsed >= 1.5 && elapsed < 3.0 && phases.perimeterEdges) {
            phases.perimeterEdges.forEach(([src, dst]) => {
              const { line, ps } = getEdgeElements(src, dst);
              if (line && line.material && line.material.color) {
                line.material.color.set(0xff2222);
                line.material.opacity = 1.0;
              }
              if (ps && ps.mat && ps.mat.color) {
                ps.mat.color.set(0xff2222);
                ps.speed = 0.025;
                ps.mat.size = 0.18;
                ps.mat.opacity = 0.95;
              }
            });

            if (elapsed >= 2.2) {
              const group = meshMapRef.current[phases.gatewayNode];
              if (group && group.children) {
                const mesh = group.children[0];
                if (mesh && mesh.material && mesh.material.color && mesh.material.emissive) {
                  mesh.material.color.set(0xff2222);
                  mesh.material.emissive.set(0xff1111);
                  mesh.material.emissiveIntensity = 1.25;
                }

                if (!compromisedBadgesRef.current[phases.gatewayNode]) {
                  addBadgeToNode(phases.gatewayNode, 'COMPROMISED', '#ef4444');
                }
              }
            }
          }

          // STAGE 3: Lateral Movement (3.0s - 5.0s)
          if (elapsed >= 3.0 && elapsed < 5.0) {
            if (phases.perimeterEdges) {
              phases.perimeterEdges.forEach(([src, dst]) => {
                const { line, ps } = getEdgeElements(src, dst);
                if (line && line.material && line.material.color) {
                  line.material.color.set(0xff2222);
                  line.material.opacity = 0.8;
                }
                if (ps && ps.mat && ps.mat.color) {
                  ps.mat.color.set(0xff2222);
                  ps.speed = 0.015;
                  ps.mat.size = 0.15;
                  ps.mat.opacity = 0.8;
                }
              });
            }

            const gatewayGroup = meshMapRef.current[phases.gatewayNode];
            if (gatewayGroup && gatewayGroup.children) {
              const mesh = gatewayGroup.children[0];
              if (mesh && mesh.material && mesh.material.color && mesh.material.emissive) {
                mesh.material.color.set(0xff2222);
                mesh.material.emissive.set(0xff1111);
              }
              if (!compromisedBadgesRef.current[phases.gatewayNode]) {
                addBadgeToNode(phases.gatewayNode, 'COMPROMISED', '#ef4444');
              }
            }

            if (phases.lateralEdges) {
              phases.lateralEdges.forEach(([src, dst]) => {
                const { line, ps } = getEdgeElements(src, dst);
                if (line && line.material && line.material.color) {
                  line.material.color.set(0xff2222);
                  line.material.opacity = 1.0;
                }
                if (ps && ps.mat && ps.mat.color) {
                  ps.mat.color.set(0xff2222);
                  ps.speed = 0.025;
                  ps.mat.size = 0.18;
                  ps.mat.opacity = 0.95;
                }
              });
            }

            if (elapsed >= 3.5 && phases.intermediateNodes) {
              phases.intermediateNodes.forEach(nodeId => {
                const group = meshMapRef.current[nodeId];
                if (group && group.children) {
                  const mesh = group.children[0];
                  if (mesh && mesh.material && mesh.material.color && mesh.material.emissive) {
                    mesh.material.color.set(0xff2222);
                    mesh.material.emissive.set(0xff1111);
                    mesh.material.emissiveIntensity = 1.25;
                  }

                  if (!compromisedBadgesRef.current[nodeId]) {
                    addBadgeToNode(nodeId, 'COMPROMISED', '#ef4444');
                  }
                }
              });
            }
          }

          // STAGE 4: Core Targeting / DB Breach (5.0s - 8.0s)
          if (elapsed >= 5.0 && elapsed < 8.0) {
            if (phases.perimeterEdges && phases.lateralEdges) {
              phases.perimeterEdges.concat(phases.lateralEdges).forEach(([src, dst]) => {
                const { line, ps } = getEdgeElements(src, dst);
                if (line && line.material && line.material.color) {
                  line.material.color.set(0xff2222);
                  line.material.opacity = 0.8;
                }
                if (ps && ps.mat && ps.mat.color) {
                  ps.mat.color.set(0xff2222);
                  ps.speed = 0.015;
                  ps.mat.size = 0.15;
                  ps.mat.opacity = 0.8;
                }
              });
            }

            if (phases.intermediateNodes) {
              const compNodes = [phases.gatewayNode].concat(phases.intermediateNodes);
              compNodes.forEach(nodeId => {
                const group = meshMapRef.current[nodeId];
                if (group && group.children) {
                  const mesh = group.children[0];
                  if (mesh && mesh.material && mesh.material.color && mesh.material.emissive) {
                    mesh.material.color.set(0xff2222);
                    mesh.material.emissive.set(0xff1111);
                  }
                  if (!compromisedBadgesRef.current[nodeId]) {
                    addBadgeToNode(nodeId, 'COMPROMISED', '#ef4444');
                  }
                }
              });
            }

            if (phases.targetEdges) {
              phases.targetEdges.forEach(([src, dst]) => {
                const { line, ps } = getEdgeElements(src, dst);
                if (line && line.material && line.material.color) {
                  line.material.color.set(0xff2222);
                  line.material.opacity = 1.0;
                }
                if (ps && ps.mat && ps.mat.color) {
                  ps.mat.color.set(0xff2222);
                  ps.speed = 0.035;
                  ps.mat.size = 0.22;
                  ps.mat.opacity = 0.95;
                }
              });
            }

            if (elapsed >= 5.2) {
              const group = meshMapRef.current[phases.targetNode];
              if (group && group.children) {
                const mesh = group.children[0];
                const wire = group.children[1];

                const flash = 1.0 + Math.sin(t * 18.0) * 0.25;
                if (mesh && mesh.scale && mesh.material && mesh.material.color && mesh.material.emissive) {
                  mesh.scale.setScalar(flash * (NODES.find(n => n.id === phases.targetNode)?.size || 1.0));
                  mesh.material.color.set(0xff1111);
                  mesh.material.emissive.set(0xff0000);
                  mesh.material.emissiveIntensity = 2.5;
                }

                if (!compromisedBadgesRef.current[phases.targetNode]) {
                  addBadgeToNode(phases.targetNode, 'COMPROMISED', '#ef4444');
                }

                if (wire && wire.scale && wire.material && wire.material.color) {
                  const progress = (elapsed * 1.5) % 1.0;
                  wire.scale.setScalar(2.0 + progress * 2.5);
                  wire.material.color.set(0xff1111);
                  wire.material.opacity = 0.65 * (1.0 - progress);
                }
              }
            }
          }

          // STAGE 5: AI Remediation & Containment (8.0s+)
          if (elapsed >= 8.0) {
            if (remediationShieldsRef.current && remediationShieldsRef.current.length === 0) {
              spawnRemediationShield(phases.targetNode);
              if (phases.intermediateNodes && phases.intermediateNodes.includes('iam')) {
                spawnRemediationShield('iam');
              } else if (phases.gatewayNode) {
                spawnRemediationShield(phases.gatewayNode);
              }
            }

            if (phases.intermediateNodes) {
              const pathNodes = [phases.gatewayNode].concat(phases.intermediateNodes).concat([phases.targetNode]);
              pathNodes.forEach(nodeId => {
                if (compromisedBadgesRef.current && compromisedBadgesRef.current[nodeId] && compromisedBadgesRef.current[nodeId].material && compromisedBadgesRef.current[nodeId].material.colorHex !== '#10b981') {
                  addBadgeToNode(nodeId, 'CONTAINED', '#10b981');
                }

                const group = meshMapRef.current ? meshMapRef.current[nodeId] : null;
                if (group && group.children) {
                  const mesh = group.children[0];
                  const wire = group.children[1];

                  if (mesh && mesh.material && mesh.material.color && mesh.material.emissive) {
                    mesh.material.color.set(0x10b981);
                    mesh.material.emissive.set(0x10b981);
                    mesh.material.emissiveIntensity = 0.95;
                  }

                  if (wire && wire.scale && wire.material && wire.material.color) {
                    const nodeData = NODES.find(n => n.id === nodeId);
                    const nodeSize = nodeData ? nodeData.size : undefined;
                    wire.scale.setScalar(nodeSize !== undefined ? nodeSize * 1.2 : 1.15);
                    wire.material.color.set(0x10b981);
                    wire.material.opacity = 0.22;
                  }
                }
              });
            }

            if (phases.perimeterEdges && phases.lateralEdges && phases.targetEdges) {
              phases.perimeterEdges.concat(phases.lateralEdges).concat(phases.targetEdges).forEach(([src, dst]) => {
                const { line, ps } = getEdgeElements(src, dst);
                if (line && line.material && line.material.color) {
                  line.material.color.set(0x10b981);
                  line.material.opacity = 0.65;
                }
                if (ps && ps.mat && ps.mat.color) {
                  ps.mat.color.set(0x10b981);
                  ps.speed = 0.003;
                  ps.mat.size = 0.1;
                  ps.mat.opacity = 0.55;
                }
              });
            }
          }
        }

        // Identity meshes bob safely
        if (identityMeshesRef.current) {
          identityMeshesRef.current.forEach((mesh, i) => {
            if (mesh && mesh.material && mesh.material.opacity > 0 && mesh.position) {
              mesh.position.y += Math.sin(t * 1.5 + i) * 0.002;
            }
          });
        }

        // Render scene safely
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      } catch (err) {
        console.error("%c[DigitalTwin] Exception in Three.js render/animate frame loop:", "color: #ef4444; font-weight: bold;", err);
      }
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const W2 = container.clientWidth || 800;
      const H2 = container.clientHeight || 600;
      renderer.setSize(W2, H2);
      camera.aspect = H2 > 0 ? W2 / H2 : 1.33;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Mouse orbit controls
    const onMouseDown = e => {
      if (orbitRef.current) {
        orbitRef.current.dragging = true;
        orbitRef.current.lastX = e.clientX;
        orbitRef.current.lastY = e.clientY;
      }
    };
    const onMouseMove = e => {
      if (!orbitRef.current) return;
      const { dragging, lastX, lastY } = orbitRef.current;
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      orbitRef.current.theta -= dx * 0.005;
      orbitRef.current.phi = Math.max(0.3, Math.min(Math.PI - 0.3, orbitRef.current.phi + dy * 0.005));
      orbitRef.current.lastX = e.clientX;
      orbitRef.current.lastY = e.clientY;
    };
    const onMouseUp = () => { if (orbitRef.current) orbitRef.current.dragging = false; };
    const onWheel = e => {
      if (orbitRef.current) {
        orbitRef.current.radius = Math.max(8, Math.min(40, orbitRef.current.radius + e.deltaY * 0.03));
      }
    };

    // Raycaster for click/hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedNode = (evt) => {
      if (!container || !camera || !meshMapRef.current) return null;
      const rect = container.getBoundingClientRect();
      if (!rect || container.clientWidth === 0 || container.clientHeight === 0) return null;
      mouse.x = ((evt.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((evt.clientY - rect.top) / container.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = Object.values(meshMapRef.current).map(g => g && g.children ? g.children[0] : null).filter(Boolean);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0 && hits[0].object && hits[0].object.userData) {
        return hits[0].object.userData.nodeId;
      }
      return null;
    };

    const onCanvasMouseMove = (evt) => {
      if (!container) return;
      const nodeId = getIntersectedNode(evt);
      if (nodeId) {
        const rect = container.getBoundingClientRect();
        setTooltip({ visible: true, x: evt.clientX - (rect ? rect.left : 0), y: evt.clientY - (rect ? rect.top : 0), nodeId });
        container.style.cursor = 'pointer';
      } else {
        setTooltip({ visible: false, x: 0, y: 0, nodeId: null });
        container.style.cursor = 'grab';
      }
    };

    const onCanvasClick = (evt) => {
      if (!orbitRef.current) return;
      if (Math.abs(evt.clientX - orbitRef.current.lastX) > 5) return;
      const nodeId = getIntersectedNode(evt);
      if (nodeId) {
        const node = NODES.find(n => n.id === nodeId);
        setSelectedNode(node || null);
      }
    };

    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
      renderer.domElement.addEventListener('mousemove', onCanvasMouseMove);
      renderer.domElement.addEventListener('click', onCanvasClick);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.domElement.removeEventListener('mousemove', onCanvasMouseMove);
        renderer.domElement.removeEventListener('click', onCanvasClick);
      }
      
      // Clean up badges
      if (compromisedBadgesRef.current) {
        Object.keys(compromisedBadgesRef.current).forEach(nodeId => {
          const badgeSprite = compromisedBadgesRef.current[nodeId];
          if (badgeSprite) {
            const group = meshMapRef.current ? meshMapRef.current[nodeId] : null;
            if (group) group.remove(badgeSprite);
            if (badgeSprite.material) {
              if (badgeSprite.material.map) badgeSprite.material.map.dispose();
              badgeSprite.material.dispose();
            }
          }
        });
        compromisedBadgesRef.current = {};
      }

      // Clean up shields
      if (remediationShieldsRef.current) {
        remediationShieldsRef.current.forEach(item => {
          if (item && item.mesh) {
            if (scene) scene.remove(item.mesh);
            if (item.mesh.geometry) item.mesh.geometry.dispose();
            if (item.mesh.material) item.mesh.material.dispose();
          }
        });
        remediationShieldsRef.current = [];
      }

      if (renderer) renderer.dispose();
      if (container && renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);


  // ── Layer 3: Identities visibility ───────────────────────────────────────
  useEffect(() => {
    const vis = layers.identities ? 0.85 : 0;
    if (identityMeshesRef.current) {
      identityMeshesRef.current.forEach(m => {
        if (m && m.material) m.material.opacity = vis;
      });
    }
  }, [layers.identities]);

  // ── Layer 4: CVE rings visibility ────────────────────────────────────────
  useEffect(() => {
    if (ringMapRef.current) {
      Object.values(ringMapRef.current).forEach(ring => {
        if (ring && ring.material) {
          ring.material.opacity = layers.vulns ? 0.5 : 0;
        }
      });
    }
  }, [layers.vulns]);

  // ── Layer 5: Particles visibility ────────────────────────────────────────
  useEffect(() => {
    if (particleSystemsRef.current) {
      particleSystemsRef.current.forEach(ps => {
        if (ps && ps.mat) {
          if (!layers.logs) {
            ps.mat.opacity = 0;
          } else {
            ps.mat.opacity = ps.type === 'attack' ? 0.95 : ps.type === 'suspicious' ? 0.75 : 0.45;
          }
        }
      });
    }
  }, [layers.logs]);

  // ── Normal log ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    if (normalLogIntervalRef.current) clearInterval(normalLogIntervalRef.current);
    if (!layers.logs || simStateRef.current === 'running') return;
    let idx = 0;
    normalLogIntervalRef.current = setInterval(() => {
      if (simStateRef.current === 'running') return;
      const entry = NORMAL_LOGS[idx % NORMAL_LOGS.length];
      idx++;
      appendLog(entry.type, entry.src, entry.dst, entry.msg);
    }, 2000);
    return () => clearInterval(normalLogIntervalRef.current);
  }, [layers.logs, simState]);

  // ── Attack path line highlighting ─────────────────────────────────────────
  useEffect(() => {
    if (lineMapRef.current) {
      // Reset all lines
      Object.values(lineMapRef.current).forEach(line => {
        if (line && line.material && line.material.color) {
          line.material.color.set(0x1e3a5f);
          line.material.opacity = 0.5;
        }
      });
    }
    // Highlight attack path
    const path = attackPathRef.current;
    if (path && lineMapRef.current) {
      for (let i = 0; i < path.length - 1; i++) {
        const key1 = `${path[i]}-${path[i+1]}`;
        const key2 = `${path[i+1]}-${path[i]}`;
        const line = lineMapRef.current[key1] || lineMapRef.current[key2];
        if (line && line.material && line.material.color) {
          line.material.color.set(0xff2222);
          line.material.opacity = 1.0;
        }
      }
    }
    // Color nodes
    if (meshMapRef.current) {
      NODES.forEach(node => {
        const group = meshMapRef.current[node.id];
        if (!group || !group.children) return;
        const isAttacked = path && path.includes(node.id);
        const mesh = group.children[0];
        if (mesh && mesh.material) {
          if (isAttacked) {
            if (mesh.material.color) mesh.material.color.set(0xff2222);
            if (mesh.material.emissive) {
              mesh.material.emissive.set(0xff0000);
              mesh.material.emissiveIntensity = 1.25; // Brighter active node glow on attack path
            }
          } else {
            const origColor = NODES.find(n => n.id === node.id)?.color ?? 0x3b82f6;
            if (mesh.material.color) mesh.material.color.set(origColor);
            if (mesh.material.emissive) {
              mesh.material.emissive.set(origColor);
              mesh.material.emissiveIntensity = node.criticality >= 8 ? 0.75 : 0.35;
            }
          }
        }
      });
    }
  }, [attackPathNodes]);

  // ── Attack particles ──────────────────────────────────────────────────────
  useEffect(() => {
    const path = attackPathRef.current;
    if (path && particleSystemsRef.current) {
      particleSystemsRef.current.forEach(ps => {
        if (!ps || !ps.mat || !ps.mat.color) return;
        const onPath = path.includes(ps.src) && path.includes(ps.dst);
        if (onPath && simStateRef.current === 'running') {
          ps.type = 'attack';
          ps.speed = 0.015;
          ps.mat.color.set(0xff2222);
          ps.mat.size = 0.18;
          if (layers.logs) ps.mat.opacity = 0.95;
        } else if (!onPath) {
          ps.type = 'normal';
          ps.speed = 0.003;
          ps.mat.color.set(0x60a5fa);
          ps.mat.size = 0.1;
          if (layers.logs) ps.mat.opacity = 0.45;
        }
      });
    }
  }, [attackPathNodes, layers.logs]);

  const appendLog = useCallback((type, src, dst, msg) => {
    const line = { type, src, dst, msg, time: nowStr() };
    logLinesRef.current = [line, ...logLinesRef.current].slice(0, 50);
    setLogLines([...logLinesRef.current]);
  }, []);

  // ── Simulate Attack ───────────────────────────────────────────────────────
  const handleSimulate = useCallback(() => {
    if (simStateRef.current !== 'idle') return;
    const scenario = SCENARIOS[selectedScenario];
    simStateRef.current = 'running';
    setSimState('running');
    setDefcon(2);
    setCompromisedIds(Math.floor(Math.random() * 3) + 1);
    setAnomalousTx(Math.floor(Math.random() * 40) + 10);
    attackPathRef.current = scenario.path;
    setAttackPathNodes([...scenario.path]);

    // Attack logs
    let logIdx = 0;
    attackLogIntervalRef.current = setInterval(() => {
      if (logIdx < scenario.logTemplate.length) {
        const entry = scenario.logTemplate[logIdx++];
        appendLog(entry.type, entry.src, entry.dst, entry.msg);
      } else {
        clearInterval(attackLogIntervalRef.current);
      }
    }, 1800);

    // Liability counter
    liabilityRef.current = 0;
    liabilityIntervalRef.current = setInterval(() => {
      liabilityRef.current = Math.min(2300000, liabilityRef.current + 19000);
      setLiability(liabilityRef.current);
    }, 150);

    // Breach banner
    breachTimerRef.current = setTimeout(() => {
      setSimState('breach');
      simStateRef.current = 'breach';
    }, 5000);

    // Remediation banner
    remTimerRef.current = setTimeout(() => {
      setSimState('remediated');
      simStateRef.current = 'remediated';
      clearInterval(liabilityIntervalRef.current);
    }, 8000);
  }, [selectedScenario, appendLog]);

  const handleReset = useCallback(() => {
    clearInterval(attackLogIntervalRef.current);
    clearInterval(liabilityIntervalRef.current);
    clearTimeout(breachTimerRef.current);
    clearTimeout(remTimerRef.current);
    simStateRef.current = 'idle';
    setSimState('idle');
    setDefcon(5);
    setActiveCVEs(4);
    setCompromisedIds(0);
    setAnomalousTx(0);
    setLiability(0);
    attackPathRef.current = [];
    setAttackPathNodes([]);
    logLinesRef.current = [];
    setLogLines([]);

    // Reset stopwatch & badge visual states
    simTimeRef.current = 0;
    clearAllBadges();

    // Clean up remediation shields
    remediationShieldsRef.current.forEach(item => {
      if (sceneRef.current) {
        sceneRef.current.remove(item.mesh);
      }
      if (item.mesh.geometry) item.mesh.geometry.dispose();
      if (item.mesh.material) item.mesh.material.dispose();
    });
    remediationShieldsRef.current = [];
  }, []);


  const toggleLayer = key => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const defconColor = () => {
    if (defcon === 5) return '#22c55e';
    if (defcon === 4) return '#3b82f6';
    if (defcon === 3) return '#eab308';
    if (defcon === 2) return '#f97316';
    return '#ef4444';
  };

  const logColor = type => {
    if (type === 'ATTACK')     return '#ef4444';
    if (type === 'SUSPICIOUS') return '#eab308';
    return '#94a3b8';
  };

  const renderStatusBadge = (type) => {
    let bg, color, border;
    if (type === 'ATTACK') {
      bg = 'rgba(239, 68, 68, 0.2)';
      color = '#ff6b6b';
      border = '1px solid rgba(239, 68, 68, 0.55)';
    } else if (type === 'SUSPICIOUS') {
      bg = 'rgba(234, 179, 8, 0.2)';
      color = '#facc15';
      border = '1px solid rgba(234, 179, 8, 0.55)';
    } else {
      bg = 'rgba(148, 163, 184, 0.15)';
      color = '#cbd5e1';
      border = '1px solid rgba(148, 163, 184, 0.35)';
    }
    return (
      <span style={{
        display: 'inline-block',
        padding: '5px 12px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: 1.5,
        backgroundColor: bg,
        color: color,
        border: border,
        textAlign: 'center',
        minWidth: 120,
        textTransform: 'uppercase',
      }}>
        {type}
      </span>
    );
  };

  const tooltipNode = tooltip.nodeId ? NODES.find(n => n.id === tooltip.nodeId) : null;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: '0', width: '100%', height: '100%', fontFamily: "'Inter', 'JetBrains Mono', monospace", background: '#020617', overflow: 'hidden' }}>
      
      {/* Dynamic Embedded CSS Styles */}
      <style>{`
        .soc-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .soc-btn:hover {
          background: rgba(59, 130, 246, 0.08) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
          color: #ffffff !important;
          transform: translateX(2px);
        }
        .soc-btn-active:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
        }
        /* Premium custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar,
        .log-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track,
        .log-scroll::-webkit-scrollbar-track {
          background: rgba(2, 6, 23, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb,
        .log-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover,
        .log-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }
        @keyframes pulse-red {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        @keyframes pulse-green {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        @keyframes voice-wave-bob {
          0% { transform: scaleY(0.25); }
          100% { transform: scaleY(1.0); }
        }
        .pulse-dot-red {
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-red 1.5s infinite ease-in-out;
          box-shadow: 0 0 8px #ef4444;
        }
        .pulse-dot-green {
          width: 8px;
          height: 8px;
          background-color: #22c55e;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-green 1.5s infinite ease-in-out;
          box-shadow: 0 0 8px #22c55e;
        }
      `}</style>

      {/* ── LEFT: 3D Canvas (Fills Remaining Space) ─────────────────────────────────── */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, #070e24 0%, #020617 100%)', // Subtle blue radial gradient behind scene
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.85)', // Vignette effect
      }}>
        {/* Canvas mount */}
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Active Layer Badges Stack (Left aligned, vertically stacked with spacing, below banner) */}
        <div style={{ position: 'absolute', top: 84, left: 24, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>Active Layers</div>
          {Object.entries(layers).map(([key, on]) => on && (
            <div key={key} style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: '#60a5fa',
              background: 'rgba(10, 14, 26, 0.85)',
              padding: '8px 16px',
              borderRadius: 6,
              borderLeft: '4px solid #3b82f6',
              borderTop: '1px solid rgba(96,165,250,0.15)',
              borderRight: '1px solid rgba(96,165,250,0.15)',
              borderBottom: '1px solid rgba(96,165,250,0.15)',
              textTransform: 'uppercase',
              width: '210px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
            }}>
              ● {key}
            </div>
          ))}
        </div>

        {/* Zone labels overlay */}
        {layers.network && (
          <div style={{ 
            position: 'absolute', 
            bottom: simState !== 'idle' ? 460 : 100, 
            left: 24, 
            pointerEvents: 'none', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 8,
            transition: 'bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {[
              { label: 'CORE BANKING ZONE', color: '#eab308' },
              { label: 'INTERNAL NETWORK',  color: '#22c55e' },
              { label: 'DMZ ZONE',          color: '#3b82f6' },
            ].map(z => (
              <div key={z.label} style={{ 
                fontSize: 16, 
                fontWeight: 900, 
                letterSpacing: '6px', 
                color: z.color, 
                opacity: 0.95,
                textShadow: `0 0 16px ${z.color}, 0 0 8px ${z.color}, 0 0 4px ${z.color}`,
              }}>{z.label}</div>
            ))}
          </div>
        )}

        {/* Tooltip */}
        {tooltip.visible && tooltipNode && (
          <div style={{
            position: 'absolute',
            left: tooltip.x + 16, top: tooltip.y - 12,
            background: 'rgba(10,14,26,0.96)',
            border: '1px solid rgba(96,165,250,0.35)',
            borderCornerRadius: 10, padding: '14px 18px',
            fontSize: 14, color: '#e2e8f0', pointerEvents: 'none',
            zIndex: 20, minWidth: 220,
            boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 6, letterSpacing: 0.5 }}>{tooltipNode.label}</div>
            <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{tooltipNode.ip}</div>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>{tooltipNode.type} · {tooltipNode.os}</div>
            {tooltipNode.cve && <div style={{ color: '#ff6b6b', fontSize: 14, marginTop: 6, fontWeight: 800 }}>⚠️ {tooltipNode.cve}</div>}
            <div style={{ color: '#64748b', fontSize: 14, marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6 }}>Click node for telemetry</div>
          </div>
        )}

        {/* Node detail panel */}
        {selectedNode && (
          <div style={{
            position: 'absolute', top: 80, right: 24,
            background: 'rgba(10,14,26,0.96)',
            border: '1px solid rgba(96,165,250,0.3)',
            borderRadius: 12, padding: 22, fontSize: 15,
            color: '#e2e8f0', zIndex: 30, width: 350,
            boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: 0.5 }}>
                {selectedNode.label}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
              >✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 14px', fontSize: 16 }}>
              <span style={{ color: '#64748b' }}>IP Address:</span><span style={{ color: '#60a5fa', fontWeight: 700 }}>{selectedNode.ip}</span>
              <span style={{ color: '#64748b' }}>Node Type:</span><span style={{ color: '#e2e8f0' }}>{selectedNode.type}</span>
              <span style={{ color: '#64748b' }}>OS Platform:</span><span style={{ color: '#e2e8f0' }}>{selectedNode.os}</span>
              <span style={{ color: '#64748b' }}>Open Ports:</span><span style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{selectedNode.ports}</span>
              <span style={{ color: '#64748b' }}>Criticality:</span>
              <span style={{ color: selectedNode.criticality >= 9 ? '#ef4444' : selectedNode.criticality >= 7 ? '#f97316' : '#22c55e', fontWeight: 700 }}>
                {selectedNode.criticality}/10
              </span>
              <span style={{ color: '#64748b' }}>Node Status:</span>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>🟢 ACTIVE & SECURE</span>
            </div>
            {selectedNode.cve && CVES[selectedNode.cve] && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 16, marginBottom: 6 }}>{selectedNode.cve}</div>
                <div style={{ fontSize: 15, color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>{CVES[selectedNode.cve].desc}</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 15 }}>
                  <span style={{ color: '#f97316', fontWeight: 600 }}>CVSS {CVES[selectedNode.cve].cvss}</span>
                  <span style={{ color: '#eab308', fontWeight: 600 }}>EPSS {CVES[selectedNode.cve].epss}</span>
                  {CVES[selectedNode.cve].isKEV && <span style={{ color: '#ef4444', fontWeight: 800 }}>✦ KEV</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Asset labels (Layer 2) */}
        {layers.assets && (
          <div style={{ 
            position: 'absolute', 
            bottom: 24, 
            left: simState !== 'idle' ? 490 : 24, 
            pointerEvents: 'none', 
            background: 'rgba(10,14,26,0.85)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: 10, 
            padding: '14px 18px', 
            backdropFilter: 'blur(8px)', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ fontSize: 14, color: '#64748b', letterSpacing: 2, marginBottom: 8, fontWeight: 800, textTransform: 'uppercase' }}>ASSET LEGEND</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { color: '#3b82f6', label: 'Web/Network' },
                { color: '#a855f7', label: 'API/Gateway' },
                { color: '#22c55e', label: 'Server' },
                { color: '#eab308', label: 'Database' },
                { color: '#94a3b8', label: 'Network Devices' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#94a3b8', fontWeight: 600 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}/>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Identity legend (Layer 3) */}
        {layers.identities && (
          <div style={{ position: 'absolute', bottom: 60, right: 24, pointerEvents: 'none', background: 'rgba(10,14,26,0.85)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '16px 20px', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 14, color: '#64748b', letterSpacing: 2, marginBottom: 12, fontWeight: 800, textTransform: 'uppercase' }}>IDENTITY ACCESS</div>
            {IDENTITIES.map(id => (
              <div key={id.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#94a3b8', marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: id.color }} />
                <span style={{ color: id.color, fontWeight: 700 }}>{id.label}</span>
                <span style={{ color: '#475569', fontWeight: 600 }}>{id.role}</span>
              </div>
            ))}
          </div>
        )}

        {/* Centered Horizontal Status Banner ABOVE canvas cleanly */}
        {(simState === 'breach' || simState === 'remediated') && (
          <div style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '650px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: simState === 'remediated' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${simState === 'remediated' ? '#22c55e' : '#ef4444'}`,
            borderRadius: '8px',
            backdropFilter: 'blur(16px)',
            boxShadow: simState === 'remediated' ? '0 0 25px rgba(34,197,94,0.3)' : '0 0 25px rgba(239,68,68,0.3)',
            zIndex: 40,
            padding: '0 24px',
          }}>
            {simState === 'breach' && (
              <span style={{ color: '#ef4444', fontWeight: 800, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pulse-dot-red" /> ⚠ BREACH DETECTED — INCIDENT RESPONSE ACTIVATED
              </span>
            )}
            {simState === 'remediated' && (
              <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pulse-dot-green" /> ✅ AI REMEDIATION TRIGGERED — THREAT CONTAINED
              </span>
            )}
          </div>
        )}

        {/* Top-Right Voice Narration Utility HUD */}
        <div style={{
          position: 'absolute',
          top: 24,
          right: 24,
          height: '44px',
          padding: '0 16px',
          background: 'rgba(7, 10, 22, 0.8)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${voiceState.isSpeaking ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: voiceState.isSpeaking 
            ? '0 0 15px rgba(59, 130, 246, 0.35), inset 0 0 10px rgba(59, 130, 246, 0.05)' 
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 35,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>AI NARRATOR</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: voiceState.isSpeaking ? '#60a5fa' : '#94a3b8', transition: 'color 0.3s' }}>
              {voiceState.isMuted ? 'MUTED' : (voiceState.isSpeaking ? 'SPEAKING' : 'READY')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px', width: '25px', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(barId => (
              <div
                key={barId}
                style={{
                  width: '2px',
                  height: voiceState.isSpeaking ? '100%' : '3px',
                  backgroundColor: '#22d3ee',
                  boxShadow: '0 0 4px #22d3ee',
                  borderRadius: '1px',
                  animation: voiceState.isSpeaking ? `voice-wave-bob 0.8s ease-in-out infinite alternate` : 'none',
                  animationDelay: `${barId * 0.15}s`,
                  transformOrigin: 'bottom',
                  transition: 'height 0.3s'
                }}
              />
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />

          <button
            onClick={() => voiceNarrator.toggleMute()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: voiceState.isMuted ? '#f87171' : '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            title={voiceState.isMuted ? "Unmute AI Narration" : "Mute AI Narration"}
          >
            {voiceState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Orbit hint */}
        <div style={{ position: 'absolute', bottom: 24, right: 24, fontSize: 15, color: '#1e3a5f', letterSpacing: 2, pointerEvents: 'none', fontWeight: 700 }}>
          DRAG TO ORBIT · SCROLL TO ZOOM
        </div>

        {/* Cinematic Replay Timeline */}
        <AttackReplayTimeline simState={simState} onReset={handleReset} />
      </div>

      {/* ── RIGHT PANEL (Fixed 420px Width, Enterprise SOC UI) ─────────────────────────────────── */}
      <div 
        className="custom-scrollbar"
        style={{
          flex: '0 0 420px', width: '420px', minWidth: '420px', display: 'flex', flexDirection: 'column', gap: 0,
          background: '#080b14', borderLeft: '1px solid rgba(255, 255, 255, 0.05)', overflowY: 'auto',
          height: '100%', paddingBottom: '120px',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)'
        }}
      >

        {/* Header */}
        <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,14,26,0.3)' }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3, color: '#3b82f6', marginBottom: 6 }}>SARATHI CYBERDEFENSE</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', letterSpacing: -0.5, marginBottom: 4 }}>Digital Twin Control</div>
          <div style={{ fontSize: 18, color: '#64748b', letterSpacing: 0.5 }}>Real-Time Infrastructure Threat Simulation</div>
        </div>

        {/* Layer Controls */}
        <div style={{ padding: '24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' }}>Layer Controls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: 'network',    icon: '🌐', label: 'Network Topology' },
              { key: 'assets',     icon: '💻', label: 'Assets & Infrastructure' },
              { key: 'identities', icon: '👤', label: 'Identities & Access Roles' },
              { key: 'vulns',      icon: '⚠️', label: 'Vulnerabilities (CVEs)' },
              { key: 'logs',       icon: '📊', label: 'Logs & Active Behavior' },
            ].map(({ key, icon, label }) => {
              const isActive = layers[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className={isActive ? 'soc-btn soc-btn-active' : 'soc-btn'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', borderRadius: 8, cursor: 'pointer', width: '100%', textAlign: 'left',
                    background: isActive ? 'rgba(59,130,246,0.18)' : 'rgba(17,24,39,0.4)',
                    border: isActive ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: 18, fontWeight: isActive ? 700 : 500,
                    boxShadow: isActive ? '0 0 15px rgba(59,130,246,0.2)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ flex: 1, letterSpacing: '0.5px' }}>{label}</span>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: isActive ? '#3b82f6' : '#1f2937',
                    boxShadow: isActive ? '0 0 8px #3b82f6' : 'none',
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Threat State */}
        <div style={{ padding: '24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' }}>Threat State</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'DEFCON', value: defcon, color: defconColor(), suffix: '' },
              { label: 'Active CVEs', value: activeCVEs, color: '#f97316', suffix: '' },
              { label: 'Compromised IDs', value: compromisedIds, color: compromisedIds > 0 ? '#ef4444' : '#22c55e', suffix: '' },
              { label: 'Anomalous Tx', value: anomalousTx, color: anomalousTx > 0 ? '#eab308' : '#22c55e', suffix: '' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(13, 17, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 15, color: '#64748b', fontWeight: 650, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ fontSize: 38, fontWeight: 700, color: item.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
                  {item.value}{item.suffix}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Liability Card */}
          <div style={{ marginTop: 14, background: 'rgba(13, 17, 23, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 17, color: '#64748b', fontWeight: 650, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Financial Liability</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: liability > 0 ? '#ef4444' : '#22c55e', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
              ${liability.toLocaleString()}
            </div>
            <div style={{ marginTop: 10, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, transition: 'width 0.2s',
                width: `${Math.min(100, (liability / 2300000) * 100)}%`,
                background: 'linear-gradient(90deg, #f97316, #ef4444)',
                boxShadow: liability > 0 ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
              }} />
            </div>
          </div>
        </div>

        {/* Attack Simulation */}
        <div style={{ padding: '24px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' }}>Attack Simulation</div>
          <select
            value={selectedScenario}
            onChange={e => setSelectedScenario(e.target.value)}
            style={{
              width: '100%', padding: '16px 20px', background: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8, color: '#e2e8f0', fontSize: 18, marginBottom: 14, outline: 'none',
              cursor: 'pointer',
            }}
          >
            {Object.entries(SCENARIOS).map(([key, sc]) => (
              <option key={key} value={key} style={{ background: '#0a0e1a', color: '#e2e8f0' }}>{sc.name}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSimulate}
              disabled={simState !== 'idle'}
              style={{
                flex: 1, padding: '16px 0', borderRadius: 8, fontWeight: 800, fontSize: 18, letterSpacing: 0.5,
                cursor: simState !== 'idle' ? 'not-allowed' : 'pointer',
                background: simState !== 'idle' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.85)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: simState !== 'idle' ? '#7f1d1d' : '#fff',
                transition: 'all 0.2s',
                boxShadow: simState !== 'idle' ? 'none' : '0 4px 12px rgba(239,68,68,0.25)',
              }}
            >
              ▶ SIMULATE ATTACK
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '16px 24px', borderRadius: 8, fontWeight: 700, fontSize: 18,
                cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8', transition: 'all 0.2s',
              }}
            >
              ⏹ RESET
            </button>
          </div>
          {simState === 'running' && (
            <div style={{ marginTop: 12, fontSize: 18, color: '#ef4444', textAlign: 'center', fontWeight: 800, letterSpacing: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="pulse-dot-red" /> ATTACK IN PROGRESS
            </div>
          )}
        </div>

        {/* Live Log Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
          <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,14,26,0.1)' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5, textTransform: 'uppercase' }}>Live Event Log</span>
            <span style={{ fontSize: 17, color: '#3b82f6', fontWeight: 800, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} /> STREAM
            </span>
          </div>
          <div className="custom-scrollbar" style={{ height: '360px', overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8, background: '#04060b' }}>
            {logLines.length === 0 && (
              <div style={{ fontSize: 16, color: '#475569', textAlign: 'center', marginTop: 32, fontFamily: "'JetBrains Mono', monospace" }}>
                [NO EVENT STREAM ACTIVE - ENABLE LOGS LAYER OR RUN SIMULATION]
              </div>
            )}
            {logLines.map((line, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                fontSize: 15,
                fontFamily: "'JetBrains Mono', monospace",
                background: i % 2 === 0 ? 'rgba(17, 24, 39, 0.65)' : 'rgba(8, 12, 24, 0.45)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                borderRadius: 6,
              }}>
                <span style={{ color: '#cbd5e1', flexShrink: 0, fontSize: 15 }}>{line.time}</span>
                {renderStatusBadge(line.type)}
                <span style={{ color: '#60a5fa', flexShrink: 0, fontWeight: 700, fontSize: 16 }}>
                  {line.src} <span style={{ color: '#64748b', fontWeight: 500 }}>→</span> {line.dst}
                </span>
                <span style={{ color: '#ffffff', fontSize: 15, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={line.msg}>
                  {line.msg}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CVE Detail popup */}
        {selectedCVE && CVES[selectedCVE] && (
          <div style={{
            position: 'absolute', bottom: 80, right: 20,
            background: '#0d1117', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 12, padding: 16, width: 240, zIndex: 50,
            boxShadow: '0 16px 48px rgba(0,0,0,0.9)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 800, color: '#ef4444', fontSize: 14 }}>{selectedCVE}</span>
              <button onClick={() => setSelectedCVE(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{CVES[selectedCVE].desc}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
              <span style={{ color: '#f97316' }}>CVSS {CVES[selectedCVE].cvss}</span>
              <span style={{ color: '#eab308' }}>EPSS {CVES[selectedCVE].epss}</span>
              <span style={{ color: CVES[selectedCVE].severity === 'CRITICAL' ? '#ef4444' : '#f97316', fontWeight: 700 }}>{CVES[selectedCVE].severity}</span>
              {CVES[selectedCVE].isKEV && <span style={{ color: '#ef4444', fontWeight: 900 }}>✦ KEV</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
