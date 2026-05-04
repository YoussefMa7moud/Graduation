import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import dashboardImg from '../../assets/landing.png';

const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="badge-law mb-3">
              <i className="bi bi-shield-check me-2"></i> ENTERPRISE SOFTWARE SECURITY
            </span>
            <h1 className="hero-main-title">
              Automate Security Reviews with <span className="text-highlight">AI</span> for <br />
              Your Enterprise
            </h1>
            <p className="hero-description my-4">
              SoftwareGuard empowers tech teams to automate software reviews, ensuring 100% alignment with industry security standards and internal compliance policies.
            </p>
            <div className="hero-btns mt-5">
              <Link to="/auth" className="btn btn-mint px-4 py-3 me-3">Get Started <i className="bi bi-arrow-right ms-2"></i></Link>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-white px-4 py-3"><i className="bi bi-play-circle me-2"></i> Watch Demo</a>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="dashboard-preview-wrapper">
              <div className="dashboard-img-container">
                <img src={dashboardImg} alt="Dashboard" className="img-fluid rounded-4 shadow-lg" />
              </div>
              <div className="floating-compliance-card">
                <div className="d-flex align-items-center">
                  <div className="check-icon-circle me-3"><i className="bi bi-check-lg"></i></div>
                  <div>
                    <div className="text-uppercase x-small-label">Compliance Score</div>
                    <div className="fw-bold fs-4">98.4%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
