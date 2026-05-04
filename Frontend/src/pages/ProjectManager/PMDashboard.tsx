import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPMProjects, type CompanyProjectDTO } from '../../services/CompanyProjectRepo';
import { toast } from 'react-toastify';
import './PMDashboard.css';


// ─── Main Dashboard ─────────────────────────────────────────────
const PMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<CompanyProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<CompanyProjectDTO | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPMProjects();
        setProjects(data || []);
        if (data?.length) setSelectedProject(data[0]);
      } catch {
        setError('Failed to load assigned projects.');
        toast.error('Failed to load your projects.');
      } finally { setLoading(false); }
    })();
  }, []);


  if (loading) return (
    <div className="pmd-root">
      <div className="pm-skeleton-row">
        {[220, 140].map((w, i) => <div key={i} className="pmd-skeleton" style={{ height: 28, width: w, borderRadius: 6 }} />)}
      </div>
      <div className="pm-project-grid">
        {[0, 1, 2].map(i => <div key={i} className="pmd-skeleton" style={{ height: 200, borderRadius: 14 }} />)}
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

      {/* ── Header ── */}
      <div className="pmd-header">
        <div>
          <h1 className="pmd-title">Project Manager Dashboard</h1>
          <p className="pmd-subtitle">Manage your assigned projects, documents and tasks.</p>
        </div>
        <div className="pmd-header-stats">
          <div className="pmd-stat-card">
            <span className="pmd-stat-label">Assigned Projects</span>
            <span className="pmd-stat-value pmd-stat-value--accent">{projects.length}</span>
          </div>
        </div>
      </div>

      {/* ── Validate bar (placeholder) ── */}
      <div className="pm-validate-bar">
        <div className="pm-validate-bar-left">
          <i className="bi bi-shield-check pm-validate-icon" />
          <div>
            <div className="pm-validate-title">Document Validation</div>
            <div className="pm-validate-sub">Open a project workspace to validate your SRS/SDD against OCL constraints.</div>
          </div>
        </div>
        <button className="pm-validate-btn" disabled>
          <i className="bi bi-check2-circle me-2" />Validate Document
        </button>
      </div>

      {/* ── Assigned Projects Cards ── */}
      <section className="pmd-section">
        <div className="pmd-section-header">
          <div className="pmd-section-title-group">
            <span className="pmd-section-icon pmd-section-icon--blue"><i className="bi bi-briefcase-fill" /></span>
            <h2 className="pmd-section-title">Assigned Projects</h2>
            <span className="pmd-count-pill">{projects.length}</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="pm-empty-state">
            <i className="bi bi-inbox pm-empty-icon" />
            <p>No projects assigned to you yet.</p>
          </div>
        ) : (
          <div className="pm-project-grid">
            {projects.map(p => (
              <div
                key={p.id}
                className={`pm-project-card ${selectedProject?.id === p.id ? 'selected' : ''}`}
                onClick={() => setSelectedProject(p)}
              >
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
                  <span><i className="bi bi-calendar2-check me-1" />{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  className="pm-go-btn"
                  onClick={e => { e.stopPropagation(); navigate(`/TechnicalDocWorkSpaces/${p.id}`); }}
                >
                  <i className="bi bi-arrow-right-circle-fill me-2" />Go to Project
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Selected Project Detail Panel ── */}
      {selectedProject && (
        <section className="pmd-section pm-detail-section">
          <div className="pmd-section-header">
            <div className="pmd-section-title-group">
              <span className="pmd-section-icon" style={{ background: '#f0fdf4', color: '#059669' }}>
                <i className="bi bi-file-earmark-code-fill" />
              </span>
              <h2 className="pmd-section-title">{selectedProject.projectTitle}</h2>
            </div>
            <button className="pm-go-btn-sm" onClick={() => navigate(`/TechnicalDocWorkSpaces/${selectedProject.id}`)}>
              <i className="bi bi-box-arrow-up-right me-1" />Open Workspace
            </button>
          </div>

          <div className="pm-detail-grid">
            {/* Left: OCL + Guidelines */}
            <div className="pm-detail-col">
              <div className="pm-detail-block">
                <div className="pm-detail-block-title">
                  <i className="bi bi-code-square me-2" style={{ color: '#3b82f6' }} />OCL Constraints
                </div>
                <pre className="pm-ocl-box">{selectedProject.oclRules || 'No OCL constraints extracted for this project.'}</pre>
              </div>
              <div className="pm-detail-block">
                <div className="pm-detail-block-title">
                  <i className="bi bi-stars me-2" style={{ color: '#d97706' }} />AI Guidelines for SRS / SDD
                </div>
                <div className="pm-guidelines-box">{selectedProject.guidelines || 'No guidelines generated.'}</div>
              </div>
            </div>

            {/* Right: Full Proposal */}
            <div className="pm-detail-col">
              <div className="pm-detail-block">
                <div className="pm-detail-block-title">
                  <i className="bi bi-file-earmark-person me-2" style={{ color: '#0891b2' }} />Original Client Proposal
                </div>
                <div className="pm-proposal-fields">
                  {[
                    ['Project Title', selectedProject.projectTitle],
                    ['Type', selectedProject.projectType],
                    ['Client', selectedProject.clientName],
                    ['Budget', selectedProject.budgetUsd ? `$${Number(selectedProject.budgetUsd).toLocaleString()} USD` : null],
                    ['Duration', selectedProject.durationDays ? `${selectedProject.durationDays} days` : null],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label as string} className="pm-proposal-row">
                      <span className="pm-proposal-label">{label}</span>
                      <span className="pm-proposal-value">{value}</span>
                    </div>
                  ))}
                  {selectedProject.projectDescription && (
                    <div className="pm-proposal-row pm-proposal-row--full">
                      <span className="pm-proposal-label">Description</span>
                      <div className="pm-proposal-text">{selectedProject.projectDescription}</div>
                    </div>
                  )}
                  {selectedProject.mainFeatures && (
                    <div className="pm-proposal-row pm-proposal-row--full">
                      <span className="pm-proposal-label">Main Features</span>
                      <div className="pm-proposal-text">{selectedProject.mainFeatures}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}



    </div>
  );
};

export default PMDashboard;