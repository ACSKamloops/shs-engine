
import React, { useRef } from 'react';
import { LayoutDashboard, Scale, FileSearch, Gavel, FileJson, Upload, Save, FolderOpen, Library, Briefcase, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onImportFiles: (files: FileList) => void;
  onSaveProject: () => void;
  onLoadProject: (jsonText: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onImportFiles, onSaveProject, onLoadProject }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Case Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Evidence Queue', icon: Scale },
    { id: 'review', label: 'Review Interface', icon: FileSearch },
    { id: 'ask', label: 'Ask the Archive', icon: MessageSquare }, // New Item
    { id: 'builder', label: 'Case Builder', icon: Briefcase },
    { id: 'findings', label: 'Forensic Findings', icon: Gavel },
    { id: 'logs', label: 'System Logs', icon: FileJson },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImportFiles(event.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProjectLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onLoadProject(text);
        if (projectInputRef.current) projectInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-indigo-400 tracking-wider flex items-center gap-2">
          <Library size={24} />
          LEXISCOUT
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Historical Forensics</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
          {/* Document Import Drop Zone Style */}
          <input 
            type="file" 
            accept=".json,.csv,.txt" 
            multiple
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
          <div className="relative group">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 border-dashed border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50 transition-all duration-200 group-hover:text-indigo-300"
            >
                <Upload size={20} className="text-slate-500 group-hover:text-indigo-400" />
                <span className="text-xs font-medium text-slate-400">Import Records</span>
                <span className="text-[10px] text-slate-600">JSON Transcripts, Archives</span>
            </button>
          </div>
          
          {/* Project Save/Load */}
          <input 
            type="file" 
            accept=".json" 
            ref={projectInputRef} 
            className="hidden" 
            onChange={handleProjectLoad}
          />
           <button
            onClick={() => projectInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-all duration-200"
          >
            <FolderOpen size={18} />
            Load Dossier
          </button>
          
          <button
            onClick={onSaveProject}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-all duration-200"
          >
            <Save size={18} />
            Save Dossier
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded p-3 text-xs font-mono text-slate-500">
          <p>Role: Forensic Historian</p>
          <p>Engine: Gemini 3.0 Pro</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-indigo-500">System Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
