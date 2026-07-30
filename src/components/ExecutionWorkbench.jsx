import React, { useState, useEffect } from 'react';
import { Play, StopCircle, RefreshCw, CheckCircle, Cpu, Terminal } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';
import { StepTraceVisualizer } from './StepTraceVisualizer';
import { ApprovalModal } from './ApprovalModal';

export function ExecutionWorkbench({ initialSkillId = null, initialVersionNum = null }) {
  const {
    skills,
    activeSkillId,
    selectedVersionNum,
    setActiveSkill,
    executionRuns,
    activeRunId,
    startExecution,
    approvePendingAction,
    rejectPendingAction,
    dismissPendingApproval,
    cancelExecution
  } = usePlatformStore();

  const currentSkillId = initialSkillId || activeSkillId || skills[0]?.id;
  const skill = skills.find(s => s.id === currentSkillId) || skills[0];
  const versionNum = initialVersionNum || selectedVersionNum || skill?.currentVersion || 1;
  const version = skill?.versions?.find(v => v.version === versionNum) || skill?.versions?.[0];

  const [inputJsonStr, setInputJsonStr] = useState('');

  // Derive active run directly from Zustand store state - zero lag, instant reactive re-rendering!
  const activeRun = executionRuns.find(r => r.runId === activeRunId) || executionRuns[0] || null;

  useEffect(() => {
    if (version) {
      const sampleInput = version.examples?.[0]?.input || {
        customerEmail: 'alice@acme.com',
        refundReason: 'System outage SLA credit',
        purchaseAmount: 499.00
      };
      setInputJsonStr(JSON.stringify(sampleInput, null, 2));
    }
  }, [skill?.id, versionNum]);

  const handleRunSkill = async () => {
    let parsedInput;
    try {
      parsedInput = JSON.parse(inputJsonStr);
    } catch (err) {
      alert('Invalid JSON input format.');
      return;
    }

    await startExecution(skill.id, version.version, parsedInput);
  };

  const handleLoadExample = (example) => {
    if (example?.input) {
      setInputJsonStr(JSON.stringify(example.input, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Skill & Version Context Toolbar */}
      <div className="surface-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target AI Skill</label>
            <select
              value={skill.id}
              onChange={(e) => setActiveSkill(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {skills.map(s => (
                <option key={s.id} value={s.id}>{s.name} (v{s.currentVersion})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Version</label>
            <select
              value={version.version}
              onChange={(e) => setActiveSkill(skill.id, Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold focus:outline-none cursor-pointer"
            >
              {skill.versions.map(v => (
                <option key={v.version} value={v.version}>
                  Version v{v.version} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <div className="text-right pl-4 border-l border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Max Execution Steps</span>
            <span className="text-xs font-extrabold text-white">{version.maxExecutionSteps} Steps Boundary</span>
          </div>
        </div>
      </div>

      {/* Main Execution Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Console: Test Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Test Input Parameters</span>
              </h3>
              {version.examples?.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleLoadExample(version.examples[0])}
                  className="text-[11px] text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Load Sample Payload
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                JSON Data Payload (Matching Input Schema):
              </label>
              <textarea
                rows={11}
                value={inputJsonStr}
                onChange={(e) => setInputJsonStr(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Run / Cancel Action Group */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleRunSkill}
                disabled={activeRun?.status === 'RUNNING'}
                className="btn-primary flex-1 py-2.5 cursor-pointer"
              >
                {activeRun?.status === 'RUNNING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Orchestrating Step Loop...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Agent Skill</span>
                  </>
                )}
              </button>

              {activeRun?.status === 'RUNNING' && (
                <button
                  type="button"
                  onClick={() => cancelExecution(activeRun.runId)}
                  className="px-3.5 py-2.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Abort</span>
                </button>
              )}
            </div>
          </div>

          {/* Tool Scoping Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-300 block">Permitted Scoped Tools for v{version.version}:</span>
            <div className="flex flex-wrap gap-1.5">
              {version.allowedTools?.map(t => (
                <span key={t} className="px-2.5 py-1 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg text-[11px] font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Console: Step Trace & Approval Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Status Header */}
          {activeRun && (
            <div className="surface-panel p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activeRun.status === 'COMPLETED' ? 'bg-emerald-400 glow-emerald' :
                  activeRun.status === 'WAITING_FOR_APPROVAL' ? 'bg-amber-400 glow-amber animate-pulse' :
                  activeRun.status === 'RUNNING' ? 'bg-cyan-400 glow-cyan animate-ping' :
                  'bg-rose-400'
                }`} />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Status: {activeRun.status}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400">
                    Step {activeRun.stepNumber || 0} of {activeRun.maxSteps} max allowed
                  </span>
                </div>
              </div>

              {activeRun.status === 'COMPLETED' && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Execution Verified</span>
                </span>
              )}
            </div>
          )}

          {/* Trace Timeline Visualizer */}
          <div className="surface-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Execution Plan & Tool Calls</span>
              {activeRun?.executionHistory?.length > 0 && (
                <span className="text-[11px] font-normal text-slate-400">
                  {activeRun.executionHistory.length} step trace records
                </span>
              )}
            </h3>

            <StepTraceVisualizer executionHistory={activeRun?.executionHistory || []} />
          </div>

          {/* Final Output Result Drawer */}
          {activeRun?.finalOutput && (
            <div className="surface-panel p-5 rounded-2xl border-emerald-500/40 bg-emerald-950/10 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Final Output (Validated against Output Schema)</span>
              </h4>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(activeRun.finalOutput, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>

      {/* Human Approval Modal Trigger */}
      {activeRun?.pendingApproval && (
        <ApprovalModal
          pendingApproval={activeRun.pendingApproval}
          onApprove={() => approvePendingAction(activeRun.runId, activeRun.pendingApproval.idempotencyKey)}
          onReject={(reason) => rejectPendingAction(activeRun.runId, reason)}
          onDismiss={() => dismissPendingApproval(activeRun.runId)}
        />
      )}

    </div>
  );
}
