/**
 * Document Stats Dashboard
 * Rich visual analytics with domain-specific charts and real-time updates
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDocsStore } from '../../store';
import { useStatsSocket } from '../../hooks/useStatsSocket';

interface ChartData {
  docs_by_theme: { name: string; count: number }[];
  docs_by_type: { name: string; count: number }[];
  breach_categories: { name: string; count: number }[];
  reliability_ratings: { A: number; B: number; C: number; D: number; unrated: number };
  timeline: { year: number; count: number }[];
  processing_status: { pending: number; done: number; flagged: number; processing: number };
  geo_coverage: { with_coords: number; in_treaty: number; in_reserve: number; total: number };
  forensic_stats: { with_key_quote: number; with_entities: number; with_summary: number; total: number };
  total_docs: number;
}

const THEME_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#6366f1', '#14b8a6', '#84cc16', '#f97316',
];

const RELIABILITY_COLORS = {
  A: '#10b981', B: '#06b6d4', C: '#f59e0b', D: '#ef4444', unrated: '#64748b',
};

const STATUS_COLORS = { done: '#10b981', pending: '#f59e0b', processing: '#06b6d4', flagged: '#ef4444' };

interface Props {
  onFilterChange?: (filter: { theme?: string; breach?: string; year?: number }) => void;
}

export function DocumentStatsDashboard({ onFilterChange }: Props) {
  const navigate = useNavigate();
  const docs = useDocsStore((s) => s.docs);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Real-time updates from WebSocket
  const { status: liveStatus, totalDocs: liveTotalDocs, connected } = useStatsSocket(true);

  const fetchCharts = useCallback(() => {
    const params = new URLSearchParams();
    if (dateRange.start) params.set('start_year', dateRange.start);
    if (dateRange.end) params.set('end_year', dateRange.end);
    
    fetch(`/admin/stats/charts?${params}`, {
      headers: { 'X-API-Key': localStorage.getItem('apiKey') || 'dev-token' },
    })
      .then((r) => r.json())
      .then(setChartData)
      .catch(() => setChartData(null))
      .finally(() => setLoading(false));
  }, [dateRange]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts, docs]);

  // Drill-down handlers
  const handleThemeClick = (name: string) => {
    if (onFilterChange) onFilterChange({ theme: name });
    else navigate(`/?theme=${encodeURIComponent(name)}`);
  };

  const handleBreachClick = (name: string) => {
    if (onFilterChange) onFilterChange({ breach: name });
    else navigate(`/?breach=${encodeURIComponent(name)}`);
  };

  const handleTimelineClick = (year: number) => {
    if (onFilterChange) onFilterChange({ year });
    else navigate(`/?year=${year}`);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-white/10 rounded" />
          <div className="h-4 w-16 bg-white/10 rounded" />
        </div>
        {/* KPI cards skeleton */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="h-6 w-12 bg-white/10 rounded mb-2 mx-auto" />
              <div className="h-3 w-16 bg-white/5 rounded mx-auto" />
            </div>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-40">
          <div className="h-4 w-32 bg-white/10 rounded mb-4" />
          <div className="flex items-end gap-2 h-24">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-1 bg-white/10 rounded" style={{ height: `${30 + Math.random() * 50}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return <div className="p-4 text-center text-slate-400">No data available</div>;
  }

  // Use live data if available
  const processingStatus = liveStatus || chartData.processing_status;
  const totalDocs = liveTotalDocs ?? chartData.total_docs;

  const statusData = [
    { name: 'Done', value: processingStatus.done, fill: STATUS_COLORS.done },
    { name: 'Pending', value: processingStatus.pending, fill: STATUS_COLORS.pending },
    { name: 'Processing', value: processingStatus.processing, fill: STATUS_COLORS.processing },
    { name: 'Flagged', value: processingStatus.flagged, fill: STATUS_COLORS.flagged },
  ].filter((d) => d.value > 0);

  const reliabilityData = Object.entries(chartData.reliability_ratings)
    .map(([name, value]) => ({ name, value, fill: RELIABILITY_COLORS[name as keyof typeof RELIABILITY_COLORS] }))
    .filter((d) => d.value > 0);

  const geoPct = chartData.geo_coverage.total > 0
    ? Math.round((chartData.geo_coverage.with_coords / chartData.geo_coverage.total) * 100)
    : 0;

  const forensicPct = chartData.forensic_stats.total > 0
    ? Math.round((chartData.forensic_stats.with_key_quote / chartData.forensic_stats.total) * 100)
    : 0;

  return (
    <div className="space-y-4 p-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-white">📊 Analytics</h4>
          {connected && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live" />}
        </div>
        <span className="text-sm text-slate-400">{totalDocs.toLocaleString()} docs</span>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-2 items-center">
        <input
          type="number"
          placeholder="Start Year"
          value={dateRange.start}
          onChange={(e) => setDateRange((d) => ({ ...d, start: e.target.value }))}
          className="w-24 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white"
        />
        <span className="text-slate-500">–</span>
        <input
          type="number"
          placeholder="End Year"
          value={dateRange.end}
          onChange={(e) => setDateRange((d) => ({ ...d, end: e.target.value }))}
          className="w-24 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white"
        />
        <button
          onClick={fetchCharts}
          className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30"
        >
          Filter
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
          <p className="text-xl font-bold text-emerald-400">{geoPct}%</p>
          <p className="text-xs text-slate-400">Geo Located</p>
        </div>
        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center cursor-pointer hover:bg-purple-500/20" onClick={() => handleThemeClick('treaty')}>
          <p className="text-xl font-bold text-purple-400">{chartData.geo_coverage.in_treaty}</p>
          <p className="text-xs text-slate-400">In Treaty</p>
        </div>
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-center">
          <p className="text-xl font-bold text-cyan-400">{chartData.geo_coverage.in_reserve}</p>
          <p className="text-xs text-slate-400">In Reserve</p>
        </div>
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
          <p className="text-xl font-bold text-amber-400">{forensicPct}%</p>
          <p className="text-xs text-slate-400">Key Quotes</p>
        </div>
      </div>

      {/* Reliability Rating */}
      {reliabilityData.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <h5 className="text-sm font-medium text-white/80 mb-2">Reliability Ratings</h5>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reliabilityData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                  {reliabilityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Breach Categories */}
      {chartData.breach_categories.length > 0 && chartData.breach_categories[0]?.name !== 'unclassified' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <h5 className="text-sm font-medium text-white/80 mb-2">Breach Categories</h5>
          <div className="flex flex-wrap gap-1">
            {chartData.breach_categories.slice(0, 8).map(({ name, count }, i) => (
              <span
                key={name}
                onClick={() => handleBreachClick(name)}
                className="px-2 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `${THEME_COLORS[i % THEME_COLORS.length]}20`, color: THEME_COLORS[i % THEME_COLORS.length] }}
              >
                {name}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {chartData.timeline.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <h5 className="text-sm font-medium text-white/80 mb-2">Timeline</h5>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.timeline} onClick={(e) => { const payload = (e as unknown as { activePayload?: Array<{ payload: { year: number } }> })?.activePayload?.[0]?.payload; if (payload) handleTimelineClick(payload.year); }}>
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status & Theme */}
      <div className="grid grid-cols-2 gap-3">
        {statusData.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <h5 className="text-xs font-medium text-white/80 mb-1">Status</h5>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={25} outerRadius={38} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {chartData.docs_by_theme.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <h5 className="text-xs font-medium text-white/80 mb-1">Themes</h5>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {chartData.docs_by_theme.slice(0, 5).map(({ name, count }, i) => (
                <div
                  key={name}
                  onClick={() => handleThemeClick(name)}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-white/5 rounded px-1 -mx-1"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: THEME_COLORS[i % THEME_COLORS.length] }} />
                  <span className="text-slate-300 truncate flex-1">{name}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
