import React from 'react';
import { Cpu, ShieldAlert, Play, GitBranch, Layers, Clock, Wrench, ArrowRight } from 'lucide-react';
import { getTool } from '../engine/tools/index.js';

export function SkillCard({ skill, onSelectSkill, onTestSkill, onCompareVersions }) {
  const currentVerObj = skill.versions.find(v => v.version === skill.currentVersion) || skill.versions[skill.versions.length - 1];
  const hasDraft = skill.versions.some(v => v.status === 'draft');
  const allowedTools = currentVerObj?.allowedTools || [];
  const approvalActions = currentVerObj?.actionsRequiringApproval || [];

  return (
    <div className="surface-card rounded-2xl p-5 flex flex-col justify-between relative group overflow-hidden">
      
      {/* Subtle Accent Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 opacity-40 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Top Metadata Row */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg">
              v{skill.currentVersion}
            </span>
            {hasDraft && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-md">
                Draft Pending
              </span>
            )}
          </div>

          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {new Date(skill.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Title & Purpose */}
        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1.5 tracking-tight">
          {skill.name}
        </h3>
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed font-normal">
          {skill.purpose}
        </p>

        {/* Permitted Tools Matrix */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-indigo-400" />
            <span>Permitted Tools ({allowedTools.length})</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allowedTools.map((tName) => {
              const toolDef = getTool(tName);
              const isWrite = toolDef?.isWriteAction || approvalActions.includes(tName);
              return (
                <span
                  key={tName}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    isWrite
                      ? 'bg-amber-950/30 text-amber-300 border-amber-500/30 shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{toolDef?.label || tName}</span>
                  {isWrite && <ShieldAlert className="w-3 h-3 text-amber-400 ml-1" title="Requires Human Write Approval" />}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentVerObj?.maxExecutionSteps || 5} steps max</span>
        </div>

        <div className="flex items-center space-x-2">
          {skill.versions.length > 1 && (
            <button
              onClick={() => onCompareVersions(skill)}
              className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 rounded-xl transition-colors"
              title="Compare Version Diff"
            >
              <GitBranch className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onSelectSkill(skill)}
            className="btn-secondary"
          >
            Details
          </button>

          <button
            onClick={() => onTestSkill(skill)}
            className="btn-primary"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test</span>
          </button>
        </div>
      </div>

    </div>
  );
}
