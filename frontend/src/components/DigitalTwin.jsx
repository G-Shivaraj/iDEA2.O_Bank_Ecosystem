import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  ShieldCheck, 
  Activity, 
  DollarSign, 
  Flame, 
  Terminal, 
  Layers
} from 'lucide-react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';

// Handcrafted banking assets representing the topological components
const NETWORK_ASSETS = {
  Asset_1: {
    id: 'Asset_1',
    name: 'External Web Gateway',
    type: 'DMZ Public Web Router',
    ip: '10.100.10.1',
    criticality: 5,
    cve: 'CVE-2026-1043',
    riskWeight: 200000, // monetary exposure
    x: 100,
    y: 200,
  },
  Asset_2: {
    id: 'Asset_2',
    name: 'IAM Auth Router',
    type: 'Core Identity Router',
    ip: '10.100.20.14',
    criticality: 8,
    cve: 'CVE-2026-2090',
    riskWeight: 450000,
    x: 280,
    y: 100,
  },
  Asset_3: {
    id: 'Asset_3',
    name: 'Internal App Host',
    type: 'Production Microservice Gateway',
    ip: '10.100.20.25',
    criticality: 6,
    cve: 'CVE-2026-1043',
    riskWeight: 300000,
    x: 280,
    y: 300,
  },
  Asset_4: {
    id: 'Asset_4',
    name: 'Core Database',
    type: 'Customer Vault Database Cluster',
    ip: '10.200.5.5',
    criticality: 9,
    cve: 'CVE-2026-3021',
    riskWeight: 800000,
    x: 480,
    y: 200,
  },
  Asset_5: {
    id: 'Asset_5',
    name: 'SWIFT Gateway',
    type: 'Interbank SWIFT Transaction Hub',
    ip: '10.300.99.1',
    criticality: 10,
    cve: 'CVE-2026-4012',
    riskWeight: 1500000,
    x: 680,
    y: 200,
  }
};

// Attack scenario steps mapping our simulation flow
const SIMULATION_SCENARIOS = {
  lateral_movement: {
    id: 'lateral_movement',
    name: 'Gateway to Database Intrusion',
    steps: [
      { node: 'Asset_1', state: 'ATTACK', log: 'IP 198.51.100.12 initiating HTTP RCE exploitation signature against Web Gateway.' },
      { node: 'Asset_1', state: 'COMPROMISED', log: 'Exploit successful. Interactive reverse shell established on Gateway (Port 443 -> 4444).' },
      { node: 'Asset_2', state: 'ATTACK', log: 'Pivoting from compromised Asset_1. Scanning Internal IAM Auth Router for T1110 vulnerability.' },
      { node: 'Asset_2', state: 'COMPROMISED', log: 'Admin credentials scraped from memory buffer. Privilege escalation complete on Auth Router.' },
      { node: 'Asset_4', state: 'ATTACK', log: 'Establishing SSH session to Database using hijacked credentials. Initial database dump triggered.' },
      { node: 'Asset_4', state: 'COMPROMISED', log: 'Database compromised. Exfiltrating customer vault entries via DNS tunneling channels.' }
    ]
  },
  swift_fraud: {
    id: 'swift_fraud',
    name: 'SWIFT Gateway Hijack Campaign',
    steps: [
      { node: 'Asset_3', state: 'ATTACK', log: 'Executing unauthorized process injects on internal App Host interface.' },
      { node: 'Asset_3', state: 'COMPROMISED', log: 'App Host compromised. Gaining operational access to persistent local scripts.' },
      { node: 'Asset_5', state: 'ATTACK', log: 'Bypassing intermediate host filters. Scanning Interbank SWIFT Gateway router.' },
      { node: 'Asset_5', state: 'COMPROMISED', log: 'SWIFT gateway ledger compromised. Falsified clearing transaction messages injected.' }
    ]
  },
  ransomware_spread: {
    id: 'ransomware_spread',
    name: 'Wormhole Network-wide Encryption',
    steps: [
      { node: 'Asset_3', state: 'ATTACK', log: 'Malicious payload staged on internal App Host.' },
      { node: 'Asset_3', state: 'COMPROMISED', log: 'Ransomware executing on Asset_3. Critical application services locked.' },
      { node: 'Asset_2', state: 'ATTACK', log: 'Spreading laterally via active SMB sessions to Identity Router.' },
      { node: 'Asset_2', state: 'COMPROMISED', log: 'Identity Router files encrypted. Core authentication token access halted.' },
      { node: 'Asset_4', state: 'ATTACK', log: 'Targeting Customer Vault Core Database partition.' },
      { node: 'Asset_4', state: 'COMPROMISED', log: 'Vault Database encrypted. SWIFT payments block and disaster recovery activated.' }
    ]
  }
};

