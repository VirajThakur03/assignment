import React, { useState } from 'react';
import { X, Wrench, ShieldAlert, Sparkles, Check, AlertCircle, FileCode, Sliders, Layers } from 'lucide-react';
import { ALL_TOOLS } from '../engine/tools/index.js';
import { isValidJsonSchema } from '../engine/schemaValidator.js';

export function SkillFormModal({ isOpen, onClose, onSubmit, initialSkill = null }) {
  if (!isOpen) return null;

  const currentVer = initialSkill?.versions?.find(v => v.version === initialSkill.currentVersion) || null;

  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic', 'tools', 'schemas'

  const [name, setName] = useState(initialSkill?.name || '');
  const [purpose, setPurpose] = useState(initialSkill?.purpose || '');
  const [instructions, setInstructions] = useState(
    currentVer?.instructions || '1. Analyze user inputs.\n2. Execute allowed tools if necessary.\n3. Return structured response.'
  );
  
  const [inputSchemaStr, setInputSchemaStr] = useState(
    JSON.stringify(currentVer?.inputSchema || {
      type: 'object',
      properties: {
        customerEmail: { type: 'string', description: 'User email address' },
        purchaseAmount: { type: 'number', description: 'Total purchase amount' }
      },
      required: ['customerEmail']
    }, null, 2)
  );

  const [outputSchemaStr, setOutputSchemaStr] = useState(
    JSON.stringify(currentVer?.outputSchema || {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        status: { type: 'string' }
      },
      required: ['summary']
    }, null, 2)
  );

  const [allowedTools, setAllowedTools] = useState(
    currentVer?.allowedTools || ['calculator', 'document_search', 'structured_record_lookup']
  );

  const [actionsRequiringApproval, setActionsRequiringApproval] = useState(
    currentVer?.actionsRequiringApproval || ['mock_task_creator']
  );

  const [maxExecutionSteps, setMaxExecutionSteps] = useState(currentVer?.maxExecutionSteps || 6);

  const [errors, setErrors] = useState([]);

  const toggleTool = (toolName) => {
    if (allowedTools.includes(toolName)) {
      setAllowedTools(allowedTools.filter(t => t !== toolName));
    } else {
      setAllowedTools([...allowedTools, toolName]);
    }
  };

  const toggleApproval = (toolName) => {
    if (actionsRequiringApproval.includes(toolName)) {
      setActionsRequiringApproval(actionsRequiringApproval.filter(t => t !== toolName));
    } else {
      setActionsRequiringApproval([...actionsRequiringApproval, toolName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valErrors = [];

    if (!name.trim()) valErrors.push('Skill name is required.');
    if (!purpose.trim()) valErrors.push('Skill purpose is required.');
    if (!instructions.trim()) valErrors.push('Instructions / system prompt is required.');

    let parsedInputSchema, parsedOutputSchema;
    try {
      parsedInputSchema = JSON.parse(inputSchemaStr);
      if (!isValidJsonSchema(parsedInputSchema)) {
        valErrors.push('Input Schema must be a valid JSON Schema object with a "type" property.');
      }
    } catch (err) {
      valErrors.push('Input Schema contains invalid JSON syntax.');
    }

    try {
      parsedOutputSchema = JSON.parse(outputSchemaStr);
      if (!isValidJsonSchema(parsedOutputSchema)) {
        valErrors.push('Output Schema must be a valid JSON Schema object with a "type" property.');
      }
    } catch (err) {
      valErrors.push('Output Schema contains invalid JSON syntax.');
    }

    if (allowedTools.length === 0) {
      valErrors.push('At least one permitted tool must be selected.');
    }

    if (valErrors.length > 0) {
      setErrors(valErrors);
      return;
    }

    onSubmit({
      name,
      purpose,
      instructions,
      inputSchema: parsedInputSchema,
      outputSchema: parsedOutputSchema,
      allowedTools,
      actionsRequiringApproval,
      maxExecutionSteps
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C14]/90 backdrop-blur-xl overflow-y-auto">
      <div className="surface-panel w-full max-w-3xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-extrabold text-white">
              {initialSkill ? `Edit Skill: ${initialSkill.name}` : 'Author New AI Skill'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Tab Switcher */}
        <div className="flex items-center bg-slate-950/80 px-6 py-2 border-b border-slate-800 space-x-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFormTab('basic')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeFormTab === 'basic' ? 'border-indigo-500 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Core Directives & Purpose
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('tools')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeFormTab === 'tools' ? 'border-indigo-500 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Permitted Tools & Governance ({allowedTools.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('schemas')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeFormTab === 'schemas' ? 'border-indigo-500 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Schemas & Step Boundaries
          </button>
        </div>

        {/* Validation Error Banner */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
            <div className="flex items-center space-x-1.5 font-bold mb-1">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Validation Errors:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Basic Details */}
          {activeFormTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Support SLA & Refund Agent"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Purpose / High-level Goal *</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Calculates refund eligibility & creates support ticket"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Agent Directives & System Instructions *
                </label>
                <textarea
                  rows={6}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step by step instructions for the agent..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Permitted Tools & Approvals */}
          {activeFormTab === 'tools' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Select Permitted Tools (Bounded Set)</span>
                <span className="text-[11px] font-normal text-slate-400">Agent can ONLY invoke checked tools</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_TOOLS.map((tool) => {
                  const isSelected = allowedTools.includes(tool.name);
                  const isApproval = actionsRequiringApproval.includes(tool.name);
                  return (
                    <div
                      key={tool.name}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/20 border-indigo-500/50 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                      onClick={() => toggleTool(tool.name)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-indigo-600 border-indigo-400' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold text-white">{tool.label}</span>
                        </div>
                        {tool.isWriteAction && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                            Write Action
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6 leading-tight font-normal">{tool.description}</p>
                      
                      {/* Human Approval Checkbox */}
                      {isSelected && (
                        <div className="mt-2.5 pl-6 pt-2 border-t border-slate-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                            Require Human Approval
                          </span>
                          <input
                            type="checkbox"
                            checked={isApproval}
                            onChange={() => toggleApproval(tool.name)}
                            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Schemas & Limits */}
          {activeFormTab === 'schemas' && (
            <div className="space-y-4">
              
              {/* Max Execution Steps Slider */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Maximum Execution Steps Limit ({maxExecutionSteps})
                  </label>
                  <span className="text-[11px] text-slate-400">Halts agent if steps exceed limit</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={15}
                  value={maxExecutionSteps}
                  onChange={(e) => setMaxExecutionSteps(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Schemas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Input Schema (JSON Schema) *
                  </label>
                  <textarea
                    rows={7}
                    value={inputSchemaStr}
                    onChange={(e) => setInputSchemaStr(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Output Schema (JSON Schema) *
                  </label>
                  <textarea
                    rows={7}
                    value={outputSchemaStr}
                    onChange={(e) => setOutputSchemaStr(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6"
            >
              {initialSkill ? 'Save Draft Version' : 'Publish Skill Version'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
