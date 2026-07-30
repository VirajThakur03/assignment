import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SkillCard } from './components/SkillCard';
import { SkillFormModal } from './components/SkillFormModal';
import { SkillDetailModal } from './components/SkillDetailModal';
import { SkillVersionDiff } from './components/SkillVersionDiff';
import { ExecutionWorkbench } from './components/ExecutionWorkbench';
import { AuditLogsView } from './components/AuditLogsView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Toast } from './components/Toast';
import { usePlatformStore } from './store/usePlatformStore';
import { Cpu, Search, Sparkles, ShieldCheck, Layers, ScrollText, Play, CheckCircle2, SlidersHorizontal } from 'lucide-react';

export function App() {
  const { skills, createSkill, saveSkillDraft, publishSkillVersion, setActiveSkill, logs, executionRuns } = usePlatformStore();

  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'workbench', 'logs'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [selectedDetailSkill, setSelectedDetailSkill] = useState(null);
  const [selectedDiffSkill, setSelectedDiffSkill] = useState(null);

  // Active Workbench target skill
  const [workbenchSkillId, setWorkbenchSkillId] = useState(null);
  const [workbenchVersionNum, setWorkbenchVersionNum] = useState(null);

  const filteredSkills = skills.filter(skill => {
    const q = searchQuery.toLowerCase();
    return skill.name.toLowerCase().includes(q) || skill.purpose.toLowerCase().includes(q);
  });

  const handleCreateOrEditSkill = (formData) => {
    createSkill(formData);
  };

  const handleTestSkill = (skill, versionNum = null) => {
    const targetVer = versionNum || skill.currentVersion;
    setActiveSkill(skill.id, targetVer);
    setWorkbenchSkillId(skill.id);
    setWorkbenchVersionNum(targetVer);
    setActiveTab('workbench');
  };

  const handleCompareVersions = (skill) => {
    setSelectedDiffSkill(skill);
  };

  // Stats Counters
  const totalSkillsCount = skills.length;
  const publishedVersionsCount = skills.reduce((acc, s) => acc + s.versions.filter(v => v.status === 'published').length, 0);
  const totalRunsCount = executionRuns.length;
  const securityEventsCount = logs.filter(l => l.level === 'security' || l.level === 'approval').length;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans bg-grid-pattern">
      
      {/* Navbar */}
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Executive Metric Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="surface-card p-4.5 rounded-2xl flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">{totalSkillsCount}</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Defined Skills</p>
            </div>
          </div>

          <div className="surface-card p-4.5 rounded-2xl flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">{publishedVersionsCount}</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Published Versions</p>
            </div>
          </div>

          <div className="surface-card p-4.5 rounded-2xl flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">{totalRunsCount}</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Execution Runs</p>
            </div>
          </div>

          <div className="surface-card p-4.5 rounded-2xl flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">{securityEventsCount}</span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Security Intercepts</p>
            </div>
          </div>
        </section>

        {/* TAB 1: Skill Library View */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Reusable AI Skill Definitions</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Author, validate JSON schemas, configure permitted tool boundaries, and enforce human write approvals.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter skills by keyword..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Grid of Skill Cards */}
            {filteredSkills.length === 0 ? (
              <div className="surface-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
                <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No matching skills found</h3>
                <p className="text-xs text-slate-500">Adjust your search query or define a new AI skill above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onSelectSkill={(s) => setSelectedDetailSkill(s)}
                    onTestSkill={(s) => handleTestSkill(s)}
                    onCompareVersions={(s) => handleCompareVersions(s)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Execution Workbench */}
        {activeTab === 'workbench' && (
          <ExecutionWorkbench
            initialSkillId={workbenchSkillId}
            initialVersionNum={workbenchVersionNum}
          />
        )}

        {/* TAB 3: Audit Trail Logs */}
        {activeTab === 'logs' && <AuditLogsView />}

      </main>

      {/* Modals & Dialogs */}
      <SkillFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrEditSkill}
      />

      <SkillDetailModal
        skill={selectedDetailSkill}
        isOpen={Boolean(selectedDetailSkill)}
        onClose={() => setSelectedDetailSkill(null)}
        onTestVersion={(sId, vNum) => {
          const sObj = skills.find(s => s.id === sId);
          if (sObj) handleTestSkill(sObj, vNum);
        }}
        onCompareVersions={(s) => {
          setSelectedDetailSkill(null);
          setSelectedDiffSkill(s);
        }}
      />

      {selectedDiffSkill && (
        <SkillVersionDiff
          skill={selectedDiffSkill}
          onClose={() => setSelectedDiffSkill(null)}
          onSelectVersionToRun={(vNum) => {
            handleTestSkill(selectedDiffSkill, vNum);
            setSelectedDiffSkill(null);
          }}
        />
      )}

      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      <Toast />
    </div>
  );
}
