import React from 'react';
import './CompanyCard.css';

interface CompanyCardProps {
  company: {
    id: number;
    name: string;
    logo: string | null;
  };
  onOpen: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onOpen }) => {
  const logoUrl = company.logo 
    ? `data:image/png;base64,${company.logo}` 
    : 'https://via.placeholder.com/150?text=Company';

  return (
    <div className="premium-company-card" onClick={onOpen}>
      {/* Top Banner Section */}
      <div className="card-banner-top"></div>
      
      {/* Overlapping Logo */}
      <div className="card-logo-overlap shadow-sm">
        <img src={logoUrl} alt={company.name} />
      </div>

      <div className="card-body-content">
        <h5 className="company-title-main">{company.name}</h5>
        <p className="text-muted small mb-4">Official Partner</p>
        
        <button className="btn-pitch-outline" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          View Profile & Pitch
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;