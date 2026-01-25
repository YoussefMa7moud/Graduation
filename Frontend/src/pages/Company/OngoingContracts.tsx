import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Updated service import
import { submissionService } from '../../services/Company/Proposlals'; 
import { toast } from 'react-toastify';


interface Project {
  id: number;
  title: string;
  clientName: string; // Changed from 'company'
  status: string;
  rawStatus: string; 
  progress: number;
  steps: string[];
  activeStep: number;
  lastUpdate: string;
  statusType: 'neutral' | 'success' | 'warning' | 'danger';
}

const OngoingContracts: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await submissionService.getCompanyQueue();
      // Only show projects that are not finished
      const filteredData = data.filter((item: any) => item.status !== "COMPLETED");
      const mappedData = filteredData.map((item: any) => mapBackendToUI(item));
      setProjects(mappedData);
    } catch (error) {
      toast.error("Failed to fetch project queue.");
    } finally {
      setIsLoading(false);
    }
  };

  const mapBackendToUI = (submission: any): Project => {
    const s = submission.status; 
    let stepOneLabel = "Proposal";
    let activeStep = 0;
    let progress = 0;
    let statusType: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';

    // Logic for Company View
    if (s === "WAITING_FOR_NDA") {
      activeStep = 0; progress = 30;
      stepOneLabel = "NDA Pending";
      statusType = 'warning';
    } else if (s === "WAITING_FOR_COMPANY") {
      activeStep = 0; progress = 15;
      stepOneLabel = "Your Action Needed";
      statusType = 'danger';
    } else if (s === "ACCEPTED") {
      activeStep = 1; progress = 40; statusType = 'success';
    } else if (["CONSTRUCTING_CONTRACT", "REVIEWING"].includes(s)) {
      activeStep = 2; progress = 60; statusType = 'success';
    } else if (s === "VALIDATION") {
      activeStep = 3; progress = 80; statusType = 'success';
    } else if (["WAITING_FOR_SIGNING", "SIGNING"].includes(s)) {
      activeStep = 4; progress = 100; statusType = 'success';
    }

    return {
      id: submission.id,
      title: submission.proposalTitle,
      clientName: submission.clientName, // Displaying the Client Name from DTO
      status: s.replace(/_/g, ' '), 
      rawStatus: s, 
      progress: progress,
      steps: [stepOneLabel, "Accepted", "Design/Review", "Validation", "Finalizing"],
      activeStep: activeStep,
      lastUpdate: new Date(submission.updatedAt).toLocaleDateString(),
      statusType: statusType
    };
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleManage = (p: Project) => {
    // Navigate company to their specific workflow workspace
    navigate('/CompanyWorkspace', { state: { submissionId: p.id } });
  };

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ongoing-container container">
      <h2 className="page-title">Project Management Queue</h2>
      <p className="page-subtitle">Track and manage active client requests and contracts.</p>

      {projects.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No active projects in your queue.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => {
            // Company usually shouldn't be blocked from viewing/managing
            const isManageDisabled = p.rawStatus === "WAITING_FOR_NDA";

            return (
              <div className="project-card" key={p.id}>
                <div className="card-header">
                  <h3>{p.title}</h3>
                  <span className={`badge status-${p.statusType}`}>{p.status}</span>
                </div>
                <span className="company-name">CLIENT: {p.clientName}</span>

                <div className="progress">
                  <span>WORKFLOW PROGRESS</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-fill bg-${p.statusType}`} style={{ width: `${p.progress}%` }}></div>
                </div>

                <div className="steps">
                  {p.steps.map((s, idx) => (
                    <div key={idx} className={`step ${idx <= p.activeStep ? "done" : ""}`}>
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
                  <div><small>LAST UPDATE</small><strong>{p.lastUpdate}</strong></div>
                  <div><small>CLIENT TYPE</small><strong>ACTIVE</strong></div>
                </div>

                <div className="card-actions">
                  <button 
                    className="primary w-100" 
                    onClick={() => handleManage(p)}
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OngoingContracts;