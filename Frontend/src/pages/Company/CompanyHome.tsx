import React from 'react';

const CompanyHome: React.FC = () => {
  // Sample data to map through for the cards
  const clients = [
    { name: "CairoTech Solutions", location: "Maadi, Cairo, Egypt", contracts: 14, reviews: 2, industry: "TECH & SOFTWARE", color: "#e3fcef" },
    { name: "Nile Finance Group", location: "Downtown, Alexandria, Egypt", contracts: 8, reviews: 0, industry: "BANKING & FINANCE", color: "#eef2ff" },
    { name: "Delta Heavy Ind.", location: "6th of October City, Giza", contracts: 32, reviews: 5, industry: "MANUFACTURING", color: "#fff7ed" },
  ];

  return (
    <div className="client-directory">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0">Browse Client Companies</h2>
          <p className="text-muted">Manage and monitor legal compliance for registered corporate entities.</p>
          
        </div>
        <button className="btn btn-dark px-4 py-2" style={{ backgroundColor: '#17253b' }}>
          <i className="bi bi-plus-lg me-2"></i> Add New Client
        </button>
      </div>

      {/* Filter Bar */}
      <div className="row g-3 mb-4 align-items-center bg-white p-3 rounded shadow-sm mx-0">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control bg-light border-start-0" placeholder="Search by company name, tax ID..." />
          </div>
        </div>
        <div className="col-md-2">
          <select className="form-select bg-light">
            <option>All Industries</option>
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select bg-light">
            <option>All Regions</option>
          </select>
        </div>
        <div className="col-md-1 text-end">
          <button className="btn btn-outline-secondary w-100"><i className="bi bi-sliders"></i></button>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="row g-4">
        {clients.map((client, index) => (
          <div className="col-md-4" key={index}>
            <div className="card border-0 shadow-sm h-100 p-3">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="p-2 rounded" style={{ backgroundColor: client.color }}>
                  <i className="bi bi-building fs-4"></i>
                </div>
                <span className="badge text-dark opacity-75" style={{ backgroundColor: client.color, fontSize: '10px' }}>
                  {client.industry}
                </span>
              </div>
              <h5 className="fw-bold">{client.name}</h5>
              <p className="small text-muted mb-4"><i className="bi bi-geo-alt me-1"></i> {client.location}</p>
              
              <div className="row text-center border-top pt-3 mb-4">
                <div className="col-6 border-end">
                  <h6 className="fw-bold m-0">{client.contracts}</h6>
                  <small className="text-muted" style={{ fontSize: '10px' }}>ACTIVE CONTRACTS</small>
                </div>
                <div className="col-6">
                  <h6 className="fw-bold m-0 text-danger">{client.reviews}</h6>
                  <small className="text-muted" style={{ fontSize: '10px' }}>PENDING REVIEWS</small>
                </div>
              </div>

              <button className="btn btn-outline-dark w-100 py-2">
                <i className="bi bi-file-earmark-plus me-2"></i> Propose Project
              </button>
            </div>
          </div>
        ))}
        
        {/* Register New Entity Placeholder */}
        <div className="col-md-4">
          <div className="card border-primary border-dashed h-100 d-flex flex-column align-items-center justify-content-center p-5 text-center bg-transparent" style={{ borderStyle: 'dashed' }}>
             <div className="rounded-circle border p-3 mb-3">
               <i className="bi bi-plus-lg fs-3 text-muted"></i>
             </div>
             <h6 className="fw-bold">Register New Entity</h6>
             <p className="small text-muted">Start legal profiling for a new client company.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHome;