
import React, { useState, useEffect, useRef } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell, ReferenceLine, ReferenceArea,
  PieChart, Pie, Legend, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { QueueStats, Task } from '../types';
import { Scale, Users, FileStack, AlertTriangle, Calendar, XCircle, PlayCircle, ArrowRight, Loader, ShieldCheck, Gavel, Activity, Radar as RadarIcon, Clock } from 'lucide-react';

interface DashboardProps {
  stats: QueueStats;
  tasks: Task[];
  onStartQueue: () => void;
  onViewQueue: () => void;
  isProcessing: boolean;
}

const THEME_COLORS: Record<string, string> = {
  'Land_Reduction_Trespass': '#ef4444',     // Red
  'Governance_Sovereignty': '#3b82f6',      // Blue
  'Fiduciary_Duty_Negligence': '#f97316',   // Orange
  'Water_Rights_Fishing': '#06b6d4',        // Cyan
  'Coercion_Duress': '#a855f7',             // Purple
  'None': '#64748b'                         // Gray
};

const THEME_LABELS: Record<string, string> = {
  'Land_Reduction_Trespass': 'Land Trespass',
  'Governance_Sovereignty': 'Sovereignty',
  'Fiduciary_Duty_Negligence': 'Fiduciary Duty',
  'Water_Rights_Fishing': 'Water Rights',
  'Coercion_Duress': 'Coercion',
  'None': 'Unclassified'
};

