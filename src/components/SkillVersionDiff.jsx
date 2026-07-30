import React from 'react';
import { GitCompare, Wrench, ShieldAlert, Layers, Code, X, ArrowRight } from 'lucide-react';
import { getTool } from '../engine/tools/index.js';

export function SkillVersionDiff({ skill, onClose, onSelectVersionToRun }) {
  if (!skill || !skill.versions || skill.versions.length < 2) return null;

  const sortedVersions = [...skill.versions].sort((a, b) => b.version - a.version);
  const vNew = sortedVersions[0];
  const vOld = sortedVersions[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C14]/90 backdrop-blur-xl overflow-y-auto">
      <div className="surface-panel w-full max-w-4xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-extrabold text-white">Version Diff Comparison</h2>
              <p className="text-xs text-slate-400 font-medium">Side-by-side visual diff for "{skill.name}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Version Header Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">Version v{vOld.version}</span>
                <span className="text-[11px] text-slate-400">{vOld.publishedAt ? new Date(vOld.publishedAt).toLocaleDateString() : 'Draft'}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{vOld.purpose}</p>
              <button
                onClick={() => onSelectVersionToRun(vOld.version)}
                className="text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1 pt-1"
              >
                Rerun v{vOld.version} in Workbench →
              </button>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-indigo-300">Version v{vNew.version} (Latest)</span>
                <span className="text-[11px] text-indigo-400">{vNew.publishedAt ? new Date(vNew.publishedAt).toLocaleDateString() : 'Draft'}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">{vNew.purpose}</p>
              <button
                onClick={() => onSelectVersionToRun(vNew.version)}
                className="text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1 pt-1"
              >
                Run v{vNew.version} in Workbench →
              </button>
            </div>
          </div>

          {/* Permitted Tools Comparison */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-indigo-400" />
              <span>Permitted Tools & Approvals Diff</span>
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">v{vOld.version} Allowed Tools:</span>
                <div className="space-y-1">
                  {vOld.allowedTools?.map(t => (
                    <div key={t} className="text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {getTool(t)?.label || t}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">v{vNew.version} Allowed Tools:</span>
                <div className="space-y-1">
                  {vNew.allowedTools?.map(t => {
                    const isAdded = !vOld.allowedTools?.includes(t);
                    return (
                      <div
                        key={t}
                        className={`px-2.5 py-1 rounded-lg border ${
                          isAdded
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 font-bold'
                            : 'text-slate-300 bg-slate-950 border-slate-800'
                        }`}
                      >
                        {getTool(t)?.label || t} {isAdded && '(+ Added in v' + vNew.version + ')'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Directives Diff */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Agent Directives Diff</span>
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">v{vOld.version} Directives:</span>
                <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl text-slate-400 border border-slate-800 whitespace-pre-wrap">
                  {vOld.instructions}
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">v{vNew.version} Directives:</span>
                <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl text-indigo-200 border border-indigo-500/30 whitespace-pre-wrap">
                  {vNew.instructions}
                </pre>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
