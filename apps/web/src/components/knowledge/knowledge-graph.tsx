'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RefreshCw, Crosshair } from 'lucide-react';
import { CYBER_KB, type CyberKBArticle } from '@/lib/knowledge/cyber-kb';

// ── Category colour palette ──────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  'Phishing & Social Engineering': '#f87171',
  'Malware & Ransomware':          '#fb923c',
  'Incident Response':              '#facc15',
  'Network Security':               '#4ade80',
  'Identity & Access Management':   '#60a5fa',
  'Cloud Security':                 '#38bdf8',
  'Threat Intelligence':            '#a78bfa',
  'Web Application Security':       '#f472b6',
  'Endpoint Security':              '#34d399',
  'SOC & Detection':                '#e879f9',
  'Compliance & Governance':        '#94a3b8',
  'Secure Development':             '#fbbf24',
};

function hexAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Force simulation ─────────────────────────────────────────────────────────

interface SimNode extends CyberKBArticle {
  x: number; y: number;
  vx: number; vy: number;
}

interface SimEdge { source: SimNode; target: SimNode }

function buildGraph(articles: CyberKBArticle[]): { nodes: SimNode[]; edges: SimEdge[] } {
  const nodes: SimNode[] = articles.map(a => ({
    ...a,
    x: Math.random() * 800 + 100,
    y: Math.random() * 500 + 100,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
  }));

  // Connect articles in the same category
  const edges: SimEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].category === nodes[j].category) {
        edges.push({ source: nodes[i], target: nodes[j] });
      }
    }
  }
  return { nodes, edges };
}

