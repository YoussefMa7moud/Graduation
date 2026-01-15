import React from 'react';
import StatCard from '../../components/Company/CompanyHome/StatCard';
import './CompanyHome.css';
import Header from '../../components/Company/CompanyHome/Header';

const CompanyHome: React.FC = () => {
  const managers = [
    { name: "Ahmed Mansour", email: "ahmed.m@lexguard.ai", role: "General Counsel", dept: "CAIRO HQ", status: "Active" },
    { name: "Dina Kamal", email: "dina.k@lexguard.ai", role: "Junior Associate", dept: "COMPLIANCE UNIT", status: "Active" },
    { name: "Omar Sherif", email: "omar.s@lexguard.ai", role: "Compliance Lead", dept: "LEGAL OPERATIONS", status: "On Leave" },
    { name: "Laila Hassan", email: "laila.h@lexguard.ai", role: "Senior Paralegal", dept: "REAL ESTATE", status: "Inactive" },
  ];

  return (
    <>
      <Header />
     
    <div className="corporate-container w-100 p-0">
      {/* 1. Stat Cards (Working Perfect) */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <StatCard title="Total Contracts" value="1,284" icon="bi-file-earmark-text" variant="gray" subText="+12% from last month" subTextColor="#10b981" />
        </div>
        <div className="col-md-4">
          <StatCard title="Active Requests" value="42" icon="bi-clipboard-check" variant="mint" subText="8 urgent pending" subTextColor="#f59e0b" />
        </div>
        <div className="col-md-4">
          <StatCard title="Team Leads" value="18" icon="bi-people" variant="blue" subText="Project Managers" subTextColor="#64748b" />
        </div>
      </div>

      {/* 2. Project Managers List (Fixed Width & No Hover Effect) */}
      <div className="flat-table-container bg-white rounded-4 shadow-sm border overflow-hidden w-100">
        <div className="p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
          <h5 className="fw-bold m-0"><i className="bi bi-people-fill me-2 text-mint"></i> Project Managers</h5>
          <button className="btn btn-mint text-white px-4 py-2 rounded-3 fw-bold">
            + Add Project Manager
          </button>
        </div>

        <table className="table corporate-table align-middle mb-0 w-100">
          <thead>
            <tr className="text-muted small text-uppercase bg-light">
              <th className="ps-5 py-3 border-0">Manager Name</th>
              <th className="border-0">Role / Department</th>
              <th className="border-0">Status</th>
              <th className="text-end pe-5 border-0">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((m, i) => (
              <tr key={i} className="manager-row border-bottom">
                <td className="ps-5 py-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar-box">{m.name.charAt(0)}</div>
                    <div>
                      <div className="fw-bold">{m.name}</div>
                      <div className="text-muted small">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="fw-bold small">{m.role}</div>
                  <div className="text-muted x-small">{m.dept}</div>
                </td>
                <td>
                  <span className={`status-pill status-${m.status.toLowerCase().replace(' ', '-')}`}>
                    • {m.status.toUpperCase()}
                  </span>
                </td>
                <td className="text-end pe-5">
                  <div className="action-icons">
                    <i className="bi bi-pencil me-3"></i>
                    <i className="bi bi-clock-history me-3"></i>
                    <i className="bi bi-trash"></i>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="p-4 bg-white d-flex justify-content-between align-items-center border-top">
          <small className="text-muted">Showing 4 of 18 Project Managers</small>
          <div className="pagination-btns">
            <button className="btn btn-sm btn-outline-secondary me-2">Previous</button>
            <button className="btn btn-sm btn-outline-secondary">Next</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CompanyHome;