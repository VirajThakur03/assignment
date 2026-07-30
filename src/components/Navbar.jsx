import React from 'react';
import { Bot, Plus, Key, Cpu, ScrollText, Play, Command, Sparkles } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';

export function Navbar({ onOpenCreateModal, onOpenApiModal, activeTab, setActiveTab }) {
  const { providerConfig, skills } = usePlatformStore();

  return (
    <header className="sticky top-0 z-40 bg-[#0A0E1A]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Context Breadcrumb */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('skills')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>SkillCraft</span>
                <span className="text-indigo-400 font-normal">Studio</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                Enterprise v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Dynamic AI Skills & Approval Governance Engine</p>
          </div>
        </div>

        {/* Segmented Tab Controls (macOS / Linear style) */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Skills Library</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {skills.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'workbench'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Workbench</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </nav>

        {/* Engine Status & Primary Action */}
        <div className="flex items-center space-x-3">
          
          {/* Provider Config Button */}
          <button
            onClick={onOpenApiModal}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold transition-all hover:border-slate-700 shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{providerConfig.provider}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Create Skill Button */}
          <button
            onClick={onOpenCreateModal}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>New AI Skill</span>
          </button>

        </div>

      </div>
    </header>
  );
}
