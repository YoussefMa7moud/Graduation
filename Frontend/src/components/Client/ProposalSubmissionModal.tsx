import React, { useEffect, useState } from 'react';
import { GetAllProposals } from '../../services/Client/ProposalDocumnet';
import { sendProposalToCompany } from '../../services/Client/SubmitProposal';
import { toast } from 'react-toastify';
import './ProposalSubmissionModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  company: any;
}

const ProposalSubmissionModal: React.FC<Props> = ({ isOpen, onClose, company }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      if (storedUser && token) {
        try {
          const { userId } = JSON.parse(storedUser);
          
          const proposalsData = await GetAllProposals(userId);
          
          const subsResponse = await fetch('/api/submissions/my-submissions', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const subsData = await subsResponse.json();

          setProposals(Array.isArray(proposalsData) ? proposalsData : proposalsData ? [proposalsData] : []);
          setSubmissions(Array.isArray(subsData) ? subsData : []);
        } catch (error) {
          toast.error("Failed to load your proposals data.");
        }
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedId) return toast.warning("Please select a proposal first.");

    setIsSubmitting(true);
    try {
      await sendProposalToCompany({
        proposalId: selectedId,
        softwareCompanyId: company.id
      });

      toast.success(`Proposal successfully sent to ${company.name}`);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to send proposal. Please try again.");
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-fast" onClick={onClose}>
      <div className="modal-content-glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header-brand">
          <div className="d-flex align-items-center gap-3">
             <img 
               src={company.logo ? `data:image/png;base64,${company.logo}` : ''} 
               alt="" 
               className="mini-logo" 
             />
             <h4 className="m-0 fw-bold">{company.name}</h4>
          </div>
          <button className="close-btn-minimal" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body-split">
          <div className="info-pane">
            <label className="text-uppercase small fw-bold text-muted">About Company</label>
            <p className="mt-2">{company.description}</p>
          </div>
          
          <div className="action-pane">
            <label className="text-uppercase small fw-bold text-muted mb-3 d-block">
              Choose Proposal
            </label>
            
            <div className="proposal-grid">
              {proposals.length > 0 ? (
                proposals.map(p => {
                  const submission = submissions.find(s => s.proposalId === p.id);
                  const isSubmitted = !!submission;
                  const isSubmittedToOther = isSubmitted && submission.companyId !== company.id;
                  const isSubmittedToThis = isSubmitted && submission.companyId === company.id;

                  return (
                    <div 
                      key={p.id} 
                      className={`proposal-chip ${selectedId === p.id ? 'active' : ''} ${isSubmittedToOther ? 'disabled' : ''}`}
                      onClick={() => !isSubmittedToOther && setSelectedId(p.id)}
                      style={{ 
                        opacity: isSubmittedToOther ? 0.6 : 1, 
                        cursor: isSubmittedToOther ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px'
                      }}
                    >
                      <div className="d-flex justify-content-between w-100 align-items-center">
                        <span className="title m-0">{p.projectTitle}</span>
                        {!isSubmittedToOther && <i className="bi bi-check-circle-fill"></i>}
                      </div>
                      {isSubmittedToOther && (
                        <span className="badge bg-secondary" style={{fontSize: '0.7em'}}>
                          Submitted to {submission.companyName}
                        </span>
                      )}
                      {isSubmittedToThis && (
                        <span className="badge bg-primary" style={{fontSize: '0.7em'}}>
                          Already sent here
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted small">No proposals found. Create one first.</p>
              )}
            </div>
            
            <button 
              className="btn-pitch-submit" 
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedId}
            >
              {isSubmitting ? (
                <span><i className="bi bi-arrow-repeat spin"></i> Sending...</span>
              ) : (
                "Submit Project Pitch"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalSubmissionModal;