import React from 'react';
import './MyPolicyRepository.css';
// Import the new component
import StatCard from '../../components/Company/MyPolicyRepository/StatCard';

const MyPolicyRepository: React.FC = () => {
  // Sample data - in a real app, you'd calculate these
  const totalRules = 24;
  const activeRules = 18;

  const policies = [
    { name: "Cairo HQ Data Residency", id: "OCL-2023-0892", law: "Egyptian Data Protection (151/2020)", type: "OCL", date: "Oct 12, 2023", status: "Active" },
    { name: "Remote Work Overtime Clause", id: "AI-2023-1104", law: "Egyptian Labor Law (12/2003)", type: "AI", date: "Nov 04, 2023", status: "Draft" },
    { name: "Financial Reporting Intervals", id: "OCL-2023-1255", law: "FRA Regulatory Rules", type: "OCL", date: "Dec 20, 2023", status: "Active" },
    { name: "IP Assignment Standard", id: "OCL-2024-0102", law: "Egyptian Civil Code", type: "OCL", date: "Jan 15, 2024", status: "Active" },
  ];

  return (
    <div className="w-100 p-0 m-0">
       <div className="container page-fade-in">
      {/* Search Header (No Changes) */}
      <div className="bg-white p-3 rounded-3 shadow-sm border mb-4 d-flex align-items-center justify-content-between">
        <div className="position-relative flex-grow-1 me-4">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input 
            type="text" 
            className="form-control border-0 bg-light ps-5 py-2 w-100" 
            placeholder="Search policies or rules..." 
          />
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small fw-bold">FRAMEWORK:</span>
          <select className="form-select border-0 bg-light py-2 px-3" style={{ width: '220px' }}>
            <option>All Frameworks</option>
          </select>
          <button className="btn btn-light border"><i className="bi bi-sliders"></i></button>
        </div>
      </div>


       {/* NEW: Stat Cards Section */}
      <div className="row g-4">
        <div className="col-md-6">
          <StatCard title="Total Rules" count={totalRules} isActive={false} />
        </div>
        <div className="col-md-6">
          <StatCard title="Active Rules" count={activeRules} isActive={true} />
        </div>
      </div>


      <br />

      {/* THE TABLE (No Changes) */}
      <div className="bg-white rounded-3 shadow-sm border overflow-hidden w-100 mb-4">
        <table className="table table-hover align-middle mb-0 w-100">
          <thead className="bg-light">
            <tr className="text-muted small text-uppercase">
              <th className="ps-4 py-3 border-0">Policy Name</th>
              <th className="border-0">Associated Law</th>
              <th className="text-center border-0">Rule Type</th>
              <th className="border-0">Last Updated</th>
              <th className="border-0">Status</th>
              <th className="text-end pe-4 border-0">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p, i) => (
              <tr key={i}>
                <td className="ps-4 py-3">
                  <div className="fw-bold text-dark">{p.name}</div>
                  <small className="text-muted" style={{fontSize: '10px'}}>{p.id}</small>
                </td>
                <td className="text-muted small">{p.law}</td>
                <td className="text-center">
                  <span className={`badge-rule badge-${p.type.toLowerCase()}`}>{p.type}</span>
                </td>
                <td className="text-muted small">{p.date}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`status-dot dot-${p.status.toLowerCase()}`}></span>
                    <span className={`status-text text-${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                </td>
                <td className="text-end pe-4">
                  <button className="btn btn-sm text-muted border-0"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm text-muted border-0"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      
      </div>

     </div>

    </div>
  );
};

export default MyPolicyRepository;