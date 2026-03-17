import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PMService } from '../../services/ProjectManager/PMService';
import { toast } from 'react-toastify';
import './PMDashboard.css';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Proposal {
  id: number;
  projectTitle: string;
  clientName: string;
  budgetUsd: number;
  durationDays: number;
}

interface ActiveProject {
  id: number;
  projectTitle: string;
  projectType: string;
}

interface RecentActivity {
  id: number;
  description: string;
  timestamp: string;
}

interface UpcomingDeadline {
  id: number;
  projectTitle: string;
  deadline: string;
  daysLeft: number;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);

const IconActivity = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton: React.FC<{ height?: number; width?: string; radius?: number }> = ({
  height = 20, width = '100%', radius = 6,
}) => (
  <div className="pmd-skeleton" style={{ height, width, borderRadius: radius }} />
);

// ─── Main component ───────────────────────────────────────────────────────────
const PMDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [proposals,      setProposals]      = useState<Proposal[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterType,     setFilterType]     = useState<'all' | 'proposals' | 'projects'>('all');
  const [error,          setError]          = useState<string | null>(null);
  const [actingId,       setActingId]       = useState<number | null>(null);

  const [recentActivities] = useState<RecentActivity[]>([
    { id: 1, description: "Proposal for 'Tech Doc Project A' accepted", timestamp: '2 hours ago' },
    { id: 2, description: "New project 'API Documentation' started",    timestamp: '1 day ago'   },
    { id: 3, description: "Client feedback received for 'User Manual B'", timestamp: '3 days ago' },
  ]);

  const [upcomingDeadlines] = useState<UpcomingDeadline[]>([
    { id: 1, projectTitle: 'Tech Doc Project A', deadline: '2023-10-15', daysLeft: 5  },
    { id: 2, projectTitle: 'API Documentation',  deadline: '2023-10-20', daysLeft: 10 },
    { id: 3, projectTitle: 'User Manual B',       deadline: '2023-10-25', daysLeft: 15 },
  ]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pending, active] = await Promise.all([
        PMService.getPendingProposals(),
        PMService.getActiveProjects(),
      ]);
      setProposals(pending);
      setActiveProjects(active);
    } catch (err) {
      const msg = 'Failed to load dashboard data. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id: number, status: 'ACCEPTED' | 'DENIED') => {
    setActingId(id);
    try {
      await PMService.updateStatus(id, status);
      toast.success(`Proposal ${status === 'ACCEPTED' ? 'approved' : 'denied'} successfully.`);
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error('Failed to update proposal status. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  const filteredProposals = useMemo(() => {
    if (!searchTerm) return proposals;
    const q = searchTerm.toLowerCase();
    return proposals.filter(p =>
      p.projectTitle.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q)
    );
  }, [proposals, searchTerm]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return activeProjects;
    const q = searchTerm.toLowerCase();
    return activeProjects.filter(p =>
      p.projectTitle.toLowerCase().includes(q) ||
      p.projectType.toLowerCase().includes(q)
    );
  }, [activeProjects, searchTerm]);

  const displayedProposals = filteredProposals.slice(0, 4);
  const showProposals = filterType === 'all' || filterType === 'proposals';
  const showProjects  = filterType === 'all' || filterType === 'projects';

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pmd-root">
        {/* Header skeleton */}
        <div className="pmd-header">
          <div>
            <Skeleton height={28} width="240px" />
            <div style={{ marginTop: 8 }}><Skeleton height={14} width="320px" /></div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton height={72} width="140px" radius={10} />
            <Skeleton height={72} width="140px" radius={10} />
          </div>
        </div>
        <Skeleton height={44} radius={8} />
        <div style={{ marginTop: 24 }}>
          <Skeleton height={20} width="140px" />
          <div className="pmd-proposal-grid" style={{ marginTop: 16 }}>
            {[0,1,2,3].map(i => <Skeleton key={i} height={160} radius={12} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="pmd-root">
        <div className="pmd-error">
          <div className="pmd-error-icon">
            <IconRefresh />
          </div>
          <p className="pmd-error-title">Something went wrong</p>
          <p className="pmd-error-sub">{error}</p>
          <button className="pmd-btn-retry" onClick={loadData}>
            <IconRefresh /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pmd-root">

      {/* ── Header ── */}
      <div className="pmd-header">
        <div>
          <h1 className="pmd-title">Project Manager Dashboard</h1>
      </div>
        <div className="pmd-header-stats">
          <div className="pmd-stat-card">
            <span className="pmd-stat-label">Pending Proposals</span>
            <span className="pmd-stat-value pmd-stat-value--accent">{proposals.length}</span>
          </div>
          <div className="pmd-stat-card">
            <span className="pmd-stat-label">Active Projects</span>
            <span className="pmd-stat-value">{activeProjects.length}</span>
          </div>
        </div>
      </div>

      {/* ── Search & filter ── */}
      <div className="pmd-search-bar">
        <div className="pmd-search-wrap">
          <span className="pmd-search-icon"><IconSearch /></span>
          <input
            type="text"
            className="pmd-search-input"
            placeholder="Search proposals and projects…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search proposals and projects"
          />
        </div>
        <select
          className="pmd-filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value as typeof filterType)}
        >
          <option value="all">All</option>
          <option value="proposals">Proposals only</option>
          <option value="projects">Projects only</option>
        </select>
      </div>

      {/* ── Proposal requests ── */}
      {showProposals && (
        <section className="pmd-section">
          <div className="pmd-section-header">
            <div className="pmd-section-title-group">
              <h2 className="pmd-section-title">Incoming Proposals</h2>
              <span className="pmd-count-pill">{filteredProposals.length}</span>
            </div>
            <button
              className="pmd-section-link"
              onClick={() => navigate('/proposalrequests')}
              aria-label="View all incoming proposal "
            >
              View all <IconChevronRight />
            </button>
          </div>

          {displayedProposals.length === 0 ? (
            <p className="pmd-no-data">No pending proposals match your search.</p>
          ) : (
            <>
              <div className="pmd-proposal-grid">
                {displayedProposals.map((prop, i) => (
                  <div
                    key={prop.id}
                    className={`pmd-proposal-card${actingId === prop.id ? ' pmd-proposal-card--busy' : ''}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="pmd-proposal-card-top">
                      <span className="pmd-tag-new">NEW</span>
                      <h3 className="pmd-proposal-title">{prop.projectTitle}</h3>
                      <p className="pmd-proposal-client">
                        Client <span className="pmd-dot">·</span>
                        <strong>{prop.clientName}</strong>
                      </p>
                    </div>
                    <div className="pmd-proposal-meta">
                      <span className="pmd-meta-pill pmd-meta-pill--green">
                        ${prop.budgetUsd.toLocaleString()}
                      </span>
                      <span className="pmd-meta-pill pmd-meta-pill--amber">
                        {prop.durationDays}d
                      </span>
                    </div>
                    <div className="pmd-proposal-actions">
                      <button
                        className="pmd-btn-accept"
                        disabled={actingId !== null}
                        onClick={() => handleAction(prop.id, 'ACCEPTED')}
                        aria-label={`Accept proposal for ${prop.projectTitle}`}
                      >
                        <IconCheck /> Accept
                      </button>
                      <button
                        className="pmd-btn-deny"
                        disabled={actingId !== null}
                        onClick={() => handleAction(prop.id, 'DENIED')}
                        aria-label={`Deny proposal for ${prop.projectTitle}`}
                      >
                        <IconX /> Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProposals.length > 4 && (
                <div className="pmd-view-more">
                  <button className="pmd-btn-view-more" onClick={() => navigate('/proposalrequests')}>
                    View all proposals <IconArrowRight />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Active projects ── */}
      {showProjects && (
        <section className="pmd-section">
          <div className="pmd-section-header">
            <div className="pmd-section-title-group">
              <h2 className="pmd-section-title">Active Projects</h2>
              <span className="pmd-count-pill">{filteredProjects.length}</span>
            </div>
            <button
              className="pmd-section-link"
              onClick={() => navigate('/TechnicalDocWorkSpaces')}
              aria-label="View all active projects"
            >
              View all active projects <IconChevronRight />
            </button>
          </div>

          {filteredProjects.length === 0 ? (
            <p className="pmd-no-data">No active projects match your search.</p>
          ) : (
            <div className="pmd-table-wrap">
              <table className="pmd-table" aria-label="Active projects">
                <thead>
                  <tr>
                    <th>Project name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Technical doc</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project.id}>
                      <td className="pmd-td-bold">{project.projectTitle}</td>
                      <td className="pmd-td-muted">{project.projectType}</td>
                      <td><span className="pmd-badge-active">Active</span></td>
                      <td>
                        <button
                          className="pmd-doc-link"
                          onClick={() => navigate(`/pm/workspace/${project.id}`)}
                          aria-label={`View doc for ${project.projectTitle}`}
                        >
                          <IconDoc /> miu.pdf
                        </button>
                      </td>
                      <td>
                        <button
                          className="pmd-btn-workspace"
                          onClick={() => navigate(`/pm/workspace/${project.id}`)}
                          aria-label={`Open workspace for ${project.projectTitle}`}
                        >
                          Open workspace <IconArrowRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── Two-column bottom ── */}
      <div className="pmd-bottom-grid">

        {/* Recent activities */}
        <section className="pmd-section">
          <div className="pmd-section-header pmd-section-header--no-link">
            <div className="pmd-section-title-group">
              <span className="pmd-section-icon pmd-section-icon--blue"><IconActivity /></span>
              <h2 className="pmd-section-title">Recent activity</h2>
            </div>
          </div>
          <div className="pmd-activity-list">
            {recentActivities.map((a, i) => (
              <div key={a.id} className="pmd-activity-item" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="pmd-activity-dot" />
                <div className="pmd-activity-body">
                  <p className="pmd-activity-desc">{a.description}</p>
                  <span className="pmd-activity-time">{a.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming deadlines */}
        <section className="pmd-section">
          <div className="pmd-section-header pmd-section-header--no-link">
            <div className="pmd-section-title-group">
              <span className="pmd-section-icon pmd-section-icon--amber"><IconClock /></span>
              <h2 className="pmd-section-title">Upcoming deadlines</h2>
            </div>
          </div>
          <div className="pmd-deadline-list">
            {upcomingDeadlines.map((d, i) => (
              <div key={d.id} className="pmd-deadline-item" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="pmd-deadline-info">
                  <p className="pmd-deadline-title">{d.projectTitle}</p>
                  <p className="pmd-deadline-date">{d.deadline}</p>
                </div>
                <span className={`pmd-days-left${d.daysLeft <= 7 ? ' pmd-days-left--urgent' : ''}`}>
                  {d.daysLeft}d
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default PMDashboard;