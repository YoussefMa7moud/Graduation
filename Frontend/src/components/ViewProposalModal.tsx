import React from 'react';
import '../pages/Client/CreateProposal.css'; // Reusing styles

interface ProposalData {
  id?: number;
  projectTitle: string;
  projectType: string;
  problemSolved: string;
  description: string;
  mainFeatures: string;
  userRoles: string;
  scalability: string;
  durationDays: number;
  budgetUsd: number;
  ndaRequired: boolean;
  codeOwnership: string;
  maintenancePeriod: string;
  status: string;
  createdAt?: string;
}

interface ViewProposalModalProps {
  proposal: ProposalData;
  onClose: () => void;
}

const ViewProposalModal: React.FC<ViewProposalModalProps> = ({ proposal, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>{proposal.projectTitle}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="proposal-status-badge" style={{ 
              marginBottom: '20px', 
              padding: '8px 12px', 
              borderRadius: '6px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              display: 'inline-block',
              fontWeight: 600
          }}>
            Status: {proposal.status}
          </div>

          <div className="proposal-section" style={{ marginBottom: '24px' }}>
            <h5 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Project Overview</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div><strong>Type:</strong> {proposal.projectType}</div>
                <div><strong>Budget:</strong> ${proposal.budgetUsd}</div>
                <div><strong>Duration:</strong> {proposal.durationDays} Days</div>
                <div><strong>Scalability:</strong> {proposal.scalability}</div>
            </div>
            <div style={{ marginTop: '16px' }}>
                <strong>Description:</strong>
                <p style={{ color: '#555', marginTop: '4px' }}>{proposal.description}</p>
            </div>
            <div style={{ marginTop: '16px' }}>
                <strong>Problem Solved:</strong>
                <p style={{ color: '#555', marginTop: '4px' }}>{proposal.problemSolved}</p>
            </div>
          </div>

          <div className="proposal-section" style={{ marginBottom: '24px' }}>
            <h5 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Technical Requirements</h5>
            <div style={{ marginTop: '12px' }}>
                <strong>Main Features:</strong>
                <p style={{ color: '#555', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{proposal.mainFeatures}</p>
            </div>
            <div style={{ marginTop: '16px' }}>
                <strong>User Roles:</strong>
                <p style={{ color: '#555', marginTop: '4px' }}>{proposal.userRoles}</p>
            </div>
          </div>

          <div className="proposal-section">
            <h5 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Legal & Terms</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div><strong>NDA Required:</strong> {proposal.ndaRequired ? 'Yes' : 'No'}</div>
                <div><strong>Code Ownership:</strong> {proposal.codeOwnership}</div>
                <div><strong>Maintenance:</strong> {proposal.maintenancePeriod}</div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewProposalModal;
