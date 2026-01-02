import React, { useState } from 'react';
import { AgentLog } from '../types';
import { Terminal, ChevronDown, ChevronRight, Bug } from 'lucide-react';

interface AgentLogViewProps {
  logs: AgentLog[];
}

const LogEntry: React.FC<{ log: AgentLog }> = ({ log }) => {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
          case 'GREEN': return 'text-emerald-400';
          case 'YELLOW': return 'text-yellow-400';
          case 'RED': return 'text-red-400';
          case 'BLUE': return 'text-blue-400';
          default: return 'text-slate-400';
        }
      };

    return (
        <div className="hover:bg-slate-900/50 p-2 rounded transition-colors group border border-transparent hover:border-slate-800">
             <div className="flex gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                 <div className="text-slate-600 shrink-0 select-none font-mono text-xs pt-1">{log.timestamp}</div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2">
                        {log.promptUsed ? (
                            expanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />
                        ) : <div className="w-3.5"></div>}
                        <span className="text-indigo-400 font-bold">[{log.agentName}]</span>
                        <span className={`font-bold ${getStatusColor(log.status)}`}>{log.status}:</span>
                        <span className="text-slate-300">{log.message}</span>
                    </div>
                    {log.details && (
                        <div className="mt-1 ml-6 pl-3 border-l-2 border-slate-800 text-slate-500 text-xs">
                            {log.details}
                        </div>
                    )}
                 </div>
             </div>
             
             {expanded && log.promptUsed && (
                 <div className="mt-2 ml-14 p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-400">
                     <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold border-b border-slate-800 pb-1">
                         <Bug size={12} /> DIAGNOSTICS
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                         <div>
                             <span className="text-slate-500 block mb-1">PROMPT SENT:</span>
                             <pre className="whitespace-pre-wrap bg-slate-900/50 p-2 rounded text-slate-300">{log.promptUsed}</pre>
                         </div>
                         <div>
                             <span className="text-slate-500 block mb-1">RAW RESPONSE:</span>
                             <pre className="whitespace-pre-wrap bg-slate-900/50 p-2 rounded text-emerald-300">{log.rawResponse}</pre>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

const AgentLogView: React.FC<AgentLogViewProps> = ({ logs }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-sm h-[calc(100vh-8rem)] flex flex-col shadow-2xl">
      <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center gap-2">
        <Terminal size={16} className="text-slate-500" />
        <span className="text-slate-400 font-semibold">Agent Communication Log</span>
        <span className="ml-auto text-xs text-slate-600">{logs.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono">
        {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
        ))}
        <div className="animate-pulse text-emerald-500/50 pt-2 pl-4">_</div>
      </div>
    </div>
  );
};

export default AgentLogView;