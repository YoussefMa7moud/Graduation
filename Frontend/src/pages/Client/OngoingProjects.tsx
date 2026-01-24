import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyActiveSubmissions } from '../../services/Client/RetriveSubmitions'; 
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

  const mapBackendToUI = (submission: any): Project => {
    const s = submission.status; 
    let stepOneLabel = "Submission";
    let activeStep = 0;
    let progress = 0;
    let statusType: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';

    // Logic for steps and progress
    if (["WAITING_FOR_COMPANY", "REJECTED", "REJECTED_WITH_NOTE", "RESUBMITTED"].includes(s)) {
      activeStep = 0;
      progress = 20;
      stepOneLabel = s.replace(/_/g, ' '); 
      if (s.includes("REJECTED")) statusType = 'danger';
      else if (s === "WAITING_FOR_COMPANY") statusType = 'warning';
      else statusType = 'success';
    } else if (s === "ACCEPTED") {
      activeStep = 1;
      progress = 40;
      statusType = 'success';
    } else if (s === "REVIEWING") {
      activeStep = 2;
      progress = 60;
      statusType = 'success';
    } else if (s === "VALIDATION") {
      activeStep = 3;
      progress = 80;
      statusType = 'success';
    } else if (s === "SIGNING") {
      activeStep = 4;
      progress = 100;
      statusType = 'success';
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
    const fetchProjects = async () => {
      try {
        const data = await getMyActiveSubmissions();
        
        // 1. FILTER: Only keep projects where status is NOT "COMPLETED"
        const filteredData = data.filter((item: any) => item.status !== "COMPLETED");
        
        // 2. MAP: Convert the filtered backend data to UI format
        const mappedData = filteredData.map((item: any) => mapBackendToUI(item));
        
        setProjects(mappedData);
      } catch (error) {
        toast.error("Failed to fetch ongoing projects.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleManageContracts = (p: Project) => {
    if (p.rawStatus === 'REJECTED_WITH_NOTE') {
      navigate('/ProposalFeedback', { state: { project: p } });
    } else {
      navigate('/ActiveProjects', { state: { project: p } });
    }
  };

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ongoing-container container">
      <h2 className="page-title">Ongoing Client Projects</h2>
      <p className="page-subtitle">Track your project status across the lifecycle.</p>

      {/* 3. Handle Empty State (If all projects are completed or list is empty) */}
      {projects.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No ongoing projects found.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => {
            const isButtonDisabled = p.rawStatus === "WAITING_FOR_COMPANY" || p.rawStatus === "RESUBMITTED";

            return (
              <div className="project-card" key={p.id}>
                <div className="card-header">
                  <h3>{p.title}</h3>
                  <span className={`badge status-${p.statusType}`}>
                    {p.status}
                  </span>
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

                <div className="card-actions">
                  <button 
                    className="primary" 
                    onClick={() => handleManageContracts(p)}
                    disabled={isButtonDisabled}
                    style={{ 
                      opacity: isButtonDisabled ? 0.5 : 1, 
                      cursor: isButtonDisabled ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {isButtonDisabled ? 'Action Pending' : 'Manage Project'}
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

export default OngoingProjects;