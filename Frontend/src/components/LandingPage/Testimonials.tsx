import React from 'react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  return (
    <section className="py-5 bg-light text-center">
      <div className="container py-5">
        <h2 className="section-title-big fw-bold mb-5">Voices from the Field</h2>
        <div className="row g-4 mt-5">
          <div className="col-md-6">
            <div className="testimonial-card p-4 text-start bg-white rounded-4 border">
              <p className="text-muted fst-italic mb-4">"LexGuard AI has reduced our contract review time by 70%. The GCL rule engine is a game-changer for maintaining internal policy consistency across our regional Cairo and Alexandria offices."</p>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-small" id="testimonial-avatar-1"></div>
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
                <div className="avatar-small" id="testimonial-avatar-2"></div>
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
  );
};

export default Testimonials;
