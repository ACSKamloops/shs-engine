
import React, { useState } from 'react';
import { Task } from '../types';
import { Gavel, Check, Download, Shield, BookOpen, Loader, FileText, X, AlertTriangle } from 'lucide-react';
import { generateJSON, downloadJSON } from '../utils/csvExporter';
import { generateDossierNarrative } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface FindingsViewProps {
  tasks: Task[];
}

const FindingsView: React.FC<FindingsViewProps> = ({ tasks }) => {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeCitationTask, setActiveCitationTask] = useState<Task | null>(null);
  
  const relevantTasks = tasks.filter(t => t.isRelevant);
  
  // Group by Record Type
  const recordTypes = Array.from(new Set(relevantTasks.map(t => t.recordType || 'Unclassified')));

  const handleExportJSON = () => {
      const data = generateJSON(relevantTasks);
      downloadJSON(data, "LexiScout_Verified_Evidence.json");
  };

  const handleSynthesize = async () => {
      setIsSynthesizing(true);
      try {
          const result = await generateDossierNarrative(relevantTasks);
          setNarrative(result);
      } catch (e) {
          console.error(e);
          setNarrative("Error generating narrative. Please try again.");
      } finally {
          setIsSynthesizing(false);
      }
  };

  const handleCitationClick = (id: string) => {
      // Logic: Strip brackets if passed "[D123]" -> "D123"
      const cleanId = id.replace(/[\[\]]/g, '');
      const task = tasks.find(t => t.id === cleanId || t.id.includes(cleanId));
      if (task) {
          setActiveCitationTask(task);
      } else {
          alert(`Record ${cleanId} not found in current queue.`);
      }
  };

  // Custom renderer for ReactMarkdown to detect citations
  const markdownComponents = {
      p: ({node, children}: any) => {
          // Flatten children to text to check regex
          return (
              <p className="mb-4">
                  {React.Children.map(children, child => {
                      if (typeof child === 'string') {
                          // Split by citation pattern [D...]
                          const parts = child.split(/(\[[D]\w+\])/g);
                          return parts.map((part, i) => {
                              if (part.match(/^\[D\w+\]$/)) {
                                  return (
                                      <span 
                                        key={i}
                                        onClick={() => handleCitationClick(part)}
                                        className="text-indigo-400 font-bold cursor-pointer hover:underline hover:text-indigo-300 mx-1"
                                        title="View Record Evidence"
                                      >
                                          {part}
                                      </span>
                                  );
                              }
                              return part;
                          });
                      }
                      return child;
                  })}
              </p>
          );
      }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 relative">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <Gavel className="text-indigo-500" />
                Legal Findings & Dossier
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl">
                Review verified evidence and synthesize the official "Counter-Narrative".
            </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
            <div className="text-3xl font-bold text-slate-100">{relevantTasks.length}</div>
            <div className="flex gap-2">
                <button 
                    onClick={handleSynthesize}
                    disabled={isSynthesizing || relevantTasks.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20">
                    {isSynthesizing ? <Loader className="animate-spin" size={16} /> : <BookOpen size={16} />}
                    Synthesize Narrative
                </button>
                <button 
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-medium transition-colors border border-slate-700">
                    <Download size={16} /> Export JSON
                </button>
            </div>
        </div>
      </div>

      {/* Narrative Section */}
      {narrative && (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                  <FileText className="text-indigo-400" size={24} />
                  <h3 className="text-xl font-bold text-slate-100">Executive Dossier: The Counter-Narrative</h3>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-serif leading-relaxed">
                  <ReactMarkdown components={markdownComponents}>
                      {narrative}
                  </ReactMarkdown>
              </div>
          </div>
      )}

      {/* Evidence Grid */}
      {recordTypes.map(type => {
          const groupTasks = relevantTasks.filter(t => t.recordType === type);
          if (groupTasks.length === 0) return null;

          return (
            <div key={type} className="space-y-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-200 uppercase tracking-wider">{type}</h3>
                    <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {groupTasks.map(task => (
                        <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs px-2 py-1 bg-slate-800 rounded text-slate-300 border border-slate-700">{task.id}</span>
                                    <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                                        Score: {task.relevanceScore}
                                    </span>
                                    {task.isPrivileged && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full bg-purple-500/10">
                                            <Shield size={10} /> PRIVILEGED
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500">{task.reviewedBy || 'AI System'}</span>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-slate-200 text-sm leading-relaxed border-l-2 border-emerald-500 pl-3">
                                    <span className="text-emerald-500 font-semibold text-xs uppercase block mb-1">Opinion</span>
                                    {task.legalOpinion}
                                </p>
                            </div>
                            
                            <div className="bg-slate-950 rounded p-3 text-xs font-mono text-slate-400 border border-slate-800/50 overflow-hidden">
                                <div className="flex justify-between mb-1 opacity-50">
                                    <span>SOURCE DATA</span>
                                </div>
                                <pre className="line-clamp-3 text-[10px] text-blue-200/50">{task.content}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          );
      })}

      {relevantTasks.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
              <p className="text-slate-500">No relevant findings yet. Please review data in the Queue.</p>
          </div>
      )}

      {/* Citation Modal */}
      {activeCitationTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                      <div>
                          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                              <AlertTriangle size={20} className="text-orange-500" />
                              Evidence Record: {activeCitationTask.id}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">{activeCitationTask.path}</p>
                      </div>
                      <button onClick={() => setActiveCitationTask(null)} className="text-slate-400 hover:text-white p-2">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="mb-6">
                           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Legal Opinion</h4>
                           <p className="text-slate-200 text-sm leading-relaxed border-l-4 border-indigo-500 pl-4 py-1 bg-slate-800/50 rounded-r">
                               {activeCitationTask.legalOpinion}
                           </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="bg-slate-950 p-3 rounded border border-slate-800">
                               <span className="block text-xs text-slate-500 mb-1">RECORD TYPE</span>
                               <span className="text-sm font-medium text-white">{activeCitationTask.recordType}</span>
                           </div>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800">
                               <span className="block text-xs text-slate-500 mb-1">BREACH CATEGORY</span>
                               <span className="text-sm font-medium text-red-400">{activeCitationTask.breachCategory || 'None'}</span>
                           </div>
                      </div>
                      <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Source Content</h4>
                          <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-xs font-mono text-slate-400 whitespace-pre-wrap overflow-x-auto max-h-60">
                              {activeCitationTask.content}
                          </pre>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-b-2xl flex justify-end">
                      <button 
                          onClick={() => setActiveCitationTask(null)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium">
                          Close Record
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FindingsView;
