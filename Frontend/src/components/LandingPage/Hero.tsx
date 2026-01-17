import React from 'react';
import './Hero.css';
import dashboardImg from '../../assets/landing.png';

const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="badge-law mb-3">
              <i className="bi bi-shield-check me-2"></i> NOW WITH LAW NO. 151 SUPPORT
            </span>
            <h1 className="hero-main-title">
              Automate Legal Reviews with <span className="text-highlight">AI</span> for <br />
              Egyptian Law
            </h1>
            <p className="hero-description my-4">
              LexGuard AI empowers corporate legal teams to automate contract reviews, ensuring 100% alignment with Egyptian regulatory frameworks and internal GCL policies.
            </p>
            <div className="hero-btns mt-5">
              <button className="btn btn-mint px-4 py-3 me-3">Get Started <i className="bi bi-arrow-right ms-2"></i></button>
              <button className="btn btn-outline-white px-4 py-3"><i className="bi bi-play-circle me-2"></i> Watch Demo</button>
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
