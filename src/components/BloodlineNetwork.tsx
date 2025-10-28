import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GitBranch, ExternalLink } from 'lucide-react';
import { BloodlineNode } from '../services/bloodlineService';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  data: BloodlineNode;
  isCurrent: boolean;
}

interface Props {
  nodes: BloodlineNode[];
  currentNodeId: string;
}

export default function BloodlineNetwork({ nodes, currentNodeId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const animationFrameRef = useRef<number>();
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = Math.max(800, nodes.length * 100);

    const nodeMap = new Map<string, NetworkNode>();

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.3;
      const centerX = width / 2;
      const centerY = height / 2;

      nodeMap.set(node.id, {
        id: node.id,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        data: node,
        isCurrent: node.id === currentNodeId,
      });
    });

    setNetworkNodes(Array.from(nodeMap.values()));

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, currentNodeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const height = Math.max(800, nodes.length * 100);
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const animate = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const updatedNodes = [...networkNodes];

      updatedNodes.forEach((node) => {
        let fx = 0;
        let fy = 0;

        updatedNodes.forEach((other) => {
          if (node.id === other.id) return;

          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const hasConnection =
            node.data.parent_revival_id === other.id ||
            other.data.parent_revival_id === node.id;

          if (hasConnection) {
            const springForce = (dist - 150) * 0.01;
            fx += (dx / dist) * springForce;
            fy += (dy / dist) * springForce;
          } else {
            const repelForce = 2000 / (dist * dist);
            fx -= (dx / dist) * repelForce;
            fy -= (dy / dist) * repelForce;
          }
        });

        const centerX = width / 2;
        const centerY = height / 2;
        const toCenterX = centerX - node.x;
        const toCenterY = centerY - node.y;
        const centerDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
        fx += (toCenterX / centerDist) * 0.001;
        fy += (toCenterY / centerDist) * 0.001;

        node.vx = (node.vx + fx) * 0.85;
        node.vy = (node.vy + fy) * 0.85;

        node.x += node.vx;
        node.y += node.vy;

        const padding = 50;
        if (node.x < padding) node.x = padding;
        if (node.x > width - padding) node.x = width - padding;
        if (node.y < padding) node.y = padding;
        if (node.y > height - padding) node.y = height - padding;
      });

      setNetworkNodes(updatedNodes);

      updatedNodes.forEach((node) => {
        updatedNodes.forEach((other) => {
          if (node.data.parent_revival_id === other.id) {
            const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            gradient.addColorStop(0, 'rgba(0, 255, 144, 0.3)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 255, 144, 0.3)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();

            const angle = Math.atan2(other.y - node.y, other.x - node.x);
            const arrowSize = 10;
            const arrowX = other.x - Math.cos(angle) * 30;
            const arrowY = other.y - Math.sin(angle) * 30;

            ctx.fillStyle = 'rgba(0, 255, 144, 0.8)';
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
              arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
              arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
              arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
        });
      });

      updatedNodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const nodeRadius = node.isCurrent ? 35 : 25;

        if (node.isCurrent || isHovered || isSelected) {
          const glowRadius = nodeRadius + 15;
          const gradient = ctx.createRadialGradient(node.x, node.y, nodeRadius, node.x, node.y, glowRadius);
          gradient.addColorStop(0, 'rgba(0, 255, 144, 0.4)');
          gradient.addColorStop(1, 'rgba(0, 255, 144, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        const gradient = ctx.createRadialGradient(
          node.x - nodeRadius / 3,
          node.y - nodeRadius / 3,
          0,
          node.x,
          node.y,
          nodeRadius
        );

        if (node.isCurrent) {
          gradient.addColorStop(0, '#00ff90');
          gradient.addColorStop(1, '#00cc70');
        } else {
          gradient.addColorStop(0, '#2a2a2a');
          gradient.addColorStop(1, '#1a1a1a');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = node.isCurrent ? '#00ff90' : isHovered || isSelected ? '#00ff90' : '#444';
        ctx.lineWidth = node.isCurrent ? 3 : 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = node.isCurrent ? '#000' : '#00ff90';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`D${node.data.depth}`, node.x, node.y);

        ctx.fillStyle = node.isCurrent ? '#000' : '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(node.data.title.substring(0, 15), node.x, node.y - nodeRadius - 10);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [networkNodes, hoveredNode, selectedNode, nodes.length]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = networkNodes.find((node) => {
      const nodeRadius = node.isCurrent ? 35 : 25;
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= nodeRadius;
    });

    setSelectedNode(clickedNode || null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y };

    const hoveredNode = networkNodes.find((node) => {
      const nodeRadius = node.isCurrent ? 35 : 25;
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= nodeRadius;
    });

    setHoveredNode(hoveredNode || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        className="w-full"
      />

      {selectedNode && (
        <div className="absolute top-4 right-4 bg-zinc-900 border-2 border-primary rounded-lg p-6 max-w-md shadow-2xl">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 text-zinc-400 hover:text-white"
          >
            ✕
          </button>

          <div className="flex items-start gap-3 mb-4">
            <img
              src={selectedNode.data.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
              alt={selectedNode.data.username}
              className="w-12 h-12 rounded-full border-2 border-primary object-cover"
            />
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">{selectedNode.data.title}</h3>
              <p className="text-zinc-400 text-sm">by @{selectedNode.data.username}</p>
            </div>
          </div>

          <p className="text-zinc-300 text-sm mb-4">{selectedNode.data.description}</p>

          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-white">{selectedNode.data.blessing_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <span className="text-zinc-400">Depth {selectedNode.data.depth}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            {selectedNode.data.github_url && (
              <a
                href={selectedNode.data.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-3 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors rounded"
              >
                <ExternalLink className="w-3 h-3" />
                GitHub
              </a>
            )}
            {selectedNode.data.deployed_url && (
              <a
                href={selectedNode.data.deployed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs px-3 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors rounded"
              >
                <ExternalLink className="w-3 h-3" />
                Live Site
              </a>
            )}
          </div>

          <Link
            to={`/revivals/${selectedNode.id}`}
            className="block w-full text-center bg-primary text-black py-2 font-bold hover:bg-primary/80 transition-colors rounded"
          >
            View Revival Details
          </Link>
        </div>
      )}

      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="text-white font-bold">Network Legend</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 border-2 border-primary"></div>
            <span className="text-zinc-400">Current Revival</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-zinc-600"></div>
            <span className="text-zinc-400">Other Revivals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-cyan-500"></div>
            <span className="text-zinc-400">Evolution Chain</span>
          </div>
        </div>
        <p className="text-zinc-500 text-xs mt-3">
          Click any node to view details. Nodes repel each other while connected nodes attract, creating an organic network visualization.
        </p>
      </div>
    </div>
  );
}