const Dashboard: React.FC<DashboardProps> = ({ stats, tasks, onStartQueue, onViewQueue, isProcessing }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'evolution' | 'radar'>('timeline');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeRecord, setActiveRecord] = useState<Task | null>(null);

  // Robust Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect && entry.contentRect.width > 0) {
             requestAnimationFrame(() => {
                 setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
             });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // --- DATA PREPARATION ---
  
  const filteredTasks = selectedEntity 
    ? tasks.filter(t => 
        t.entities?.people?.includes(selectedEntity) || 
        t.entities?.locations?.includes(selectedEntity)
      )
    : tasks;
  
  // 1. Forensic Timeline Data (Scatter)
  const timelineData = filteredTasks
    .filter(t => t.isRelevant && t.timestamp && !t.timestamp.includes('1970'))
    .map(t => {
        const date = new Date(t.timestamp);
        const year = date.getFullYear();
        const yJitter = (Math.random() - 0.5) * 5; 
        return {
            x: isNaN(year) ? 1900 : year,
            y: (t.relevanceScore || 50) + yJitter,
            id: t.id,
            title: t.recordType,
            opinion: t.legalOpinion,
            breach: t.breachCategory || 'None',
            reliability: t.reliability,
            task: t 
        };
    })
    .sort((a, b) => a.x - b.x);

  // 2. Thematic Evolution Data (Stacked Area)
  const evolutionDataMap: Record<number, any> = {};
  const minYear = 1870;
  const maxYear = 1920;
  
  // Init buckets
  for(let y = minYear; y <= maxYear; y++) {
      evolutionDataMap[y] = { year: y, total: 0 };
      Object.keys(THEME_LABELS).forEach(k => evolutionDataMap[y][k] = 0);
  }

  filteredTasks.forEach(t => {
      if(!t.timestamp) return;
      const y = new Date(t.timestamp).getFullYear();
      if(y >= minYear && y <= maxYear) {
          const cat = t.breachCategory || 'None';
          evolutionDataMap[y][cat] = (evolutionDataMap[y][cat] || 0) + 1;
          evolutionDataMap[y].total += 1;
      }
  });
  
  // Smoothing (Rolling Average)
  const evolutionData = Object.values(evolutionDataMap).filter(d => d.total >= 0); // Keep all years for timeline continuity

  // 3. Entity Radar Data
  const radarData = Object.keys(THEME_LABELS).filter(k => k !== 'None').map(key => {
      const count = filteredTasks.filter(t => t.breachCategory === key).length;
      return {
          subject: THEME_LABELS[key],
          A: count,
          fullMark: filteredTasks.length
      };
  });

  // 4. Admissibility Audit Data
  const reliabilityCounts = { Verified: 0, Unverified: 0, Reconstructed: 0 };
  tasks.forEach(t => {
      if (t.reliability === 'Verified') reliabilityCounts.Verified++;
      else if (t.reliability === 'Unverified') reliabilityCounts.Unverified++;
      else reliabilityCounts.Reconstructed++;
  });
  const admissibilityData = [
      { name: 'Verified (Govt)', value: reliabilityCounts.Verified, fill: '#10b981' },
      { name: 'Unverified (Sec)', value: reliabilityCounts.Unverified, fill: '#f59e0b' },
      { name: 'Reconstructed', value: reliabilityCounts.Reconstructed, fill: '#6366f1' },
  ];

  // 5. Theme Distribution Data (Bar)
  const themeCounts: Record<string, number> = {};
  filteredTasks.forEach(t => {
      const cat = t.breachCategory || 'None';
      themeCounts[cat] = (themeCounts[cat] || 0) + 1;
  });
  const themeData = Object.entries(themeCounts)
    .filter(([key]) => key !== 'None')
    .map(([key, value]) => ({
        name: THEME_LABELS[key] || key,
        value,
        fill: THEME_COLORS[key] || '#64748b'
    }))
    .sort((a, b) => b.value - a.value);

  // 6. Entity Extraction
  const personCounts: Record<string, number> = {};
  filteredTasks.forEach(t => {
      t.entities?.people?.forEach(p => personCounts[p] = (personCounts[p] || 0) + 1);
  });
  const topPeople = Object.entries(personCounts).sort(([,a], [,b]) => b - a).slice(0, 5);

  const getEntityProfile = () => {
      if (!selectedEntity) return null;
      const years = filteredTasks
        .filter(t => t.timestamp && !t.timestamp.includes('1970'))
        .map(t => new Date(t.timestamp).getFullYear());
      return { minYear: Math.min(...years), maxYear: Math.max(...years), docCount: filteredTasks.length };
  };
  
  const entityProfile = getEntityProfile();

  // If entity is selected, default to Radar if we were in Evolution mode (since evolution works better for aggregate)
  useEffect(() => {
      if (selectedEntity && viewMode === 'evolution') setViewMode('radar');
  }, [selectedEntity]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* --- ACTION BANNER --- */}
      {isProcessing ? (
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-indigo-900/10">
              <div className="flex items-center gap-4">
                  <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 animate-pulse"></div>
                      <Loader className="animate-spin text-indigo-400 relative z-10" size={28} />
                  </div>
                  <div>
                      <h3 className="text-indigo-200 font-bold text-sm tracking-wide uppercase">Forensic Analysis Active</h3>
                      <p className="text-indigo-400/70 text-xs font-mono">Processing {stats.pending} records against Rulebook v2.0...</p>
                  </div>
              </div>
              <button onClick={onViewQueue} className="px-4 py-2 bg-indigo-600/20 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/50 flex items-center gap-2 hover:bg-indigo-600/30 transition-colors">
                  Monitor Queue <ArrowRight size={14} />
              </button>
          </div>
      ) : stats.pending > 0 ? (
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-5 flex items-center justify-between shadow-xl shadow-emerald-900/10 relative overflow-hidden group">
              <div className="relative z-10">
                  <h3 className="text-emerald-100 font-bold text-lg flex items-center gap-2">
                      <PlayCircle className="text-emerald-400" size={24} />
                      Intake Ready for Processing
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                      <span className="text-emerald-400/70 text-xs font-mono border-r border-emerald-500/20 pr-4">
                          {stats.pending} New Records
                      </span>
                      <span className="text-slate-500 text-xs">
                          Waiting for classification & thematic sharding.
                      </span>
                  </div>
              </div>
              <button onClick={onStartQueue} className="relative z-10 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 group-hover:translate-x-1">
                  Initiate Forensic Batch <ArrowRight size={16} />
              </button>
          </div>
      ) : null}

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Evidence Count" value={filteredTasks.length} icon={FileStack} color="text-slate-200" onClick={onViewQueue} />
        <StatCard title="Verified Records" value={reliabilityCounts.Verified} icon={ShieldCheck} color="text-emerald-400" />
        <StatCard title="Breaches Found" value={filteredTasks.filter(t => t.breachCategory && t.breachCategory !== 'None').length} icon={AlertTriangle} color="text-red-400" />
        <StatCard title="Key Entities" value={Object.keys(personCounts).length} icon={Users} color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* --- MAIN FORENSIC VISUALIZATION --- */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col min-w-0 shadow-lg">
          <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
             <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {viewMode === 'timeline' && <Clock size={18} className="text-indigo-500" />}
                    {viewMode === 'evolution' && <Activity size={18} className="text-emerald-500" />}
                    {viewMode === 'radar' && <RadarIcon size={18} className="text-purple-500" />}
                    
                    {viewMode === 'timeline' && "Forensic Timeline"}
                    {viewMode === 'evolution' && "Strata of Dispossession"}
                    {viewMode === 'radar' && "Entity Fingerprint"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                    {viewMode === 'timeline' && "Mapping events by Relevance vs. Time. Click dots to inspect."}
                    {viewMode === 'evolution' && "Volume of breaches over time, showing thematic dominance eras."}
                    {viewMode === 'radar' && "Comparative profile of Legal Themes for the selected dataset."}
                </p>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex gap-1">
                    <button 
                        onClick={() => setViewMode('timeline')} 
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Scatter Timeline"
                    >
                        <Clock size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('evolution')} 
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'evolution' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Thematic Evolution"
                    >
                        <Activity size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('radar')} 
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'radar' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Entity Radar"
                    >
                        <RadarIcon size={16} />
                    </button>
                </div>
                
                {selectedEntity && (
                    <button onClick={() => setSelectedEntity(null)} className="ml-2 text-indigo-400 hover:text-white p-1 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all" title="Clear Filter">
                        <XCircle size={18} />
                    </button>
                )}
             </div>
          </div>
          
          <div ref={containerRef} className="flex-1 min-h-[400px] relative">
            {dimensions.width > 0 && (
                <>
                {viewMode === 'timeline' && (
                    <ScatterChart width={dimensions.width} height={400} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis type="number" dataKey="x" name="Year" domain={[1875, 1920]} tickCount={10} stroke="#64748b" tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <YAxis type="number" dataKey="y" name="Relevance" domain={[40, 105]} stroke="#64748b" tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} tickLine={false} axisLine={false} label={{ value: 'Weight', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        
                        <ReferenceArea x1={1876} x2={1880} fill="#10b981" fillOpacity={0.05} label={{ value: "SPROAT", position: 'insideTop', fill: '#059669', fontSize: 10, opacity: 0.5 }} />
                        <ReferenceArea x1={1880} x2={1898} fill="#ef4444" fillOpacity={0.05} label={{ value: "O'REILLY", position: 'insideTop', fill: '#b91c1c', fontSize: 10, opacity: 0.5 }} />
                        <ReferenceArea x1={1913} x2={1916} fill="#f59e0b" fillOpacity={0.05} label={{ value: "MCKENNA", position: 'insideTop', fill: '#d97706', fontSize: 10, opacity: 0.5 }} />

                        <Scatter name="Events" data={timelineData} shape="circle" onClick={(data) => setActiveRecord(data.payload.task)} cursor="pointer">
                            {timelineData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={THEME_COLORS[entry.breach] || '#64748b'} fillOpacity={0.7} strokeWidth={1} stroke={THEME_COLORS[entry.breach]} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                )}

                {viewMode === 'evolution' && (
                    <AreaChart width={dimensions.width} height={400} data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            {Object.entries(THEME_COLORS).map(([key, color]) => (
                                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis dataKey="year" stroke="#64748b" tick={{fontSize: 10}} />
                        <YAxis stroke="#64748b" tick={{fontSize: 10}} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ fontSize: 12 }} />
                        {Object.keys(THEME_LABELS).filter(k => k !== 'None').map(key => (
                            <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={THEME_COLORS[key]} fill={`url(#color${key})`} name={THEME_LABELS[key]} />
                        ))}
                    </AreaChart>
                )}

                {viewMode === 'radar' && (
                    <div className="flex items-center justify-center h-full">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" width={400} height={400} data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name={selectedEntity || "Dataset"} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        </RadarChart>
                    </div>
                )}
                </>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN ANALYTICS --- */}
        <div className="xl:col-span-1 flex flex-col gap-6 min-w-0">
            
            {/* 1. ADMISSIBILITY AUDIT */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                 <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Gavel size={16} className="text-emerald-500" />
                    Admissibility Audit
                 </h3>
                 <div className="h-[180px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={admissibilityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {admissibilityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pr-14">
                        <span className="text-lg font-bold text-slate-200">{reliabilityCounts.Verified}</span>
                        <span className="block text-[8px] text-slate-500 uppercase">Verified</span>
                    </div>
                 </div>
            </div>

            {/* 2. THEMATIC DISTRIBUTION */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1">
                 <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Scale size={16} className="text-indigo-500" />
                    Thematic Weight
                 </h3>
                 <div className="space-y-3">
                     {themeData.map((theme) => (
                         <div key={theme.name} className="group">
                             <div className="flex justify-between text-xs mb-1">
                                 <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{theme.name}</span>
                                 <span className="font-mono text-slate-500">{theme.value}</span>
                             </div>
                             <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                 <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${(theme.value / (filteredTasks.length || 1)) * 100}%`, backgroundColor: theme.fill }}
                                 ></div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            {/* 3. ENTITY LIST */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 min-h-[200px] flex flex-col">
                <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    Dramatis Personae
                </h3>
                <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pr-1">
                    {topPeople.map(([name, count]) => (
                        <button 
                            key={name} 
                            onClick={() => setSelectedEntity(selectedEntity === name ? null : name)} 
                            className={`w-full flex items-center justify-between p-2 rounded text-left transition-all text-xs border ${selectedEntity === name ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-300' : 'hover:bg-slate-800 border-transparent text-slate-400'}`}
                        >
                            <span className="truncate">{name}</span>
                            <span className="px-1.5 py-0.5 bg-slate-950 rounded text-[10px] text-slate-600 font-mono">{count}</span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
      </div>

       {/* --- QUICK LOOK MODAL --- */}
       {activeRecord && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 pointer-events-none">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                      <div>
                          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                              <AlertTriangle size={16} className="text-orange-500" />
                              {activeRecord.id}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">{activeRecord.recordType} | {activeRecord.timestamp.split('T')[0]}</p>
                      </div>
                      <button onClick={() => setActiveRecord(null)} className="text-slate-400 hover:text-white p-1">
                          <XCircle size={20} />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="mb-4">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Legal Opinion</h4>
                           <p className="text-slate-200 text-sm leading-relaxed border-l-2 border-indigo-500 pl-3">
                               {activeRecord.legalOpinion}
                           </p>
                      </div>
                      <div className="mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Key Quote</h4>
                            <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-3 rounded-r">
                                <p className="text-xs text-indigo-100 font-serif italic">
                                    "{activeRecord.keyEvidenceQuote || "No direct quote extracted."}"
                                </p>
                            </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                           <div className="bg-slate-950 p-2 rounded border border-slate-800">
                               <span className="block text-[10px] text-slate-500 mb-1">PROVENANCE</span>
                               <span className="text-xs font-medium text-white break-words">{activeRecord.provenance}</span>
                           </div>
                           <div className="bg-slate-950 p-2 rounded border border-slate-800">
                               <span className="block text-[10px] text-slate-500 mb-1">BREACH</span>
                               <span className="text-xs font-medium" style={{ color: THEME_COLORS[activeRecord.breachCategory || 'None'] }}>
                                   {activeRecord.breachCategory || 'None'}
                               </span>
                           </div>
                      </div>
                  </div>
                  <div className="p-3 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end">
                      <button 
                          onClick={() => { setActiveRecord(null); onViewQueue(); }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700">
                          Open in Queue
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-2xl max-w-xs z-50 pointer-events-none">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500 text-[10px] font-mono">{data.x}</span>
                    <span className={`text-[10px] px-1.5 rounded ${data.reliability === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {data.reliability}
                    </span>
                </div>
                <p className="text-indigo-400 font-bold text-xs mb-1 font-mono">{data.id}</p>
                <p className="text-slate-200 text-sm font-semibold mb-2 leading-tight">{data.title}</p>
                <div className="text-[10px] font-bold uppercase mb-1" style={{ color: THEME_COLORS[data.breach] }}>
                    {THEME_LABELS[data.breach] || data.breach}
                </div>
                <p className="text-slate-400 text-xs italic line-clamp-3 border-l-2 border-slate-800 pl-2">
                    {data.opinion}
                </p>
                <div className="mt-2 text-[10px] text-slate-500 text-right">Click to view record</div>
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, value, icon: Icon, color, onClick, className }: any) => (
  <div onClick={onClick} className={`bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-all ${className || ''} ${onClick ? 'cursor-pointer group' : ''}`}>
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-2xl font-bold font-mono ${color} group-hover:scale-105 transition-transform origin-left`}>{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-slate-950 border border-slate-800 ${color.replace('text', 'text').replace('400', '500')} opacity-80`}>
      <Icon size={20} />
    </div>
  </div>
);

export default Dashboard;
