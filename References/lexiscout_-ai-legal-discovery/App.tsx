
import React, { useState, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import QueueTable from './components/QueueTable';
import ReviewInterface from './components/ReviewInterface';
import FindingsView from './components/FindingsView';
import AgentLogView from './components/AgentLogView';
import CaseBuilder from './components/CaseBuilder';
import AskArchive from './components/AskArchive'; // New Import
import { MOCK_TASKS, MOCK_LOGS } from './mockData';
import { Task, AgentLog } from './types';
import { processFiles } from './utils/documentLoader';
import { generateCSV, downloadCSV, generateJSON, downloadJSON } from './utils/csvExporter';
import { analyzeEvidence } from './services/geminiService';
import { Loader, UploadCloud } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [logs, setLogs] = useState<AgentLog[]>(MOCK_LOGS);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("Initializing...");
  
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const shouldProcessRef = useRef(false);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      relevant: tasks.filter(t => t.isRelevant).length,
      privileged: tasks.filter(t => t.isPrivileged).length,
      verified: tasks.filter(t => t.isHumanVerified).length,
      pinned: tasks.filter(t => t.isPinned).length
    };
  }, [tasks]);

  const addLog = (log: Partial<AgentLog>) => {
      const newLog: AgentLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          agentName: 'System',
          status: 'GREEN',
          message: 'Log Entry',
          ...log
      };
      setLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleSaveProject = () => {
    const projectData = {
      timestamp: new Date().toISOString(),
      version: "3.0.0",
      caseId: "LEXI-CASE-001",
      tasks,
      logs
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LEXISCOUT_CASE_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog({ status: 'BLUE', message: 'Case Saved', details: `Serialized ${tasks.length} evidence records.` });
  };

  const handleLoadProject = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setLogs(data.logs || []);
        setActiveTab('dashboard');
        addLog({ status: 'GREEN', message: 'Case Loaded', details: `Restored ${data.tasks.length} records.` });
      } else {
        alert("Invalid project file format.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to parse project file.");
    }
  };

  const handleExport = (filteredTasks: Task[], filenamePrefix: string, format: 'csv' | 'json') => {
    const filename = `${filenamePrefix}_${new Date().toISOString().slice(0,10)}.${format}`;
    
    if (format === 'csv') {
        const csv = generateCSV(filteredTasks);
        downloadCSV(csv, filename);
    } else {
        const json = generateJSON(filteredTasks);
        downloadJSON(json, filename);
    }

    addLog({ 
        status: 'BLUE', 
        message: 'Evidence Exported', 
        details: `Exported ${filteredTasks.length} items to ${filename}` 
    });
  };

  const stopQueue = () => {
      console.log('[Queue] Stop signal received.');
      shouldProcessRef.current = false;
      addLog({ status: 'RED', message: 'Stopping Review...', details: 'Workers will finish current tasks then halt.' });
  };

  const processSingleTask = async (task: Task) => {
      if (!shouldProcessRef.current) {
          console.log(`[Queue] Skipped task ${task.id} (Stopped)`);
          return;
      }

      console.log(`[Queue] Processing Task: ${task.id}`);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'IN_PROGRESS' } : t));

      try {
          const result = await analyzeEvidence(task);
          console.log(`[Queue] Success: ${task.id}`, result.legalOpinion.substring(0, 50) + "...");

          setTasks(prev => prev.map(t => t.id === task.id ? {
              ...t,
              status: 'COMPLETED',
              isRelevant: result.isRelevant,
              isPrivileged: result.isPrivileged,
              recordType: result.recordType as any,
              legalOpinion: result.legalOpinion,
              keyEvidenceQuote: result.keyEvidenceQuote,
              reviewedBy: 'LexiScout AI',
              relevanceScore: result.relevanceScore,
              issueTags: result.issueTags,
              relevanceLevel: result.relevanceLevel as any,
              entities: result.entities,
              breachCategory: result.breachCategory as any
          } : t));

      } catch (error: any) {
          console.error(`[Queue] FAILED: ${task.id}`, error);
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'FLAGGED' } : t));
          addLog({ status: 'RED', message: `Analysis Failed: ${task.id}`, details: error.message });
      }
  };

  const processQueue = async () => {
      if (isProcessing) return;
      
      const pendingTasks = tasks.filter(t => t.status === 'PENDING');
      
      if (pendingTasks.length === 0) {
          console.log('[Queue] Queue is empty. No tasks to process.');
          addLog({ status: 'YELLOW', message: 'Queue Empty', details: 'No pending records to analyze. Import data first.' });
          return;
      }

      shouldProcessRef.current = true;
      setIsProcessing(true);

      console.group(`[Queue] Starting Batch Review: ${pendingTasks.length} items`);
      addLog({ status: 'GREEN', message: 'Batch Review Started', details: `Processing ${pendingTasks.length} records.` });

      // Concurrent Processing Limit (1 to prevent browser freezing/API limits)
      const CONCURRENCY_LIMIT = 1; 
      const executing: Promise<void>[] = [];

      for (const task of pendingTasks) {
          if (!shouldProcessRef.current) {
              console.log('[Queue] Processing loop halted by user.');
              break;
          }

          console.log(`[Queue] Assigning task ${task.id} to worker.`);
          if (executing.length > 0) {
               console.log(`[Queue] Tasks in flight: ${executing.length}. Waiting for slot...`);
          }
          
          const p = processSingleTask(task).then(() => {
              const idx = executing.indexOf(p);
              if (idx > -1) executing.splice(idx, 1);
          });
          
          executing.push(p);

          if (executing.length >= CONCURRENCY_LIMIT) {
              await Promise.race(executing);
          }
          
          await new Promise(r => setTimeout(r, 200));
      }

      await Promise.all(executing);

      setIsProcessing(false);
      shouldProcessRef.current = false;
      console.log("[Queue] Batch review complete.");
      console.groupEnd();
      addLog({ status: 'GREEN', message: 'Review Complete', details: 'Analysis finished.' });
  };

  const handleImportFiles = async (files: FileList) => {
    setIsImporting(true);
    setImportStatus("Parsing Data Structure...");
    
    // Give UI a moment to render the loader before heavy processing
    setTimeout(async () => {
        try {
            const newTasks = await processFiles(files);
            
            if (newTasks.length > 0) {
              setTasks(prev => [...prev, ...newTasks]);
              setActiveTab('queue');
              addLog({
                status: 'BLUE',
                message: 'Evidence Ingested',
                details: `Added ${newTasks.length} records from ${files.length} source files.`
              });
            } else {
                alert("No valid data found in uploaded files.");
            }
        } catch (error: any) {
            console.error("Import Error:", error);
            alert(`Import failed: ${error.message}`);
        } finally {
            setIsImporting(false);
        }
    }, 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
            <Dashboard 
                stats={stats} 
                tasks={tasks} 
                onStartQueue={processQueue} 
                onViewQueue={() => setActiveTab('queue')}
                isProcessing={isProcessing}
            />
        );
      case 'queue':
        return (
            <QueueTable 
                tasks={tasks} 
                isProcessing={isProcessing} 
                onProcessQueue={processQueue} 
                onStopQueue={stopQueue}
                onExport={handleExport}
            />
        );
      case 'review':
        return <ReviewInterface tasks={tasks} onUpdateTask={handleUpdateTask} />;
      case 'ask': // New Route
        return <AskArchive tasks={tasks} />;
      case 'builder':
        return <CaseBuilder tasks={tasks} />;
      case 'findings':
        return <FindingsView tasks={tasks} />;
      case 'logs':
        return <AgentLogView logs={logs} />;
      default:
        return <Dashboard 
            stats={stats} 
            tasks={tasks} 
            onStartQueue={processQueue} 
            onViewQueue={() => setActiveTab('queue')}
            isProcessing={isProcessing}
        />;
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDragging(true);
      }
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
          setIsDragging(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleImportFiles(e.dataTransfer.files);
      }
  };

  return (
    <div 
        className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
    >
      {isDragging && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-indigo-500/50 m-4 rounded-3xl pointer-events-none">
              <div className="flex flex-col items-center animate-bounce">
                  <UploadCloud size={64} className="text-indigo-400 mb-4" />
                  <h2 className="text-3xl font-bold text-white tracking-wide">Import Evidence</h2>
                  <p className="text-slate-400 mt-2">Drop JSON Arrays, CSV Logs, or Text Files</p>
              </div>
          </div>
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
            console.log(`[Navigation] Switching to ${tab}`);
            setActiveTab(tab);
        }} 
        onImportFiles={handleImportFiles}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative custom-scrollbar">
         <div className="max-w-7xl mx-auto h-full">
            {isImporting ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader className="animate-spin text-indigo-500" size={48} />
                    <h2 className="text-xl font-bold text-slate-200">Processing Evidence...</h2>
                    <p className="text-slate-500">{importStatus}</p>
                    <p className="text-xs text-slate-600">Splitting large JSON arrays into individual review tasks...</p>
                </div>
            ) : renderContent()}
         </div>
      </main>
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

export default App;
