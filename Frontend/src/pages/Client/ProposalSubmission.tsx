
import './ProposalSubmission.css';
import { useEffect, useState } from 'react';

/* ================= TYPES ================= */

type ProposalStatus = 'DECLINED' | 'APPROVED' | 'PENDING';

interface Proposal {
  id: string;
  projectName: string;
  targetCompany: string;
  contractType: string;
  contractSummary: string;
  jurisdiction: string;
  priority: string;
  status: ProposalStatus;
  submittedAt: string;
}

/* ================= COMPONENT ================= */

const ProposalSubmission = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  /* 🔗 Later replace with API */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('proposals') || '[]');
    setProposals(stored);
  }, []);

  return (
    <>


      <div className="submission-page container">

        {/* Breadcrumb */}
        <div className="submission-breadcrumb">
          Client Portal › My Proposals › Submission Status
        </div>

        {/* Header */}
        <div className="submission-header">
          <h2>Proposal Submission Status</h2>
          <p>
            Track the real-time review status and feedback of your submitted legal proposals.
          </p>
        </div>

        {/* Proposals */}
        {proposals.length === 0 && (
          <p className="text-muted mt-4">No proposals submitted yet.</p>
        )}

        {proposals.map(proposal => (
          <div
            key={proposal.id}
            className="proposal-card"
            data-status={proposal.status}
          >
            <div className="proposal-header">

              <div className="proposal-left">
                <div className="proposal-icon" />
                <div>
                  <div className="proposal-title">
                    {proposal.projectName}
                    <span
                      className={`status-badge ${proposal.status.toLowerCase()}`}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  <div className="proposal-meta">
                    {proposal.contractType} · {proposal.targetCompany} · {proposal.submittedAt}
                  </div>
                </div>
              </div>

              <div className="proposal-actions">
                {proposal.status === 'DECLINED' && (
                  <button className="btn-primary">
                    Modify & Resubmit
                  </button>
                )}

                {proposal.status === 'APPROVED' && (
                  <button className="btn-secondary">
                    View Contract
                  </button>
                )}

                {proposal.status === 'PENDING' && (
                  <span className="review-progress">
                    Review in progress…
                  </span>
                )}
              </div>

            </div>

            {/* Summary / Reviewer Area */}
            <div className="reviewer-note">
              <strong>Contract Summary</strong>
              <p>{proposal.contractSummary}</p>

              <small className="text-muted">
                Jurisdiction: {proposal.jurisdiction} · Priority: {proposal.priority}
              </small>
            </div>
          </div>
        ))}

        {/* Stats */}
        <div className="submission-stats">
          <div className="stat-box">
            <h6>Total Submissions</h6>
            <strong>{proposals.length}</strong>
          </div>

          <div className="stat-box highlight">
            <h6>Average Turnaround</h6>
            <strong>3.2 Days</strong>
          </div>

          <div className="stat-box">
            <h6>Need Clarification?</h6>
            <p>Message the reviewer or contact legal support.</p>
          </div>
        </div>

      </div>
    </>
  );
};

export default ProposalSubmission;
