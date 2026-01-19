import React, { useState } from 'react';
import './CompanyCard.css'; // Import custom styles

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

  const shouldTruncate = company.description.length > DESCRIPTION_LIMIT;
  const displayedDescription = isExpanded || !shouldTruncate
    ? company.description 
    : `${company.description.substring(0, DESCRIPTION_LIMIT)}...`;

  return (
    // Removed border-0, added custom class 'company-card'
    <div className="card h-100 shadow-sm company-card">
      
      {/* 1. Top Banner (Colored background) */}
      <div className="card-banner"></div>

      {/* 2. Rounded, centered logo overlapping the banner */}
      <div className="logo-wrapper rounded-circle d-flex align-items-center justify-content-center">
        <img 
          src={logoUrl} 
          alt={company.name} 
          className="logo-image"
        />
      </div>

      <div className="card-body d-flex flex-column pt-3 text-center">
        {/* 3. Title Centered using text-center on parent, added custom class */}
        <h5 className="card-title mb-3 company-title">{company.name}</h5>
        
        <p className="card-text text-muted mb-3" style={{ fontSize: '0.9rem' }}>
          {displayedDescription}
          {shouldTruncate && (
            <button 
              // 4. Changed blue link to custom theme link color
              className="btn btn-link text-decoration-none btn-theme-link ms-1" 
              style={{ fontSize: '0.85rem'}}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'See Less' : 'See More'}
            </button>
          )}
        </p>

        <div className="mt-auto">
          <button 
            // 5. Changed outline-primary to custom main color button
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