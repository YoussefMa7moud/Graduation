import React, { useState, useEffect, useCallback } from 'react';
import { getPMProjects, type CompanyProjectDTO } from '../../services/CompanyProjectRepo';
import { askGroq } from '../../services/geminiService';
import { toast } from 'react-toastify';
import './PMDashboard.css';

// ─── Task helpers ───────────────────────────────────────────────
interface Task { id: string; text: string; done: boolean; }

const loadTasks = (projectId: number): Task[] => {
  try { return JSON.parse(localStorage.getItem(`pm_tasks_${projectId}`) || '[]'); }
  catch { return []; }
};
const saveTasks = (projectId: number, tasks: Task[]) =>
  localStorage.setItem(`pm_tasks_${projectId}`, JSON.stringify(tasks));

// ─── ProjectTaskPanel ───────────────────────────────────────────
const ProjectTaskPanel: React.FC<{ project: CompanyProjectDTO }> = ({ project }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(project.id));
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const persistAndSet = useCallback((next: Task[]) => {
    setTasks(next);
    saveTasks(project.id, next);
  }, [project.id]);

  useEffect(() => {
    if (tasks.length === 0) generateTasks();
  }, []); // eslint-disable-line

  const generateTasks = async () => {
    setGenerating(true);
    try {
      const prompt = `For the project "${project.projectTitle}", based on these guidelines:
${project.guidelines || 'Standard software project.'}
Generate exactly 8 actionable to-do tasks for the Project Manager.
Return ONLY a valid JSON array of strings. Example: ["Task 1","Task 2"]`;
      const res = await askGroq(prompt);
      const match = res.match(/\[[\s\S]*\]/);
      if (match) {
        const texts: string[] = JSON.parse(match[0]);
        persistAndSet(texts.map(text => ({ id: crypto.randomUUID(), text, done: false })));
        toast.success('Tasks generated!');
      } else { toast.error('Could not parse AI response.'); }
    } catch { toast.error('AI task generation failed.'); }
    finally { setGenerating(false); }
  };

  const addTask = () => {
    if (!input.trim()) return;
    persistAndSet([...tasks, { id: crypto.randomUUID(), text: input.trim(), done: false }]);
    setInput('');
  };
  const toggle = (id: string) => persistAndSet(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => persistAndSet(tasks.filter(t => t.id !== id));
  const saveEdit = (id: string) => {
    persistAndSet(tasks.map(t => t.id === id ? { ...t, text: editText } : t));
    setEditingId(null);
  };

  const done = tasks.filter(t => t.done).length;

  return (
    <div className="pm-task-panel">
      {/* Progress */}
      <div className="pm-task-meta">
        <span className="pm-task-meta-text">{done}/{tasks.length} completed</span>
        <div className="pm-task-bar-wrap">
          <div className="pm-task-bar-fill" style={{ width: tasks.length ? `${(done / tasks.length) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* Task list */}
      <div className="pm-task-list">
        {generating && (
          <div className="pm-task-generating">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            AI is generating tasks…
          </div>
        )}
        {tasks.length === 0 && !generating && (
          <p className="pm-task-empty">No tasks yet. Add one or let AI generate them.</p>
        )}
        {tasks.map(t => (
          <div key={t.id} className={`pm-task-item ${t.done ? 'done' : ''}`}>
            <input type="checkbox" className="pm-task-cb" checked={t.done} onChange={() => toggle(t.id)} />
            {editingId === t.id ? (
              <input
                className="pm-task-edit-input"
                value={editText}
                autoFocus
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(t.id); if (e.key === 'Escape') setEditingId(null); }}
              />
            ) : (
              <span className="pm-task-text" onDoubleClick={() => { setEditingId(t.id); setEditText(t.text); }}>{t.text}</span>
            )}
            <div className="pm-task-actions">
              {editingId === t.id
                ? <button className="pm-task-btn save" onClick={() => saveEdit(t.id)}><i className="bi bi-check-lg" /></button>
                : <button className="pm-task-btn edit" onClick={() => { setEditingId(t.id); setEditText(t.text); }}><i className="bi bi-pencil" /></button>
              }
              <button className="pm-task-btn del" onClick={() => remove(t.id)}><i className="bi bi-trash" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add row */}
      <div className="pm-task-add-row">
        <input
          className="pm-task-input"
          placeholder="Add a task… (Enter to save)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <button className="pm-task-add-btn" onClick={addTask}><i className="bi bi-plus-lg" /></button>
        <button className="pm-task-ai-btn" onClick={generateTasks} disabled={generating}>
          <i className="bi bi-stars me-1" />{generating ? 'Generating…' : 'AI Regenerate'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Tasks Page ─────────────────────────────────────────────
const PMTasks: React.FC = () => {
  const [projects, setProjects] = useState<CompanyProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTaskGroups, setOpenTaskGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const data = await getPMProjects();
        setProjects(data || []);
      } catch {
        setError('Failed to load assigned projects.');
        toast.error('Failed to load your projects.');
      } finally { setLoading(false); }
    })();
  }, []);

  const toggleTaskGroup = (id: number) =>
    setOpenTaskGroups(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return (
    <div className="pmd-root">
      <div className="pm-skeleton-row">
        {[220, 140].map((w, i) => <div key={i} className="pmd-skeleton" style={{ height: 28, width: w, borderRadius: 6 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="pmd-root">
      <div className="pmd-error">
        <i className="bi bi-exclamation-triangle-fill pmd-error-icon-bi" />
        <p className="pmd-error-title">Something went wrong</p>
        <p className="pmd-error-sub">{error}</p>
        <button className="pmd-btn-retry" onClick={() => window.location.reload()}>
          <i className="bi bi-arrow-clockwise me-2" />Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="pmd-root">
      <div className="pmd-header">
        <div>
          <h1 className="pmd-title">Project Tasks</h1>
          <p className="pmd-subtitle">Manage action items and to-do lists for your assigned projects.</p>
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
              const tasks = loadTasks(p.id);
              const done = tasks.filter(t => t.done).length;
              return (
                <div key={p.id} className="pm-task-group">
                  <div
                    className={`pm-task-group-header ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleTaskGroup(p.id)}
                  >
                    <div className="pm-task-group-left">
                      <span className={`pm-task-chevron ${isOpen ? 'rotated' : ''}`}>
                        <i className="bi bi-chevron-right" />
                      </span>
                      <span className="pm-task-group-name">{p.projectTitle}</span>
                    </div>
                    <span className={`pm-task-group-pill ${tasks.length > 0 && done === tasks.length ? 'all-done' : ''}`}>
                      {done}/{tasks.length} done
                    </span>
                  </div>
                  {isOpen && <ProjectTaskPanel project={p} />}
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
