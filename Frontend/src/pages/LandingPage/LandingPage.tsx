import React from 'react';
import './LandingPage.css';
import dashboardImg from '../../assets/landing.png';

const LandingPage: React.FC = () => {
  return (
    <div className="lexguard-landing-page page-fade-in">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
            <span className="logo-icon">LA</span> LexGuard AI
            <small className="d-block brand-sub">EGYPTIAN LEGAL TECH</small>
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

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge-law mb-3">
                <i className="bi bi-shield-check me-2"></i> NOW WITH LAW NO. 151 SUPPORT
              </span>
              <h1 className="hero-main-title fw-bold">
                The Future of <br />
                <span className="text-highlight">Egyptian</span> Legal <br /> Tech
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

      {/* TRUSTED BY */}
      <section className="trusted-by-section text-center py-5">
        <div className="container">
          <p className="trusted-text mb-4">TRUSTED BY EGYPT'S LEADING LEGAL FIRMS & ENTERPRISES</p>
          <div className="trusted-logos d-flex justify-content-center align-items-center gap-5 grayscale">
            <img src="https://via.placeholder.com/100x30?text=LOGO1" alt="partner" />
            <img src="https://via.placeholder.com/100x30?text=LOGO2" alt="partner" />
            <img src="https://via.placeholder.com/100x30?text=LOGO3" alt="partner" />
            <img src="https://via.placeholder.com/100x30?text=LOGO4" alt="partner" />
            <img src="https://via.placeholder.com/100x30?text=LOGO5" alt="partner" />
          </div>
        </div>
      </section>

      {/* ENGINEERED SECTION */}
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

      {/* WORKFLOW SECTION */}
      <section id="how-it-works" className="py-5 text-center bg-white">
        <div className="container py-5">
          <h2 className="section-title-big fw-bold mb-5">Your Workflow, Accelerated</h2>
          <div className="row g-0 workflow-path-container">
            <div className="col-md-3 workflow-step">
              <div className="workflow-icon-circle mb-3"><i className="bi bi-cloud-upload"></i></div>
              <h6 className="fw-bold">Upload</h6>
              <p className="text-muted x-small">Securely upload PDFs or Word contracts.</p>
            </div>
            <div className="col-md-3 workflow-step">
              <div className="workflow-icon-circle mb-3"><i className="bi bi-bar-chart-steps"></i></div>
              <h6 className="fw-bold">Analyze</h6>
              <p className="text-muted x-small">AI extracts and categorizes entities.</p>
            </div>
            <div className="col-md-3 workflow-step">
              <div className="workflow-icon-circle mb-3"><i className="bi bi-check2-square"></i></div>
              <h6 className="fw-bold">Validate</h6>
              <p className="text-muted x-small">Cross-check against laws and rules.</p>
            </div>
            <div className="col-md-3 workflow-step">
              <div className="workflow-icon-circle mb-3"><i className="bi bi-pencil-square"></i></div>
              <h6 className="fw-bold">Sign</h6>
              <p className="text-muted x-small">Final approval with audit trails.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE BLUE SECTION */}
      <section id="compliance" className="py-5 compliance-section-navy">
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="compliance-dark-card p-5">
                <h4 className="fw-bold mb-4 text-white"><i className="bi bi-shield-shaded text-mint me-2"></i> Data Protection Compliance</h4>
                <ul className="list-unstyled d-flex flex-column gap-4">
                  <li className="d-flex gap-3">
                    <i className="bi bi-check-circle-fill text-mint mt-1"></i>
                    <div>
                      <h6 className="fw-bold text-white mb-1">Law No. 151 of 2020</h6>
                      <p className="x-small text-light opacity-75">Automatic verification of data controller and processor obligations under the Egyptian Personal Data Protection Law.</p>
                    </div>
                  </li>
                  <li className="d-flex gap-3">
                    <i className="bi bi-check-circle-fill text-mint mt-1"></i>
                    <div>
                      <h6 className="fw-bold text-white mb-1">Server Residency Check</h6>
                      <p className="x-small text-light opacity-75">Validate cross-border transfer requirements against localized hosting mandates.</p>
                    </div>
                  </li>
                  <li className="d-flex gap-3">
                    <i className="bi bi-check-circle-fill text-mint mt-1"></i>
                    <div>
                      <h6 className="fw-bold text-white mb-1">DPO Registration Status</h6>
                      <p className="x-small text-light opacity-75">Maintain compliance with regulatory filing timelines automatically.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6 text-white text-start">
              <h2 className="section-title-big fw-bold mb-4">Mastering Egypt's <br /><span className="text-mint">New Digital Frontier</span></h2>
              <p className="opacity-75 mb-5">Egyptian law is evolving rapidly. Our specialized AI engines are synchronized with the Data Protection Center (DPC) and FRA updates so your legal team doesn't have to manually track every decree.</p>
              <div className="expert-box p-3 rounded-3 d-flex align-items-center">
                 <div className="expert-avatar me-3"></div>
                 <div>
                    <h6 className="fw-bold mb-0">Expert-Verified Templates</h6>
                    <p className="x-small opacity-50 mb-0">Curated by top-tier Egyptian legal consultants.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-5 bg-light text-center">
        <div className="container py-5">
          <h2 className="section-title-big fw-bold mb-5">Voices from the Field</h2>
          <div className="row g-4 mt-5">
            <div className="col-md-6">
              <div className="testimonial-card p-4 text-start bg-white rounded-4 border">
                <p className="text-muted fst-italic mb-4">"LexGuard AI has reduced our contract review time by 70%. The GCL rule engine is a game-changer for maintaining internal policy consistency across our regional Cairo and Alexandria offices."</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-small"></div>
                  <div>
                    <h6 className="fw-bold mb-0">Ahmed Mansour</h6>
                    <p className="x-small text-muted mb-0">CHIEF LEGAL OFFICER, MISR TECH</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="testimonial-card p-4 text-start bg-white rounded-4 border">
                <p className="text-muted fst-italic mb-4">"The integration with Egyptian Law 151/2020 gave our board the confidence we needed during our digital transformation phase. It is the standard for legal tech in the MENA region."</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar-small"></div>
                  <div>
                    <h6 className="fw-bold mb-0">Sherif El-Ganzoury</h6>
                    <p className="x-small text-muted mb-0">SYSTEM ADMINISTRATOR, CAIRO GLOBAL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <h4 className="fw-bold text-white mb-4 d-flex align-items-center">
                <span className="logo-icon-small me-2">LA</span> LexGuard AI
              </h4>
              <p className="text-light opacity-50 small mb-4" style={{maxWidth: '300px'}}>Elevating Egyptian corporate legal standards through advanced artificial intelligence and rule-based validation.</p>
              <div className="social-icons d-flex gap-3 text-light opacity-50 fs-5">
                 <i className="bi bi-share cursor-pointer"></i>
                 <i className="bi bi-shield-check cursor-pointer"></i>
                 <i className="bi bi-globe cursor-pointer"></i>
              </div>
            </div>
            <div className="col-lg-2">
              <h6 className="footer-label mb-4">LAW SEARCH HUB</h6>
              <ul className="list-unstyled footer-links">
                <li>Egyptian Civil Code</li>
                <li>Data Protection (Law 151)</li>
                <li>Labor Law Amendments</li>
                <li>FRA Regulatory Updates</li>
              </ul>
            </div>
            <div className="col-lg-2">
              <h6 className="footer-label mb-4">COMPANY</h6>
              <ul className="list-unstyled footer-links">
                <li>About LexGuard</li>
                <li>Enterprise Solutions</li>
                <li>Security Architecture</li>
                <li>Contact Support</li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h6 className="footer-label mb-4">NEWSLETTER</h6>
              <p className="text-light opacity-50 small mb-4">Stay updated with the latest in Egyptian legal tech.</p>
              <div className="newsletter-input d-flex">
                <input type="email" placeholder="Email Address" className="form-control bg-transparent border-secondary text-white" />
                <button className="btn btn-mint ms-2 px-3"><i className="bi bi-send-fill"></i></button>
              </div>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="footer-bottom d-flex justify-content-between x-small text-light opacity-50 py-4">
             <p>© 2024 LexGuard AI. All rights reserved. Registered in Egypt.</p>
             <div className="d-flex gap-4">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Cookie Policy</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;