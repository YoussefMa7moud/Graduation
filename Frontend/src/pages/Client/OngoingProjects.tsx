import React from "react";
import { useNavigate } from "react-router-dom";
import './OngoingProjects.css';

// 1️⃣ Define the Project interface
interface Project {
  id: string;
  title: string;
  company: string;
  status: string;
  progress: number;
  steps: string[];
  activeStep: number;
  startDate: string;
  reviewer: string;
}

// 2️⃣ Define the projects array
const projects: Project[] = [
  {
    id: "proj_001",
    title: "Annual Compliance Audit 2024",
    company: "Cairo Plaza Estates",
    status: "In Review",
    progress: 65,
    steps: ["Accepted", "Reviewing", "Validation", "Signing"],
    activeStep: 1,
    startDate: "Oct 12, 2023",
    reviewer: "Dr. Ahmed Salem",
  },
  {
    id: "proj_002",
    title: "Service Level Agreement Review",
    company: "Nile Bank Corp",
    status: "Validation",
    progress: 85,
    steps: ["Accepted", "Reviewing", "Validation", "Signing"],
    activeStep: 2,
    startDate: "Nov 04, 2023",
    reviewer: "Counselor Nadia Zaki",
  },
  {
    id: "proj_003",
    title: "IP Licensing Agreement",
    company: "Alexandria TechHub",
    status: "Signing",
    progress: 95,
    steps: ["Accepted", "Reviewing", "Validation", "Signing"],
    activeStep: 3,
    startDate: "Dec 01, 2023",
    reviewer: "Omar Al-Fayed",
  },
  {
    id: "proj_004",
    title: "Warehouse Lease Extension",
    company: "Giza Manufacturing Ltd",
    status: "Drafting",
    progress: 10,
    steps: ["Proposal", "Reviewing", "Validation", "Signing"],
    activeStep: 0,
    startDate: "Dec 14, 2023",
    reviewer: "Mariam Eissa",
  },
];

const OngoingProjects: React.FC = () => {
  const navigate = useNavigate();

  const handleManageContracts = (project: Project) => {
    navigate('/ActiveProjects', { state: { project } });
  };

  return (
    <>
      <div className="ongoing-container container page-fade-in">
        <h2 className="page-title">Ongoing Client Projects</h2>
        <p className="page-subtitle">
          Track active legal review progress and manage contract lifecycles.
        </p>

        <div className="projects-grid">
          {projects.map((p) => (
            <div className="project-card" key={p.id}>
              <div className="card-header">
                <h3>{p.title}</h3>
                <span className={`badge ${p.status.toLowerCase().replace(" ", "-")}`}>
                  {p.status}
                </span>
              </div>
              <span className="company-name">{p.company}</span>

              <div className="progress">
                <span>PROJECT PROGRESS</span>
                <span>{p.progress}%</span>
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
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              <div className="meta">
                <div>
                  <small>START DATE</small>
                  <strong>{p.startDate}</strong>
                </div>
                <div>
                  <small>ASSIGNED REVIEWER</small>
                  <strong>{p.reviewer}</strong>
                </div>
              </div>

              <div className="card-actions">
                <button className="primary" onClick={() => handleManageContracts(p)}>
                  Manage Contracts
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className="footer">Showing {projects.length} active projects</footer>
      </div>
    </>
  );
};

export default OngoingProjects;
