import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMyActiveSubmissions } from '../../../services/Client/RetriveSubmitions'; 
import { withdrawSubmission } from '../../../services/Client/withdrawSubmission'; 
import { toast } from 'react-toastify';
import { 
  XCircle, 
  MessageSquare, 
  Building2, 
  ExternalLink, 
  Lightbulb, 
  ArrowLeft, 
  FileEdit 
} from 'lucide-react';
import './ProposalFeedback.css';

const ProposalFeedback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Local state for the specific project details
  const [project, setProject] = useState<any>(location.state?.project);
  const [isLoading, setIsLoading] = useState(!location.state?.project);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        // We fetch all active submissions and find the one matching our current ID
        const allSubmissions = await getMyActiveSubmissions();
        const currentId = location.state?.project?.id;
        
        const freshProject = allSubmissions.find((s: any) => s.id === currentId);
        
        if (freshProject) {
          setProject(freshProject);
        }
      } catch (error) {
        toast.error("Could not sync latest feedback from server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreshData();
  }, [location.state?.project?.id]);

  const handleWithdraw = async () => {
    if (!window.confirm("Are you sure you want to withdraw this proposal? This will delete the submission.")) return;
    
    setIsWithdrawing(true);
    try {
      await withdrawSubmission(project.id);
      toast.success("Proposal withdrawn successfully");
      navigate('/OngoingProjects');
    } catch (error) {
      toast.error("Failed to withdraw proposal.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
  if (!project) return <div className="p-5 text-center"><p>No project data found.</p></div>;

  return (
    <div className="feedback-page-container">
      <div className="feedback-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="feedback-content">
        {/* Status Alert */}
        <div className="status-alert-box">
          <div className="alert-icon-wrapper"><XCircle className="alert-icon" size={24} /></div>
          <div className="alert-text">
            <h3>Proposal Rejected</h3>
            <p>The company has reviewed and provided feedback on your proposal.</p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="section-label-row">
          <span className="section-label">COMPANY FEEDBACK</span>
          <span className="received-time">Last Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
        
        <div className="feedback-card">
          <div className="feedback-quote-icon"><MessageSquare size={20} fill="currentColor" /></div>
          <div className="feedback-body">
            <p className="quote-text">
              {/* project.rejectionNote comes directly from your DTO mapped in the controller */}
              "{project.rejectionNote || "The company rejected the proposal without a specific note."}"
            </p>
            <div className="reviewer-info">
              <div className="reviewer-avatar">{project.companyName?.charAt(0) || "C"}</div>
              <span className="reviewer-name">
                <strong> Review Team</strong> — {project.companyName}
              </span>
            </div>
          </div>
        </div>

        {/* Reference Section */}
        <div className="section-label-row"><span className="section-label">PROPOSAL REFERENCE</span></div>
        <div className="reference-card">
          <div className="company-icon-box"><Building2 size={24} /></div>
          <div className="reference-details">
            <span className="target-label">SOFTWARE PROVIDER</span>
            <div className="d-flex justify-content-between align-items-center">
              <h3>{project.companyName}</h3>
              
            </div>
            <p className="text-muted small mt-2">Reference Title: {project.proposalTitle}</p>
          </div>
        </div>

<div className="tip-box">
          <div className="tip-icon-wrapper">
            <Lightbulb size={24} strokeWidth={2} />
          </div>
          <div className="tip-content">
            <h4>Tip: What to Do Next</h4>
            <p>
              Review the company's feedback above carefully. Then, click <strong>"Edit Proposal"</strong> to make the necessary adjustments to your <em>{project.proposalTitle}</em> and submit it again for approval.
            </p>
          </div>
        </div>
      </div>


      {/* Actions */}
      <div className="feedback-footer">
        <button 
          className="withdraw-btn" 
          onClick={handleWithdraw} 
          disabled={isWithdrawing}
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw Request"}
        </button>
        <button className="resubmit-btn" onClick={() => navigate(`/proposals`)}>
          <FileEdit size={18} className="me-2" />
         Take Me to My Proposal
        </button>
      </div>
    </div>
  );
};

export default ProposalFeedback;