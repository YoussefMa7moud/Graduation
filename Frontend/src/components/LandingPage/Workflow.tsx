import React from 'react';
import './Workflow.css';

const Workflow: React.FC = () => {
  return (
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
  );
};

export default Workflow;
