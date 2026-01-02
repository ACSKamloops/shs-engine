
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { analyzeEvidence, generateOpposingCounselAnalysis } from '../services/geminiService';
import { Check, ShieldCheck, Loader, AlertTriangle, Scale, Quote, Gavel, FileText, Pin, BookOpen } from 'lucide-react';

interface ReviewInterfaceProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

const ReviewInterface: React.FC<ReviewInterfaceProps> = ({ tasks, onUpdateTask }) => {
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'raw'>('json');
  const [activeTab, setActiveTab] = useState<'coding' | 'opposition'>('coding');
  const [oppositionAnalysis, setOppositionAnalysis] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Partial<Task> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReaderMode, setIsReaderMode] = useState(false); // New Paper Mode state

  // Auto-select next pending task OR next unverified task
  useEffect(() => {
    if (!currentTaskId) {
        const next = tasks.find(t => t.status === 'PENDING') || tasks.find(t => t.status === 'COMPLETED' && !t.isHumanVerified);
        if (next) setCurrentTaskId(next.id);
    }
  }, [tasks, currentTaskId]);

  const currentTask = tasks.find(t => t.id === currentTaskId);

  // Initialize analysis result from existing task data if already analyzed
  useEffect(() => {
      if (currentTask && currentTask.status === 'COMPLETED' && !analysisResult) {
          setAnalysisResult({
              ...currentTask
          });
      } else if (currentTask && currentTask.status === 'PENDING' && !analysisResult) {
          setAnalysisResult(null); // Reset for new unanalyzed task
      }
      setOppositionAnalysis(null);
      setActiveTab('coding');
  }, [currentTask]);

  const handleManualVerdict = (relevant: boolean) => {
    if (!currentTask) return;
    onUpdateTask({
        ...currentTask,
        status: 'COMPLETED',
        isRelevant: relevant,
        legalOpinion: relevant ? "Manually marked relevant." : "Manually marked not relevant.",
        reviewedBy: 'Human Reviewer'
    });
    setAnalysisResult(null);
    setCurrentTaskId(null);
  };

  const handleVerifyAndLock = () => {
      if (!currentTask || !analysisResult) return;
      onUpdateTask({
          ...currentTask,
          ...analysisResult,
          status: 'COMPLETED',
          isHumanVerified: true,
          verifiedBy: 'Senior Counsel',
          verificationDate: new Date().toISOString()
      });
      setAnalysisResult(null);
      setCurrentTaskId(null); // Move to next
  };

  const togglePin = () => {
      if (!currentTask) return;
      onUpdateTask({
          ...currentTask,
          isPinned: !currentTask.isPinned
      });
  };

  const runAnalysis = async () => {
    if (!currentTask) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeEvidence(currentTask);
      setAnalysisResult(result);
    } catch (e) {
      setError("Analysis failed. Check connection or API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOppositionAnalysis = async () => {
      if (!currentTask) return;
      setIsAnalyzing(true);
      try {
          const result = await generateOpposingCounselAnalysis(currentTask);
          setOppositionAnalysis(result);
      } catch (e) {
          setError("Failed to generate opposition analysis.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const safeJsonStringify = (data: any) => {
      try {
          if (typeof data === 'string') {
              try { return JSON.stringify(JSON.parse(data), null, 4); } catch (e) { return data; }
          }
          return JSON.stringify(data || {}, null, 4);
      } catch (e) { return "Invalid JSON Structure"; }
  };

  if (!currentTask) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
            <Check size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-300">Queue Empty</h3>
        <p className="mt-2 text-sm">All uploaded records have been reviewed and verified.</p>
      </div>
    );
  }

  const isVerified = currentTask.isHumanVerified;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="p-2 bg-slate-800 rounded text-indigo-400 border border-slate-700">
                <FileText size={20} />
             </div>
             <div>
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    {currentTask.id}
                    {isVerified && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={10} /> VERIFIED</span>}
                </h3>
                <p className="text-xs text-slate-500 font-mono truncate max-w-xl">{currentTask.provenance}</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
               <button
                  onClick={togglePin}
                  className={`p-2 rounded transition-colors ${currentTask.isPinned ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title={currentTask.isPinned ? "Unpin Record" : "Pin Record to Shortlist"}
               >
                   <Pin size={16} fill={currentTask.isPinned ? "currentColor" : "none"} />
               </button>
               <div className="h-6 w-px bg-slate-800 mx-2"></div>
               <button 
                  onClick={() => setCurrentTaskId(null)} 
                  className="p-2 hover:bg-slate-800 rounded text-slate-500"
                  title="Skip"
               >
                   <span className="text-xs">Skip</span>
               </button>
           </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          
          {/* LEFT PANE: SOURCE DOCUMENT */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden relative">
               <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center z-10">
                   <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Material</span>
                       {/* Reader Mode Toggle */}
                       <button 
                            onClick={() => setIsReaderMode(!isReaderMode)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors border ${isReaderMode ? 'bg-[#fdfbf7] text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'}`}
                       >
                           <BookOpen size={10} /> {isReaderMode ? "Paper View" : "Reader Mode"}
                       </button>
                   </div>
                   <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                        <button onClick={() => setViewMode('json')} className={`px-2 py-0.5 text-[10px] rounded ${viewMode === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>JSON</button>
                        <button onClick={() => setViewMode('raw')} className={`px-2 py-0.5 text-[10px] rounded ${viewMode === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>TEXT</button>
                   </div>
               </div>
               
               {/* DOCUMENT CONTENT AREA */}
               <div className={`flex-1 overflow-auto p-6 transition-colors duration-300 ${isReaderMode ? 'bg-[#fdfbf7]' : 'bg-[#0d1117]'}`}>
                   <pre className={`whitespace-pre-wrap ${isReaderMode ? 'font-serif text-sm leading-relaxed text-slate-900' : 'font-mono text-xs leading-relaxed text-blue-100'}`}>
                        {viewMode === 'json' ? safeJsonStringify(currentTask.jsonContent) : currentTask.content}
                   </pre>
               </div>
          </div>

          {/* RIGHT PANE: ANALYSIS & OPPOSITION */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden relative">
              {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/80 z-20 flex items-center justify-center flex-col gap-4 backdrop-blur-sm">
                      <Loader className="animate-spin text-indigo-500" size={32} />
                      <span className="text-indigo-300 font-medium animate-pulse">Running Forensic Reasoning (Gemini 3.0 Pro)...</span>
                  </div>
              )}
              
              <div className="flex items-center border-b border-slate-800 bg-slate-950/50">
                   <button 
                        onClick={() => setActiveTab('coding')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'coding' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                   >
                       Forensic Analysis
                   </button>
                   <button 
                        onClick={() => { setActiveTab('opposition'); if (!oppositionAnalysis && analysisResult) runOppositionAnalysis(); }}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'opposition' ? 'border-red-500 text-red-400 bg-red-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        disabled={!analysisResult}
                   >
                       <Gavel size={14} /> Opposing Counsel
                   </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {error && <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded">{error}</div>}

                  {activeTab === 'coding' && (
                      !analysisResult ? (
                          <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-3 border-2 border-dashed border-slate-800 rounded-xl">
                              <Scale size={24} />
                              <p className="text-sm">No analysis generated yet.</p>
                              <button onClick={runAnalysis} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition-all">
                                  Run AI Analysis
                              </button>
                          </div>
                      ) : (
                          <>
                            {/* Relevance & Privilege Toggles */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded border text-center ${analysisResult.isRelevant ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                                    <span className="block text-[10px] font-bold uppercase mb-1">Relevance</span>
                                    <span className="text-lg font-bold">{analysisResult.isRelevant ? 'RELEVANT' : 'NOT RELEVANT'}</span>
                                </div>
                                <div className={`p-3 rounded border text-center ${analysisResult.isPrivileged ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                                    <span className="block text-[10px] font-bold uppercase mb-1">Privilege</span>
                                    <span className="text-lg font-bold">{analysisResult.isPrivileged ? 'YES' : 'NO'}</span>
                                </div>
                            </div>

                            {/* Legal Opinion */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Clerk's Summary (Factual)</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none min-h-[100px]"
                                    value={analysisResult.legalOpinion || ''}
                                    onChange={(e) => setAnalysisResult({...analysisResult, legalOpinion: e.target.value})}
                                />
                            </div>

                            {/* Smoking Gun */}
                            <div>
                                <label className="text-xs font-bold text-indigo-400 uppercase block mb-2 flex items-center gap-2">
                                    <Quote size={12} /> Key Evidence Quote
                                </label>
                                <textarea 
                                    className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded p-3 text-sm text-indigo-200 focus:border-indigo-500 focus:outline-none font-serif italic min-h-[80px]"
                                    value={analysisResult.keyEvidenceQuote || ''}
                                    onChange={(e) => setAnalysisResult({...analysisResult, keyEvidenceQuote: e.target.value})}
                                />
                            </div>

                            {/* Classifications */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Breach Category</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                                        value={analysisResult.breachCategory || 'None'}
                                        onChange={(e) => setAnalysisResult({...analysisResult, breachCategory: e.target.value as any})}
                                    >
                                        <option value="None">None</option>
                                        <option value="Land_Reduction_Trespass">Land Reduction & Trespass</option>
                                        <option value="Governance_Sovereignty">Governance & Sovereignty</option>
                                        <option value="Fiduciary_Duty_Negligence">Fiduciary Duty</option>
                                        <option value="Water_Rights_Fishing">Water Rights</option>
                                        <option value="Coercion_Duress">Coercion</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Reliability</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white"
                                        value={analysisResult.reliability || 'Unverified'}
                                        onChange={(e) => setAnalysisResult({...analysisResult, reliability: e.target.value as any})}
                                    >
                                        <option value="Verified">Verified (Primary)</option>
                                        <option value="Unverified">Unverified (Secondary)</option>
                                        <option value="Reconstructed">Reconstructed</option>
                                    </select>
                                </div>
                            </div>
                          </>
                      )
                  )}

                  {activeTab === 'opposition' && (
                      <div className="space-y-4">
                          <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-lg">
                              <h4 className="text-red-400 font-bold text-sm mb-2 uppercase flex items-center gap-2">
                                  <AlertTriangle size={16} /> Devil's Advocate
                              </h4>
                              <p className="text-xs text-slate-400 mb-4">
                                  Predicted counter-arguments from the Crown based on the document's content and provenance.
                              </p>
                              {oppositionAnalysis ? (
                                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
                                      {oppositionAnalysis}
                                  </pre>
                              ) : (
                                  <div className="text-center py-8">
                                      <button onClick={runOppositionAnalysis} className="text-xs text-red-400 border border-red-500/50 px-3 py-1.5 rounded hover:bg-red-900/50 transition-colors">
                                          Generate Critique
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
                  <button onClick={() => handleManualVerdict(false)} className="text-slate-500 hover:text-white text-sm font-medium px-3">
                      Discard
                  </button>
                  {analysisResult && activeTab === 'coding' && (
                      <button 
                        onClick={handleVerifyAndLock}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
                      >
                          <ShieldCheck size={18} />
                          VERIFY & LOCK RECORD
                      </button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ReviewInterface;
