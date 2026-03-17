import React, { useState, useEffect } from 'react';
import { PMService } from '../../services/ProjectManager/PMService';
import { toast } from 'react-toastify';
import './IncomingProposals.css';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconDollar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const IconInbox = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22,12 16,12 14,15 10,15 8,12 2,12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const PageHeader: React.FC<{ count: number; loading?: boolean }> = ({ count, loading }) => (
  <header className="proposals-header">
    <div>
      <h1 className="page-title">Incoming Proposals</h1>
      <p className="page-subtitle">Review and respond to client project requests.</p>
    </div>
    <div className="proposals-stat-card">
      <div className="proposals-stat-inner">
        <span className="stat-label">Pending</span>
        <span className={`stat-value${loading ? ' stat-value--loading' : ''}`}>
          {loading ? '—' : count}
        </span>
      </div>
      {!loading && count > 0 && <span className="stat-pulse-dot" />}
    </div>
  </header>
);

interface ProposalCardProps {
  prop: any;
  index: number;
  onAction: (id: number, action: 'ACCEPTED' | 'DENIED') => void;
  isActing: number | null;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ prop, index, onAction, isActing }) => {
  const busy = isActing === prop.id;
  return (
    <div
      className={`proposal-row-card${busy ? ' proposal-row-card--busy' : ''}`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="prop-main-info">
        <div className="prop-icon">
          <IconDoc />
        </div>
        <div className="prop-text">
          <h3 className="prop-title">{prop.projectTitle}</h3>
          <p className="client-tagline">
            Client <span className="client-dot">·</span>
            <strong>{prop.clientName}</strong>
          </p>
        </div>
      </div>

      <div className="prop-details">
        <span className="detail-pill detail-pill--green">
          <IconDollar />
          ${prop.budgetUsd.toLocaleString()}
        </span>
        <span className="detail-pill detail-pill--amber">
          <IconClock />
          {prop.durationDays}d
        </span>
      </div>

      <div className="prop-divider" />

      <div className="prop-actions">
        <button
          className="btn-approve"
          disabled={busy}
          onClick={() => onAction(prop.id, 'ACCEPTED')}
        >
          <IconCheck /> Approve
        </button>
        <button
          className="btn-reject"
          disabled={busy}
          onClick={() => onAction(prop.id, 'DENIED')}
        >
          <IconX /> Reject
        </button>
      </div>
    </div>
  );
};

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <div className="proposal-skeleton" style={{ animationDelay: `${index * 0.15}s` }} />
);

const EmptyState: React.FC = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <IconInbox />
    </div>
    <div>
      <p className="empty-state-title">No pending proposals</p>
      <p className="empty-state-sub">New client requests will appear here when submitted.</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const IncomingProposals: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isActing,  setIsActing]  = useState<number | null>(null);

  useEffect(() => { loadProposals(); }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await PMService.getPendingProposals();
      setProposals(data);
    } catch {
      toast.error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'ACCEPTED' | 'DENIED') => {
    setIsActing(id);
    try {
      await PMService.updateStatus(id, action);
      toast.success(`Proposal ${action === 'ACCEPTED' ? 'approved' : 'rejected'} successfully`);
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setIsActing(null);
    }
  };

  if (loading) {
    return (
      <div className="proposals-container animate-fade-in">
        <PageHeader count={0} loading />
        <div className="proposals-list">
          {[0, 1, 2].map(i => <SkeletonCard key={i} index={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="proposals-container animate-fade-in">
      <PageHeader count={proposals.length} />
      <div className="proposals-list">
        {proposals.length === 0 ? (
          <EmptyState />
        ) : (
          proposals.map((prop, i) => (
            <ProposalCard
              key={prop.id}
              prop={prop}
              index={i}
              onAction={handleAction}
              isActing={isActing}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default IncomingProposals;