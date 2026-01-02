import React, { useState } from 'react';
import { Task, CaseBundle } from '../types';
import { Briefcase, Plus, FolderOpen, Trash2, FileText, Download, PenTool, Loader } from 'lucide-react';
import { downloadJSON } from '../utils/csvExporter';
import { generateLegalArgument } from '../services/geminiService';

interface CaseBuilderProps {
    tasks: Task[];
}

const CaseBuilder: React.FC<CaseBuilderProps> = ({ tasks }) => {
    const [bundles, setBundles] = useState<CaseBundle[]>([
        { id: 'b1', title: 'Argument A: Sovereignty', description: 'Evidence of distinct Pukaist leadership.', evidenceIds: [] },
        { id: 'b2', title: 'Argument B: Land Trespass', description: 'Illegal pre-emptions and reductions.', evidenceIds: [] }
    ]);
    const [selectedBundleId, setSelectedBundleId] = useState<string>('b1');
    const [draftArgument, setDraftArgument] = useState<string | null>(null);
    const [isDrafting, setIsDrafting] = useState(false);

    const verifiedTasks = tasks.filter(t => t.isHumanVerified && t.isRelevant);
    const selectedBundle = bundles.find(b => b.id === selectedBundleId);

    const handleCreateBundle = () => {
        const title = prompt("Enter Bundle Name (e.g., 'Witness List')");
        if (title) {
            setBundles([...bundles, { id: `b${Date.now()}`, title, description: '', evidenceIds: [] }]);
        }
    };

    const toggleEvidenceInBundle = (taskId: string) => {
        if (!selectedBundle) return;
        const exists = selectedBundle.evidenceIds.includes(taskId);
        const newIds = exists 
            ? selectedBundle.evidenceIds.filter(id => id !== taskId)
            : [...selectedBundle.evidenceIds, taskId];
        
        setBundles(bundles.map(b => b.id === selectedBundleId ? { ...b, evidenceIds: newIds } : b));
    };

    const handleDraftArgument = async () => {
        if (!selectedBundle || selectedBundle.evidenceIds.length === 0) return;
        setIsDrafting(true);
        try {
            const bundleEvidence = tasks.filter(t => selectedBundle.evidenceIds.includes(t.id));
            const argument = await generateLegalArgument(selectedBundle.title, bundleEvidence);
            setDraftArgument(argument);
        } catch (e) {
            console.error(e);
            alert("Failed to draft argument.");
        } finally {
            setIsDrafting(false);
        }
    };

    const exportBundle = () => {
        if (!selectedBundle) return;
        const bundleEvidence = tasks.filter(t => selectedBundle.evidenceIds.includes(t.id));
        const report = {
            bundle_title: selectedBundle.title,
            generated_date: new Date().toISOString(),
            drafted_argument: draftArgument,
            evidence_count: bundleEvidence.length,
            records: bundleEvidence.map(t => ({
                id: t.id,
                opinion: t.legalOpinion,
                quote: t.keyEvidenceQuote,
                provenance: t.provenance
            }))
        };
        downloadJSON(JSON.stringify(report, null, 2), `${selectedBundle.title.replace(/\s/g,'_')}_Bundle.json`);
    };

    return (
        <div className="h-[calc(100vh-6rem)] grid grid-cols-12 gap-6">
            {/* Left: Bundle List */}
            <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        <Briefcase size={18} className="text-indigo-400" />
                        Case Bundles
                    </h3>
                    <button onClick={handleCreateBundle} className="p-1.5 bg-indigo-600 rounded text-white hover:bg-indigo-500">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {bundles.map(bundle => (
                        <div 
                            key={bundle.id}
                            onClick={() => { setSelectedBundleId(bundle.id); setDraftArgument(null); }}
                            className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedBundleId === bundle.id ? 'bg-indigo-900/20 border-indigo-500/50' : 'hover:bg-slate-800 border-transparent'}`}
                        >
                            <div className="font-bold text-sm text-slate-200 mb-1">{bundle.title}</div>
                            <div className="text-xs text-slate-500 truncate">{bundle.evidenceIds.length} records</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle: Evidence Selector */}
            <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="font-bold text-slate-200">Verified Evidence Pool</h3>
                    <p className="text-xs text-slate-500">Select evidence to add to {selectedBundle?.title}</p>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                     {verifiedTasks.length === 0 && (
                         <div className="p-8 text-center text-slate-500 text-sm italic">
                             No verified evidence available. Go to "Review Interface" and Verify records first.
                         </div>
                     )}
                     {verifiedTasks.map(task => {
                         const isAdded = selectedBundle?.evidenceIds.includes(task.id);
                         return (
                            <div 
                                key={task.id}
                                onClick={() => toggleEvidenceInBundle(task.id)}
                                className={`p-3 rounded border flex items-start gap-3 cursor-pointer ${isAdded ? 'bg-emerald-900/10 border-emerald-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center ${isAdded ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                    {isAdded && <Plus size={10} className="text-white" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-300 mb-0.5">{task.id}</div>
                                    <div className="text-xs text-slate-300 line-clamp-2">{task.legalOpinion}</div>
                                </div>
                            </div>
                         );
                     })}
                 </div>
            </div>

            {/* Right: Bundle Preview & Drafting */}
            <div className="col-span-5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <h3 className="font-bold text-slate-200">Legal Submission Draft</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDraftArgument}
                            disabled={isDrafting || !selectedBundle || selectedBundle.evidenceIds.length === 0}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded font-bold shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                        >
                            {isDrafting ? <Loader className="animate-spin" size={14} /> : <PenTool size={14} />} 
                            Draft Argument
                        </button>
                        <button onClick={exportBundle} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    {draftArgument ? (
                        <div className="prose prose-invert prose-sm max-w-none font-serif leading-relaxed">
                            <pre className="whitespace-pre-wrap font-serif text-slate-300">{draftArgument}</pre>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedBundle && selectedBundle.evidenceIds.length > 0 ? (
                                selectedBundle.evidenceIds.map(id => {
                                    const t = tasks.find(task => task.id === id);
                                    if (!t) return null;
                                    return (
                                        <div key={id} className="relative pl-4 border-l-2 border-slate-700">
                                            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                                            <div className="text-xs font-bold text-slate-400 mb-1">{t.recordType} ({t.timestamp.split('T')[0]})</div>
                                            <div className="text-sm text-slate-200 mb-2">{t.legalOpinion}</div>
                                            {t.keyEvidenceQuote && (
                                                <div className="text-xs text-indigo-400 italic bg-slate-900 p-2 rounded border border-slate-800">
                                                    "{t.keyEvidenceQuote}"
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-slate-600 mt-10">
                                    <FolderOpen size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Bundle is empty. Add verified evidence to begin drafting.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaseBuilder;