import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar d-flex flex-column justify-content-between">
      <div className="top-section">
       {/* Branding - Enhanced Logo Version */}
<div className="brand-logo-container">
  <div className="logo-flex">
    {/* Shield Icon Box */}
    <div className="logo-icon-box">
      <i className="bi bi-shield-lock-fill"></i>
    </div>

    {/* Brand Text Wrapper */}
    <div className="logo-text-wrapper">
      <h2 className="brand-name">
        LexGuard <span className="brand-accent">AI</span>
      </h2>
      <small className="brand-subtext">
        MENA Legal Unit
      </small>
    </div>
  </div>
</div>

        {/* Navigation Links */}
        <nav className="nav flex-column px-2 mt-3">
          <NavLink to="/CompanyHome" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-grid-fill me-3"></i> Home
          </NavLink>
          <NavLink to="/ClientRequests" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-lines-fill me-3"></i> Client Requests
          </NavLink>
          <NavLink to="/ContractRepository" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-file-earmark-text-fill me-3"></i> Contract Repository
          </NavLink>
          <NavLink to="/PolicyConverter" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-ui-checks me-3"></i> Policy Converter
          </NavLink>
          <NavLink to="/MyPolicyRepository" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
            <i className="bi bi-database me-3"></i> My Policy Repository
          </NavLink>
        
          <div className="mt-5 pt-4">
            <NavLink to="/CompanySettings" className={({isActive}) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
              <i className="bi bi-gear-fill me-3"></i> System Settings
            </NavLink>
          </div>
        </nav>
      </div>

     {/* Bottom Action Section */}
<div className="bottom-section p-3">

  {/* NEW: Logout Button */}
  <button className="logout-button w-100 d-flex align-items-center justify-content-center gap-2 py-2">
    <i className="bi bi-box-arrow-left"></i>
    <span>Sign Out</span>
  </button>
</div>
    </div>
  );
};

export default Sidebar;