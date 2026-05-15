import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getPMProjects, type CompanyProjectDTO } from '../../services/CompanyProjectRepo';
import {
  getProjectTasks,
  generateTasksFromProposal,
  updateProjectTask,
  deleteProjectTask,
  PHASE_LABELS,
  PHASE_ORDER,
  type ProjectTaskDTO,
  type ProjectPhase,
  type TaskStatus,
} from '../../services/pmTasks.service';
import { toast } from 'react-toastify';
import './PMDashboard.css';

const PRIORITY_CLASS: Record<string, string> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'];

function groupTasksByPhase(tasks: ProjectTaskDTO[]): Map<ProjectPhase, ProjectTaskDTO[]> {
  const map = new Map<ProjectPhase, ProjectTaskDTO[]>();
  for (const phase of PHASE_ORDER) map.set(phase, []);
  for (const t of tasks) {
    const list = map.get(t.phase) ?? [];
    list.push(t);
    map.set(t.phase, list);
  }
  return map;
}

const ProjectTaskPanel: React.FC<{
  project: CompanyProjectDTO;
  onTasksChanged: () => void;
}> = ({ project, onTasksChanged }) => {
  const [tasks, setTasks] = useState<ProjectTaskDTO[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [proposalText, setProposalText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<ProjectPhase>>(new Set(PHASE_ORDER));

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const data = await getProjectTasks(project.id);
      setTasks(data);
      onTasksChanged();
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [project.id, onTasksChanged]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!proposalText && (project.projectDescription || project.guidelines)) {
      const parts: string[] = [];
      if (project.projectDescription) parts.push(project.projectDescription);
      if (project.mainFeatures) parts.push(`Main features:\n${project.mainFeatures}`);
      if (project.guidelines) parts.push(`Guidelines:\n${project.guidelines}`);
      setProposalText(parts.join('\n\n'));
    }
  }, [project.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setProposalText(text);
      toast.info(`Loaded "${file.name}"`);
    };
    reader.onerror = () => toast.error('Could not read file.');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!proposalText.trim()) {
      toast.warning('Paste or upload a project proposal first.');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateTasksFromProposal(project.id, {
        proposalText: proposalText.trim(),
        replaceExisting: true,
      });
      setTasks(res.tasks);
      onTasksChanged();
      toast.success(`Generated ${res.count} tasks from proposal.`);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
        message?: string;
      };
      const status = axiosErr.response?.status;
      let msg = axiosErr.response?.data?.error;
      if (!msg) {
        if (status === 401) {
          msg = 'Session expired or not authorized. Please sign out and sign in again.';
        } else if (status === 503) {
          msg = 'AI is not configured on the server. Add GROQ_API_KEY to Backend/backend/.env and restart the backend.';
        } else if (status === 404) {
          msg = 'Task API not found. Restart the Spring Boot backend with the latest code.';
        } else {
          msg =
            axiosErr.message ??
            'AI task generation failed. Ensure the backend is running and GROQ_API_KEY is set.';
        }
      }
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    try {
      const updated = await updateProjectTask(project.id, taskId, status);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      onTasksChanged();
    } catch {
      toast.error('Failed to update task status.');
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await deleteProjectTask(project.id, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      onTasksChanged();
      toast.success('Task removed.');
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const togglePhase = (phase: ProjectPhase) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const grouped = useMemo(() => groupTasksByPhase(tasks), [tasks]);
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  return (
    <div className="pm-task-panel">
      <div className="pm-proposal-section">
        <div className="pm-proposal-header">
          <h3 className="pm-proposal-title">
            <i className="bi bi-file-earmark-text me-2" />
            Project Proposal
          </h3>
          <label className="pm-proposal-upload-btn">
            <i className="bi bi-upload me-1" />
            Upload document
            <input type="file" accept=".txt,.md,.json" hidden onChange={handleFileUpload} />
          </label>
        </div>
        <textarea
          className="pm-proposal-textarea"
          placeholder="Paste your project proposal, requirements document, or SOW here…"
          value={proposalText}
          onChange={e => setProposalText(e.target.value)}
          rows={6}
          disabled={generating}
        />
        <button
          type="button"
          className="pm-generate-proposal-btn"
          onClick={handleGenerate}
          disabled={generating || !proposalText.trim()}
        >
          {generating ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Analyzing proposal…
            </>
          ) : (
            <>
              <i className="bi bi-stars me-2" />
              Generate Tasks from Proposal
            </>
          )}
        </button>
      </div>

      <div className="pm-task-meta">
        <span className="pm-task-meta-text">
          {doneCount}/{tasks.length} completed
        </span>
        <div className="pm-task-bar-wrap">
          <div
            className="pm-task-bar-fill"
            style={{ width: tasks.length ? `${(doneCount / tasks.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {loadingTasks && (
        <div className="pm-task-generating">
          <span className="spinner-border spinner-border-sm me-2" role="status" />
          Loading tasks…
        </div>
      )}

      {!loadingTasks && tasks.length === 0 && !generating && (
        <p className="pm-task-empty">
          No tasks yet. Upload or paste a proposal, then click &quot;Generate Tasks from Proposal&quot;.
        </p>
      )}

      {!loadingTasks && tasks.length > 0 && (
        <div className="pm-phase-list">
          {PHASE_ORDER.map(phase => {
            const phaseTasks = grouped.get(phase) ?? [];
            if (phaseTasks.length === 0) return null;
            const isOpen = expandedPhases.has(phase);
            const milestone = phaseTasks[0]?.milestone;

            return (
              <div key={phase} className="pm-phase-block">
                <button type="button" className={`pm-phase-header ${isOpen ? 'open' : ''}`} onClick={() => togglePhase(phase)}>
                  <span className={`pm-task-chevron ${isOpen ? 'rotated' : ''}`}>
                    <i className="bi bi-chevron-right" />
                  </span>
                  <span className="pm-phase-name">{PHASE_LABELS[phase]}</span>
                  {milestone && <span className="pm-phase-milestone">{milestone}</span>}
                  <span className="pm-phase-count">{phaseTasks.length} tasks</span>
                </button>

                {isOpen && (
                  <div className="pm-phase-tasks">
                    {phaseTasks.map(task => (
                      <div key={task.id} className={`pm-rich-task ${task.status === 'DONE' ? 'done' : ''}`}>
                        <div className="pm-rich-task-head">
                          <h4 className="pm-rich-task-title">{task.title}</h4>
                          <span className={`pm-priority-pill ${PRIORITY_CLASS[task.priority] ?? 'medium'}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && <p className="pm-rich-task-desc">{task.description}</p>}
                        <div className="pm-rich-task-meta">
                          {task.estimatedDuration && (
                            <span><i className="bi bi-clock me-1" />{task.estimatedDuration}</span>
                          )}
                          {task.suggestedAssignee && (
                            <span><i className="bi bi-person me-1" />{task.suggestedAssignee}</span>
                          )}
                          {task.milestone && (
                            <span><i className="bi bi-flag me-1" />{task.milestone}</span>
                          )}
                        </div>
                        {task.dependencies?.length > 0 && (
                          <div className="pm-rich-task-deps">
                            <i className="bi bi-diagram-3 me-1" />
                            Depends on: {task.dependencies.join(', ')}
                          </div>
                        )}
                        <div className="pm-rich-task-footer">
                          <select
                            className="pm-task-status-select"
                            value={task.status}
                            onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                          <button type="button" className="pm-task-btn del" onClick={() => handleDelete(task.id)} title="Delete">
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Main page — task counts per project for accordion headers
const PMTasks: React.FC = () => {
  const [projects, setProjects] = useState<CompanyProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTaskGroups, setOpenTaskGroups] = useState<Set<number>>(new Set());
  const [taskStats, setTaskStats] = useState<Record<number, { total: number; done: number }>>({});

  const refreshStats = useCallback(async (projectList: CompanyProjectDTO[]) => {
    const stats: Record<number, { total: number; done: number }> = {};
    await Promise.all(
      projectList.map(async p => {
        try {
          const tasks = await getProjectTasks(p.id);
          stats[p.id] = {
            total: tasks.length,
            done: tasks.filter(t => t.status === 'DONE').length,
          };
        } catch {
          stats[p.id] = { total: 0, done: 0 };
        }
      })
    );
    setTaskStats(stats);
  }, []);

  // Note: getProjectTasks uses skipAuthRedirect so a missing backend endpoint won't log the user out.

  useEffect(() => {
    (async () => {
      try {
        const data = await getPMProjects();
        setProjects(data || []);
        await refreshStats(data || []);
      } catch {
        setError('Failed to load assigned projects.');
        toast.error('Failed to load your projects.');
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshStats]);

  const handleTasksChanged = useCallback(() => {
    refreshStats(projects);
  }, [projects, refreshStats]);

  const toggleTaskGroup = (id: number) =>
    setOpenTaskGroups(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  if (loading) {
    return (
      <div className="pmd-root">
        <div className="pm-skeleton-row">
          {[220, 140].map((w, i) => (
            <div key={i} className="pmd-skeleton" style={{ height: 28, width: w, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pmd-root">
        <div className="pmd-error">
          <i className="bi bi-exclamation-triangle-fill pmd-error-icon-bi" />
          <p className="pmd-error-title">Something went wrong</p>
          <p className="pmd-error-sub">{error}</p>
          <button type="button" className="pmd-btn-retry" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise me-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pmd-root">
      <div className="pmd-header">
        <div>
          <h1 className="pmd-title">Project Tasks</h1>
          <p className="pmd-subtitle">
            Upload or paste a proposal to generate structured tasks with phases, priorities, and dependencies.
          </p>
        </div>
      </div>

      <section className="pmd-section">
        <div className="pmd-section-header">
          <div className="pmd-section-title-group">
            <span className="pmd-section-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
              <i className="bi bi-check2-all" />
            </span>
            <h2 className="pmd-section-title">Project Task Lists</h2>
            <span className="pmd-count-pill">{projects.length} projects</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <p className="pmd-no-data">No projects to show tasks for.</p>
        ) : (
          <div className="pm-task-accordion">
            {projects.map(p => {
              const isOpen = openTaskGroups.has(p.id);
              const stats = taskStats[p.id] ?? { total: 0, done: 0 };
              return (
                <div key={p.id} className="pm-task-group">
                  <div
                    className={`pm-task-group-header ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleTaskGroup(p.id)}
                    onKeyDown={e => e.key === 'Enter' && toggleTaskGroup(p.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="pm-task-group-left">
                      <span className={`pm-task-chevron ${isOpen ? 'rotated' : ''}`}>
                        <i className="bi bi-chevron-right" />
                      </span>
                      <span className="pm-task-group-name">{p.projectTitle}</span>
                    </div>
                    <span
                      className={`pm-task-group-pill ${
                        stats.total > 0 && stats.done === stats.total ? 'all-done' : ''
                      }`}
                    >
                      {stats.done}/{stats.total} done
                    </span>
                  </div>
                  {isOpen && <ProjectTaskPanel project={p} onTasksChanged={handleTasksChanged} />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PMTasks;
