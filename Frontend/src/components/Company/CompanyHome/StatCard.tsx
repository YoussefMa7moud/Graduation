import React from 'react';

interface StatCardProps {
  title: string;
  value: string; // Changed to string to support "1,284" or "+12%"
  icon: string;  // Allows passing different Bootstrap icons
  variant: 'mint' | 'blue' | 'orange' | 'gray'; // Controls the color theme
  subText?: string; 
  subTextColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, variant, subText, subTextColor }) => {
  return (
    <div className="stat-card bg-white rounded-4 shadow-sm border p-4 d-flex align-items-center h-100">
      <div className={`icon-container bg-${variant}-light rounded-3 d-flex align-items-center justify-content-center me-4`} style={{ width: '60px', height: '60px' }}>
        <i className={`bi ${icon} text-${variant} fs-4`}></i>
      </div>
      <div>
        <div className="stat-title text-muted small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{title}</div>
        <h2 className="stat-count fw-bold mb-0">{value}</h2>
        {subText && (
          <div className="small fw-bold mt-1" style={{ color: subTextColor, fontSize: '11px' }}>
            {subText}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;