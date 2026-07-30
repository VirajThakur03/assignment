import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_SKILLS } from '../engine/mockData.js';
import { AgentOrchestrator, getOrchestrator } from '../engine/agentOrchestrator.js';

export const usePlatformStore = create(
  persist(
    (set, get) => ({
      // State Properties
      skills: SEED_SKILLS,
      activeSkillId: 'skl-001',
      selectedVersionNum: 2,
      executionRuns: [],
      activeRunId: null,
      activeOrchestrator: null,
      logs: [
        {
          id: 'log-init-1',
          timestamp: new Date().toISOString(),
          level: 'info',
          type: 'SYSTEM',
          message: 'Agent Skills Platform initialized with seed skills and version history.'
        }
      ],
      providerConfig: {
        provider: 'mock',
        apiKey: '',
        model: 'gpt-4o-mini'
      },
      toastNotification: null,

      // UI Actions
      setActiveSkill: (skillId, versionNum = null) => {
        const skill = get().skills.find(s => s.id === skillId);
        if (!skill) return;
        const targetVer = versionNum || skill.currentVersion;
        set({ activeSkillId: skillId, selectedVersionNum: targetVer });
      },

      setProviderConfig: (config) => set((state) => ({
        providerConfig: { ...state.providerConfig, ...config }
      })),

      showToast: (message, type = 'info') => {
        set({ toastNotification: { id: Date.now(), message, type } });
        setTimeout(() => {
          set((state) => (state.toastNotification?.message === message ? { toastNotification: null } : {}));
        }, 4000);
      },

      // Skill Management
      createSkill: (skillData) => {
        const newId = `skl-${Math.floor(100 + Math.random() * 900)}`;
        const now = new Date().toISOString();
        
        const firstVersion = {
          version: 1,
          status: 'published',
          publishedAt: now,
          name: skillData.name,
          purpose: skillData.purpose,
          instructions: skillData.instructions || 'Follow user inputs and produce structured JSON result.',
          inputSchema: skillData.inputSchema || { type: 'object', properties: {} },
          outputSchema: skillData.outputSchema || { type: 'object', properties: {} },
          examples: skillData.examples || [],
          allowedTools: skillData.allowedTools || ['calculator'],
          actionsRequiringApproval: skillData.actionsRequiringApproval || [],
          maxExecutionSteps: skillData.maxExecutionSteps || 5
        };

        const newSkill = {
          id: newId,
          name: skillData.name,
          purpose: skillData.purpose,
          status: 'published',
          currentVersion: 1,
          createdAt: now,
          updatedAt: now,
          versions: [firstVersion]
        };

        set((state) => ({
          skills: [newSkill, ...state.skills],
          activeSkillId: newId,
          selectedVersionNum: 1
        }));

        get().logEntry('info', 'SKILL_CREATED', `Created new skill "${newSkill.name}" (v1).`);
        get().showToast(`Skill "${newSkill.name}" created successfully!`, 'success');
        return newSkill;
      },

      saveSkillDraft: (skillId, draftVersionData) => {
        set((state) => {
          const updatedSkills = state.skills.map(skill => {
            if (skill.id !== skillId) return skill;

            const existingDraftIndex = skill.versions.findIndex(v => v.status === 'draft');
            let updatedVersions = [...skill.versions];

            if (existingDraftIndex >= 0) {
              updatedVersions[existingDraftIndex] = {
                ...updatedVersions[existingDraftIndex],
                ...draftVersionData,
                updatedAt: new Date().toISOString()
              };
            } else {
              const nextVersionNum = Math.max(...skill.versions.map(v => v.version)) + 1;
              const newDraft = {
                ...draftVersionData,
                version: nextVersionNum,
                status: 'draft',
                createdAt: new Date().toISOString()
              };
              updatedVersions.push(newDraft);
            }

            return {
              ...skill,
              updatedAt: new Date().toISOString(),
              versions: updatedVersions
            };
          });

          return { skills: updatedSkills };
        });

        get().showToast('Skill draft saved.', 'info');
      },

      publishSkillVersion: (skillId) => {
        let publishedVersionNum = 1;
        set((state) => {
          const updatedSkills = state.skills.map(skill => {
            if (skill.id !== skillId) return skill;

            const draftIndex = skill.versions.findIndex(v => v.status === 'draft');
            if (draftIndex < 0) return skill; // No draft to publish

            const draft = skill.versions[draftIndex];
            publishedVersionNum = draft.version;

            const updatedVersions = [...skill.versions];
            updatedVersions[draftIndex] = {
              ...draft,
              status: 'published',
              publishedAt: new Date().toISOString()
            };

            return {
              ...skill,
              status: 'published',
              currentVersion: publishedVersionNum,
              updatedAt: new Date().toISOString(),
              versions: updatedVersions
            };
          });

          return { skills: updatedSkills, selectedVersionNum: publishedVersionNum };
        });

        get().logEntry('info', 'SKILL_PUBLISHED', `Published new version v${publishedVersionNum} for skill ${skillId}.`);
        get().showToast(`Published Version v${publishedVersionNum} successfully!`, 'success');
      },

      // Audit Logging
      logEntry: (level, type, message, details = {}) => {
        const entry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          level,
          type,
          message,
          details
        };
        set((state) => ({ logs: [entry, ...state.logs.slice(0, 499)] }));
      },

      clearLogs: () => set({ logs: [] }),

      // Execution Orchestration
      startExecution: async (skillId, versionNum, inputData) => {
        const skill = get().skills.find(s => s.id === skillId);
        if (!skill) return;

        const version = skill.versions.find(v => v.version === versionNum) || skill.versions[skill.versions.length - 1];

        const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newRun = {
          runId,
          skillId: skill.id,
          skillName: skill.name,
          version: version.version,
          startedAt: new Date().toISOString(),
          inputData,
          status: 'RUNNING',
          stepNumber: 0,
          maxSteps: version.maxExecutionSteps || 5,
          executionHistory: [],
          pendingApproval: null,
          finalOutput: null,
          error: null
        };

        set((state) => ({
          executionRuns: [newRun, ...state.executionRuns],
          activeRunId: runId
        }));

        const orchestrator = new AgentOrchestrator({
          skill,
          version,
          inputData,
          providerConfig: get().providerConfig,
          onStepUpdate: (update) => {
            set((state) => ({
              executionRuns: state.executionRuns.map(r => {
                if (r.runId !== runId) return r;
                return { ...r, ...update };
              })
            }));
          },
          onApprovalRequired: (approvalPayload) => {
            get().logEntry('approval', 'APPROVAL_REQUEST', `Run ${runId} waiting for human approval for tool ${approvalPayload.toolName}.`);
          },
          onLog: (logEntry) => {
            set((state) => ({ logs: [logEntry, ...state.logs] }));
          }
        });

        set({ activeOrchestrator: orchestrator });
        const result = await orchestrator.start();
        return result;
      },

      // Helper to retrieve active orchestrator or restore instance from runData if RAM was cleared
      getOrRestoreOrchestrator: (runId) => {
        let orchestrator = getOrchestrator(runId) || get().activeOrchestrator;
        if (orchestrator && orchestrator.runId === runId) {
          return orchestrator;
        }

        const run = get().executionRuns.find(r => r.runId === runId);
        if (!run) return null;

        const skill = get().skills.find(s => s.id === run.skillId);
        if (!skill) return null;

        const version = skill.versions.find(v => v.version === run.version) || skill.versions[0];

        orchestrator = AgentOrchestrator.restore(run, skill, version, run.inputData, get().providerConfig, {
          onStepUpdate: (update) => {
            set((state) => ({
              executionRuns: state.executionRuns.map(r => (r.runId === runId ? { ...r, ...update } : r))
            }));
          },
          onLog: (logEntry) => {
            set((state) => ({ logs: [logEntry, ...state.logs] }));
          }
        });

        set({ activeOrchestrator: orchestrator });
        return orchestrator;
      },

      approvePendingAction: async (runId, idempotencyKey) => {
        const orchestrator = get().getOrRestoreOrchestrator(runId);
        if (orchestrator) {
          get().logEntry('approval', 'APPROVAL_GRANTED', `Human approved write action for run ${runId}`);
          await orchestrator.approveWriteAction('tool_action', idempotencyKey);
        } else {
          console.warn('Orchestrator not found for runId:', runId);
        }
      },

      rejectPendingAction: async (runId, reason) => {
        const orchestrator = get().getOrRestoreOrchestrator(runId);
        if (orchestrator) {
          get().logEntry('warn', 'APPROVAL_REJECTED', `Human rejected write action for run ${runId}: ${reason}`);
          orchestrator.rejectWriteAction('tool_action', reason);
        } else {
          console.warn('Orchestrator not found for runId:', runId);
        }
      },

      dismissPendingApproval: (runId) => {
        set((state) => ({
          executionRuns: state.executionRuns.map(r => {
            if (r.runId !== runId) return r;
            return { ...r, status: 'CANCELLED', pendingApproval: null };
          })
        }));
        get().showToast('Approval modal dismissed.', 'info');
      },

      cancelExecution: (runId) => {
        const orchestrator = get().getOrRestoreOrchestrator(runId);
        if (orchestrator) {
          orchestrator.cancel();
        } else {
          set((state) => ({
            executionRuns: state.executionRuns.map(r => (r.runId === runId ? { ...r, status: 'CANCELLED', pendingApproval: null } : r))
          }));
        }
        get().showToast('Execution run cancelled.', 'warn');
      }
    }),
    {
      name: 'agent-skills-platform-storage',
      partialize: (state) => ({
        skills: state.skills,
        activeSkillId: state.activeSkillId,
        selectedVersionNum: state.selectedVersionNum,
        providerConfig: state.providerConfig,
        logs: state.logs.slice(0, 100)
      })
    }
  )
);
