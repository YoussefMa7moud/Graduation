import React, { useState } from 'react';
import Modal from '../../components/Company/CompanyHome/Modal';
import './ContractRepository.css';

interface Project {
  title: string;
  update: string;
  compliance: number;
  color: string;
  teamLead?: string;
  hasNDA: boolean;
  isValidated: boolean;
  items: { n: string; s: string; c: string }[];
}

const ContractRepository: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Ongoing projects data
  const ongoing: Project[] = [
    { 
        title: "Project Cairo (Phase II)", 
        update: "2 hours ago", 
        compliance: 65, 
        color: "#10b981", 
        teamLead: "Ahmed Mansour",
        hasNDA: true,
        isValidated: true,
        items: [{ n: "SWE Agreement", s: "Under Review", c: "#f59e0b" }, { n: "NDA (Multilateral)", s: "Validated", c: "#10b981" }] 
    },
    { 
        title: "Alexandria Data Center", 
        update: "1 day ago", 
        compliance: 22, 
        color: "#ef4444", 
        teamLead: "Dina Kamal",
        hasNDA: false,
        isValidated: false,
        items: [{ n: "SLA - Hosting", s: "Critical Issues", c: "#ef4444" }, { n: "DP Agreement", s: "In Review", c: "#f59e0b" }] 
    },
  ];

  const pending = [
    { name: "Cloud Migration Services Contract", status: "APPROVED BY LEGAL UNIT • AWAITING CLIENT SIGNATURE", location: "Giza Hub Expansion", timing: "5 days pending", action: "Remind Party" },
    { name: "Egyptian Fintech JV Agreement", status: "AI VALIDATED • INTERNAL APPROVAL REQUIRED", location: "Cairo Financial District", timing: "2 days pending", action: "Approve" },
  ];

  const signed = [
    { name: "Smart City Infrastructure", ref: "EGY-2023-004", type: "SWE Agreement", date: "Oct 12, 2023" },
    { name: "Nile River Logistic SA", ref: "EGY-2023-009", type: "Service Level Agr.", date: "Sep 28, 2023" },
    { name: "Cairo Metro Digital Ticketing", ref: "EGY-2023-012", type: "Software License", date: "Aug 05, 2023" },
  ];

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flat-repository-wrapper w-100">
      
      {/* SECTION 1: ONGOING PROJECTS */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="section-title"><i className="bi bi-clipboard-data me-2"></i> Ongoing Projects</h6>
        </div>
        <div className="row g-4">
          {ongoing.map((p, i) => (
            <div className="col-md-4" key={i}>
              <div className="static-card p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-bold mb-0">{p.title}</h6>
                  <span className="badge-status-active">ACTIVE</span>
                </div>
                <small className="text-muted d-block mb-3">Last update: {p.update}</small>
                
                <div className="flex-grow-1">
                    {p.items.map((item, idx) => (
                    <div className="d-flex justify-content-between align-items-center mb-2 small" key={idx}>
                        <span className="text-secondary">{item.n}</span>
                        <span className="item-tag" style={{ backgroundColor: `${item.c}15`, color: item.c }}>{item.s}</span>
                    </div>
                    ))}
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="progress-label">COMPLIANCE</span>
                    <span className="fw-bold" style={{ fontSize: '9px' }}>{p.compliance}%</span>
                  </div>
                  <div className="progress-flat mb-3">
                    <div className="progress-bar" style={{ width: `${p.compliance}%`, backgroundColor: p.color }}></div>
                  </div>
                  <button 
                    className="btn btn-outline-mint w-100 btn-sm fw-bold" 
                    onClick={() => handleViewDetails(p)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: PENDING EXECUTION */}
      <div className="mb-5">
        <h6 className="section-title mb-3"><i className="bi bi-pencil-square text-warning me-2"></i> Pending Execution</h6>
        {pending.map((item, i) => (
          <div className="pending-row mb-3" key={i}>
            <div className="d-flex align-items-center gap-3">
              <div className="icon-circle-warning"><i className="bi bi-lightning-fill"></i></div>
              <div>
                <div className="fw-bold">{item.name}</div>
                <div className="text-muted small-status">{item.status}</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-4">
              <div className="text-end text-muted small">
                <div className="fw-bold text-dark">{item.location}</div>
                <div>{item.timing}</div>
              </div>
              <button className="btn-navy-flat">{item.action}</button>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: SIGNED CONTRACTS DATABASE */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="section-title m-0"><i className="bi bi-check-circle-fill text-success me-2"></i> Signed Contracts Database</h6>
          
        </div>
        <div className="table-container-flat">
          <table className="table corporate-table align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th className="ps-4">PROJECT NAME</th>
                <th>CONTRACT TYPE</th>
                <th>SIGN DATE</th>
                <th className="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {signed.map((s, i) => (
                <tr key={i} className="border-bottom">
                  <td className="ps-4 py-4">
                    <div className="fw-bold text-dark">{s.name}</div>
                    <div className="text-muted small" style={{ fontSize: '10px' }}>Ref: {s.ref}</div>
                  </td>
                  <td><span className="badge-type-flat">{s.type}</span></td>
                  <td className="text-muted small">{s.date}</td>
                  <td className="text-end pe-4">
                    <button className="btn btn-light btn-sm me-2" title="View Project"><i className="bi bi-eye text-primary"></i></button>
                    <button className="btn btn-light btn-sm" title="Download Contract"><i className="bi bi-download text-success"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROJECT DETAIL MODAL */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title="Project Oversight"
      >
        {selectedProject && (
          <div className="project-details">
            <div className="mb-4 p-3 bg-light rounded-3">
                <label className="text-uppercase small fw-bold text-muted d-block mb-1" style={{fontSize: '10px'}}>Assigned Team Leader</label>
                <div className="d-flex align-items-center gap-2">
                    <div className="avatar-sm">{selectedProject.teamLead?.charAt(0)}</div>
                    <span className="fw-bold">{selectedProject.teamLead || "Unassigned"}</span>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-6">
                    <label className="text-uppercase small fw-bold text-muted d-block" style={{fontSize: '10px'}}>NDA Status</label>
                    <span className={selectedProject.hasNDA ? "text-success fw-bold" : "text-danger fw-bold"}>
                        {selectedProject.hasNDA ? "✓ Signed & Active" : "✗ Missing NDA"}
                    </span>
                </div>
                <div className="col-6 text-end">
                    <label className="text-uppercase small fw-bold text-muted d-block" style={{fontSize: '10px'}}>Validation</label>
                    <span className="badge bg-soft-info">{selectedProject.isValidated ? "Verified" : "Pending Approval"}</span>
                </div>
            </div>

            <hr />

            <div className="d-grid gap-2 mt-4">
                <button className="btn btn-navy-flat py-2">
                    <i className="bi bi-pencil-square me-2"></i> Modify Contract Draft
                </button>
                <button 
                    className={`btn py-2 fw-bold ${selectedProject.isValidated ? 'btn-mint text-white' : 'btn-secondary disabled'}`}
                    disabled={!selectedProject.isValidated}
                >
                    <i className="bi bi-pen me-2"></i> Execute Signature
                </button>
                {!selectedProject.isValidated && (
                    <small className="text-center text-muted mt-1" style={{fontSize: '10px'}}>
                        Signature active once validation is agreed by both parties.
                    </small>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContractRepository;