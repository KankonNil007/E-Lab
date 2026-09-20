import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Plus,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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

const VIRTUAL_WIDTH = 740;
const VIRTUAL_HEIGHT = 420;

const PRESETS: { name: string; description: string; nodes: CircuitNode[]; wires: CircuitWire[] }[] = [
  {
    name: 'Half Adder',
    description: 'Computes Sum (A ⊕ B) and Carry (A · B) for two 1-bit inputs.',
    nodes: [
      { id: 'in_a', type: 'input', label: 'Input A', x: 40, y: 60, value: true },
      { id: 'in_b', type: 'input', label: 'Input B', x: 40, y: 220, value: true },
      { id: 'xor1', type: 'XOR', label: 'XOR (Sum)', x: 260, y: 55 },
      { id: 'and1', type: 'AND', label: 'AND (Carry)', x: 260, y: 215 },
      { id: 'out_sum', type: 'output', label: 'Sum (S)', x: 490, y: 70 },
      { id: 'out_carry', type: 'output', label: 'Carry (C)', x: 490, y: 230 },
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
      { id: 'in_d0', type: 'input', label: 'Data D0', x: 35, y: 40, value: true },
      { id: 'in_s', type: 'input', label: 'Select S', x: 35, y: 150, value: false },
      { id: 'in_d1', type: 'input', label: 'Data D1', x: 35, y: 270, value: false },
      { id: 'not_s', type: 'NOT', label: 'NOT (¬S)', x: 195, y: 110 },
      { id: 'and_d0', type: 'AND', label: 'AND 0', x: 330, y: 50 },
      { id: 'and_d1', type: 'AND', label: 'AND 1', x: 330, y: 230 },
      { id: 'or_y', type: 'OR', label: 'OR (Output)', x: 480, y: 140 },
      { id: 'out_y', type: 'output', label: 'Mux Out Y', x: 620, y: 155 },
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
      { id: 'in_a', type: 'input', label: 'Input A', x: 35, y: 80, value: true },
      { id: 'in_b', type: 'input', label: 'Input B', x: 35, y: 220, value: false },
      { id: 'nand1', type: 'NAND', label: 'NAND 1', x: 180, y: 140 },
      { id: 'nand2', type: 'NAND', label: 'NAND 2', x: 335, y: 50 },
      { id: 'nand3', type: 'NAND', label: 'NAND 3', x: 335, y: 230 },
      { id: 'nand4', type: 'NAND', label: 'NAND 4', x: 490, y: 140 },
      { id: 'out_xor', type: 'output', label: 'XOR Out', x: 635, y: 155 },
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
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; port: 'out' } | null>(null);
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].name);

  // Responsive Zoom & Pan System
  const [scale, setScale] = useState<number>(1.0);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showWireList, setShowWireList] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute Auto-Fit scale based on container dimensions
  const calculateFitScale = useCallback(() => {
    if (!containerRef.current) return 1.0;
    const containerWidth = containerRef.current.clientWidth;
    // Calculate padding tolerance
    const targetWidth = VIRTUAL_WIDTH + 30;
    const computedScale = Math.min(1.0, Math.max(0.44, (containerWidth - 16) / targetWidth));
    return parseFloat(computedScale.toFixed(2));
  }, []);

  // Update scale on window resize or initial mount
  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit) {
        const fit = calculateFitScale();
        setScale(fit);
        setPan({ x: 0, y: 0 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoFit, calculateFitScale]);

  // Handle zoom buttons
  const handleZoomIn = () => {
    setIsAutoFit(false);
    setScale(prev => Math.min(1.5, parseFloat((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setScale(prev => Math.max(0.4, parseFloat((prev - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setIsAutoFit(true);
    const fit = calculateFitScale();
    setScale(fit);
    setPan({ x: 0, y: 0 });
  };

  // Evaluate the entire circuit iteratively
  const nodeOutputs = useMemo(() => {
    const outputs: Record<string, boolean> = {};

    // 1. Initialize inputs
    for (const node of nodes) {
      if (node.type === 'input') {
        outputs[node.id] = !!node.value;
      }
    }

    // 2. Iteratively resolve gates up to depth 15
    for (let iter = 0; iter < 15; iter++) {
      let changed = false;
      for (const node of nodes) {
        if (node.type === 'input') continue;

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

  // Toggle input logic level
  const toggleInput = (nodeId: string) => {
    setNodes(prev => prev.map(n => (n.id === nodeId ? { ...n, value: !n.value } : n)));
  };

  // Unified Pointer Handlers for Node Dragging
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    // If the tap/click was on a button (like toggle or port), do not initiate drag!
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedNodeId(nodeId);
    setSelectedWireId(null);
    setDraggingNodeId(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerCanvasX = (e.clientX - rect.left - pan.x) / scale;
      const pointerCanvasY = (e.clientY - rect.top - pan.y) / scale;
      setDragOffset({
        x: pointerCanvasX - node.x,
        y: pointerCanvasY - node.y,
      });
    }
  };

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pointerCanvasX = (e.clientX - rect.left - pan.x) / scale;
      const pointerCanvasY = (e.clientY - rect.top - pan.y) / scale;

      const newX = Math.max(10, Math.min(VIRTUAL_WIDTH - 80, pointerCanvasX - dragOffset.x));
      const newY = Math.max(10, Math.min(VIRTUAL_HEIGHT - 60, pointerCanvasY - dragOffset.y));

      setNodes(prev =>
        prev.map(n => (n.id === draggingNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n))
      );
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [draggingNodeId, dragOffset, isPanning, panStart, scale, pan.x, pan.y]);

  const handleCanvasPointerUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Background pointer down for panning when zoomed in
  const handleBackgroundPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-circuit-node]')) return;
    setSelectedNodeId(null);
    setSelectedWireId(null);
    setConnectingFrom(null);

    // If zoomed in or manual scale, allow drag panning
    if (!isAutoFit || scale > 1.0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  // Wire Connection Handlers
  const handlePortClick = (e: React.MouseEvent | React.TouchEvent, nodeId: string, port: 'out' | 'in1' | 'in2') => {
    e.stopPropagation();
    if (port === 'out') {
      if (connectingFrom && connectingFrom.nodeId === nodeId) {
        setConnectingFrom(null);
      } else {
        setConnectingFrom({ nodeId, port: 'out' });
      }
    } else {
      // Connecting to an in1 or in2 port
      if (connectingFrom) {
        if (connectingFrom.nodeId !== nodeId) {
          // Remove any existing wire targeting this node's port
          setWires(prev => [
            ...prev.filter(w => !(w.toNodeId === nodeId && w.toPort === port)),
            {
              id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

  // Add Gate / Component
  const addNode = (type: CircuitNode['type']) => {
    const id = `node_${Date.now()}`;
    const defaultLabel = type === 'input' ? 'Input' : type === 'output' ? 'Probe' : `${type}`;

    // Place node within visible boundaries
    const spawnX = Math.min(VIRTUAL_WIDTH - 120, 160 + Math.floor(Math.random() * 80));
    const spawnY = Math.min(VIRTUAL_HEIGHT - 80, 80 + Math.floor(Math.random() * 80));

    const newNode: CircuitNode = {
      id,
      type,
      label: defaultLabel,
      x: spawnX,
      y: spawnY,
      value: type === 'input' ? false : undefined,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setSelectedWireId(null);
  };

  // Delete Selected Node
  const deleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setWires(prev => prev.filter(w => w.fromNodeId !== selectedNodeId && w.toNodeId !== selectedNodeId));
    setSelectedNodeId(null);
  };

  // Delete a specific wire
  const deleteWire = (wireId: string) => {
    setWires(prev => prev.filter(w => w.id !== wireId));
    if (selectedWireId === wireId) setSelectedWireId(null);
  };

  // Clear Canvas
  const clearCanvas = () => {
    setNodes([]);
    setWires([]);
    setSelectedNodeId(null);
    setSelectedWireId(null);
    setConnectingFrom(null);
  };

  // Load Preset
  const loadPreset = (presetName: string) => {
    const p = PRESETS.find(pr => pr.name === presetName);
    if (!p) return;
    setNodes(p.nodes);
    setWires(p.wires);
    setActivePreset(p.name);
    setSelectedNodeId(null);
    setSelectedWireId(null);
    setConnectingFrom(null);
    // Reset to auto-fit view for preset
    handleResetZoom();
  };

  // Port position calculator
  const getPortCoords = (node: CircuitNode, port: 'out' | 'in1' | 'in2') => {
    const width = node.type === 'input' ? 100 : node.type === 'output' ? 95 : 105;
    const height = 54;

    if (port === 'out') {
      return { x: node.x + width, y: node.y + height / 2 };
    }
    if (port === 'in1') {
      return { x: node.x, y: node.type === 'NOT' || node.type === 'output' ? node.y + height / 2 : node.y + 16 };
    }
    return { x: node.x, y: node.y + 38 };
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ═══ RESPONSIVE COMPONENT ADD TOOLBAR ═══ */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-surface-elevated border border-border space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Component Creation Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-mono font-bold text-text-muted mr-0.5 uppercase tracking-wider">
              Add:
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 active:scale-95"
              onClick={() => addNode('input')}
            >
              <Plus className="w-3 h-3 mr-1 text-emerald-400" />
              Input (0/1)
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 active:scale-95"
              onClick={() => addNode('output')}
            >
              <Plus className="w-3 h-3 mr-1 text-cyan-400" />
              Probe LED
            </Button>

            <div className="h-4 w-px bg-border hidden sm:block mx-1" />

            {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'] as GateType[]).map(gate => (
              <button
                key={gate}
                type="button"
                onClick={() => addNode(gate)}
                className="h-7 px-2 sm:px-2.5 rounded-md text-xs font-mono font-semibold bg-surface border border-border hover:border-zinc-500 hover:text-text-primary text-text-secondary active:scale-95 transition-all"
              >
                +{gate}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {selectedNodeId && (
              <Button size="sm" variant="danger" className="text-xs h-7 px-2.5" onClick={deleteSelected}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-xs h-7 px-2.5" onClick={() => loadPreset(activePreset)}>
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-text-muted hover:text-rose-400" onClick={clearCanvas} title="Clear entire canvas">
              Clear
            </Button>
          </div>
        </div>

        {/* Presets Horizontal Slider */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/60 overflow-x-auto scrollbar-none snap-x">
          <span className="text-[10px] font-mono text-text-muted shrink-0 mr-1">PRESET:</span>
          {PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => loadPreset(p.name)}
              className={`px-2.5 py-1 text-xs rounded-md font-mono shrink-0 transition-all border snap-center ${
                activePreset === p.name
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/50 font-semibold shadow-sm'
                  : 'bg-surface text-text-secondary border-border hover:border-zinc-700'
              }`}
            >
              {p.name}
            </button>
          ))}
          <span className="text-[11px] text-text-muted italic ml-auto pl-2 truncate hidden md:inline">
            {PRESETS.find(p => p.name === activePreset)?.description}
          </span>
        </div>
      </div>

      {/* ═══ INTERACTIVE CIRCUIT CANVAS ═══ */}
      <Card className="p-0 overflow-hidden relative border border-border shadow-md">
        {/* Connection State Banner */}
        {connectingFrom && (
          <div className="absolute top-2 left-2 right-2 sm:left-3 sm:right-auto z-40 flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-500/50 text-xs font-mono text-amber-300 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Tap any pulsing input port to connect wire</span>
            </div>
            <button
              type="button"
              onClick={() => setConnectingFrom(null)}
              className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/50 text-[11px] font-bold text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Selected Wire Notice Banner */}
        {selectedWireId && (
          <div className="absolute top-2 left-2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 backdrop-blur-md border border-rose-500/40 text-xs font-mono text-rose-300 shadow-lg animate-in fade-in">
            <span>Wire selected</span>
            <button
              type="button"
              onClick={() => deleteWire(selectedWireId)}
              className="px-2 py-0.5 rounded bg-rose-500/40 hover:bg-rose-500/60 text-white font-bold text-xs transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete Wire
            </button>
            <button
              type="button"
              onClick={() => setSelectedWireId(null)}
              className="p-1 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Zoom & Canvas Controls */}
        <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-1 p-1 rounded-lg bg-surface/90 backdrop-blur-md border border-border text-xs font-mono shadow-md">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded hover:bg-surface-elevated text-[11px] font-semibold text-text-primary transition-colors"
            title="Fit to Screen"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-border mx-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            className={`p-1.5 rounded transition-colors ${
              isAutoFit
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
            }`}
            title="Fit Full Circuit to Viewport"
            aria-label="Auto-Fit Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Canvas Viewport Container */}
        <div
          ref={containerRef}
          onPointerDown={handleBackgroundPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          className="relative w-full h-[380px] sm:h-[460px] bg-[#0c0c0e] select-none overflow-hidden touch-none cursor-crosshair"
          style={{
            backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* Scalable Inner Coordinate System */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'top left',
              width: `${VIRTUAL_WIDTH}px`,
              height: `${VIRTUAL_HEIGHT}px`,
            }}
            className="relative pointer-events-auto"
          >
            {/* SVG Connection Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ width: `${VIRTUAL_WIDTH}px`, height: `${VIRTUAL_HEIGHT}px` }}
            >
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
                const isSelected = selectedWireId === wire.id;

                // Smooth bezier route
                const dx = Math.abs(end.x - start.x) * 0.5;
                const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

                return (
                  <g key={wire.id} className="pointer-events-auto cursor-pointer">
                    {/* Invisible Thick Tap Area for touch selection */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={22}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedWireId(wire.id);
                        setSelectedNodeId(null);
                      }}
                    />
                    {/* Rendered Wire */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isSelected ? '#f43f5e' : isHigh ? '#10b981' : '#3f3f46'}
                      strokeWidth={isSelected ? 4 : isHigh ? 3 : 2}
                      opacity={isSelected ? 1 : isHigh ? 0.95 : 0.65}
                      filter={isHigh && !isSelected ? 'url(#glow-high)' : undefined}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedWireId(wire.id);
                        setSelectedNodeId(null);
                      }}
                    />
                    {/* Pulsing signal bead along active wires */}
                    {isHigh && (
                      <circle r="3.5" fill="#6ee7b7">
                        <animateMotion dur="1.4s" repeatCount="indefinite" path={pathD} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Render Draggable Nodes */}
            {nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const outputVal = !!nodeOutputs[node.id];
              const isInput = node.type === 'input';
              const isOutput = node.type === 'output';

              return (
                <div
                  key={node.id}
                  data-circuit-node={node.id}
                  onPointerDown={e => handleNodePointerDown(e, node.id)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    touchAction: 'none',
                  }}
                  className={`absolute z-20 rounded-xl p-2 sm:p-2.5 transition-shadow cursor-move flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-accent-blue shadow-lg' : 'hover:border-zinc-500'
                  } ${
                    isInput
                      ? 'w-[100px] h-[54px] bg-surface-elevated border border-emerald-500/40 shadow-sm'
                      : isOutput
                      ? 'w-[95px] h-[54px] bg-surface-elevated border border-cyan-500/40 shadow-sm'
                      : 'w-[105px] h-[54px] bg-surface border border-border shadow-md'
                  }`}
                >
                  {/* ── Input Ports (Left) ── */}
                  {!isInput && (
                    <>
                      {/* Port in1 */}
                      <button
                        type="button"
                        title="Input 1"
                        onClick={e => handlePortClick(e, node.id, 'in1')}
                        className="absolute -left-4 top-1 w-9 h-9 flex items-center justify-center rounded-full z-30 transition-transform active:scale-95 group touch-manipulation"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center transition-all ${
                            connectingFrom
                              ? 'bg-amber-400 ring-4 ring-amber-400/40 animate-pulse scale-125'
                              : 'bg-zinc-800 group-hover:scale-125 group-hover:border-emerald-400'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover:bg-white" />
                        </div>
                      </button>

                      {/* Port in2 (for 2-input gates) */}
                      {node.type !== 'NOT' && (
                        <button
                          type="button"
                          title="Input 2"
                          onClick={e => handlePortClick(e, node.id, 'in2')}
                          className="absolute -left-4 bottom-1 w-9 h-9 flex items-center justify-center rounded-full z-30 transition-transform active:scale-95 group touch-manipulation"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center transition-all ${
                              connectingFrom
                                ? 'bg-amber-400 ring-4 ring-amber-400/40 animate-pulse scale-125'
                                : 'bg-zinc-800 group-hover:scale-125 group-hover:border-emerald-400'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover:bg-white" />
                          </div>
                        </button>
                      )}
                    </>
                  )}

                  {/* ── Gate Center Content / Input Toggle / LED Probe ── */}
                  <div className="flex items-center justify-between w-full h-full">
                    {isInput ? (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleInput(node.id);
                        }}
                        className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95 touch-manipulation ${
                          node.value
                            ? 'bg-emerald-500 text-white shadow-emerald-500/40 ring-1 ring-emerald-400'
                            : 'bg-zinc-800/90 text-zinc-400 hover:text-white border border-zinc-700/60'
                        }`}
                      >
                        {node.value ? 'HIGH (1)' : 'LOW (0)'}
                      </button>
                    ) : isOutput ? (
                      <div className="flex items-center justify-center gap-2 w-full">
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

                  {/* ── Output Port (Right) ── */}
                  {!isOutput && (
                    <button
                      type="button"
                      title="Output (Tap to connect wire)"
                      onClick={e => handlePortClick(e, node.id, 'out')}
                      className="absolute -right-4 top-[8px] w-9 h-9 flex items-center justify-center rounded-full z-30 transition-transform active:scale-95 group touch-manipulation"
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center transition-all ${
                          connectingFrom?.nodeId === node.id
                            ? 'bg-amber-400 ring-4 ring-amber-400/40 scale-125'
                            : outputVal
                            ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-zinc-800 group-hover:scale-125 group-hover:border-emerald-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Collapsible Active Wires Panel for Easy Mobile Disconnection ── */}
      <div className="rounded-lg bg-surface border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setShowWireList(!showWireList)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accent-blue" />
            <span>Active Connections ({wires.length} wires)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <span>{showWireList ? 'Hide' : 'Manage Wires'}</span>
            {showWireList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showWireList && (
          <div className="p-3 border-t border-border bg-surface-elevated/40 space-y-2 max-h-48 overflow-y-auto">
            {wires.length === 0 ? (
              <p className="text-xs text-text-muted italic">No wire connections yet. Tap an output dot and an input dot to wire.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {wires.map((wire) => {
                  const fromNode = nodes.find(n => n.id === wire.fromNodeId);
                  const toNode = nodes.find(n => n.id === wire.toNodeId);
                  const isHigh = !!nodeOutputs[wire.fromNodeId];
                  return (
                    <div
                      key={wire.id}
                      className="flex items-center justify-between p-1.5 rounded bg-surface border border-border text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-2 h-2 rounded-full ${isHigh ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        <span className="text-text-primary font-semibold">{fromNode?.label || wire.fromNodeId}</span>
                        <span className="text-text-muted">→</span>
                        <span className="text-text-secondary">{toNode?.label || wire.toNodeId} ({wire.toPort})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteWire(wire.id)}
                        className="p-1 text-text-muted hover:text-rose-400 rounded transition-colors ml-2 shrink-0"
                        title="Delete wire"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Responsive Instruction Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-text-secondary">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface border border-border">
          <span className="font-mono text-emerald-400 font-bold">1.</span>
          <span>Tap green <strong>Input (0/1)</strong> buttons to toggle states and watch digital signals propagate.</span>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface border border-border">
          <span className="font-mono text-cyan-400 font-bold">2.</span>
          <span>Tap white <strong>Output dots</strong>, then tap pulsing amber <strong>Input dots</strong> to route wires.</span>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface border border-border">
          <span className="font-mono text-accent-purple font-bold">3.</span>
          <span>Drag gates freely with touch. Use <strong>Auto-Fit</strong> or <strong>Zoom</strong> controls to scale view.</span>
        </div>
      </div>
    </div>
  );
};
