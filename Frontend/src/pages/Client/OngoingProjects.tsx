import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyActiveSubmissions } from '../../services/Client/RetriveSubmitions'; 
import { withdrawSubmission } from '../../services/Client/withdrawSubmission';
import { toast } from 'react-toastify';
import './OngoingProjects.css';

interface Project {
  id: number;
  title: string;
  company: string;
  status: string;
  rawStatus: string; 
  progress: number;
  steps: string[];
  activeStep: number;
  startDate: string;
  reviewer: string;
  statusType: 'neutral' | 'success' | 'warning' | 'danger';
  feedback?: string; 
}

const OngoingProjects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getMyActiveSubmissions();
      const filteredData = data.filter((item: any) => item.status !== "COMPLETED");
      const mappedData = filteredData.map((item: any) => mapBackendToUI(item));
      setProjects(mappedData);
    } catch (error) {
      toast.error("Failed to fetch ongoing projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const mapBackendToUI = (submission: any): Project => {
    const s = submission.status; 
    let stepOneLabel = "Submission";
    let activeStep = 0;
    let progress = 0;
    let statusType: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';

    if (s === "WAITING_FOR_NDA") {
      activeStep = 0;
      progress = 30;
      stepOneLabel = "Waiting for NDA";
      statusType = 'warning';
    } 
    else if (["WAITING_FOR_COMPANY", "REJECTED", "REJECTED_WITH_NOTE", "RESUBMITTED"].includes(s)) {
      activeStep = 0;
      progress = 20;
      stepOneLabel = s.replace(/_/g, ' '); 
      if (s.includes("REJECTED")) statusType = 'danger';
      else if (s === "WAITING_FOR_COMPANY") statusType = 'warning';
      else statusType = 'success';
    } 
    else if (s === "ACCEPTED") {
      activeStep = 1; progress = 40; statusType = 'success';
    } else if (s === "CONSTRUCTING_CONTRACT" || s === "REVIEWING") {
      activeStep = 2; progress = 60; statusType = 'success';
    } else if (s === "VALIDATION") {
      activeStep = 3; progress = 80; statusType = 'success';
    } else if (s === "WAITING_FOR_SIGNING" || s === "SIGNING") {
      activeStep = 4; progress = 100; statusType = 'success';
    }

    return {
      id: submission.id,
      title: submission.proposalTitle,
      company: submission.companyName,
      status: s.replace(/_/g, ' '), 
      rawStatus: s, 
      progress: progress,
      steps: [stepOneLabel, "Accepted", "Reviewing", "Validation", "Signing"],
      activeStep: activeStep,
      startDate: new Date(submission.updatedAt).toLocaleDateString(),
      reviewer: submission.companyName, 
      statusType: statusType,
      feedback: submission.rejectionNote 
    };
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleManageProject = (p: Project) => {
    switch (p.rawStatus) {
      case 'WAITING_FOR_NDA':
        navigate('/NDASigning', { state: { project: p } });
        break;
      case 'REJECTED_WITH_NOTE':
        navigate('/ProposalFeedback', { state: { project: p } });
        break;
      default:
        navigate('/ActiveProjects', { state: { project: p } });
    }
  };

  const handleWithdraw = async (submissionId: number) => {
    if (!window.confirm("Are you sure you want to withdraw this proposal?")) return;
    setIsProcessing(true);
    try {
      await withdrawSubmission(submissionId);
      toast.success("Proposal withdrawn successfully");
      fetchProjects(); 
    } catch (error) {
      toast.error("Failed to withdraw proposal.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ongoing-container container">
      <h2 className="page-title">Ongoing Client Projects</h2>
      <p className="page-subtitle">Track your project status across the lifecycle.</p>

      {projects.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No ongoing projects found.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => {
            const isManageDisabled = p.rawStatus === "WAITING_FOR_COMPANY" || p.rawStatus === "RESUBMITTED";
            const showWithdraw = ["WAITING_FOR_COMPANY", "RESUBMITTED", "WAITING_FOR_NDA"].includes(p.rawStatus);

            return (
              <div className="project-card" key={p.id}>
                <div className="card-header">
                  <h3>{p.title}</h3>
                  <span className={`badge status-${p.statusType}`}>{p.status}</span>
                </div>
                <span className="company-name">{p.company}</span>

                <div className="progress">
                  <span>PROGRESS</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-fill bg-${p.statusType}`} style={{ width: `${p.progress}%` }}></div>
                </div>

                <div className="steps">
                  {p.steps.map((s, idx) => (
                    <div key={idx} className={`step ${idx <= p.activeStep ? "done" : ""} ${idx === 0 ? `step-one-${p.statusType}` : ""}`}>
                      <div className="dot-wrapper">
                        <span className="dot" />
                        {idx !== p.steps.length - 1 && (
                          <span className={`line ${idx < p.activeStep ? "active" : ""}`} />
                        )}
                      </div>
                      <span className="step-label">{s}</span>
                    </div>
                  ))}
                </div>

                <div className="meta">
                  <div><small>LAST UPDATE</small><strong>{p.startDate}</strong></div>
                  <div><small>ASSIGNED COMPANY</small><strong>{p.reviewer}</strong></div>
                </div>

                <div className="card-actions d-flex gap-2">
                  <button 
                    className="primary flex-grow-1" 
                    onClick={() => handleManageProject(p)}
                    disabled={isManageDisabled || isProcessing}
                  >
                    {isManageDisabled ? 'Action Pending' : 'Open Workspace'}
                  </button>

                  {showWithdraw && (
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleWithdraw(p.id)}
                      disabled={isProcessing}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OngoingProjects;