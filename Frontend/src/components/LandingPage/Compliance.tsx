import React from 'react';
import './Compliance.css';

const Compliance: React.FC = () => {
  return (
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
  );
};

export default Compliance;
