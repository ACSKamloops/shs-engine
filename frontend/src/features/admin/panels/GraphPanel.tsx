import { useState, useEffect, useCallback, useRef, useMemo, type WheelEvent, type PointerEvent } from 'react';
import { forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide } from 'd3-force';
import { useApi } from '../../../hooks';
import { useAppStore } from '../../../store';
import { exportJson } from '../AdminUtils';

export function GraphPanel() {
  const { api, useLiveApi } = useApi();
  const setBanner = useAppStore((s) => s.setBanner);
  const [theme, setTheme] = useState('');
  const [limitDocs, setLimitDocs] = useState(2000);
  const [includeEntities, setIncludeEntities] = useState(true);
  const [maxEntities, setMaxEntities] = useState(5);
  const [includeContradictions, setIncludeContradictions] = useState(true);
  const [maxContradictions, setMaxContradictions] = useState(500);
  const [graph, setGraph] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);

  type GraphNode = {
    id: string;
    type: string;
    label: string;
    data?: any;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  };
  type GraphEdge = { source: any; target: any; type: string };

  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphEdge[]>([]);
  const simRef = useRef<ReturnType<typeof forceSimulation> | null>(null);
  const [, bumpTick] = useState(0);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [docPreview, setDocPreview] = useState<any | null>(null);

  const width = 900;
  const height = 600;

  const load = useCallback(async () => {
    if (!useLiveApi) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (theme.trim()) params.set('theme', theme.trim());
      params.set('limit_docs', String(limitDocs));
      params.set('include_entities', String(includeEntities));
      params.set('max_entities_per_type_per_doc', String(maxEntities));
      params.set('include_contradictions', String(includeContradictions));
      params.set('max_contradictions', String(maxContradictions));
      const res = await api<any>(`/admin/graph?${params.toString()}`);
      setGraph({ nodes: res.nodes || [], edges: res.edges || [] });
      setSelectedNode(null);
    } catch (err) {
      setBanner(`Graph load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [
    api,
    includeContradictions,
    includeEntities,
    limitDocs,
    maxContradictions,
    maxEntities,
    setBanner,
    theme,
    useLiveApi,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const nodes: GraphNode[] = (graph.nodes || []).map((n) => ({
      id: String(n.id),
      type: String(n.type || 'unknown'),
      label: String(n.label || n.id),
      data: n.data,
    }));
    const links: GraphEdge[] = (graph.edges || []).map((e) => ({
      source: String(e.source),
      target: String(e.target),
      type: String(e.type || ''),
    }));
    nodesRef.current = nodes;
    linksRef.current = links;
    if (simRef.current) {
      simRef.current.stop();
    }
    if (!nodes.length) return;
    const sim = forceSimulation(nodes as any)
      .force('charge', forceManyBody().strength(-260))
      .force('center', forceCenter(width / 2, height / 2))
      .force(
        'link',
        forceLink(links as any)
          .id((d: any) => d.id)
          .distance((l: any) => (l.type === 'mentions' ? 140 : l.type === 'has_doc' ? 90 : 110))
      )
      .force('collide', forceCollide(18))
      .alpha(1)
      .on('tick', () => bumpTick((t) => t + 1));
    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [graph.edges, graph.nodes]);

  useEffect(() => {
    if (!selectedNode || selectedNode.type !== 'doc') {
      setDocPreview(null);
      return;
    }
    const parts = selectedNode.id.split(':');
    const docId = parts.length > 1 ? Number(parts[1]) : NaN;
    if (!useLiveApi || !docId || Number.isNaN(docId)) {
      setDocPreview(null);
      return;
    }
    api<any>(`/docs/${docId}`)
      .then((d) => setDocPreview(d))
      .catch(() => setDocPreview(null));
  }, [api, selectedNode, useLiveApi]);

  const nodesByType = useMemo(() => {
    const groups: Record<string, GraphNode[]> = {};
    for (const n of nodesRef.current) {
      (groups[n.type] ||= []).push(n);
    }
    return groups;
  }, [graph.nodes]);

  const colorFor = (t: string) => {
    if (t === 'theme') return '#60a5fa';
    if (t === 'doc') return '#34d399';
    if (t === 'entity') return '#fbbf24';
    if (t === 'contradiction') return '#f87171';
    return '#a78bfa';
  };

  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const panningRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onWheel = (e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => ({ ...v, k: Math.max(0.3, Math.min(3, v.k * delta)) }));
  };

  const onPanStart = (e: PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    panningRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
  };

  const onPanMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!panningRef.current) return;
    const dx = e.clientX - panningRef.current.sx;
    const dy = e.clientY - panningRef.current.sy;
    setView((v) => ({ ...v, x: panningRef.current!.ox + dx, y: panningRef.current!.oy + dy }));
  };

  const onPanEnd = () => {
    panningRef.current = null;
  };

  const draggingRef = useRef<string | null>(null);

  const onNodeDown = (n: GraphNode, e: PointerEvent) => {
    e.stopPropagation();
    draggingRef.current = n.id;
    n.fx = n.x;
    n.fy = n.y;
    simRef.current?.alphaTarget(0.3).restart();
  };

  const onNodeMove = (e: PointerEvent) => {
    const id = draggingRef.current;
    if (!id) return;
    const n = nodesRef.current.find((x) => x.id === id);
    if (!n) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = (e.clientX - rect.left - view.x) / view.k;
    const py = (e.clientY - rect.top - view.y) / view.k;
    n.fx = px;
    n.fy = py;
    bumpTick((t) => t + 1);
  };

  const onNodeUp = () => {
    if (!draggingRef.current) return;
    const n = nodesRef.current.find((x) => x.id === draggingRef.current);
    if (n) {
      n.fx = null;
      n.fy = null;
    }
    draggingRef.current = null;
    simRef.current?.alphaTarget(0);
  };

  const edges = linksRef.current;
  const nodes = nodesRef.current;

  const selectedEdgeKeys = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const s = new Set<string>();
    for (const e of edges) {
      const sid = typeof e.source === 'string' ? e.source : e.source.id;
      const tid = typeof e.target === 'string' ? e.target : e.target.id;
      if (sid === selectedNode.id || tid === selectedNode.id) {
        s.add(`${sid}->${tid}`);
      }
    }
    return s;
  }, [edges, selectedNode]);

  return (
    <div className="space-y-5">
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Knowledge Graph</h3>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm text-xs" onClick={() => void load()} disabled={loading}>
              Refresh
            </button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              onClick={() => exportJson('knowledge_graph.json', graph)}
              disabled={!graph.nodes.length}
            >
              Export JSON
            </button>
          </div>
        </div>
        {!useLiveApi && <p className="text-xs text-white/50">Demo mode: graph unavailable.</p>}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="glass p-3 md:col-span-3 space-y-2 text-xs">
            <label className="text-white/70">Theme filter</label>
            <input
              className="input w-full"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="alpha or Land_Reduction_Trespass"
            />
            <label className="text-white/70">Limit docs</label>
            <input
              className="input w-full"
              type="number"
              min={1}
              max={10000}
              value={limitDocs}
              onChange={(e) => setLimitDocs(Number(e.target.value))}
            />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={includeEntities} onChange={(e) => setIncludeEntities(e.target.checked)} />
              <span>Include entities</span>
            </label>
            {includeEntities && (
              <>
                <label className="text-white/70">Max entities / type / doc</label>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  max={50}
                  value={maxEntities}
                  onChange={(e) => setMaxEntities(Number(e.target.value))}
                />
              </>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeContradictions}
                onChange={(e) => setIncludeContradictions(e.target.checked)}
              />
              <span>Include contradictions</span>
            </label>
            {includeContradictions && (
              <>
                <label className="text-white/70">Max contradictions</label>
                <input
                  className="input w-full"
                  type="number"
                  min={0}
                  max={2000}
                  value={maxContradictions}
                  onChange={(e) => setMaxContradictions(Number(e.target.value))}
                />
              </>
            )}
            <button className="btn btn-primary btn-sm w-full" onClick={() => void load()} disabled={loading}>
              Apply
            </button>
            <div className="pt-2 text-[11px] text-white/60 space-y-1">
              {Object.entries(nodesByType).map(([t, arr]) => (
                <div key={t}>
                  {t}: {arr.length}
                </div>
              ))}
              <div>edges: {graph.edges.length}</div>
            </div>
          </div>

          <div className="glass p-3 md:col-span-6">
            <div className="w-full h-[620px] rounded bg-black/30 border border-white/5 overflow-hidden">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full touch-none"
                onWheel={onWheel}
                onPointerDown={onPanStart}
                onPointerMove={(e) => {
                  onPanMove(e);
                  onNodeMove(e);
                }}
                onPointerUp={onPanEnd}
                onPointerLeave={onPanEnd}
              >
                <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
                  {edges.map((e, i) => {
                    const s = e.source as any;
                    const t = e.target as any;
                    const sid = typeof e.source === 'string' ? e.source : s.id;
                    const tid = typeof e.target === 'string' ? e.target : t.id;
                    const key = `${sid}->${tid}`;
                    const highlighted = selectedEdgeKeys.has(key);
                    const sx = s.x ?? 0;
                    const sy = s.y ?? 0;
                    const tx = t.x ?? 0;
                    const ty = t.y ?? 0;
                    return (
                      <line
                        key={i}
                        x1={sx}
                        y1={sy}
                        x2={tx}
                        y2={ty}
                        stroke={highlighted ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)'}
                        strokeWidth={highlighted ? 2 : 1}
                      />
                    );
                  })}
                  {nodes.map((n) => {
                    const isSel = selectedNode?.id === n.id;
                    const r = n.type === 'theme' ? 9 : n.type === 'doc' ? 7 : n.type === 'contradiction' ? 6 : 5;
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(n);
                        }}
                        onPointerDown={(e) => onNodeDown(n, e)}
                        onPointerUp={onNodeUp}
                      >
                        <circle r={isSel ? r + 3 : r} fill={colorFor(n.type)} opacity={isSel ? 1 : 0.9} />
                        <text x={r + 4} y={3} fontSize={10} fill="white" opacity={0.9}>
                          {n.label.slice(0, 50)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
            <div className="mt-2 text-[11px] text-white/60">
              Scroll to zoom, drag background to pan, drag nodes to reposition.
            </div>
          </div>

          <div className="glass p-3 md:col-span-3 text-xs space-y-2">
            {!selectedNode && <div className="text-white/60">Select a node to inspect.</div>}
            {selectedNode && (
              <>
                <div className="text-sm font-semibold text-white">{selectedNode.label}</div>
                <div className="text-white/60">Type: {selectedNode.type}</div>
                {selectedNode.type === 'doc' && (
                  <>
                    {docPreview ? (
                      <div className="space-y-1">
                        <div className="text-white/80">{docPreview.title || docPreview.stable_id}</div>
                        <div className="text-white/60">Theme: {docPreview.theme || ''}</div>
                        <div className="text-white/60">Doc type: {docPreview.doc_type || ''}</div>
                        <div className="text-white/60">Date: {docPreview.inferred_date || ''}</div>
                        {docPreview.summary && (
                          <div className="mt-2 whitespace-pre-wrap text-white/80">{docPreview.summary}</div>
                        )}
                        {docPreview.file_path && (
                          <div className="mt-2 text-[11px] text-white/60 break-all">{docPreview.file_path}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/60">Loading document…</div>
                    )}
                  </>
                )}
                {selectedNode.type !== 'doc' && selectedNode.data && (
                  <pre className="whitespace-pre-wrap text-[11px] text-white/80 bg-black/40 rounded p-2 border border-white/5 max-h-64 overflow-auto">
                    {JSON.stringify(selectedNode.data, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
