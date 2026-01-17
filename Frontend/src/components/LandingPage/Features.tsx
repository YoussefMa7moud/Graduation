import React from 'react';
import './Features.css';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-5 text-center">
      <div className="container py-5">
        <h2 className="section-title-big fw-bold">Engineered for Egyptian Law</h2>
        <p className="section-subtitle mx-auto mb-5">Proprietary AI models trained specifically on the Egyptian Civil Code and recent digital transformation laws.</p>
        
        <div className="row g-4 mt-5">
          <div className="col-md-4">
            <div className="feature-item-box p-5">
              <div className="feature-icon mb-4"><i className="bi bi-search"></i></div>
              <h5 className="fw-bold">AI Analysis</h5>
              <p className="text-muted small">Deep learning extraction of key terms, obligations, and liabilities from complex Arabic and English legal documents.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-item-box p-5">
              <div className="feature-icon mb-4"><i className="bi bi-cpu"></i></div>
              <h5 className="fw-bold">GCL Rule Validation</h5>
              <p className="text-muted small">Convert complex internal company policies into executable GCL logic for automated objective compliance checks.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-item-box p-5">
              <div className="feature-icon mb-4"><i className="bi bi-shield-lock"></i></div>
              <h5 className="fw-bold">Egyptian Law Compliance</h5>
              <p className="text-muted small">Pre-built libraries covering Law 151/2020 (Data Protection), Labor Laws, and Cairo Stock Exchange regulations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
