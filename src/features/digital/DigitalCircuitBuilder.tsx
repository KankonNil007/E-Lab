import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, RotateCcw, Info } from 'lucide-react';
import { evaluateGate, type GateType } from '../../lib/simulation/digital/gates';

export interface CircuitNode {
  id: string;
  type: 'input' | 'output' | GateType;
  label: string;
  x: number;
  y: number;
  value?: boolean;
}

export interface CircuitWire {
  id: string;
  fromNodeId: string;
  fromPort: 'out';
  toNodeId: string;
  toPort: 'in1' | 'in2';
}

const PRESETS: { name: string; description: string; nodes: CircuitNode[]; wires: CircuitWire[] }[] = [
  {
    name: 'Half Adder',
    description: 'Computes Sum (A ⊕ B) and Carry (A · B) for two 1-bit inputs.',
    nodes: [
      { id: 'in_a', type: 'input', label: 'Input A', x: 60, y: 80, value: true },
      { id: 'in_b', type: 'input', label: 'Input B', x: 60, y: 220, value: true },
      { id: 'xor1', type: 'XOR', label: 'XOR (Sum)', x: 280, y: 70 },
      { id: 'and1', type: 'AND', label: 'AND (Carry)', x: 280, y: 220 },
      { id: 'out_sum', type: 'output', label: 'Sum (S)', x: 500, y: 85 },
      { id: 'out_carry', type: 'output', label: 'Carry (C)', x: 500, y: 235 },
    ],
    wires: [
      { id: 'w1', fromNodeId: 'in_a', fromPort: 'out', toNodeId: 'xor1', toPort: 'in1' },
      { id: 'w2', fromNodeId: 'in_b', fromPort: 'out', toNodeId: 'xor1', toPort: 'in2' },
      { id: 'w3', fromNodeId: 'in_a', fromPort: 'out', toNodeId: 'and1', toPort: 'in1' },
      { id: 'w4', fromNodeId: 'in_b', fromPort: 'out', toNodeId: 'and1', toPort: 'in2' },
      { id: 'w5', fromNodeId: 'xor1', fromPort: 'out', toNodeId: 'out_sum', toPort: 'in1' },
      { id: 'w6', fromNodeId: 'and1', fromPort: 'out', toNodeId: 'out_carry', toPort: 'in1' },
    ],
  },
  {
    name: '2-to-1 Multiplexer',
    description: 'Selects between input D0 and D1 based on Selector S (Y = (D0·¬S) + (D1·S)).',
    nodes: [
      { id: 'in_d0', type: 'input', label: 'Data D0', x: 50, y: 50, value: true },
      { id: 'in_s', type: 'input', label: 'Select S', x: 50, y: 160, value: false },
      { id: 'in_d1', type: 'input', label: 'Data D1', x: 50, y: 280, value: false },
      { id: 'not_s', type: 'NOT', label: 'NOT (¬S)', x: 210, y: 120 },
      { id: 'and_d0', type: 'AND', label: 'AND 0', x: 340, y: 60 },
      { id: 'and_d1', type: 'AND', label: 'AND 1', x: 340, y: 240 },
      { id: 'or_y', type: 'OR', label: 'OR (Output)', x: 490, y: 150 },
      { id: 'out_y', type: 'output', label: 'Mux Out Y', x: 640, y: 165 },
    ],
    wires: [
      { id: 'w1', fromNodeId: 'in_s', fromPort: 'out', toNodeId: 'not_s', toPort: 'in1' },
      { id: 'w2', fromNodeId: 'in_d0', fromPort: 'out', toNodeId: 'and_d0', toPort: 'in1' },
      { id: 'w3', fromNodeId: 'not_s', fromPort: 'out', toNodeId: 'and_d0', toPort: 'in2' },
      { id: 'w4', fromNodeId: 'in_s', fromPort: 'out', toNodeId: 'and_d1', toPort: 'in1' },
      { id: 'w5', fromNodeId: 'in_d1', fromPort: 'out', toNodeId: 'and_d1', toPort: 'in2' },
      { id: 'w6', fromNodeId: 'and_d0', fromPort: 'out', toNodeId: 'or_y', toPort: 'in1' },
      { id: 'w7', fromNodeId: 'and_d1', fromPort: 'out', toNodeId: 'or_y', toPort: 'in2' },
      { id: 'w8', fromNodeId: 'or_y', fromPort: 'out', toNodeId: 'out_y', toPort: 'in1' },
    ],
  },
  {
    name: 'XOR from NANDs',
    description: 'Universal logic construction: 4 NAND gates implementing A ⊕ B.',
    nodes: [
      { id: 'in_a', type: 'input', label: 'Input A', x: 50, y: 90, value: true },
      { id: 'in_b', type: 'input', label: 'Input B', x: 50, y: 230, value: false },
      { id: 'nand1', type: 'NAND', label: 'NAND 1', x: 200, y: 150 },
      { id: 'nand2', type: 'NAND', label: 'NAND 2', x: 360, y: 60 },
      { id: 'nand3', type: 'NAND', label: 'NAND 3', x: 360, y: 240 },
      { id: 'nand4', type: 'NAND', label: 'NAND 4', x: 520, y: 150 },
      { id: 'out_xor', type: 'output', label: 'XOR Out', x: 670, y: 165 },
    ],
    wires: [
      { id: 'w1', fromNodeId: 'in_a', fromPort: 'out', toNodeId: 'nand1', toPort: 'in1' },
      { id: 'w2', fromNodeId: 'in_b', fromPort: 'out', toNodeId: 'nand1', toPort: 'in2' },
      { id: 'w3', fromNodeId: 'in_a', fromPort: 'out', toNodeId: 'nand2', toPort: 'in1' },
      { id: 'w4', fromNodeId: 'nand1', fromPort: 'out', toNodeId: 'nand2', toPort: 'in2' },
      { id: 'w5', fromNodeId: 'nand1', fromPort: 'out', toNodeId: 'nand3', toPort: 'in1' },
      { id: 'w6', fromNodeId: 'in_b', fromPort: 'out', toNodeId: 'nand3', toPort: 'in2' },
      { id: 'w7', fromNodeId: 'nand2', fromPort: 'out', toNodeId: 'nand4', toPort: 'in1' },
      { id: 'w8', fromNodeId: 'nand3', fromPort: 'out', toNodeId: 'nand4', toPort: 'in2' },
      { id: 'w9', fromNodeId: 'nand4', fromPort: 'out', toNodeId: 'out_xor', toPort: 'in1' },
    ],
  },
];

