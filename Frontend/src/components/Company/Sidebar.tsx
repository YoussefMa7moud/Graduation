import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar d-flex flex-column justify-content-between">
      <div className="top-section">
        {/* Branding */}
        <div className="brand p-4">
          <h4 className="fw-bold m-0 text-white">LexGuard AI</h4>
          <small className="text-muted text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
            MENA Legal Unit
          </small>
        </div>

        {/* Navigation Links */}
        <nav className="nav flex-column px-2 mt-3">
          <NavLink to="/CompanyHome" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-grid-fill me-3"></i> Home
          </NavLink>
          <NavLink to="/ClientRequests" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-lines-fill me-3"></i> Client Requests
          </NavLink>
          <NavLink to="/contracts" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-file-earmark-text-fill me-3"></i> Contract Repository
          </NavLink>
          <NavLink to="/PolicyConverter" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-ui-checks me-3"></i> Policy Converter
          </NavLink>
          <NavLink to="/MyPolicyRepository" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-database me-3"></i> My Policy Repository
          </NavLink>
          
          <div className="mt-5 pt-4">
            <NavLink to="/settings" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
              <i className="bi bi-gear-fill me-3"></i> System Settings
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Bottom Action Section */}
      <div className="bottom-section p-3">
        <div className="scan-card p-3 rounded text-center">
          <small className="text-muted d-block mb-2" style={{ fontSize: '10px' }}>Egyptian DPL Module v1.4</small>
          <button className="btn btn-light w-100 fw-bold py-2 shadow-sm">
            New Compliance Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;