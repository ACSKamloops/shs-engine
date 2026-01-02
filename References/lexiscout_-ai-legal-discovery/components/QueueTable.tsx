
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Clock, CheckCircle, AlertCircle, PlayCircle, StopCircle, Scale, Search, Download, Filter, Eye, ChevronLeft, ChevronRight, FileJson, ShieldAlert, Database } from 'lucide-react';

interface QueueTableProps {
  tasks: Task[];
  isProcessing: boolean;
  onProcessQueue: () => void;
  onStopQueue: () => void;
  onExport: (tasks: Task[], filename: string, format: 'csv' | 'json') => void;
}

const QueueTable: React.FC<QueueTableProps> = ({ tasks, isProcessing, onProcessQueue, onStopQueue, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, minScore, tasks.length]);

  const getStatusIcon = (status: string) => {
    switch(status) {
        case 'COMPLETED': return <CheckCircle size={14} className="text-emerald-500" />;
        case 'IN_PROGRESS': return <PlayCircle size={14} className="text-indigo-500 animate-pulse" />;
        case 'PENDING': return <Clock size={14} className="text-slate-500" />;
        default: return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  const getRelevanceBadge = (level?: string) => {
      if (!level) return <span className="text-slate-600">-</span>;
      switch(level) {
          case 'Hot': return <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white rounded shadow-sm shadow-red-900/50">HOT</span>;
          case 'Relevant': return <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-500 text-white rounded">RELEVANT</span>;
          case 'Privileged': return <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-500 text-white rounded">PRIVILEGED</span>;
          default: return <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded">JUNK</span>;
      }
  }

  const formatSize = (str: string) => {
      const bytes = str.length;
      if (bytes < 1024) return `${bytes} B`;
      return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
        task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const effectiveScore = task.relevanceScore !== undefined ? task.relevanceScore : 0;
    const matchesScore = effectiveScore >= minScore;

    return matchesSearch && matchesScore;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-950">
        <div className="flex items-center gap-4 w-full xl:w-auto">
             <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <Scale size={18} className="text-indigo-400" />
                 </div>
                 <h3 className="font-semibold text-slate-200">Evidence Queue</h3>
             </div>
             <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700 font-mono">
                {filteredTasks.length} items
             </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
             <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors focus-within:border-indigo-500/50">
                 <Filter size={12} className="text-slate-500 mr-2" />
                 <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Min Score:</span>
                 <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                    className="w-10 bg-transparent text-xs text-slate-200 focus:outline-none font-mono text-right"
                 />
             </div>

             <div className="relative flex-grow sm:flex-grow-0">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search contents..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition-all"
                />
             </div>
             
             <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

             <div className="flex items-center gap-2">
                 <button 
                     onClick={() => onExport(filteredTasks, `LexiScout_Export`, 'json')}
                     className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all text-xs font-medium">
                     <FileJson size={14} /> JSON Export
                 </button>
             </div>

             <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

             {isProcessing ? (
                 <button 
                    onClick={onStopQueue}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-bold animate-pulse">
                    <StopCircle size={14} /> STOP REVIEW
                 </button>
             ) : (
                 <button 
                    onClick={onProcessQueue}
                    disabled={pendingCount === 0}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20 border border-indigo-500/50">
                    <PlayCircle size={14} /> START AUTO-REVIEW ({pendingCount})
                 </button>
             )}
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-950 text-slate-400 font-medium uppercase text-xs sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3 w-32 border-b border-slate-800">ID</th>
              <th className="px-4 py-3 w-32 border-b border-slate-800 text-center">Status</th>
              <th className="px-4 py-3 w-40 border-b border-slate-800">Type</th>
              <th className="px-4 py-3 w-24 border-b border-slate-800 text-center">Score</th>
              <th className="px-4 py-3 w-32 border-b border-slate-800 text-center">Finding</th>
              <th className="px-4 py-3 border-b border-slate-800">Legal Opinion / Content</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginatedTasks.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        {tasks.length === 0 ? "Import data (JSON/CSV) to begin e-discovery." : "No records match your search."}
                    </td>
                </tr>
            ) : (
                paginatedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 group-hover:text-slate-300">
                        {task.id.split('_').pop()}
                        <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-1">
                            <Database size={10} /> {formatSize(task.content)}
                        </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                            {getStatusIcon(task.status)}
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        {task.recordType ? (
                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">
                                {task.recordType}
                            </span>
                        ) : <span className="text-slate-600 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                         <span className={`font-bold font-mono ${task.relevanceScore && task.relevanceScore > 70 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {task.relevanceScore || '-'}
                         </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                             {getRelevanceBadge(task.relevanceLevel)}
                             {task.isPrivileged && <ShieldAlert size={12} className="text-purple-400" title="Privileged" />}
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 max-w-2xl">
                             {task.legalOpinion && (
                                 <p className="text-xs text-indigo-300 font-medium line-clamp-2">
                                    <span className="text-slate-500 font-normal mr-1">Opinion:</span>
                                    {task.legalOpinion}
                                 </p>
                             )}
                             <div className="flex items-center gap-2 text-slate-500 text-xs opacity-75 font-mono">
                                <Eye size={10} />
                                <span className="truncate max-w-md">{task.content.substring(0, 100).replace(/\n/g, ' ')}...</span>
                             </div>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
           <div className="text-xs text-slate-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTasks.length)} of {filteredTasks.length} entries
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-2 text-xs font-mono text-slate-300">
                Page {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default QueueTable;
