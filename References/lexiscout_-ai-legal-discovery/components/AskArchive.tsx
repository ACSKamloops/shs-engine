
import React, { useState } from 'react';
import { Task } from '../types';
import { askTheArchive } from '../services/geminiService';
import { MessageSquare, Send, Search, Loader, BookOpen, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AskArchiveProps {
  tasks: Task[];
}

const AskArchive: React.FC<AskArchiveProps> = ({ tasks }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResponse(null);
    try {
        const result = await askTheArchive(query, tasks);
        setResponse(result);
        setHistory(prev => [{q: query, a: result}, ...prev]);
        setQuery('');
    } catch (e) {
        setResponse("Error querying the archive.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleAsk();
      }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Search size={24} className="text-indigo-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-100">Ask the Archive</h2>
                <p className="text-slate-400 text-sm">Use Gemini 3.0 Pro to perform contextual RAG queries across the entire document set.</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {history.length === 0 && !response && !isSearching && (
                <div className="text-center py-20 opacity-50">
                    <BookOpen size={48} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-500">Ask questions like:</p>
                    <ul className="text-sm text-slate-400 mt-2 space-y-1">
                        <li>"Summarize Tetlanetea's interactions with O'Reilly."</li>
                        <li>"List all water right denials in 1889."</li>
                        <li>"How does the archive define 'Spatsum' vs 'Pukaist'?"</li>
                    </ul>
                </div>
            )}

            {history.map((item, idx) => (
                <div key={idx} className="space-y-4 mb-8">
                    <div className="flex justify-end">
                        <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-tr-none max-w-2xl text-sm">
                            {item.q}
                        </div>
                    </div>
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">AI</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl rounded-tl-none max-w-3xl shadow-lg">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                <ReactMarkdown>{item.a}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {isSearching && (
                 <div className="flex justify-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <Loader size={14} className="animate-spin text-white" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl rounded-tl-none text-slate-400 text-sm flex items-center gap-2">
                        Reading documents and synthesizing answer...
                    </div>
                </div>
            )}
        </div>

        <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl flex items-center shadow-2xl relative z-10">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a forensic question about the evidence..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 px-4 py-2"
                disabled={isSearching}
            />
            <button 
                onClick={handleAsk}
                disabled={!query.trim() || isSearching}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send size={18} />
            </button>
        </div>
    </div>
  );
};

export default AskArchive;
