import React from 'react';


interface StatCardProps {
  title: string;
  count: number;
  isActive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, isActive }) => {
  return (
    <div className="stat-card bg-white rounded-4 shadow-sm border p-4 d-flex align-items-center">
      <div className={`icon-container ${isActive ? 'bg-mint-light' : 'bg-blue-light'} rounded-circle d-flex align-items-center justify-content-center me-4`}>
        <i className={`bi ${isActive ? 'bi-check-circle-fill text-mint' : 'bi-list-check text-blue'} fs-4`}></i>
      </div>
      <div>
        <div className="stat-title text-muted small fw-bold text-uppercase">{title}</div>
        <h2 className="stat-count fw-bold mb-0">{count}</h2>
      </div>
    </div>
  );
};

export default StatCard;