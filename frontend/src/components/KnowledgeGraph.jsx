import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RefreshCw, X, ChevronRight, Zap, Target, BookOpen, AlertTriangle } from 'lucide-react';
import client, { graphApi } from '../api/client';

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const fgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAttackPaths, setShowAttackPaths] = useState(false);
  const [attackPathNodes, setAttackPathNodes] = useState(new Set());
  const [attackPathLinks, setAttackPathLinks] = useState(new Set());
  const [attackPathData, setAttackPathData] = useState(null);

  // Hover states for active neighbor hover highlighting
  const [hoveredNode, setHoveredNodeState] = useState(null);
  const [hoveredNeighbors, setHoveredNeighbors] = useState(new Set());
  const [hoveredLinks, setHoveredLinks] = useState(new Set());
  const [hoveredLink, setHoveredLink] = useState(null);

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex || !hex.startsWith('#')) return `rgba(255, 255, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getRelationshipColor = (type) => {
    const rType = (type || '').toUpperCase();
    if (rType.includes('CONNECTS_TO') || rType.includes('CONNECTS')) return '#3b82f6';
    if (rType.includes('EXPLOITED_BY') || rType.includes('EXPLOIT')) return '#ef4444';
    if (rType.includes('USED_BY') || rType.includes('USED') || rType.includes('USES')) return '#a855f7';
    if (rType.includes('AFFECTS') || rType.includes('AFFECT')) return '#f97316';
    return '#64748b';
  };

  const handleNodeHover = (node) => {
    setHoveredNodeState(node);
    const neighbors = new Set();
    const links = new Set();
    if (node) {
      graphData.links.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        if (s === node.id) {
          neighbors.add(t);
          links.add(l);
        } else if (t === node.id) {
          neighbors.add(s);
          links.add(l);
        }
      });
    }
    setHoveredNeighbors(neighbors);
    setHoveredLinks(links);
  };

  const handleLinkHover = (link) => {
    setHoveredLink(link);
    if (link) {
      const neighbors = new Set();
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      neighbors.add(s);
      neighbors.add(t);
      setHoveredNeighbors(neighbors);
      setHoveredLinks(new Set([link]));
    } else if (!hoveredNode) {
      setHoveredNeighbors(new Set());
      setHoveredLinks(new Set());
    }
  };

  const fetchGraph = () => {
    setLoading(true);
    setSelectedNode(null);
    Promise.all([graphApi.getNodes(), graphApi.getLinks()])
      .then(([nodes, links]) => {
        setGraphData({ nodes, links });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Graph fetch failed:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGraph();
    
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 500
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 500
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch and calculate attack path nodes and links when toggled
  useEffect(() => {
    if (showAttackPaths) {
      graphApi.getAttackPaths('Asset_1', 'Asset_4')
        .then(paths => {
          if (paths && paths.length > 0) {
            setAttackPathData(paths[0]); // Take top ranked path
            const nodesInPath = new Set(paths[0].path_nodes);
            setAttackPathNodes(nodesInPath);

            // Construct link lookup sets for the path
            const linksInPath = new Set();
            for (let i = 0; i < paths[0].path_nodes.length - 1; i++) {
              const src = paths[0].path_nodes[i];
              const tgt = paths[0].path_nodes[i+1];
              linksInPath.add(`${src}->${tgt}`);
              linksInPath.add(`${tgt}->${src}`); // Support undirected matching
            }
            setAttackPathLinks(linksInPath);
          }
        })
        .catch(err => console.error("Error fetching attack paths:", err));
    } else {
      setAttackPathNodes(new Set());
      setAttackPathLinks(new Set());
      setAttackPathData(null);
    }
  }, [showAttackPaths]);

  // Adjust simulation forces to repel nodes and avoid overlaps
  useEffect(() => {
    if (fgRef.current) {
      const chargeForce = fgRef.current.d3Force('charge');
      if (chargeForce) chargeForce.strength(-300);
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce) linkForce.distance(140);
      fgRef.current.d3ReheatSimulation();
    }
  }, [graphData, loading]);

  const getNodeColor = (node) => {
    if (attackPathNodes.has(node.id)) {
      return '#f59e0b'; // Gold highlight for nodes in active attack path
    }
    
    switch (node.label) {
      case 'Asset':
        return '#3b82f6'; // Glowing Cyan/Blue
      case 'Vulnerability':
      case 'CVE':
        return '#ef4444'; // Cyber Red
      case 'Technique':
        return '#818cf8'; // Neon Purple/Blue
      case 'ThreatActor':
        return '#f97316'; // Safety Orange
      default:
        return '#a855f7'; // Purple fallback
    }
  };

  const getNodeSize = (node) => {
    let base = 8;
    if (node.label === 'Asset') {
      const crit = node.properties?.criticality || 5;
      base = 8 + crit;
    } else if (node.label === 'Vulnerability' || node.label === 'CVE') {
      const cvss = node.properties?.cvssScore || node.properties?.cvss_score || 5;
      base = 7 + cvss;
    }
    return attackPathNodes.has(node.id) ? base * 1.3 : base;
  };

  return (
    <div className="flex h-[82vh] w-full max-w-[92rem] mx-auto bg-[#0f172a]/20 border border-slate-800/80 rounded-xl overflow-hidden relative shadow-2xl" ref={containerRef}>
      {/* Sidebar / Overlay UI Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-[#0f172a]/90 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col max-w-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Cyber Intelligence Graph</h2>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Map of host routers, active CVE configurations, and MITRE ATT&amp;CK lateral techniques.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button 
              onClick={() => setShowAttackPaths(!showAttackPaths)}
              className={`px-3 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                showAttackPaths 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Zap size={14} className={showAttackPaths ? 'animate-pulse text-amber-400' : ''} />
              {showAttackPaths ? "Hide Lateral Path" : "Show Attack Paths"}
            </button>

            <button 
              onClick={fetchGraph}
              className="px-3 py-2 bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Sync DB Nodes
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-[#0f172a]/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-[10px] flex flex-col gap-2 pointer-events-none shadow-lg">
          <span className="font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-1.5 mb-0.5">LEGEND</span>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            <span className="text-slate-300">ASSETS (Hosts / Infrastructure)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-slate-300">VULNERABILITIES (CVEs)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <span className="text-slate-300">MITRE TECHNIQUES</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">THREAT ACTORS</span>
          </div>
          {showAttackPaths && (
            <div className="flex items-center gap-2.5 mt-1 pt-1.5 border-t border-slate-800/60">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
              <span className="text-amber-400 font-bold">LATERAL ATTACK PATH</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 tracking-widest font-mono uppercase animate-pulse">Synchronizing graph clusters from Neo4j...</span>
        </div>
      ) : (
        <div className="flex-1 relative bg-[#020617]/50 h-full">
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            nodeColor={getNodeColor}
            nodeVal={getNodeSize}
            linkLabel={link => link.type}
            linkDirectionalArrowLength={link => {
              const srcId = typeof link.source === 'object' ? link.source.id : link.source;
              const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
              return (showAttackPaths && attackPathLinks.has(`${srcId}->${tgtId}`)) ? 7 : 4;
            }}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.15}
            onNodeHover={handleNodeHover}
            onLinkHover={handleLinkHover}
            // Animate 5 moving gold particles down active attack path links
            linkDirectionalParticles={link => {
              const srcId = typeof link.source === 'object' ? link.source.id : link.source;
              const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
              return (showAttackPaths && attackPathLinks.has(`${srcId}->${tgtId}`)) ? 5 : 0;
            }}
            linkDirectionalParticleSpeed={0.015}
            linkDirectionalParticleWidth={3.5}
            linkDirectionalParticleColor={() => '#fbbf24'}
            linkColor={link => {
              const srcId = typeof link.source === 'object' ? link.source.id : link.source;
              const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
              const isAttackPath = showAttackPaths && attackPathLinks.has(`${srcId}->${tgtId}`);

              if (hoveredNode) {
                const isConnected = srcId === hoveredNode.id || tgtId === hoveredNode.id;
                if (!isConnected) {
                  return 'rgba(255, 255, 255, 0.02)';
                }
                return isAttackPath ? '#f59e0b' : getRelationshipColor(link.type);
              }

              if (hoveredLink) {
                const isCurrentLink = link === hoveredLink;
                if (!isCurrentLink) {
                  return 'rgba(255, 255, 255, 0.02)';
                }
                return isAttackPath ? '#f59e0b' : getRelationshipColor(link.type);
              }

              if (isAttackPath) {
                return 'rgba(245, 158, 11, 0.95)';
              }
              const baseColor = getRelationshipColor(link.type);
              return baseColor === '#64748b' ? 'rgba(100, 116, 139, 0.35)' : `${baseColor}88`;
            }}
            linkWidth={link => {
              const srcId = typeof link.source === 'object' ? link.source.id : link.source;
              const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
              const isAttackPath = showAttackPaths && attackPathLinks.has(`${srcId}->${tgtId}`);
              
              if (hoveredNode) {
                const isConnected = srcId === hoveredNode.id || tgtId === hoveredNode.id;
                return isConnected ? (isAttackPath ? 4.5 : 3.0) : 0.5;
              }
              if (hoveredLink) {
                return link === hoveredLink ? 4.0 : 0.5;
              }
              return isAttackPath ? 3.5 : 1.2;
            }}
            onNodeClick={(node) => {
              setSelectedNode(node);
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name || node.id;
              const fontSize = 13 / globalScale;
              ctx.font = `bold ${fontSize}px 'Outfit', sans-serif`;
              
              const size = getNodeSize(node);
              const isHovered = hoveredNode && node.id === hoveredNode.id;
              const isNeighbor = hoveredNode && hoveredNeighbors.has(node.id);
              const hasHover = hoveredNode !== null;
              
              // Dim unconnected clusters under hover
              let opacity = 1.0;
              if (hasHover && !isHovered && !isNeighbor) {
                opacity = 0.15;
              }

              // Draw node selection/hover border glow shadow
              if (isHovered || (selectedNode && node.id === selectedNode.id)) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = isHovered ? 'rgba(34, 211, 238, 0.25)' : 'rgba(59, 130, 246, 0.25)';
                ctx.fill();
              }
              
              // Base filled node with opacity
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
              ctx.fillStyle = hexToRgba(getNodeColor(node), opacity);
              ctx.fill();
              
              // Draw pulsing rings around path nodes
              if (attackPathNodes.has(node.id)) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false);
                ctx.strokeStyle = hexToRgba('#f59e0b', opacity * 0.7);
                ctx.lineWidth = 2.5;
                ctx.stroke();
              } else if (node.label === 'Asset') {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI, false);
                ctx.strokeStyle = hexToRgba('#3b82f6', opacity * 0.4);
                ctx.lineWidth = 1.5;
                ctx.stroke();
              }

              // Node text label with high contrast dark card backing
              if (globalScale > 0.6) {
                const textWidth = ctx.measureText(label).width;
                const padX = 8 / globalScale;
                const padY = 5 / globalScale;
                const rectW = textWidth + padX * 2;
                const rectH = fontSize + padY * 2;
                const rectX = node.x - rectW / 2;
                const rectY = node.y - size - rectH - (5 / globalScale);
                
                const radius = 4 / globalScale;
                ctx.beginPath();
                ctx.moveTo(rectX + radius, rectY);
                ctx.lineTo(rectX + rectW - radius, rectY);
                ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
                ctx.lineTo(rectX + rectW, rectY + rectH - radius);
                ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
                ctx.lineTo(rectX + radius, rectY + rectH);
                ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
                ctx.lineTo(rectX, rectY + radius);
                ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
                ctx.closePath();
                
                // Dark background card
                ctx.fillStyle = `rgba(15, 23, 42, ${opacity * 0.95})`;
                ctx.fill();
                
                // Border glow on label
                ctx.strokeStyle = isHovered 
                  ? `rgba(34, 211, 238, ${opacity * 0.8})` 
                  : (selectedNode && node.id === selectedNode.id)
                    ? `rgba(59, 130, 246, ${opacity * 0.8})`
                    : `rgba(51, 65, 85, ${opacity * 0.45})`;
                ctx.lineWidth = isHovered || (selectedNode && node.id === selectedNode.id) ? 1.5 / globalScale : 1.0 / globalScale;
                ctx.stroke();
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Color code text font inside label
                if (attackPathNodes.has(node.id)) {
                  ctx.fillStyle = hexToRgba('#fbbf24', opacity);
                } else if (node.label === 'Vulnerability' || node.label === 'CVE') {
                  ctx.fillStyle = hexToRgba('#fca5a5', opacity);
                } else {
                  ctx.fillStyle = hexToRgba('#e2e8f0', opacity);
                }
                
                ctx.fillText(label, node.x, rectY + rectH / 2);
              }
            }}
          />
        </div>
      )}

      {/* Slide-out details drawer panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-20 flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedNode.label === 'Asset' ? 'bg-blue-500' :
                  selectedNode.label === 'Vulnerability' || selectedNode.label === 'CVE' ? 'bg-red-500' : 'bg-indigo-400'
                }`}></div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
                  {selectedNode.label} Profile
                </span>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 hover:bg-slate-800/80 rounded transition-all text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {selectedNode.properties?.name || selectedNode.name || selectedNode.id}
                </h3>
                <span className="text-xs font-mono text-slate-500 mt-1 block">ID: {selectedNode.id}</span>
              </div>

              {/* Conditional Rendering by Node Label */}
              {selectedNode.label === 'Asset' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3.5 bg-slate-900/40 p-3.5 rounded-lg border border-slate-900">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">Criticality</span>
                      <span className="text-base font-extrabold text-cyan-400 font-mono">
                        {selectedNode.properties?.criticality || '5'} / 10
                      </span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">Exposure</span>
                      <span className="text-base font-extrabold text-slate-300 font-mono capitalize">
                        {selectedNode.properties?.exposure || 'Internal'}
                      </span>
                    </div>
                    <div className="col-span-2 pt-2.5 border-t border-slate-800/40">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">Role Type</span>
                      <span className="text-sm font-semibold text-slate-300 capitalize">
                        {selectedNode.properties?.type || 'Host'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Network Placement</span>
                    <div className="text-sm text-slate-400 flex flex-col gap-2 font-mono bg-slate-900/20 p-3.5 rounded border border-slate-900">
                      <div>Environment: <span className="text-slate-200">{selectedNode.properties?.environment || 'Production'}</span></div>
                      <div>System Owner: <span className="text-slate-200">{selectedNode.properties?.owner || 'SOC Ops Team'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {(selectedNode.label === 'Vulnerability' || selectedNode.label === 'CVE') && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/40 p-3.5 rounded-lg border border-slate-900">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">CVSS Score</span>
                      <span className="text-base font-extrabold text-red-400 font-mono">
                        {selectedNode.properties?.cvssScore || selectedNode.properties?.cvss_score || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">EPSS Probability</span>
                      <span className="text-base font-extrabold text-amber-500 font-mono">
                        {selectedNode.properties?.epssScore ? `${(selectedNode.properties.epssScore * 100).toFixed(2)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-2 pt-2.5 border-t border-slate-800/40">
                      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">KEV Active Exploit</span>
                      <span className={`text-sm font-bold font-mono ${
                        selectedNode.properties?.isKEV || selectedNode.properties?.is_kev ? 'text-red-500 animate-pulse' : 'text-slate-400'
                      }`}>
                        {selectedNode.properties?.isKEV || selectedNode.properties?.is_kev ? '⚠️ KNOWN EXPLOITED' : 'None Mapped'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Vulnerability Abstract</span>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/20 p-3.5 rounded border border-slate-900 font-serif">
                      {selectedNode.properties?.description || 'No description summary available.'}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.label === 'Technique' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/40 p-3.5 rounded-lg border border-slate-900 flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Tactic Classification</span>
                    <span className="text-sm font-bold text-indigo-400 capitalize">
                      {selectedNode.properties?.tactic || 'Execution'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">MITRE Description</span>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/20 p-3.5 rounded border border-slate-900">
                      {selectedNode.properties?.description || 'No details available.'}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedNode.label === 'ThreatActor' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/40 p-3.5 rounded-lg border border-slate-900 flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold font-mono">Origin Segment</span>
                    <span className="text-sm font-bold text-orange-400 font-mono">
                      {selectedNode.properties?.origin || 'Unknown'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Actor Dossier</span>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/20 p-3.5 rounded border border-slate-900 font-mono">
                      {selectedNode.properties?.description || 'No threat intelligence profile has been generated.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex flex-col">
              <button 
                onClick={() => setSelectedNode(null)}
                className="py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
