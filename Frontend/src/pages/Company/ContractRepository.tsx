import React from 'react';
import './ContractRepository.css';

const ContractRepository: React.FC = () => {
  const ongoing = [
    { title: "Project Cairo (Phase II)", update: "2 hours ago", compliance: 65, color: "#10b981", items: [{ n: "SWE Agreement", s: "Under Review", c: "#f59e0b" }, { n: "NDA (Multilateral)", s: "Validated", c: "#10b981" }] },
    { title: "Alexandria Data Center", update: "1 day ago", compliance: 22, color: "#ef4444", items: [{ n: "SLA - Hosting", s: "Critical Issues", c: "#ef4444" }, { n: "DP Agreement", s: "In Review", c: "#f59e0b" }] },
  ];

  const pending = [
    { name: "Cloud Migration Services Contract", status: "APPROVED BY LEGAL UNIT • AWAITING CLIENT SIGNATURE", location: "Giza Hub Expansion", timing: "5 days pending", action: "Remind Party" },
    { name: "Egyptian Fintech JV Agreement", status: "AI VALIDATED • INTERNAL APPROVAL REQUIRED", location: "Cairo Financial District", timing: "2 days pending", action: "Approve" },
  ];

  const signed = [
    { name: "Smart City Infrastructure", ref: "EGY-2023-004", type: "SWE Agreement", date: "Oct 12, 2023", risk: "Low", riskClass: "risk-low" },
    { name: "Nile River Logistic SA", ref: "EGY-2023-009", type: "Service Level Agr.", date: "Sep 28, 2023", risk: "Medium", riskClass: "risk-medium" },
    { name: "Cairo Metro Digital Ticketing", ref: "EGY-2023-012", type: "Software License", date: "Aug 05, 2023", risk: "Low", riskClass: "risk-low" },
  ];

  return (
    <div className="flat-repository-wrapper w-100">
      
      {/* SECTION 1: ONGOING PROJECTS (TOP CARDS) */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="section-title"><i className="bi bi-clipboard-data me-2"></i> Ongoing Projects</h6>
          <button className="btn-text-link">View All Projects</button>
        </div>
        <div className="row g-4">
          {ongoing.map((p, i) => (
            <div className="col-md-4" key={i}>
              <div className="static-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-bold mb-0">{p.title}</h6>
                  <span className="badge-status-active">ACTIVE</span>
                </div>
                <small className="text-muted d-block mb-4">Last update: {p.update}</small>
                {p.items.map((item, idx) => (
                  <div className="d-flex justify-content-between align-items-center mb-2 small" key={idx}>
                    <span className="text-secondary">{item.n}</span>
                    <span className="item-tag" style={{ backgroundColor: `${item.c}15`, color: item.c }}>{item.s}</span>
                  </div>
                ))}
                <div className="mt-4">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="progress-label">COMPLIANCE PROGRESS</span>
                    <span className="fw-bold" style={{ fontSize: '9px' }}>{p.compliance}%</span>
                  </div>
                  <div className="progress-flat">
                    <div className="progress-bar" style={{ width: `${p.compliance}%`, backgroundColor: p.color }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="col-md-4">
            <div className="create-project-btn h-100">
              <div className="icon-plus mb-2"><i className="bi bi-plus-lg fs-4"></i></div>
              <h6 className="text-muted text-uppercase fw-bold small">Create New Project</h6>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PENDING EXECUTION (LIST ROWS) */}
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

      {/* SECTION 3: SIGNED CONTRACTS DATABASE (TABLE) */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="section-title m-0"><i className="bi bi-check-circle-fill text-success me-2"></i> Signed Contracts Database</h6>
          <div className="d-flex gap-2">
             <button className="btn-filter-flat"><i className="bi bi-sliders me-2"></i> Filter</button>
             <button className="btn-filter-flat"><i className="bi bi-download me-2"></i> Export</button>
          </div>
        </div>
        <div className="table-container-flat">
          <table className="table corporate-table align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th className="ps-4">PROJECT NAME</th>
                <th>CONTRACT TYPE</th>
                <th>SIGN DATE</th>
                <th>JURISDICTION</th>
                <th>RISK SCORE</th>
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
                  <td className="small"><i className="bi bi-flag-fill text-danger me-2"></i> Egypt</td>
                  <td><span className={`risk-pill ${s.riskClass}`}>{s.risk}</span></td>
                  <td className="text-end pe-4"><i className="bi bi-three-dots-vertical text-muted cursor-pointer"></i></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContractRepository;