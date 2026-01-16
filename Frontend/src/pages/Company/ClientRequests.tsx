import React from 'react';

const ClientRequests: React.FC = () => {
  const requests = [
    {
      name: "Enterprise Cloud SLA Review",
      location: "Cairo Financial District Expansion",
      proposedBy: "Omar Mansour",
      initials: "OM",
      avatarBg: "#e6f7f1",
      avatarColor: "#00a87e",
      timeline: "12 Oct - 15 Oct, 2024",
      status: "PENDING REVIEW"
    },
    {
      name: "DPL Compliance Audit 2024",
      location: "Law No. 151 of 2020 Protocol",
      proposedBy: "Sara Hassan",
      initials: "SH",
      avatarBg: "#eef2ff",
      avatarColor: "#4f46e5",
      timeline: "18 Oct - 20 Oct, 2024",
      status: "PENDING REVIEW"
    },
    {
      name: "Smart City Infrastructure Vendor Agreement",
      location: "Administrative Capital Phase II",
      proposedBy: "Khaled Zaky",
      initials: "KZ",
      avatarBg: "#f5f3ff",
      avatarColor: "#7c3aed",
      timeline: "25 Oct - 30 Oct, 2024",
      status: "PENDING REVIEW"
    },
    {
      name: "New Cairo Data Center Lease",
      location: "Physical Security & Jurisdictional Compliance",
      proposedBy: "Laila Bakri",
      initials: "LB",
      avatarBg: "#fff7ed",
      avatarColor: "#ea580c",
      timeline: "01 Nov - 05 Nov, 2024",
      status: "PENDING REVIEW"
    }
  ];

  const styles = {
    container: { width: '100%', padding: '0' },
    header: { marginBottom: '32px' },
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden' },
    statusBadge: { backgroundColor: '#fff7ed', color: '#c2410c', fontSize: '10px', fontWeight: 'bold', borderRadius: '20px', padding: '6px 12px' },
    actionBtn: { border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div className="container page-fade-in">
      {/* 1. TOP HEADER */}
      <div className="d-flex justify-content-between align-items-start" style={styles.header}>
        <div>
          <h4 className="fw-bold m-0">Proposed Projects Queue</h4>
          <p className="text-muted small">Review and approve contract analysis requests from external officers.</p>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input 
              type="text" 
              className="form-control ps-5 border-0 bg-white shadow-sm" 
              placeholder="Search projects..." 
              style={{ width: '280px', borderRadius: '10px' }} 
            />
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative cursor-pointer">
              <i className="bi bi-bell text-muted fs-5"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '8px', height: '8px' }}></span>
            </div>
            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '12px' }}>AD</div>
          </div>
        </div>
      </div>

      {/* 2. TABLE CARD */}
      <div style={styles.tableCard} className="shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted small text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                <th className="ps-5 py-3">Project Name</th>
                <th>Proposed By</th>
                <th>Estimated Timeline</th>
                <th className="text-center">Status</th>
                <th></th>
                <th className="text-center pe-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item, index) => (
                <tr key={index} className="border-bottom border-light">
                  <td className="ps-5 py-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light p-3 rounded-3">
                        <i className="bi bi-file-earmark-text text-dark fs-5"></i>
                      </div>
                      <div>
                        <div className="fw-bold text-dark mb-0">{item.name}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{item.location}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                        style={{ width: '32px', height: '32px', fontSize: '10px', backgroundColor: item.avatarBg, color: item.avatarColor }}
                      >
                        {item.initials}
                      </div>
                      <div className="small fw-medium text-dark">{item.proposedBy}</div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <i className="bi bi-calendar-event"></i>
                      <span>{item.timeline}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span style={styles.statusBadge}>{item.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-link text-decoration-none small fw-bold p-0" style={{ color: '#64748b', fontSize: '11px' }}>
                      View Full Proposal
                    </button>
                  </td>
                  <td className="text-center pe-5">
                    <div className="d-flex justify-content-center gap-3">
                      <button style={styles.actionBtn} className="text-danger"><i className="bi bi-x-lg"></i></button>
                      <button style={styles.actionBtn} className="text-success"><i className="bi bi-check-lg"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
    
  );
};

export default ClientRequests;