function tickSimulation(nodes: SimNode[], edges: SimEdge[], width: number, height: number) {
  const cx = width / 2, cy = height / 2;
  const REPULSION = 3200;
  const SPRING_K = 0.015;
  const SPRING_LEN = 140;
  const CENTER_F = 0.003;
  const DAMPING = 0.88;

  // Repulsion between all nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist2 = dx * dx + dy * dy || 1;
      const dist = Math.sqrt(dist2);
      const force = REPULSION / dist2;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      nodes[i].vx -= fx; nodes[i].vy -= fy;
      nodes[j].vx += fx; nodes[j].vy += fy;
    }
  }

  // Spring attraction along edges
  for (const e of edges) {
    const dx = e.target.x - e.source.x;
    const dy = e.target.y - e.source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - SPRING_LEN) * SPRING_K;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    e.source.vx += fx; e.source.vy += fy;
    e.target.vx -= fx; e.target.vy -= fy;
  }

  // Centering force
  for (const n of nodes) {
    n.vx += (cx - n.x) * CENTER_F;
    n.vy += (cy - n.y) * CENTER_F;
    n.vx *= DAMPING;
    n.vy *= DAMPING;
    n.x += n.vx;
    n.y += n.vy;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface KnowledgeGraphProps {
  onBack: () => void;
  onSelectArticle: (article: CyberKBArticle) => void;
  articles?: CyberKBArticle[];
}

export function KnowledgeGraph({ onBack, onSelectArticle, articles = CYBER_KB }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<SimEdge[]>([]);
  const rafRef = useRef<number | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const hoveredRef = useRef<SimNode | null>(null);
  const selectedRef = useRef<SimNode | null>(null);
  const draggingRef = useRef<SimNode | null>(null);
  const panStartRef = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const isPanningRef = useRef(false);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const simActiveRef = useRef(true);

  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [zoom, setZoom] = useState(1);

  // Build simulation once
  useEffect(() => {
    const { nodes, edges } = buildGraph(articles);
    nodesRef.current = nodes;
    edgesRef.current = edges;
    simActiveRef.current = true;
    // Stop heavy simulation after 8 seconds to save CPU
    const stop = setTimeout(() => { simActiveRef.current = false; }, 8000);
    return () => clearTimeout(stop);
  }, [articles]);

  // Canvas resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      // Center initial view
      transformRef.current = { x: canvas.width * 0.5 - 450, y: canvas.height * 0.5 - 300, k: 0.9 };
      setZoom(0.9);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const hitTest = useCallback((clientX: number, clientY: number): SimNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const { x: tx, y: ty, k } = transformRef.current;
    const gx = (clientX - rect.left - tx) / k;
    const gy = (clientY - rect.top - ty) / k;
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const r = 8;
      if ((n.x - gx) ** 2 + (n.y - gy) ** 2 <= r * r * 2.5) return n;
    }
    return null;
  }, []);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (simActiveRef.current) {
        tickSimulation(nodesRef.current, edgesRef.current, canvas.width, canvas.height);
      }

      const { x: tx, y: ty, k } = transformRef.current;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const sel = selectedRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background grid
      ctx.save();
      ctx.strokeStyle = 'rgba(0,255,65,0.03)';
      ctx.lineWidth = 1;
      const gridSize = 60 * k;
      const offsetX = tx % gridSize;
      const offsetY = ty % gridSize;
      for (let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(k, k);

      // Edges
      for (const e of edges) {
        const connected = sel && (e.source === sel || e.target === sel);
        const color = connected ? CAT_COLORS[e.source.category] ?? '#00ff41' : '#ffffff';
        const alpha = connected ? 0.5 : 0.06;
        ctx.strokeStyle = hexAlpha(color, alpha);
        ctx.lineWidth = connected ? 1.5 / k : 1 / k;
        ctx.beginPath();
        ctx.moveTo(e.source.x, e.source.y);
        ctx.lineTo(e.target.x, e.target.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const color = CAT_COLORS[n.category] ?? '#94a3b8';
        const isSel = n === sel;
        const isHov = n === hoveredRef.current;
        const isConnected = !sel || isSel || edges.some(
          e => (e.source === sel && e.target === n) || (e.target === sel && e.source === n)
        );
        const r = isSel ? 11 : isHov ? 9 : 7;
        const fillAlpha = isConnected ? (isSel ? 0.95 : 0.8) : 0.12;
        const strokeAlpha = isConnected ? (isSel ? 1 : 0.6) : 0.08;

        if (isSel) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = hexAlpha(color, fillAlpha);
        ctx.fill();
        ctx.strokeStyle = hexAlpha(color, strokeAlpha);
        ctx.lineWidth = isSel ? 2 / k : 1.5 / k;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Hover ring
        if (isHov && !isSel) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4 / k, 0, Math.PI * 2);
          ctx.strokeStyle = hexAlpha(color, 0.5);
          ctx.lineWidth = 1 / k;
          ctx.stroke();
        }

        // Labels (always visible for selected, hover, or at zoom > 0.8)
        if (k >= 0.75 || isSel || isHov) {
          const label = n.title.length > 22 ? n.title.slice(0, 22) + '…' : n.title;
          const fontSize = Math.max(9, Math.min(13, 11 / k));
          ctx.font = `${isSel ? 600 : 400} ${fontSize}px "Fira Code", monospace`;
          ctx.fillStyle = isSel ? '#ffffff' : isConnected ? hexAlpha(color, 0.85) : 'rgba(255,255,255,0.15)';
          ctx.textAlign = 'center';
          ctx.fillText(label, n.x, n.y + r + 13 / k);
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e: MouseEvent) => {
      const node = hitTest(e.clientX, e.clientY);
      if (node !== hoveredRef.current) {
        hoveredRef.current = node;
        setHoveredNode(node);
        canvas.style.cursor = node ? 'pointer' : (isPanningRef.current ? 'grabbing' : 'grab');
      }
      if (draggingRef.current) {
        const { k } = transformRef.current;
        draggingRef.current.x += e.movementX / k;
        draggingRef.current.y += e.movementY / k;
        draggingRef.current.vx = 0;
        draggingRef.current.vy = 0;
      } else if (isPanningRef.current) {
        transformRef.current.x = panStartRef.current.tx + (e.clientX - panStartRef.current.mx);
        transformRef.current.y = panStartRef.current.ty + (e.clientY - panStartRef.current.my);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
      const node = hitTest(e.clientX, e.clientY);
      if (node) {
        draggingRef.current = node;
        canvas.style.cursor = 'grabbing';
      } else {
        isPanningRef.current = true;
        panStartRef.current = { mx: e.clientX, my: e.clientY, tx: transformRef.current.x, ty: transformRef.current.y };
        canvas.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const dx = e.clientX - mouseDownPosRef.current.x;
      const dy = e.clientY - mouseDownPosRef.current.y;
      const didDrag = Math.sqrt(dx * dx + dy * dy) > 4;

      if (!didDrag) {
        const node = hitTest(e.clientX, e.clientY);
        if (node) {
          selectedRef.current = node;
          setSelectedNode(node);
        } else {
          selectedRef.current = null;
          setSelectedNode(null);
        }
      }

      draggingRef.current = null;
      isPanningRef.current = false;
      canvas.style.cursor = hitTest(e.clientX, e.clientY) ? 'pointer' : 'grab';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const { x: tx, y: ty, k } = transformRef.current;
      const newK = Math.max(0.1, Math.min(4, k * factor));
      transformRef.current = {
        x: mx - (mx - tx) * (newK / k),
        y: my - (my - ty) * (newK / k),
        k: newK,
      };
      setZoom(newK);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [hitTest]);

  const zoomBy = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const { x: tx, y: ty, k } = transformRef.current;
    const newK = Math.max(0.1, Math.min(4, k * factor));
    transformRef.current = {
      x: cx - (cx - tx) * (newK / k),
      y: cy - (cy - ty) * (newK / k),
      k: newK,
    };
    setZoom(newK);
  };

  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    transformRef.current = { x: canvas.width * 0.5 - 450, y: canvas.height * 0.5 - 300, k: 0.9 };
    setZoom(0.9);
  };

  const centerOnSelected = () => {
    const sel = selectedRef.current;
    const canvas = canvasRef.current;
    if (!sel || !canvas) return;
    const k = transformRef.current.k;
    transformRef.current = {
      x: canvas.width / 2 - sel.x * k,
      y: canvas.height / 2 - sel.y * k,
      k,
    };
  };

  const categories = Array.from(new Set(articles.map(a => a.category)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 620, position: 'relative' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(0,255,65,0.1)', background: 'rgba(0,0,0,0.5)', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00ff41', background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-fira-code, monospace)', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,65,0.08)'; }}
        >
          <ArrowLeft size={13} /> BACK TO LIBRARY
        </button>
        <div style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.72rem', color: '#00ff41', opacity: 0.5 }}>
          // {articles.length} nodes · {edgesRef.current.length} edges · {(zoom * 100).toFixed(0)}% zoom
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => zoomBy(1.2)} style={btnStyle} title="Zoom in"><ZoomIn size={13} /></button>
          <button onClick={() => zoomBy(0.8)} style={btnStyle} title="Zoom out"><ZoomOut size={13} /></button>
          <button onClick={resetView} style={btnStyle} title="Reset view"><RefreshCw size={13} /></button>
          {selectedNode && <button onClick={centerOnSelected} style={btnStyle} title="Center on selection"><Crosshair size={13} /></button>}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#030303' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

        {/* Hover tooltip */}
        {hoveredNode && !selectedNode && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.92)', border: `1px solid ${CAT_COLORS[hoveredNode.category] ?? '#00ff41'}40`, borderRadius: 8, padding: '10px 16px', pointerEvents: 'none', maxWidth: 320, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.78rem', fontWeight: 700, color: CAT_COLORS[hoveredNode.category] ?? '#00ff41', marginBottom: 4 }}>
              {hoveredNode.title}
            </div>
            <div style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.65rem', color: '#475569' }}>
              {hoveredNode.category} · {hoveredNode.readingMinutes} min · {hoveredNode.difficulty}
            </div>
          </div>
        )}

        {/* Selected node card */}
        {selectedNode && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(5,5,5,0.96)', border: `1px solid ${CAT_COLORS[selectedNode.category] ?? '#00ff41'}50`, borderRadius: 10, padding: '16px 20px', width: 360, boxShadow: `0 0 32px ${CAT_COLORS[selectedNode.category] ?? '#00ff41'}20` }}>
            <div style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.65rem', color: CAT_COLORS[selectedNode.category] ?? '#00ff41', opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {selectedNode.category}
            </div>
            <div style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8, lineHeight: 1.35 }}>
              {selectedNode.title}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, marginBottom: 12 }}>
              {selectedNode.summary.slice(0, 140)}…
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => onSelectArticle(selectedNode)}
                style={{ flex: 1, fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.72rem', fontWeight: 700, color: '#000', background: CAT_COLORS[selectedNode.category] ?? '#00ff41', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}
              >
                Read Article →
              </button>
              <button
                onClick={() => { selectedRef.current = null; setSelectedNode(null); }}
                style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.7rem', color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 12px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 16px', borderTop: '1px solid rgba(0,255,65,0.08)', background: 'rgba(0,0,0,0.4)', flexShrink: 0 }}>
        {categories.map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: CAT_COLORS[cat] ?? '#94a3b8', display: 'inline-block', boxShadow: `0 0 4px ${CAT_COLORS[cat] ?? '#94a3b8'}` }} />
            <span style={{ fontFamily: 'var(--font-fira-code, monospace)', fontSize: '0.6rem', color: '#475569' }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30,
  background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
  borderRadius: 6, cursor: 'pointer', color: '#00ff41', opacity: 0.7,
  transition: 'opacity 150ms, background 150ms',
};
