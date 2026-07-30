import React, { useState } from 'react';
import { ScrollText, Search, Trash2, ShieldAlert, AlertTriangle, CheckCircle, Info, Filter, Shield } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';

export function AuditLogsView() {
  const { logs, clearLogs } = usePlatformStore();
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchQuery = !searchQuery || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.runId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchQuery;
  });

  return (
    <div className="surface-panel p-6 rounded-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">Platform Audit Trail & Governance Logs</h2>
            <p className="text-xs text-slate-400 font-medium">Complete record of agent execution steps, tool call permissions, human write approvals, and security refusals.</p>
          </div>
        </div>

        <button
          onClick={clearLogs}
          className="px-3.5 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by keyword, runId..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>

        {/* Level Pills */}
        <div className="flex items-center space-x-1.5 text-xs font-medium">
          {['all', 'info', 'approval', 'security', 'warn', 'error'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg capitalize border transition-all ${
                filterLevel === lvl
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records match the current filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isSecurity = log.level === 'security';
            const isApproval = log.level === 'approval';
            const isError = log.level === 'error';
            const isWarn = log.level === 'warn';

            return (
              <div
                key={log.id}
                className={`p-3.5 rounded-xl border text-xs font-mono transition-all space-y-1.5 ${
                  isSecurity ? 'bg-rose-950/20 border-rose-500/40 text-rose-200' :
                  isApproval ? 'bg-amber-950/20 border-amber-500/40 text-amber-200' :
                  isError ? 'bg-rose-950/40 border-rose-600 text-rose-300' :
                  isWarn ? 'bg-amber-950/10 border-amber-500/20 text-amber-300' :
                  'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {isSecurity && <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                    {isApproval && <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    {isError && <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                    {!isSecurity && !isApproval && !isError && <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />}

                    <span className="font-extrabold text-white tracking-wide uppercase text-[11px]">{log.type || 'LOG'}</span>
                    {log.runId && <span className="text-[10px] text-indigo-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">{log.runId}</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>

                <p className="pl-6 font-sans text-xs font-normal leading-relaxed">{log.message}</p>

                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="ml-6 mt-1.5 p-2.5 bg-slate-950 rounded-lg text-[10px] text-slate-400 overflow-x-auto border border-slate-900">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
