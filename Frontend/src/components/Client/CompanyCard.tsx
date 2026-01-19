import React, { useState } from 'react';
import './CompanyCard.css';

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    description: string;
    logo: string | null;
  };
  onSubmit: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const DESCRIPTION_LIMIT = 100;

  const logoUrl = company.logo 
    ? `data:image/png;base64,${company.logo}` 
    : 'https://via.placeholder.com/150?text=No+Logo';

  const shouldTruncate = company.description?.length > DESCRIPTION_LIMIT;
  const displayedDescription = isExpanded || !shouldTruncate
    ? company.description 
    : `${company.description.substring(0, DESCRIPTION_LIMIT)}...`;

  return (
    <div className="card h-100 company-card shadow-sm">
      <div className="card-banner"></div>

      <div className="logo-wrapper rounded-circle d-flex align-items-center justify-content-center">
        <img 
          src={logoUrl} 
          alt={company.name} 
          className="logo-image"
        />
      </div>

      <div className="card-body d-flex flex-column pt-3 text-center">
        <h5 className="card-title mb-3 company-title">{company.name}</h5>
        
        <p className="card-text text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          {displayedDescription}
          {shouldTruncate && (
            <button 
              type="button"
              className="btn-see-more ms-1"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering card clicks if any
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'See Less' : 'See More'}
            </button>
          )}
        </p>

        <div className="mt-auto">
          <button 
            type="button"
            className="btn btn-primary w-100 btn-theme-primary" 
            onClick={onSubmit}
          >
            View & Submit Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;