export const DigitalCircuitBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<CircuitNode[]>(PRESETS[0].nodes);
  const [wires, setWires] = useState<CircuitWire[]>(PRESETS[0].wires);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; port: 'out' } | null>(null);
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].name);

  const containerRef = useRef<HTMLDivElement>(null);

  // Evaluate the entire circuit iteratively
  const nodeOutputs = useMemo(() => {
    const outputs: Record<string, boolean> = {};

    // First initialize inputs
    for (const node of nodes) {
      if (node.type === 'input') {
        outputs[node.id] = !!node.value;
      }
    }

    // Iteratively resolve gates up to depth 15
    for (let iter = 0; iter < 15; iter++) {
      let changed = false;
      for (const node of nodes) {
        if (node.type === 'input') continue;

        // Find incoming wire values
        const in1Wire = wires.find(w => w.toNodeId === node.id && w.toPort === 'in1');
        const in2Wire = wires.find(w => w.toNodeId === node.id && w.toPort === 'in2');

        const val1 = in1Wire ? !!outputs[in1Wire.fromNodeId] : false;
        const val2 = in2Wire ? !!outputs[in2Wire.fromNodeId] : false;

        let computed = false;
        if (node.type === 'output') {
          computed = val1;
        } else if (node.type === 'NOT') {
          computed = !val1;
        } else {
          computed = evaluateGate(node.type as GateType, val1, val2);
        }

        if (outputs[node.id] !== computed) {
          outputs[node.id] = computed;
          changed = true;
        }
      }
      if (!changed) break;
    }

    return outputs;
  }, [nodes, wires]);

  // Handle toggling input node
  const toggleInput = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, value: !n.value } : n));
  };

  // Node Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 120, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 80, e.clientY - rect.top - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  }, [draggingNodeId, dragOffset]);

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Touch Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const touch = e.touches[0];
    const node = nodes.find(n => n.id === nodeId);
    if (node && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left - node.x,
        y: touch.clientY - rect.top - node.y,
      });
    }
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 120, touch.clientX - rect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 80, touch.clientY - rect.top - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  }, [draggingNodeId, dragOffset]);

  const handleTouchEnd = () => {
    setDraggingNodeId(null);
  };

  // Wire Connection Handlers
  const handlePortClick = (e: React.MouseEvent, nodeId: string, port: 'out' | 'in1' | 'in2') => {
    e.stopPropagation();
    if (port === 'out') {
      if (connectingFrom && connectingFrom.nodeId === nodeId) {
        setConnectingFrom(null);
      } else {
        setConnectingFrom({ nodeId, port: 'out' });
      }
    } else {
      // connecting to an in1 or in2 port
      if (connectingFrom) {
        if (connectingFrom.nodeId !== nodeId) {
          // Remove any existing wire targeting this node's port
          setWires(prev => [
            ...prev.filter(w => !(w.toNodeId === nodeId && w.toPort === port)),
            {
              id: `w_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              fromNodeId: connectingFrom.nodeId,
              fromPort: 'out',
              toNodeId: nodeId,
              toPort: port,
            },
          ]);
        }
        setConnectingFrom(null);
      }
    }
  };

  // Add Gate
  const addNode = (type: CircuitNode['type']) => {
    const id = `node_${Date.now()}`;
    const defaultLabel = type === 'input' ? 'Input' : type === 'output' ? 'Probe' : `${type}`;
    const newNode: CircuitNode = {
      id,
      type,
      label: defaultLabel,
      x: 180 + Math.floor(Math.random() * 80),
      y: 100 + Math.floor(Math.random() * 100),
      value: type === 'input' ? false : undefined,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  // Delete Selected Node
  const deleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setWires(prev => prev.filter(w => w.fromNodeId !== selectedNodeId && w.toNodeId !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Load Preset
  const loadPreset = (presetName: string) => {
    const p = PRESETS.find(pr => pr.name === presetName);
    if (!p) return;
    setNodes(p.nodes);
    setWires(p.wires);
    setActivePreset(p.name);
    setSelectedNodeId(null);
    setConnectingFrom(null);
  };

  // Port position calculator
  const getPortCoords = (node: CircuitNode, port: 'out' | 'in1' | 'in2') => {
    const width = node.type === 'input' ? 100 : node.type === 'output' ? 95 : 110;
    const height = 54;

    if (port === 'out') {
      return { x: node.x + width, y: node.y + height / 2 };
    }
    if (port === 'in1') {
      return { x: node.x, y: node.type === 'NOT' || node.type === 'output' ? node.y + height / 2 : node.y + 16 };
    }
    // in2
    return { x: node.x, y: node.y + 38 };
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface-elevated border border-border">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono font-semibold text-text-muted mr-1">ADD:</span>
          <Button size="sm" variant="outline" onClick={() => addNode('input')}>
            <Plus className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Input (0/1)
          </Button>
          <Button size="sm" variant="outline" onClick={() => addNode('output')}>
            <Plus className="w-3.5 h-3.5 mr-1 text-cyan-400" /> LED Probe
          </Button>
          {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'] as GateType[]).map(gate => (
            <Button key={gate} size="sm" variant="ghost" className="border border-border" onClick={() => addNode(gate)}>
              + {gate}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedNodeId && (
            <Button size="sm" variant="danger" onClick={deleteSelected}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => loadPreset(activePreset)}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Canvas
          </Button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-text-muted">PRESETS:</span>
        {PRESETS.map(p => (
          <button
            key={p.name}
            onClick={() => loadPreset(p.name)}
            className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all border ${
              activePreset === p.name
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold'
                : 'bg-surface text-text-secondary border-border hover:border-zinc-700'
            }`}
          >
            {p.name}
          </button>
        ))}
        <span className="text-xs text-text-muted ml-auto italic hidden lg:inline">
          {PRESETS.find(p => p.name === activePreset)?.description}
        </span>
      </div>

      {/* Interactive Circuit Canvas */}
      <Card className="p-0 overflow-hidden relative border border-border">
        {connectingFrom && (
          <div className="absolute top-2 left-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300 animate-pulse">
            <Info className="w-3 h-3" />
            <span>Click an input port on any target gate to wire connection</span>
            <button onClick={() => setConnectingFrom(null)} className="ml-2 underline hover:text-white">Cancel</button>
          </div>
        )}

        <div className="overflow-x-auto w-full scrollbar-none touch-pan-x">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => { setSelectedNodeId(null); setConnectingFrom(null); }}
            className="relative min-w-[640px] w-full h-[480px] bg-[#0c0c0e] select-none overflow-hidden cursor-crosshair"
            style={{
              backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* SVG Connection Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <filter id="glow-high" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {wires.map(wire => {
                const fromNode = nodes.find(n => n.id === wire.fromNodeId);
                const toNode = nodes.find(n => n.id === wire.toNodeId);
                if (!fromNode || !toNode) return null;

                const start = getPortCoords(fromNode, wire.fromPort);
                const end = getPortCoords(toNode, wire.toPort);
                const isHigh = !!nodeOutputs[wire.fromNodeId];

                // Curved bezier route
                const dx = Math.abs(end.x - start.x) * 0.5;
                const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

                return (
                  <g key={wire.id}>
                    {/* Thick background click path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isHigh ? '#10b981' : '#3f3f46'}
                      strokeWidth={isHigh ? 3 : 2}
                      opacity={isHigh ? 0.95 : 0.6}
                      filter={isHigh ? 'url(#glow-high)' : undefined}
                    />
                    {/* Animated pulse dot for active high signal */}
                    {isHigh && (
                      <circle r="3" fill="#6ee7b7">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path={pathD} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            {nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const outputVal = !!nodeOutputs[node.id];
              const isInput = node.type === 'input';
              const isOutput = node.type === 'output';

              return (
                <div
                  key={node.id}
                  onMouseDown={e => handleMouseDown(e, node.id)}
                  onTouchStart={e => handleTouchStart(e, node.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute z-20 rounded-lg p-2.5 transition-shadow cursor-move flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-accent-blue shadow-lg' : 'hover:border-zinc-500'
                  } ${
                    isInput
                      ? 'w-[100px] h-[54px] bg-surface-elevated border border-emerald-500/40'
                      : isOutput
                      ? 'w-[95px] h-[54px] bg-surface-elevated border border-cyan-500/40'
                      : 'w-[110px] h-[54px] bg-surface border border-border shadow-md'
                  }`}
                >
                  {/* Input Ports (Left) */}
                  {!isInput && (
                    <>
                      <button
                        type="button"
                        title="Input 1"
                        onClick={e => handlePortClick(e, node.id, 'in1')}
                        className={`absolute -left-2 top-3 w-4 h-4 rounded-full border border-border transition-transform hover:scale-125 flex items-center justify-center ${
                          connectingFrom ? 'bg-amber-400 animate-bounce' : 'bg-zinc-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      </button>

                      {node.type !== 'NOT' && (
                        <button
                          type="button"
                          title="Input 2"
                          onClick={e => handlePortClick(e, node.id, 'in2')}
                          className={`absolute -left-2 bottom-3 w-4 h-4 rounded-full border border-border transition-transform hover:scale-125 flex items-center justify-center ${
                            connectingFrom ? 'bg-amber-400 animate-bounce' : 'bg-zinc-800'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Gate Label / Input Toggle / Output LED */}
                  <div className="flex items-center justify-between w-full">
                    {isInput ? (
                      <button
                        type="button"
                        onClick={() => toggleInput(node.id)}
                        className={`w-full py-1 rounded text-xs font-mono font-bold transition-all ${
                          node.value
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {node.value ? 'HIGH (1)' : 'LOW (0)'}
                      </button>
                    ) : isOutput ? (
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <div
                          className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                            outputVal ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]' : 'bg-zinc-800 border border-zinc-700'
                          }`}
                        />
                        <span className="font-mono text-xs font-bold text-text-primary">
                          {outputVal ? '1' : '0'}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs font-bold text-text-primary tracking-wider">
                        {node.type}
                      </span>
                    )}

                    {!isInput && !isOutput && (
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          outputVal ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-700'
                        }`}
                      />
                    )}
                  </div>

                  {/* Output Port (Right) */}
                  {!isOutput && (
                    <button
                      type="button"
                      title="Output (Click to connect wire)"
                      onClick={e => handlePortClick(e, node.id, 'out')}
                      className={`absolute -right-2 top-[19px] w-4 h-4 rounded-full border border-border transition-transform hover:scale-125 flex items-center justify-center ${
                        connectingFrom?.nodeId === node.id ? 'bg-amber-400 ring-2 ring-white' : outputVal ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-text-secondary">
        <div className="flex items-start gap-2 p-2.5 rounded bg-surface border border-border">
          <span className="font-mono text-emerald-400 font-bold">1.</span>
          <span>Click on green Input buttons (0/1) to toggle input states and watch logic levels propagate.</span>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded bg-surface border border-border">
          <span className="font-mono text-cyan-400 font-bold">2.</span>
          <span>Click the white output dot on any gate, then click an input port on another gate to wire them.</span>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded bg-surface border border-border">
          <span className="font-mono text-accent-purple font-bold">3.</span>
          <span>Drag nodes freely on the canvas or load classic digital circuits like Half Adders and Multiplexers.</span>
        </div>
      </div>
    </div>
  );
};
