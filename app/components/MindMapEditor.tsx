'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Save, Download, Upload, Copy, Scissors, Clipboard, 
  Lock, Unlock, Image as ImageIcon, Bold, Italic, 
  Maximize, Plus, Minus, RotateCcw, RotateCw, X,
  Settings, Info, Zap
} from 'lucide-react';

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  parent?: string;
  children: string[];
  colors: {
    background: string;
    text: string;
    branch: string;
  };
  font: {
    size: number;
    weight: string;
    style: string;
  };
  locked: boolean;
  image?: {
    src: string;
    size: number;
  };
}

interface MindMapData {
  nodes: { [key: string]: Node };
  rootId: string;
}

interface MindMapEditorProps {
  documentId?: string;
  documentUrl?: string;
  documentName: string;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export default function MindMapEditor({
  documentId,
  documentUrl,
  documentName,
  onClose,
  onSave
}: MindMapEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData>({
    nodes: {},
    rootId: ''
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedNode, setCopiedNode] = useState<Node | null>(null);

  // Initialize mind map
  useEffect(() => {
    initializeMindMap();
  }, []);

  const initializeMindMap = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: MindMapData;

      if (documentUrl) {
        // Load existing mind map
        const response = await fetch(documentUrl);
        data = await response.json();
      } else {
        // Create new mind map
        const rootId = 'root';
        data = {
          nodes: {
            [rootId]: {
              id: rootId,
              text: 'Root node',
              x: 400,
              y: 300,
              children: [],
              colors: {
                background: '#f0f0f0',
                text: '#333333',
                branch: '#666666'
              },
              font: {
                size: 16,
                weight: 'normal',
                style: 'normal'
              },
              locked: false
            }
          },
          rootId
        };
      }

      setMindMapData(data);
      setSelectedNode(data.rootId);
      setLoading(false);
      
      // Trigger initial render
      setTimeout(() => drawMindMap(), 100);
    } catch (err) {
      console.error('Failed to initialize mind map:', err);
      setError('Failed to load mind map');
      setLoading(false);
    }
  };

  const drawMindMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw connections first
    Object.values(mindMapData.nodes).forEach(node => {
      node.children.forEach(childId => {
        const child = mindMapData.nodes[childId];
        if (child) {
          drawConnection(ctx, node, child);
        }
      });
    });

    // Draw nodes
    Object.values(mindMapData.nodes).forEach(node => {
      drawNode(ctx, node, selectedNode === node.id);
    });

