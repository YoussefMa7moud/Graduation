// components/Client/CompanyCard.tsx
import React from 'react';

const CompanyCard = ({ company, onSubmit }: any) => {
  return (
    <div className="company-card shadow-sm rounded-4 p-4 bg-white">
      
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="fw-bold">{company.name}</h6>
        {company.verified && (
          <span className="badge bg-success-subtle text-success small">Verified</span>
        )}
      </div>

      <p className="text-muted small mb-2">{company.sector}</p>
      <p className="small">{company.description}</p>

      <button
        className="btn btn-dark w-100 mt-3"
        onClick={() => onSubmit(company)}
      >
        ▶ Submit Proposal
      </button>
    </div>
  );
};

export default CompanyCard;
