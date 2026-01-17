import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <h4 className="fw-bold text-white mb-4 d-flex align-items-center">
              <span className="logo-icon-small me-2"><i className="bi bi-shield-check"></i></span> LexGuard AI
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
  );
};

export default Footer;