    ctx.restore();
  }, [mindMapData, selectedNode, zoom, pan]);

  const drawConnection = (ctx: CanvasRenderingContext2D, parent: Node, child: Node) => {
    ctx.strokeStyle = parent.colors.branch;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(parent.x, parent.y);
    ctx.lineTo(child.x, child.y);
    ctx.stroke();
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: Node, isSelected: boolean) => {
    const padding = 12;
    const minWidth = 80;
    
    // Measure text
    ctx.font = `${node.font.style} ${node.font.weight} ${node.font.size}px Arial`;
    const textMetrics = ctx.measureText(node.text);
    const textWidth = Math.max(textMetrics.width, minWidth);
    const textHeight = node.font.size;
    
    const nodeWidth = textWidth + padding * 2;
    const nodeHeight = textHeight + padding * 2;
    
    // Draw node background
    ctx.fillStyle = node.colors.background;
    ctx.strokeStyle = isSelected ? '#007bff' : node.colors.branch;
    ctx.lineWidth = isSelected ? 3 : 1;
    
    const x = node.x - nodeWidth / 2;
    const y = node.y - nodeHeight / 2;
    
    // Rounded rectangle
    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(x, y, nodeWidth, nodeHeight, radius);
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.fillStyle = node.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.text, node.x, node.y);

    // Draw lock icon if locked
    if (node.locked) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '12px Arial';
      ctx.fillText('🔒', node.x + nodeWidth/2 - 10, node.y - nodeHeight/2 + 10);
    }

    // Draw image if present
    if (node.image?.src) {
      ctx.fillStyle = '#4ecdc4';
      ctx.font = '12px Arial';
      ctx.fillText('🖼️', node.x - nodeWidth/2 + 10, node.y - nodeHeight/2 + 10);
    }
  };

  const getNodeAt = (x: number, y: number): string | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const adjustedX = (x - rect.left - pan.x) / zoom;
    const adjustedY = (y - rect.top - pan.y) / zoom;
    
    for (const node of Object.values(mindMapData.nodes)) {
      const nodeWidth = 120; // Approximate
      const nodeHeight = 40; // Approximate
      
      if (adjustedX >= node.x - nodeWidth/2 && adjustedX <= node.x + nodeWidth/2 &&
          adjustedY >= node.y - nodeHeight/2 && adjustedY <= node.y + nodeHeight/2) {
        return node.id;
      }
    }
    return null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const nodeId = getNodeAt(e.clientX, e.clientY);
    
    if (nodeId) {
      setSelectedNode(nodeId);
      const node = mindMapData.nodes[nodeId];
      if (node && !node.locked) {
        setIsDragging(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setDragOffset({
            x: (e.clientX - rect.left) / zoom - node.x,
            y: (e.clientY - rect.top) / zoom - node.y
          });
        }
      }
      
      // Double click to edit
      if (e.detail === 2) {
        startEditing(nodeId);
      }
    } else {
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = (e.clientX - rect.left) / zoom - dragOffset.x;
        const newY = (e.clientY - rect.top) / zoom - dragOffset.y;
        
        setMindMapData(prev => ({
          ...prev,
          nodes: {
            ...prev.nodes,
            [selectedNode]: {
              ...prev.nodes[selectedNode],
              x: newX,
              y: newY
            }
          }
        }));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const startEditing = (nodeId: string) => {
    const node = mindMapData.nodes[nodeId];
    if (node && !node.locked) {
      setEditText(node.text);
      setIsEditing(true);
    }
  };

  const finishEditing = () => {
    if (selectedNode && editText.trim()) {
      setMindMapData(prev => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [selectedNode]: {
            ...prev.nodes[selectedNode],
            text: editText.trim()
          }
        }
      }));
    }
    setIsEditing(false);
    setEditText('');
  };

  const addNode = () => {
    if (!selectedNode) return;

    const newId = 'node_' + Date.now();
    const parent = mindMapData.nodes[selectedNode];
    const angle = (parent.children.length * 60) * (Math.PI / 180); // Spread children
    const distance = 150;
    
    const newNode: Node = {
      id: newId,
      text: 'New node',
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      parent: selectedNode,
      children: [],
      colors: {
        background: '#f8f9fa',
        text: '#333333',
        branch: '#666666'
      },
      font: {
        size: 14,
        weight: 'normal',
        style: 'normal'
      },
      locked: false
    };

    setMindMapData(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [newId]: newNode,
        [selectedNode]: {
          ...prev.nodes[selectedNode],
          children: [...prev.nodes[selectedNode].children, newId]
        }
      }
    }));

    setSelectedNode(newId);
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode === mindMapData.rootId) return;

    const nodeToDelete = mindMapData.nodes[selectedNode];
    if (!nodeToDelete.parent) return;

    setMindMapData(prev => {
      const newNodes = { ...prev.nodes };
      
      // Remove from parent's children
      if (nodeToDelete.parent) {
        newNodes[nodeToDelete.parent] = {
          ...newNodes[nodeToDelete.parent],
          children: newNodes[nodeToDelete.parent].children.filter(id => id !== selectedNode)
        };
      }
      
      // Delete the node and its children recursively
      const deleteRecursive = (nodeId: string) => {
        const node = newNodes[nodeId];
        if (node) {
          node.children.forEach(deleteRecursive);
          delete newNodes[nodeId];
        }
      };
      
      deleteRecursive(selectedNode);
      
      return { ...prev, nodes: newNodes };
    });

    setSelectedNode(null);
  };

  const copyNode = () => {
    if (selectedNode) {
      setCopiedNode({ ...mindMapData.nodes[selectedNode] });
    }
  };

  const pasteNode = () => {
    if (copiedNode && selectedNode) {
      const newId = 'node_' + Date.now();
      const parent = mindMapData.nodes[selectedNode];
      
      const newNode: Node = {
        ...copiedNode,
        id: newId,
        parent: selectedNode,
        x: parent.x + 100,
        y: parent.y + 50,
        children: []
      };

      setMindMapData(prev => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [newId]: newNode,
          [selectedNode]: {
            ...prev.nodes[selectedNode],
            children: [...prev.nodes[selectedNode].children, newId]
          }
        }
      }));
    }
  };

  const toggleNodeLock = () => {
    if (selectedNode) {
      setMindMapData(prev => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [selectedNode]: {
            ...prev.nodes[selectedNode],
            locked: !prev.nodes[selectedNode].locked
          }
        }
      }));
    }
  };

  const toggleBold = () => {
    if (selectedNode) {
      setMindMapData(prev => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [selectedNode]: {
            ...prev.nodes[selectedNode],
            font: {
              ...prev.nodes[selectedNode].font,
              weight: prev.nodes[selectedNode].font.weight === 'bold' ? 'normal' : 'bold'
            }
          }
        }
      }));
    }
  };

  const toggleItalic = () => {
    if (selectedNode) {
      setMindMapData(prev => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [selectedNode]: {
            ...prev.nodes[selectedNode],
            font: {
              ...prev.nodes[selectedNode].font,
              style: prev.nodes[selectedNode].font.style === 'italic' ? 'normal' : 'italic'
            }
          }
        }
      }));
    }
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(mindMapData);
      }
    } catch (error) {
      console.error('Failed to save mind map:', error);
      alert('Failed to save mind map');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(mindMapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentName || 'mindmap'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Redraw when data changes
  useEffect(() => {
    drawMindMap();
  }, [drawMindMap]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => drawMindMap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMindMap]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Mind Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const selectedNodeData = selectedNode ? mindMapData.nodes[selectedNode] : null;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => initializeMindMap()}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="New Map"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => {/* Import logic */}}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Import Map"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Export Map"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button
            onClick={copyNode}
            disabled={!selectedNode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Copy Node"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={() => {/* Cut logic */}}
            disabled={!selectedNode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Cut Node"
          >
            <Scissors className="w-5 h-5" />
          </button>
          <button
            onClick={pasteNode}
            disabled={!copiedNode || !selectedNode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Paste Node"
          >
            <Clipboard className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button
            onClick={toggleNodeLock}
            disabled={!selectedNode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Lock/Unlock Node"
          >
            {selectedNodeData?.locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {/* Image logic */}}
            disabled={!selectedNode}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Add Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button
            onClick={toggleBold}
            disabled={!selectedNode}
            className={`p-2 hover:bg-blue-50 rounded disabled:opacity-50 ${
              selectedNodeData?.font.weight === 'bold' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
            }`}
            title="Bold Text"
          >
            <Bold className="w-5 h-5" />
          </button>
          <button
            onClick={toggleItalic}
            disabled={!selectedNode}
            className={`p-2 hover:bg-blue-50 rounded disabled:opacity-50 ${
              selectedNodeData?.font.style === 'italic' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
            }`}
            title="Italic Text"
          >
            <Italic className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button
            onClick={() => {/* Shortcuts */}}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Shortcuts"
          >
            <Zap className="w-5 h-5" />
          </button>
          <button
            onClick={() => {/* Settings */}}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => {/* Info */}}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Info"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b px-4 py-1 flex items-center">
        <div className="flex items-center bg-gray-100 rounded px-3 py-1 text-sm">
          <span className="text-gray-700">{documentName}</span>
          <button className="ml-2 text-gray-500 hover:text-gray-700">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="absolute inset-0 cursor-pointer"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
        
        {/* Left Side Panels */}
        <div className="absolute left-4 top-4 space-y-2">
          {/* Add Node Button */}
          <button
            onClick={addNode}
            disabled={!selectedNode}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-green-600 disabled:opacity-50"
            title="Add Node"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          {/* Remove Node Button */}
          <button
            onClick={deleteNode}
            disabled={!selectedNode || selectedNode === mindMapData.rootId}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-red-600 disabled:opacity-50"
            title="Remove Node"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Right Side Panels */}
        <div className="absolute right-4 top-4 space-y-2">
          {/* Undo */}
          <button
            onClick={() => {/* Undo logic */}}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600"
            title="Undo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          {/* Redo */}
          <button
            onClick={() => {/* Redo logic */}}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600"
            title="Redo"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Right Zoom Controls */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.1))}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Settings */}}
            className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        
        {/* Edit Dialog */}
        {isEditing && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg border z-10">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishEditing();
                if (e.key === 'Escape') { setIsEditing(false); setEditText(''); }
              }}
              className="w-64 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text"
              autoFocus
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => { setIsEditing(false); setEditText(''); }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={finishEditing}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
