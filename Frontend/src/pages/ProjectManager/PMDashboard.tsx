import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPMProjects, type CompanyProjectDTO } from '../../services/CompanyProjectRepo';
import { toast } from 'react-toastify';
import './PMDashboard.css';


// ─── Helper: load task count for a project ─────────────────────────────
interface Task { id: string; text: string; done: boolean }
const loadTasks = (projectId: number): Task[] => {
  try { return JSON.parse(localStorage.getItem(`pm_tasks_${projectId}`) || '[]'); }
  catch { return []; }
};

// ─── Main Dashboard ─────────────────────────────────────────────────────
const PMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CompanyProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Compute stats
  const totalTasks = projects.reduce((sum, p) => sum + loadTasks(p.id).length, 0);
  const doneTasks = projects.reduce((sum, p) => sum + loadTasks(p.id).filter(t => t.done).length, 0);
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // ── Loading skeleton ──
  if (loading) return (
    <div className="pmd-root">
      <div className="pm-skeleton-row">
        {[220, 160].map((w, i) => <div key={i} className="pmd-skeleton" style={{ height: 30, width: w, borderRadius: 8 }} />)}
      </div>
      <div className="pmd-stats-row">
        {[0, 1, 2].map(i => <div key={i} className="pmd-skeleton" style={{ height: 80, borderRadius: 14 }} />)}
      </div>
      <div className="pm-project-grid">
        {[0, 1, 2].map(i => <div key={i} className="pmd-skeleton" style={{ height: 220, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div className="pmd-root">
      <div className="pmd-error">
        <i className="bi bi-exclamation-triangle-fill pmd-error-icon-bi" />
        <p className="pmd-error-title">Something went wrong</p>
        <p className="pmd-error-sub">{error}</p>
        <button className="pmd-btn-retry" onClick={() => window.location.reload()}>
          <i className="bi bi-arrow-clockwise" />Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="pmd-root">

      {/* ── Header ── */}
      <div className="pmd-header">
        <div>
          <h1 className="pmd-title">Dashboard</h1>
          <p className="pmd-subtitle">Overview of your assigned projects and progress.</p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="pmd-stats-row">
        <div className="pmd-stat-card">
          <div className="pmd-stat-icon pmd-stat-icon--blue">
            <i className="bi bi-briefcase-fill" />
          </div>
          <div className="pmd-stat-info">
            <span className="pmd-stat-label">Total Projects</span>
            <span className="pmd-stat-value">{projects.length}</span>
          </div>
        </div>
        <div className="pmd-stat-card">
          <div className="pmd-stat-icon pmd-stat-icon--violet">
            <i className="bi bi-check2-all" />
          </div>
          <div className="pmd-stat-info">
            <span className="pmd-stat-label">Tasks Done</span>
            <span className="pmd-stat-value">{doneTasks}<span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>/{totalTasks}</span></span>
          </div>
        </div>
        <div className="pmd-stat-card">
          <div className="pmd-stat-icon pmd-stat-icon--emerald">
            <i className="bi bi-graph-up-arrow" />
          </div>
          <div className="pmd-stat-info">
            <span className="pmd-stat-label">Completion</span>
            <span className="pmd-stat-value">{taskPct}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>%</span></span>
          </div>
        </div>
      </div>

      {/* ── Projects Section ── */}
      <section className="pmd-section">
        <div className="pmd-section-header">
          <div className="pmd-section-title-group">
            <span className="pmd-section-icon pmd-section-icon--blue"><i className="bi bi-briefcase-fill" /></span>
            <h2 className="pmd-section-title">Your Projects</h2>
            <span className="pmd-count-pill">{projects.length}</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="pm-empty-state">
            <i className="bi bi-inbox pm-empty-icon" />
            <p style={{ fontWeight: 600, color: '#64748b', fontSize: 15 }}>No projects assigned yet</p>
            <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 320 }}>
              When a company assigns you a project, it will appear here with all its details.
            </p>
          </div>
        ) : (
          <div className="pm-project-grid">
            {projects.map((p, i) => {
              const tasks = loadTasks(p.id);
              const done = tasks.filter(t => t.done).length;
              const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="pm-project-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => navigate(`/TechnicalDocWorkSpaces/${p.id}`)}
                >
                  <div className="pm-card-body">
                    <div className="pm-card-top">
                      <span className="pm-badge-status">ASSIGNED</span>
                      {p.ndaSigned && <span className="pm-badge-nda"><i className="bi bi-shield-check-fill me-1" />NDA</span>}
                    </div>
                    <h3 className="pm-card-title">{p.projectTitle}</h3>
                    {p.projectType && <span className="pm-card-type">{p.projectType}</span>}
                    <div className="pm-card-meta">
                      {p.clientName && <span><i className="bi bi-person me-1" />{p.clientName}</span>}
                      {p.budgetUsd && <span><i className="bi bi-currency-dollar me-1" />${Number(p.budgetUsd).toLocaleString()}</span>}
                      {p.durationDays && <span><i className="bi bi-hourglass-split me-1" />{p.durationDays}d</span>}
                    </div>
                    {/* Task progress mini-bar */}
                    {tasks.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: 2, transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: pct === 100 ? '#059669' : '#64748b' }}>{pct}%</span>
                      </div>
                    )}
                  </div>
                  <div className="pm-card-footer">
                    <span className="pm-card-date">
                      <i className="bi bi-calendar2" />
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button
                      className="pm-go-btn"
                      style={{ height: 32, fontSize: 12, padding: '0 14px' }}
                      onClick={e => { e.stopPropagation(); navigate(`/TechnicalDocWorkSpaces/${p.id}`); }}
                    >
                      Open <i className="bi bi-arrow-right" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default PMDashboard;