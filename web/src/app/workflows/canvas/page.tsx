'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Types for workflow nodes and edges
interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  icon: string;
  x: number;
  y: number;
  config?: Record<string, unknown>;
  errors?: string[];
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'success' | 'failure';
}

interface NodeTemplate {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  icon: string;
  description: string;
  category: string;
}

// Node palette templates
const nodeTemplates: NodeTemplate[] = [
  // Triggers
  { id: 'github-event', type: 'trigger', name: 'GitHub Event', icon: '🐙', description: 'PR, Push, Issue events', category: 'Triggers' },
  { id: 'schedule', type: 'trigger', name: 'Schedule', icon: '⏰', description: 'Cron-based triggers', category: 'Triggers' },
  { id: 'webhook', type: 'trigger', name: 'Webhook', icon: '🔗', description: 'HTTP webhook listener', category: 'Triggers' },
  { id: 'manual', type: 'trigger', name: 'Manual', icon: '👆', description: 'Manual trigger button', category: 'Triggers' },
  // Actions
  { id: 'ai-review', type: 'action', name: 'AI Review', icon: '🧠', description: 'AI code analysis', category: 'Actions' },
  { id: 'ai-generate', type: 'action', name: 'AI Generate', icon: '✨', description: 'AI code generation', category: 'Actions' },
  { id: 'run-tests', type: 'action', name: 'Run Tests', icon: '🧪', description: 'Execute test suite', category: 'Actions' },
  { id: 'deploy', type: 'action', name: 'Deploy', icon: '🚀', description: 'Deploy to environment', category: 'Actions' },
  { id: 'http-request', type: 'action', name: 'HTTP Request', icon: '🌐', description: 'Make HTTP call', category: 'Actions' },
  { id: 'slack-message', type: 'action', name: 'Slack Message', icon: '💬', description: 'Send Slack notification', category: 'Actions' },
  { id: 'email', type: 'action', name: 'Email', icon: '📧', description: 'Send email', category: 'Actions' },
  { id: 'github-comment', type: 'action', name: 'GitHub Comment', icon: '💭', description: 'Post PR/Issue comment', category: 'Actions' },
  // Conditions
  { id: 'branch', type: 'condition', name: 'Branch', icon: '🔀', description: 'Conditional branch', category: 'Conditions' },
  { id: 'approval', type: 'condition', name: 'Approval', icon: '✅', description: 'Wait for approval', category: 'Conditions' },
  { id: 'filter', type: 'condition', name: 'Filter', icon: '🔍', description: 'Filter by condition', category: 'Conditions' },
];

// Initial demo workflow
const initialNodes: WorkflowNode[] = [
  { id: 'node-1', type: 'trigger', name: 'GitHub PR', icon: '🐙', x: 100, y: 200 },
  { id: 'node-2', type: 'action', name: 'AI Review', icon: '🧠', x: 350, y: 200 },
  { id: 'node-3', type: 'condition', name: 'Score > 80?', icon: '🔀', x: 600, y: 200 },
  { id: 'node-4', type: 'action', name: 'Auto Merge', icon: '✅', x: 850, y: 100 },
  { id: 'node-5', type: 'action', name: 'Request Review', icon: '👀', x: 850, y: 300 },
];

const initialEdges: WorkflowEdge[] = [
  { id: 'edge-1', source: 'node-1', target: 'node-2' },
  { id: 'edge-2', source: 'node-2', target: 'node-3' },
  { id: 'edge-3', source: 'node-3', target: 'node-4', type: 'success', label: 'Yes' },
  { id: 'edge-4', source: 'node-3', target: 'node-5', type: 'failure', label: 'No' },
];

const GRID_SIZE = 20;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