export default function DigitalTwin() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('lateral_movement');
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // HUD Telemetry States
  const [nodeStates, setNodeStates] = useState({
    Asset_1: 'HEALTHY',
    Asset_2: 'HEALTHY',
    Asset_3: 'HEALTHY',
    Asset_4: 'HEALTHY',
    Asset_5: 'HEALTHY',
  });
  const [logs, setLogs] = useState(['[SYSTEM] Digital Twin monitoring system fully initialized.', '[SYSTEM] Real-time asset health ping is nominal.']);
  
  const playTimer = useRef(null);
  const fgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });

  // Handle container resizing
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 480
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 480
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync node threat states with steps
  const updateTopology = (stepIndex) => {
    const scenario = SIMULATION_SCENARIOS[selectedScenarioId];
    
    const newStates = {
      Asset_1: 'HEALTHY',
      Asset_2: 'HEALTHY',
      Asset_3: 'HEALTHY',
      Asset_4: 'HEALTHY',
      Asset_5: 'HEALTHY',
    };
    
    const newLogs = [
      `[SYSTEM] Scenario initialized: ${scenario.name}`,
      `[SYSTEM] Monitoring 5 cyber topological assets in Indian Banking Zone.`
    ];

    if (stepIndex >= 0) {
      for (let i = 0; i <= stepIndex; i++) {
        const step = scenario.steps[i];
        newStates[step.node] = step.state;
        newLogs.push(`[THREAT] ${step.log}`);
      }
    }

    setNodeStates(newStates);
    setLogs(newLogs);
  };

  useEffect(() => {
    updateTopology(currentStep);
  }, [currentStep, selectedScenarioId]);

  // Timeline simulation ticks
  useEffect(() => {
    if (isPlaying) {
      const scenario = SIMULATION_SCENARIOS[selectedScenarioId];
      playTimer.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < scenario.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2000);
    } else {
      clearInterval(playTimer.current);
    }

    return () => clearInterval(playTimer.current);
  }, [isPlaying, selectedScenarioId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    const scenario = SIMULATION_SCENARIOS[selectedScenarioId];
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep >= 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const handleScenarioChange = (e) => {
    setSelectedScenarioId(e.target.value);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // Telemetry metric aggregators
  const getCompromisedCount = () => {
    return Object.values(nodeStates).filter(s => s === 'COMPROMISED').length;
  };

  const getDefconLevel = () => {
    const compromised = getCompromisedCount();
    if (compromised === 0) return 5;
    if (compromised === 1) return 4;
    if (compromised === 2) return 3;
    if (compromised === 3) return 2;
    return 1;
  };

  const getFinancialRisk = () => {
    let risk = 0;
    Object.keys(nodeStates).forEach(assetId => {
      const state = nodeStates[assetId];
      if (state === 'COMPROMISED') {
        risk += NETWORK_ASSETS[assetId].riskWeight;
      } else if (state === 'ATTACK') {
        risk += NETWORK_ASSETS[assetId].riskWeight * 0.4;
      }
    });
    return risk;
  };

  // Define Links
  const links = [
    { from: 'Asset_1', to: 'Asset_2' },
    { from: 'Asset_1', to: 'Asset_3' },
    { from: 'Asset_2', to: 'Asset_4' },
    { from: 'Asset_3', to: 'Asset_4' },
    { from: 'Asset_4', to: 'Asset_5' },
    { from: 'Asset_2', to: 'Asset_5' },
  ];

  // Format 3D graph data
  const graphData = {
    nodes: Object.values(NETWORK_ASSETS).map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      ip: asset.ip,
      criticality: asset.criticality,
      cve: asset.cve,
      riskWeight: asset.riskWeight,
      // Map 2D coords to a beautiful 3D coordinates system
      x: (asset.x - 400) * 0.35,
      y: (asset.y - 200) * -0.35,
      z: 0,
      fx: (asset.x - 400) * 0.35,
      fy: (asset.y - 200) * -0.35,
      fz: 0
    })),
    links: links.map(link => ({
      source: link.from,
      target: link.to
    }))
  };

  // WebGL 3D custom node models with pulsing threat states
  const nodeThreeObject = (node) => {
    const state = nodeStates[node.id];
    let color = 0x10b981; // HEALTHY = Green
    let size = 9;
    
    if (state === 'VULNERABLE') {
      color = 0xeab308; // Yellow
      size = 11;
    } else if (state === 'ATTACK') {
      color = 0xf97316; // Orange pulse
      size = 13;
    } else if (state === 'COMPROMISED') {
      color = 0xef4444; // Red pulse
      size = 14;
    }

    const group = new THREE.Group();

    // Core Solid Node
    const sphereGeom = new THREE.SphereGeometry(size * 0.65, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(sphereGeom, sphereMat);
    group.add(coreMesh);

    // Glowing Wireframe Outer Shield
    const outerGeom = new THREE.SphereGeometry(size, 16, 16);
    const outerMat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const outerMesh = new THREE.Mesh(outerGeom, outerMat);
    group.add(outerMesh);

    // Bind anim reference keys
    group.__coreMesh = coreMesh;
    group.__outerMesh = outerMesh;
    group.__state = state;
    group.__baseSize = size;

    return group;
  };

  // WebGL scene animations (grid helpers, camera rotations, pulsing meshes)
  useEffect(() => {
    if (!fgRef.current) return;
    
    const controls = fgRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.45; // Subtle cinematics rotation
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }

    const scene = fgRef.current.scene();
    
    // Clear old grids to avoid duplication on state changes
    const oldGrids = scene.children.filter(c => c.isGridHelper || c.name === 'holographic-grid');
    oldGrids.forEach(g => scene.remove(g));

    // holographic neon cyber-grid floor
    const gridHelper = new THREE.GridHelper(300, 30, 0x06b6d4, 0x1f2937);
    gridHelper.position.y = -50;
    gridHelper.name = 'holographic-grid';
    if (gridHelper.material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.35;
    }
    scene.add(gridHelper);

    // Dynamic anim loop for scaling threat nodes
    let animId;
    const tick = () => {
      const time = Date.now() * 0.003;
      
      scene.traverse(obj => {
        if (obj.__coreMesh && obj.__outerMesh) {
          const state = obj.__state;
          
          if (state === 'ATTACK') {
            const pulse = 1 + Math.sin(time * 3.5) * 0.2;
            obj.__outerMesh.scale.set(pulse, pulse, pulse);
            obj.__coreMesh.scale.set(1 + Math.sin(time * 3.5) * 0.08, 1 + Math.sin(time * 3.5) * 0.08, 1 + Math.sin(time * 3.5) * 0.08);
          } else if (state === 'COMPROMISED') {
            const pulse = 1.15 + Math.sin(time * 5) * 0.3;
            obj.__outerMesh.scale.set(pulse, pulse, pulse);
            // Spin outer shield of compromised nodes
            obj.__outerMesh.rotation.y += 0.025;
            obj.__outerMesh.rotation.x += 0.015;
          } else {
            obj.__outerMesh.scale.set(1, 1, 1);
            obj.__coreMesh.scale.set(1, 1, 1);
          }
        }
      });

      if (controls && controls.update) {
        controls.update();
      }

      animId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, [nodeStates]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[92rem] mx-auto pb-10 px-4">
      {/* Header Banner */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Cpu className="text-emerald-400 font-bold" size={32} />
            Cyber Digital Twin Virtualization
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time interactive WebGL 3D network topology model & multi-stage attack path propagation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Interactive 3D Force Graph */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            {/* Holographic grid visual watermark background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.2px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

            {/* ForceGraph3D Container */}
            <div 
              ref={containerRef}
              className="relative w-full aspect-[8/4.5] min-h-[480px] bg-slate-950/80 rounded-xl border border-slate-900 overflow-hidden shadow-inner flex items-center justify-center"
            >
              {dimensions.width > 0 && (
                <ForceGraph3D
                  ref={fgRef}
                  graphData={graphData}
                  width={dimensions.width}
                  height={dimensions.height}
                  backgroundColor="rgba(0,0,0,0)"
                  showNavInfo={false}
                  nodeThreeObject={nodeThreeObject}
                  nodeLabel={node => `
                    <div style="
                      background: rgba(3, 7, 18, 0.95);
                      border: 1px solid rgba(51, 65, 85, 0.7);
                      padding: 14px;
                      border-radius: 12px;
                      font-family: monospace;
                      font-size: 11px;
                      color: #cbd5e1;
                      width: 260px;
                      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.7);
                    ">
                      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
                        <strong style="color: #ffffff; text-transform: uppercase;">${node.name}</strong>
                        <span style="font-size: 9px; color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.3); padding: 2px 6px; border-radius: 4px;">${node.id}</span>
                      </div>
                      <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 6px 4px;">
                        <span style="color: #64748b;">IP Address:</span> <span style="color: #22d3ee; font-weight: bold;">${node.ip}</span>
                        <span style="color: #64748b;">Host Type:</span> <span style="color: #e2e8f0;">${node.type}</span>
                        <span style="color: #64748b;">Asset SLA:</span> <span style="color: #e2e8f0; font-weight: bold;">DEFCON ${node.criticality}</span>
                        <span style="color: #64748b;">Vulnerability:</span> <span style="color: #ef4444; font-weight: bold;">${node.cve}</span>
                        <span style="color: #64748b;">Exposure Index:</span> <span style="color: #fbbf24; font-weight: bold;">$${node.riskWeight.toLocaleString()}</span>
                        <span style="color: #64748b;">Threat State:</span> <strong style="color: ${
                          nodeStates[node.id] === 'COMPROMISED' ? '#ef4444' :
                          nodeStates[node.id] === 'ATTACK' ? '#f97316' : '#10b981'
                        }; text-transform: uppercase; animation: pulse 1.5s infinite;">${nodeStates[node.id]}</strong>
                      </div>
                    </div>
                  `}
                  onNodeClick={(node) => setHoveredNode(node)}
                  linkColor={link => {
                    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                    
                    const isUnderIntrusion = 
                      (nodeStates[srcId] === 'COMPROMISED' && nodeStates[tgtId] === 'ATTACK') ||
                      (nodeStates[srcId] === 'COMPROMISED' && nodeStates[tgtId] === 'COMPROMISED');
                      
                    return isUnderIntrusion ? '#ef4444' : '#1e293b';
                  }}
                  linkWidth={link => {
                    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                    
                    const isUnderIntrusion = 
                      (nodeStates[srcId] === 'COMPROMISED' && nodeStates[tgtId] === 'ATTACK') ||
                      (nodeStates[srcId] === 'COMPROMISED' && nodeStates[tgtId] === 'COMPROMISED');
                      
                    return isUnderIntrusion ? 4.0 : 1.2;
                  }}
                  // flowing red particles for compromised attack vector hops
                  linkDirectionalParticles={link => {
                    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
                    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
                    
                    const isUnderIntrusion = 
                      (nodeStates[srcId] === 'COMPROMISED' && nodeStates[tgtId] === 'ATTACK') ||
                      (nodeStates[srcId] === 'COMPROMISED' && nodeStates[tgtId] === 'COMPROMISED');
                      
                    return isUnderIntrusion ? 6 : 0;
                  }}
                  linkDirectionalParticleWidth={4.5}
                  linkDirectionalParticleSpeed={0.02}
                  linkDirectionalParticleColor={() => '#ef4444'}
                  controlType="orbit"
                />
              )}

              {/* Node Detailed Overlay HUD (Float Card) */}
              <AnimatePresence>
                {hoveredNode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-5 left-5 bg-slate-950/95 backdrop-blur-md border border-slate-750 p-5 rounded-2xl shadow-2xl flex flex-col gap-3 font-mono text-xs w-80 text-slate-350 z-20"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="font-extrabold text-white text-[13px] uppercase tracking-wide">{hoveredNode.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-[10px]">
                        {hoveredNode.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                      <div className="text-slate-500">Asset Type:</div>
                      <div className="text-slate-200 truncate font-semibold">{hoveredNode.type}</div>
                      <div className="text-slate-500">IP Host:</div>
                      <div className="text-cyan-400 font-bold">{hoveredNode.ip}</div>
                      <div className="text-slate-500">Node SLA:</div>
                      <div className="text-slate-200 font-medium">DEFCON {NETWORK_ASSETS[hoveredNode.id].criticality}</div>
                      <div className="text-slate-500">CVE Map:</div>
                      <div className="text-slate-200 font-bold">{hoveredNode.cve}</div>
                      <div className="text-slate-500">Max Risk:</div>
                      <div className="text-rose-400 font-bold">${hoveredNode.riskWeight.toLocaleString()}</div>
                      <div className="text-slate-500">State:</div>
                      <div className={`font-black uppercase ${
                        nodeStates[hoveredNode.id] === 'COMPROMISED' ? 'text-red-400 animate-pulse' :
                        nodeStates[hoveredNode.id] === 'ATTACK' ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {nodeStates[hoveredNode.id]}
                      </div>
                    </div>
                    <button 
                      onClick={() => setHoveredNode(null)}
                      className="mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase rounded border border-slate-800 transition-all text-[10px]"
                    >
                      Dismiss HUD
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions float overlay */}
              <div className="absolute right-4 bottom-4 bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-lg text-[10px] font-mono text-slate-500 select-none pointer-events-none">
                DRAG ORBIT CAMERA • SCROLL TO ZOOM
              </div>
            </div>

            {/* Timeline Controls Widget */}
            <div className="bg-slate-950 p-5 border border-slate-900 rounded-xl flex flex-wrap gap-5 items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <select
                  value={selectedScenarioId}
                  onChange={handleScenarioChange}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-slate-300 focus:outline-none focus:border-cyan-500 transition-all font-mono"
                >
                  <option value="lateral_movement">DMZ Database Exploit</option>
                  <option value="swift_fraud">SWIFT Gateway Hijack</option>
                  <option value="ransomware_spread">AD Ransomware Spread</option>
                </select>
                
                <div className="flex gap-2 bg-slate-900 p-1.5 border border-slate-850 rounded-lg">
                  <button
                    onClick={handleStepBackward}
                    disabled={currentStep < 0}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:text-slate-700 transition-all"
                  >
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded transition-all flex items-center justify-center"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={handleStepForward}
                    disabled={currentStep >= SIMULATION_SCENARIOS[selectedScenarioId].steps.length - 1}
                    className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:text-slate-700 transition-all"
                  >
                    <SkipForward size={16} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-850 hover:text-white rounded transition-all font-mono border border-slate-800 uppercase"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Progress Stepper indicators */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-500">STAGE PROGRESS:</span>
                <div className="flex gap-1.5">
                  {SIMULATION_SCENARIOS[selectedScenarioId].steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded border transition-all duration-300 font-mono text-[10px] flex items-center justify-center font-bold ${
                        idx <= currentStep
                          ? 'bg-rose-500 border-rose-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.45)]'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: HUD Telemetry Gauges */}
        <div className="xl:col-span-4 flex flex-col gap-6 justify-between">
          {/* DEFCON threat widget */}
          <div className="bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 shadow-2xl flex items-center gap-5 relative overflow-hidden flex-1">
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
              getDefconLevel() === 5 ? 'bg-green-500' :
              getDefconLevel() === 4 ? 'bg-blue-500' :
              getDefconLevel() === 3 ? 'bg-amber-500' :
              getDefconLevel() === 2 ? 'bg-orange-500' : 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]'
            }`}></div>

            <div className="flex-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold block">Top-Level Threat State</span>
              <span className="text-4xl lg:text-5xl font-black font-mono tracking-tight text-white block mt-2">
                DEFCON {getDefconLevel()}
              </span>
              <span className="text-xs text-slate-350 font-mono mt-3.5 block leading-relaxed">
                {getDefconLevel() === 5 ? '✓ Operation Nominal. Core intact.' :
                 getDefconLevel() === 4 ? '⚠ Warning: External boundary probing.' :
                 getDefconLevel() === 3 ? '⚡ Active Intrusion in DMZ Network.' :
                 getDefconLevel() === 2 ? '💥 High Threat: Internal zone bypassed.' :
                 '☠ CRITICAL CORE BREACH. SHUTDOWN INITIATED.'}
              </span>
            </div>

            <div className={`p-4.5 rounded-2xl bg-slate-950 border ${
              getDefconLevel() === 1 ? 'border-red-500/30 text-red-500 animate-bounce' : 'border-slate-850 text-slate-400'
            }`}>
              {getDefconLevel() === 1 ? <Flame size={32} /> : <ShieldCheck size={32} className="text-emerald-400" />}
            </div>
          </div>

          {/* Monetary Risk Exposure Widget */}
          <div className="bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 shadow-2xl flex flex-col gap-3.5 flex-1">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                <DollarSign size={12} className="text-rose-500" />
                Financial Liability Score
              </span>
              <h3 className="text-3xl lg:text-4xl font-black font-mono text-white mt-2">
                ${getFinancialRisk().toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Real-time transaction vault exposure index
              </p>
            </div>

            {/* ProgressBar */}
            <div className="h-3 bg-slate-900 border border-slate-950 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-rose-500 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                style={{ width: `${Math.min(100, (getFinancialRisk() / 2500000) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Activity Meter Grid */}
          <div className="bg-[#0f172a]/95 backdrop-blur border border-slate-750 rounded-2xl p-7 shadow-2xl flex flex-col gap-3 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
              <Activity size={12} className="text-cyan-400" />
              Sensor Traffic Wave
            </span>
            
            <div className="h-20 w-full bg-slate-950 rounded-lg border border-slate-900 overflow-hidden flex items-end">
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full text-cyan-500/25">
                <path 
                  d={`M0 ${15 + Math.sin(Date.now() / 1000) * 5} Q 25 ${isPlaying ? 5 : 15}, 50 ${isPlaying ? 25 : 15} T 100 ${15 + Math.cos(Date.now() / 1000) * 5}`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={1}
                />
                <path 
                  d={`M0 15 Q 25 ${isPlaying ? 25 : 15}, 50 ${isPlaying ? 5 : 15} T 100 15`} 
                  fill="none" 
                  stroke="rgba(6,182,212,0.6)" 
                  strokeWidth={1.5}
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Console Log streaming HUD */}
          <div className="bg-slate-950 border border-slate-750 rounded-2xl overflow-hidden flex flex-col h-[280px]">
            <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-850 flex justify-between items-center font-mono">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={12} className="text-cyan-400" />
                Live Intrusion Stream
              </span>
              <span className="text-[10px] text-slate-600">HUD_LOG</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-350 flex flex-col gap-2.5 custom-scrollbar">
              {logs.map((log, idx) => (
                <div key={idx} className={`border-l-2 pl-2 ${
                  log.includes('[THREAT]') ? 'border-red-500 text-rose-300' :
                  log.includes('[SYSTEM]') ? 'border-cyan-500 text-cyan-400' : 'border-slate-800 text-slate-500'
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
