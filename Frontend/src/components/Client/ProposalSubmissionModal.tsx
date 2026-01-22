import React, { useEffect, useState } from 'react';
import { GetAllProposals } from '../../services/Client/ProposalDocumnet';
import { sendProposalToCompany } from '../../services/Client/SubmitProposal'; // Import the new service
import { toast } from 'react-toastify';
import './ProposalSubmissionModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  company: any;
}

const ProposalSubmissionModal: React.FC<Props> = ({ isOpen, onClose, company }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loading

  useEffect(() => {
    const fetchMyProposals = async () => {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          const { userId } = JSON.parse(storedUser);
          const data = await GetAllProposals(userId);
          setProposals(Array.isArray(data) ? data : data ? [data] : []);
        } catch (error) {
          toast.error("Failed to load your proposals.");
        }
      }
    };
    if (isOpen) fetchMyProposals();
  }, [isOpen]);

  // Updated handleConfirm to interact with the Backend
  const handleConfirm = async () => {
    if (!selectedId) return toast.warning("Please select a proposal first.");

    setIsSubmitting(true);
    try {
      // Data matches our DTO: { proposalId, softwareCompanyId }
      await sendProposalToCompany({
        proposalId: selectedId,
        softwareCompanyId: company.id
      });

      toast.success(`Proposal successfully sent to ${company.name}`);
      onClose(); // Close modal on success
    } catch (error: any) {
      toast.error("Failed to send proposal. Please try again.");
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
                proposals.map(p => (
                  <div 
                    key={p.id} 
                    className={`proposal-chip ${selectedId === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span className="title">{p.projectTitle}</span>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                ))
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