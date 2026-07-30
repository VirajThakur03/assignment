import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Key, Lock, X } from 'lucide-react';

export function ApprovalModal({ pendingApproval, onApprove, onReject, onDismiss }) {
  if (!pendingApproval) return null;

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { toolName, toolLabel, toolArgs, idempotencyKey, stepNumber } = pendingApproval;

  const handleDismiss = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C14]/90 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="surface-panel w-full max-w-lg rounded-2xl border border-amber-500/40 shadow-2xl shadow-amber-950/20 overflow-hidden my-auto">
        
        {/* Safety Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-300">Human Approval Required</h3>
              <p className="text-xs text-slate-300 font-medium">Agent write action intercepted at Step {stepNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss Modal & Cancel Execution"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Target Action Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Target Write Tool:</span>
              <span className="font-bold text-white font-mono">{toolLabel || toolName}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Idempotency Protection Key:
              </span>
              <span className="font-mono text-[11px] text-indigo-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                {idempotencyKey}
              </span>
            </div>
          </div>

          {/* Tool Parameters Inspection */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-1.5">Tool Invocation Parameters:</span>
            <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-inner">
              {JSON.stringify(toolArgs, null, 2)}
            </pre>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Upon approval, this action will execute with strict duplicate protection (Idempotency Key lock). Re-approving will skip duplicate creation.
            </span>
          </div>

          {/* Reject Reason Input */}
          {showRejectForm && (
            <div>
              <label className="block text-xs font-bold text-rose-300 mb-1">Reason for Rejection:</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid parameters or policy violation"
                className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-slate-400 hover:text-white underline font-medium cursor-pointer"
            >
              Dismiss Modal
            </button>

            <div className="flex items-center space-x-3">
              {!showRejectForm ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowRejectForm(true);
                    }}
                    className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Action</span>
                  </button>

                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onApprove) {
                        await onApprove();
                      } else if (pendingApproval && typeof pendingApproval.approve === 'function') {
                        await pendingApproval.approve();
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Continue Agent</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowRejectForm(false);
                    }}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const reason = rejectReason || 'User rejected write action.';
                      if (onReject) {
                        await onReject(reason);
                      } else if (pendingApproval && typeof pendingApproval.reject === 'function') {
                        await pendingApproval.reject(reason);
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