export default function WorkflowCanvasPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ sourceId: string; startX: number; startY: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Snap to grid
  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  // Handle node drag
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, x: snapToGrid(node.x + deltaX), y: snapToGrid(node.y + deltaY) }
        : node
    ));
  }, []);

  // Handle drop from palette
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const templateId = e.dataTransfer.getData('templateId');
    const template = nodeTemplates.find(t => t.id === templateId);
    if (!template || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = snapToGrid((e.clientX - rect.left - pan.x) / zoom);
    const y = snapToGrid((e.clientY - rect.top - pan.y) / zoom);

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      name: template.name,
      icon: template.icon,
      x,
      y,
    };

    setNodes(prev => [...prev, newNode]);
  }, [pan, zoom]);

  // Start connection from node
  const startConnection = (nodeId: string, x: number, y: number) => {
    setConnecting({ sourceId: nodeId, startX: x, startY: y });
  };

  // Complete connection to node
  const completeConnection = (targetId: string) => {
    if (!connecting || connecting.sourceId === targetId) {
      setConnecting(null);
      return;
    }

    // Check if edge already exists
    const exists = edges.some(e => e.source === connecting.sourceId && e.target === targetId);
    if (!exists) {
      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}`,
        source: connecting.sourceId,
        target: targetId,
      };
      setEdges(prev => [...prev, newEdge]);
    }
    setConnecting(null);
  };

  // Validate workflow
  const validateWorkflow = () => {
    const errors: string[] = [];
    
    // Check for unconnected nodes
    const connectedNodeIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target),
    ]);
    
    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
        errors.push(`Node "${node.name}" is not connected`);
      }
    });

    // Check for trigger at start
    const hasTrigger = nodes.some(n => n.type === 'trigger');
    if (!hasTrigger) {
      errors.push('Workflow must have at least one trigger');
    }

    // Check for cycles (simplified)
    // In production, use proper graph cycle detection

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Delete selected node
  const deleteSelected = () => {
    if (!selectedNode) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setEdges(prev => prev.filter(e => e.source !== selectedNode && e.target !== selectedNode));
    setSelectedNode(null);
  };

  // Get node color by type
  const getNodeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger': return { bg: 'bg-blue-500/10', border: 'border-blue-500/50', text: 'text-blue-500' };
      case 'action': return { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-500' };
      case 'condition': return { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-500' };
    }
  };

  // Export workflow as JSON
  const exportWorkflow = () => {
    const workflow = {
      id: `workflow-${Date.now()}`,
      name: 'Untitled Workflow',
      nodes: nodes.map(n => ({ id: n.id, type: n.type, name: n.name, position: { x: n.x, y: n.y }, config: n.config })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label })),
      createdAt: new Date().toISOString(),
    };
    console.log('Workflow JSON:', JSON.stringify(workflow, null, 2));
    alert('Workflow exported to console!');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Node Palette */}
      <div className="w-64 border-r border-border/50 bg-background overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold mb-4">Node Palette</h2>
          
          {['Triggers', 'Actions', 'Conditions'].map(category => (
            <div key={category} className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {nodeTemplates.filter(t => t.category === category).map(template => (
                  <div
                    key={template.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('templateId', template.id)}
                    className={`p-2 rounded-md border cursor-grab hover:shadow-sm transition-all ${
                      getNodeColor(template.type).bg
                    } ${getNodeColor(template.type).border}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{template.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-border/50 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">Visual Workflow Builder</h1>
            <Badge variant="secondary">Draft</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              −
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              +
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="outline" size="sm" onClick={deleteSelected} disabled={!selectedNode}>
              🗑️ Delete
            </Button>
            <Button variant="outline" size="sm" onClick={validateWorkflow}>
              ✓ Validate
            </Button>
            <Button variant="outline" size="sm" onClick={exportWorkflow}>
              📤 Export
            </Button>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white" size="sm">
              💾 Save
            </Button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-2 bg-red-500/10 border-b border-red-500/30">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <span>⚠️</span>
              <span>{validationErrors.join(' • ')}</span>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-[#1a1a1a]"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseMove={(e) => {
            if (canvasRef.current) {
              const rect = canvasRef.current.getBoundingClientRect();
              setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
          }}
          onClick={() => setSelectedNode(null)}
        >
          {/* Grid Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="canvas-grid" width={GRID_SIZE * zoom} height={GRID_SIZE * zoom} patternUnits="userSpaceOnUse">
                <path 
                  d={`M ${GRID_SIZE * zoom} 0 L 0 0 0 ${GRID_SIZE * zoom}`} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#canvas-grid)" />
          </svg>

          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
            {edges.map(edge => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;

              const sx = source.x + NODE_WIDTH;
              const sy = source.y + NODE_HEIGHT / 2;
              const tx = target.x;
              const ty = target.y + NODE_HEIGHT / 2;
              const mx = (sx + tx) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`}
                    fill="none"
                    stroke={edge.type === 'success' ? '#22c55e' : edge.type === 'failure' ? '#ef4444' : '#6366f1'}
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text x={mx} y={(sy + ty) / 2 - 8} fill="#888" fontSize="12" textAnchor="middle">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Connection in progress */}
            {connecting && (
              <line
                x1={connecting.startX}
                y1={connecting.startY}
                x2={(mousePos.x - pan.x) / zoom}
                y2={(mousePos.y - pan.y) / zoom}
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            {nodes.map(node => {
              const colors = getNodeColor(node.type);
              const isSelected = selectedNode === node.id;

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-move select-none transition-shadow ${colors.bg} ${colors.border} border-2 rounded-lg p-3 ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                  onMouseDown={(e) => {
                    if (e.button === 0) {
                      setDraggingNode(node.id);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      
                      const handleMove = (moveE: MouseEvent) => {
                        handleNodeDrag(node.id, (moveE.clientX - startX) / zoom, (moveE.clientY - startY) / zoom);
                      };
                      
                      const handleUp = () => {
                        setDraggingNode(null);
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };
                      
                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{node.icon}</span>
                    <span className="font-medium text-sm truncate">{node.name}</span>
                  </div>
                  <Badge variant="secondary" className={`mt-1 text-xs ${colors.text}`}>
                    {node.type}
                  </Badge>

                  {/* Connection handle */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background cursor-crosshair hover:scale-125 transition-transform"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startConnection(node.id, node.x + NODE_WIDTH, node.y + NODE_HEIGHT / 2);
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      if (connecting) completeConnection(node.id);
                    }}
                  />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-2 border-background cursor-crosshair hover:scale-125 transition-transform"
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      if (connecting) completeConnection(node.id);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
