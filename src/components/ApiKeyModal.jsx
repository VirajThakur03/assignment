import React, { useState } from 'react';
import { X, Key, Cpu, ShieldCheck, Check } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';
import { PROVIDERS } from '../engine/llmProvider';

export function ApiKeyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { providerConfig, setProviderConfig, showToast } = usePlatformStore();
  const [provider, setProvider] = useState(providerConfig.provider || PROVIDERS.MOCK);
  const [apiKey, setApiKey] = useState(providerConfig.apiKey || '');
  const [model, setModel] = useState(providerConfig.model || 'gpt-4o-mini');

  const handleSave = (e) => {
    e.preventDefault();
    setProviderConfig({ provider, apiKey, model });
    showToast(`LLM Provider set to ${provider.toUpperCase()} engine.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Configure LLM Provider</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Engine Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Agent LLM Engine:</label>
            <div className="space-y-2">
              
              {/* Built-in Mock Simulator */}
              <div
                onClick={() => setProvider(PROVIDERS.MOCK)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  provider === PROVIDERS.MOCK
                    ? 'bg-cyan-950/30 border-cyan-500 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold">Built-in Mock Simulator (Recommended)</span>
                  </div>
                  {provider === PROVIDERS.MOCK && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  Zero-config intelligent simulator. No API key required for full feature evaluation.
                </p>
              </div>

              {/* OpenAI / Groq / Gemini */}
              {[
                { id: PROVIDERS.OPENAI, label: 'OpenAI (GPT-4o / GPT-4o-mini)', desc: 'Requires sk-... API key' },
                { id: PROVIDERS.GROQ, label: 'Groq (Llama-3.3 70B Fast)', desc: 'Requires gsk_... API key' },
                { id: PROVIDERS.GEMINI, label: 'Google Gemini', desc: 'Requires Gemini API key' }
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    provider === p.id
                      ? 'bg-cyan-950/30 border-cyan-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{p.label}</span>
                    {provider === p.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                </div>
              ))}

            </div>
          </div>

          {/* API Key Input (if real provider selected) */}
          {provider !== PROVIDERS.MOCK && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                API Key for {provider.toUpperCase()} *
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API key here..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
            >
              Save Configuration
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
