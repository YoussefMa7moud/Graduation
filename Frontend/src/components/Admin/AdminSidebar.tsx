import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="d-flex flex-column h-100 p-3 text-white" style={{ backgroundColor: '#17253b' }}>
      <div className="mb-4 text-center">
        <h4 className="fw-bold">Admin Portal</h4>
        <hr className="bg-secondary" />
      </div>

      <nav className="nav nav-pills flex-column mb-auto gap-2">
        <NavLink to="/AdminHome" className={({ isActive }) => `nav-link text-white ${isActive ? 'bg-primary' : ''}`}>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </NavLink>
        <NavLink to="/Admin/ManageAdmins" className={({ isActive }) => `nav-link text-white ${isActive ? 'bg-primary' : ''}`}>
          <i className="bi bi-shield-lock me-2"></i>
          Manage Admins
        </NavLink>
        <NavLink to="/Admin/Companies" className={({ isActive }) => `nav-link text-white ${isActive ? 'bg-primary' : ''}`}>
          <i className="bi bi-building me-2"></i>
          Companies
        </NavLink>
        <NavLink to="/Admin/Employees" className={({ isActive }) => `nav-link text-white ${isActive ? 'bg-primary' : ''}`}>
          <i className="bi bi-people me-2"></i>
          Employees
        </NavLink>
        <NavLink to="/Admin/Clients" className={({ isActive }) => `nav-link text-white ${isActive ? 'bg-primary' : ''}`}>
          <i className="bi bi-person-lines-fill me-2"></i>
          Clients
        </NavLink>
        <NavLink to="/Admin/Projects" className={({ isActive }) => `nav-link text-white ${isActive ? 'bg-primary' : ''}`}>
          <i className="bi bi-briefcase me-2"></i>
          Projects
        </NavLink>
      </nav>

      <hr className="bg-secondary" />
      <button className="btn btn-outline-light d-flex align-items-center justify-content-center" onClick={logout}>
        <i className="bi bi-box-arrow-right me-2"></i> Sign Out
      </button>
    </div>
  );
};

export default AdminSidebar;
