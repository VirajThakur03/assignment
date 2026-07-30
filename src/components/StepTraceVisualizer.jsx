import React, { useState } from 'react';
import { Brain, Wrench, ShieldAlert, CheckCircle, XCircle, ChevronDown, ChevronRight, AlertOctagon, Key } from 'lucide-react';
import { getTool } from '../engine/tools/index.js';

export function StepTraceVisualizer({ executionHistory = [] }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleExpand = (index) => {
    setExpandedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (!executionHistory || executionHistory.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        No execution trace steps recorded yet. Click "Run Agent Skill" on the left to test!
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {executionHistory.map((step, idx) => {
        const isExpanded = expandedSteps[idx] !== false; // default open

        if (step.type === 'thought') {
          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 border-l-4 border-l-indigo-500 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                    {step.step}
                  </div>
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">Agent Step Reasoning</span>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-300 pl-7 leading-relaxed font-normal italic">
                "{step.thought}"
              </p>
            </div>
          );
        }

        if (step.type === 'tool_result') {
          const toolDef = getTool(step.toolName);
          return (
            <div key={idx} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    Tool Call Executed: {toolDef?.label || step.toolName}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md font-bold">
                    SUCCESS
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 space-y-2 pl-6 pt-2 border-t border-emerald-900/40">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Input Arguments:</span>
                    <pre className="p-2.5 bg-slate-950 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-900">
                      {JSON.stringify(step.toolArgs, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Returned Output Payload:</span>
                    <pre className="p-2.5 bg-slate-950 rounded-lg text-[10px] font-mono text-emerald-300 overflow-x-auto border border-slate-900">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (step.type === 'tool_refusal') {
          return (
            <div key={idx} className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-rose-300">
                    SECURITY GUARD: Unauthorized Tool Refused ({step.toolName})
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-md font-bold">
                  REFUSED & LOGGED
                </span>
              </div>
              <p className="text-xs text-rose-200/90 pl-6">
                {step.reason}
              </p>
            </div>
          );
        }

        if (step.type === 'approval_pending') {
          return (
            <div key={idx} className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-300">
                    Human-in-the-Loop Intercept: Waiting for Approval
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md font-bold">
                  APPROVAL REQUIRED
                </span>
              </div>
              <div className="text-xs text-slate-300 pl-6 space-y-1">
                <div>Tool: <strong className="text-white">{step.toolName}</strong></div>
                <div className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-indigo-400" />
                  <span>Idempotency Key: <code className="text-indigo-300">{step.idempotencyKey}</code></span>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
