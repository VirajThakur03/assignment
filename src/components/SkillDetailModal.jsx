import React, { useState } from 'react';
import { X, Play, GitBranch, Layers, ShieldAlert, Wrench, FileCode, CheckCircle } from 'lucide-react';
import { getTool } from '../engine/tools/index.js';

export function SkillDetailModal({ skill, isOpen, onClose, onTestVersion, onCompareVersions }) {
  if (!isOpen || !skill) return null;

  const [selectedVerNum, setSelectedVerNum] = useState(skill.currentVersion);
  const versionObj = skill.versions.find(v => v.version === selectedVerNum) || skill.versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C14]/90 backdrop-blur-xl overflow-y-auto">
      <div className="surface-panel w-full max-w-3xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800 bg-slate-900/80">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-extrabold text-white tracking-tight">{skill.name}</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-md">
                v{versionObj.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{skill.purpose}</p>
          </div>

          <div className="flex items-center space-x-2">
            {skill.versions.length > 1 && (
              <button
                onClick={() => onCompareVersions(skill)}
                className="btn-secondary"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Compare Diff</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Version Selector */}
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 mr-2">Available Versions:</span>
            {skill.versions.map((v) => (
              <button
                key={v.version}
                onClick={() => setSelectedVerNum(v.version)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  v.version === selectedVerNum
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Version v{v.version} {v.version === skill.currentVersion && '(Latest)'}
              </button>
            ))}
          </div>

          {/* Permitted Tools & Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span>Permitted Tools ({versionObj.allowedTools?.length})</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {versionObj.allowedTools?.map(tName => {
                  const toolDef = getTool(tName);
                  const isApproval = versionObj.actionsRequiringApproval?.includes(tName);
                  return (
                    <span
                      key={tName}
                      className="px-2.5 py-1 text-xs bg-slate-950 text-slate-300 border border-slate-800 rounded-lg flex items-center gap-1 font-medium"
                    >
                      <span>{toolDef?.label || tName}</span>
                      {isApproval && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" title="Requires Approval" />}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Guardrails & Boundaries</span>
              </span>
              <div className="text-xs text-slate-400 space-y-1.5">
                <div>Max Execution Steps: <strong className="text-white font-mono">{versionObj.maxExecutionSteps}</strong></div>
                <div>Actions Needing Approval: <strong className="text-amber-300 font-mono">{versionObj.actionsRequiringApproval?.length || 0}</strong></div>
              </div>
            </div>
          </div>

          {/* Directives */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Agent System Directives</span>
            </h4>
            <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {versionObj.instructions}
            </pre>
          </div>

          {/* Schemas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1.5">Input Schema</h4>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                {JSON.stringify(versionObj.inputSchema, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-1.5">Output Schema</h4>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                {JSON.stringify(versionObj.outputSchema, null, 2)}
              </pre>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={() => {
                onTestVersion(skill.id, versionObj.version);
                onClose();
              }}
              className="btn-primary px-6"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Version v{versionObj.version} in Workbench</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
