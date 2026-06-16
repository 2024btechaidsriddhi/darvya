import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Network, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ShieldAlert, 
  Sparkles, 
  Grid3X3,
  HelpCircle,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';
import GlassCard from './GlassCard';

interface Node {
  id: string;
  label: string;
  type: 'Account' | 'Proxy' | 'ATM' | 'IP';
  riskScore: number;
  // Standard Default coordinates
  x: number;
  y: number;
  // Shifted coordinates when in community layout
  commX: number;
  commY: number;
  community: number; // Cluster index
  isMuleRingSeed?: boolean;
}

interface Edge {
  source: string;
  target: string;
  amount: number;
  isSuspicious: boolean;
}

export default function NetworkAnalysis() {
  // Modes state
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const [communityView, setCommunityView] = useState<boolean>(false);
  const [highlightFraudRings, setHighlightFraudRings] = useState<boolean>(true);
  const [suspiciousClusters, setSuspiciousClusters] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [initialNodes, setInitialNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  React.useEffect(() => {
    import('../services/api').then(({ apiService }) => {
      apiService.getNetworkData().then(data => {
        // Map backend generic nodes to component Node format
        const mappedNodes = data.nodes.map((n: any, idx: number) => {
          const isSuspicious = n.is_suspicious || n.risk_score >= 80;
          return {
            id: n.id,
            label: `Account ${n.id}`,
            type: n.type || 'Account',
            riskScore: n.risk_score,
            x: 200 + (Math.cos(idx) * 200),
            y: 200 + (Math.sin(idx) * 200),
            commX: 200 + (Math.cos(idx) * 150),
            commY: 200 + (Math.sin(idx) * 150),
            community: isSuspicious ? 1 : 3,
            isMuleRingSeed: isSuspicious
          };
        });
        setInitialNodes(mappedNodes);
        
        const mappedEdges = data.edges.map((e: any) => ({
          source: e.source,
          target: e.target,
          amount: e.amount || 10000,
          isSuspicious: true
        }));
        setEdges(mappedEdges);
      });
    });
  }, []);

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only drag graph on general canvas click, not on elements
    if ((e.target as HTMLElement).tagName !== 'svg') return;
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  // Node helpers
  const getNodeColor = (node: Node) => {
    if (communityView) {
      // Color coded by Cluster Groups
      switch (node.community) {
        case 1: return '#3b82f6'; // Cluster Blue
        case 2: return '#e11d48'; // Cluster Rose
        default: return '#10b981'; // Cluster Green
      }
    }
    // Standard color code by individual risk score
    if (node.riskScore >= 85) return '#f43f5e'; // Crimson
    if (node.riskScore >= 65) return '#f97316'; // Orange
    if (node.riskScore >= 35) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const getNodeBorderColor = (node: Node) => {
    if (selectedNode?.id === node.id) return '#38bdf8'; // Active cyan outline
    return 'rgba(255, 255, 255, 0.15)';
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const step = 0.15;
      const newVal = direction === 'in' ? prev + step : prev - step;
      return Math.min(Math.max(newVal, 0.5), 2.5);
    });
  };

  const handleReset = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setCommunityView(false);
    setSuspiciousClusters(false);
    setHighlightFraudRings(true);
    setSelectedNode(null);
  };

  // Find node by ID
  const findNode = (id: string) => initialNodes.find(n => n.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left pane: Topology controller map */}
      <div className="lg:col-span-1 space-y-4">
        <GlassCard glowColor="indigo" className="h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-indigo-400" />
                Graph Visual Controls
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Render entity relationships linked by mutual transactions.
              </p>
            </div>

            {/* View selectors list */}
            <div className="space-y-3.5 border-t border-slate-900 pt-4">
              {/* Toggle 1: Community Detection */}
              <button 
                onClick={() => setCommunityView(!communityView)}
                className={`w-full p-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer
                  ${communityView 
                    ? 'bg-blue-950/20 border-blue-500/40 text-blue-300' 
                    : 'bg-slate-900/40 border-slate-900/60 text-slate-400 hover:border-slate-800'
                  }`}
                id="community-detection-btn"
              >
                <span className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" /> Community Partitioning
                </span>
                <span className={`w-2 h-2 rounded-full ${communityView ? 'bg-blue-500 shadow-sm shadow-blue-500' : 'bg-slate-700'}`} />
              </button>

              {/* Toggle 2: Fraud Rings Aura */}
              <button 
                onClick={() => setHighlightFraudRings(!highlightFraudRings)}
                className={`w-full p-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer
                  ${highlightFraudRings 
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' 
                    : 'bg-slate-900/40 border-slate-900/60 text-slate-400 hover:border-slate-800'
                  }`}
                id="fraud-rings-btn"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Highlight Fraud Rings
                </span>
                <span className={`w-2 h-2 rounded-full ${highlightFraudRings ? 'bg-rose-500 shadow-sm shadow-rose-500 animate-pulse' : 'bg-slate-700'}`} />
              </button>

              {/* Toggle 3: Suspicious cluster overlays */}
              <button 
                onClick={() => setSuspiciousClusters(!suspiciousClusters)}
                className={`w-full p-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center justify-between transition cursor-pointer
                  ${suspiciousClusters 
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-900/40 border-slate-900/60 text-slate-400 hover:border-slate-800'
                  }`}
                id="suspicious-clusters-btn"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Aggregated Clusters
                </span>
                <span className={`w-2 h-2 rounded-full ${suspiciousClusters ? 'bg-amber-500 shadow-sm shadow-amber-500' : 'bg-slate-700'}`} />
              </button>
            </div>

            {/* Quick legend */}
            <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg space-y-2 text-[10px] font-mono">
              <span className="text-slate-500 block uppercase font-bold mb-1">Graph Legend</span>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Mendoza Syndicate Seed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span>High Risk Associate</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Legitimate Business node</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 leading-relaxed font-mono mt-4 flex items-center gap-1.5 border-t border-slate-900 pt-3">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Pan via dragging dark canvas background. Double click individual node to focus profile.
          </div>
        </GlassCard>
      </div>

      {/* Main Interactive Vector Map Container */}
      <div className="lg:col-span-3 space-y-6">
        <div className="relative">
          <GlassCard glowColor="slate" className="p-0 overflow-hidden relative border-slate-800 bg-slate-950/80 h-[480px]">
            {/* Control buttons floating overhead */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button 
                onClick={() => handleZoom('in')}
                className="bg-slate-900/90 hover:bg-slate-900 text-slate-300 border border-slate-800 p-2 rounded-md hover:text-sky-400 transition cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleZoom('out')}
                className="bg-slate-900/90 hover:bg-slate-900 text-slate-300 border border-slate-800 p-2 rounded-md hover:text-sky-400 transition cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleReset}
                className="bg-slate-900/90 hover:bg-slate-900 text-slate-300 border border-slate-800 p-2 rounded-md hover:text-sky-400 transition cursor-pointer"
                title="Reset Viewport"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute top-4 right-4 z-20 bg-slate-950/80 border border-slate-900 px-3 py-1 font-mono text-[9px] text-slate-500 rounded-md">
              Zoom: {Math.round(zoom * 100)}% | Pan: X:{panX} Y:{panY}
            </div>

            {/* ACTUAL SVG VECTOR GRID CANVAS */}
            <svg
              id="graph-canvas-svg"
              width="100%"
              height="100%"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing w-full h-full select-none"
            >
              <defs>
                {/* Dots grids pattern background */}
                <pattern id="cyber-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="0.75" fill="rgba(56, 189, 248, 0.1)" />
                </pattern>
                
                {/* Arrow markers */}
                <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#cyber-grid)" pointerEvents="all" />

              {/* Viewport Transform Group */}
              <g transform={`translate(${200 + panX}, ${100 + panY}) scale(${zoom})`}>
                
                {/* Cluster/Boundary rings if suspicious clusters activated */}
                {suspiciousClusters && (
                  <>
                    {/* Ring 1 - Mendoza Moscow laundering group */}
                    <motion.circle 
                      initial={{ opacity: 0, r: 80 }}
                      animate={{ opacity: 0.1, r: 105 }}
                      transition={{ duration: 0.5 }}
                      cx={communityView ? 140 : 190}
                      cy={communityView ? 160 : 180}
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="5 4"
                    />
                    <text 
                      x={communityView ? 140 : 190} 
                      y={communityView ? 50 : 70} 
                      fill="#3b82f6" 
                      fontSize="9" 
                      fontFamily="monospace" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      CLUSTER ALPHA: RU MULE_LAYER
                    </text>

                    {/* Ring 2 - Sarah Jenkins smurf money */}
                    <motion.circle 
                      initial={{ opacity: 0, r: 80 }}
                      animate={{ opacity: 0.1, r: 95 }}
                      transition={{ duration: 0.5 }}
                      cx={communityView ? 440 : 410}
                      cy={communityView ? 170 : 170}
                      fill="transparent"
                      stroke="#e11d48"
                      strokeWidth="3"
                      strokeDasharray="5 4"
                    />
                    <text 
                      x={communityView ? 440 : 410} 
                      y={communityView ? 70 : 65} 
                      fill="#e11d48" 
                      fontSize="9" 
                      fontFamily="monospace" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      CLUSTER BETA: SEC_EMU_SMURF
                    </text>
                  </>
                )}

                {/* DRAW TRANSPARENT CONNECTING EDGES */}
                {edges.map((edge, index) => {
                  const srcNode = findNode(edge.source);
                  const tgtNode = findNode(edge.target);
                  if (!srcNode || !tgtNode) return null;

                  const x1 = communityView ? srcNode.commX : srcNode.x;
                  const y1 = communityView ? srcNode.commY : srcNode.y;
                  const x2 = communityView ? tgtNode.commX : tgtNode.x;
                  const y2 = communityView ? tgtNode.commY : tgtNode.y;

                  return (
                    <g key={`edge-${index}`}>
                      <motion.line
                        layout
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={edge.isSuspicious ? 'rgba(244, 63, 94, 0.4)' : '#334155'}
                        strokeWidth={edge.isSuspicious ? 2 : 1}
                        strokeDasharray={edge.isSuspicious ? "5 2" : "none"}
                        markerEnd="url(#arrow)"
                      />
                      
                      {/* Interactive little amount tag */}
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 4}
                        fill={edge.isSuspicious ? '#f43f5e' : '#64748b'}
                        fontSize="7"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        ${edge.amount >= 1000 ? `${(edge.amount / 1000).toFixed(0)}k` : edge.amount}
                      </text>
                    </g>
                  );
                })}

                {/* DRAW CYBER PULSE RING BACKINGS for flagged accounts */}
                {highlightFraudRings && initialNodes.map((node) => {
                  if (!node.isMuleRingSeed) return null;
                  const curX = communityView ? node.commX : node.x;
                  const curY = communityView ? node.commY : node.y;

                  return (
                    <circle
                      key={`glow-${node.id}`}
                      cx={curX}
                      cy={curY}
                      r="18"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                      fill="rgba(244, 63, 94, 0.15)"
                      stroke="#f43f5e"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* DRAW NODES */}
                {initialNodes.map((node) => {
                  const curX = communityView ? node.commX : node.x;
                  const curY = communityView ? node.commY : node.y;
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <motion.circle
                        layout
                        cx={curX}
                        cy={curY}
                        r={isSelected ? 10 : 8}
                        fill={getNodeColor(node)}
                        stroke={getNodeBorderColor(node)}
                        strokeWidth={isSelected ? 3 : 1.5}
                        whileHover={{ scale: 1.25 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      />
                      <motion.text
                        layout
                        x={curX}
                        y={curY + 18}
                        fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                        fontSize="8"
                        textAnchor="middle"
                        fontFamily="monospace"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                      >
                        {node.id}
                      </motion.text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </GlassCard>

          {/* Floating Details box below the node */}
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 z-20 p-4 bg-slate-950/95 border border-sky-500/30 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 backdrop-blur-md"
              id="selected-node-panel"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-sky-400 font-bold">
                    {selectedNode.id}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase
                    ${selectedNode.riskScore >= 85 ? 'text-rose-400 bg-rose-950/20 border border-rose-500/20' : 'text-emerald-400 bg-emerald-950/20 border border-emerald-500/20'}`}>
                    Risk Grade: {selectedNode.riskScore}%
                  </span>
                </div>
                <h5 className="font-sans font-bold text-slate-100 text-xs mt-1.5">
                  {selectedNode.label}
                </h5>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
                  Cluster Partition: Community #{selectedNode.community} ({selectedNode.type} layer)
                </span>
              </div>

              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded font-mono text-[10px] text-slate-400 cursor-pointer"
                >
                  Unfocus Node
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
