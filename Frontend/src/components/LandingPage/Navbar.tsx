import React from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
          <img src={logo} alt="SoftwareGuard" style={{ height: '35px', marginRight: '10px' }} />
          <div>
            SoftwareGuard
            <small className="d-block brand-sub">PREMIUM SOFTWARE SECURITY</small>
          </div>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
            <li className="nav-item"><a className="nav-link" href="#how-it-works">How it Works</a></li>
            <li className="nav-item"><a className="nav-link" href="#compliance">Compliance</a></li>
            <li className="nav-item"><a className="nav-link" href="#pricing">Pricing</a></li>
          </ul>
          <div className="nav-actions">
            <a href="/login" className="login-link">Log In</a>
            <button className="btn btn-navy ms-3">Get Started</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
