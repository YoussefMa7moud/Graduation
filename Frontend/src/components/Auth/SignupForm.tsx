import React, { useState } from 'react';

interface SignupFormProps {
  onSwitch: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitch }) => {
  const [role, setRole] = useState<'client' | 'company'>('client');

  return (
    <div className="form-inner-container d-flex flex-column justify-content-center align-items-center h-100 p-5">
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <h2 className="fw-bold mb-2">Create account</h2>
        <p className="text-muted mb-4">Enter your details to join the legal workspace.</p>

        {/* Role Toggle */}
        <div className="role-toggle-container mb-4">
          <button 
            type="button"
            className={`role-btn ${role === 'client' ? 'active' : ''}`}
            onClick={() => setRole('client')}
          >
            Client
          </button>
          <button 
            type="button"
            className={`role-btn ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
          >
            Software Company
          </button>
        </div>

        <form className="row g-3">
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold small">First Name</label>
            <input type="text" className="form-control" placeholder="Alex" />
          </div>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold small">Last Name</label>
            <input type="text" className="form-control" placeholder="Smith" />
          </div>

          <div className="col-12 text-start">
            <label className="form-label fw-bold small">Work Email Address</label>
            <input type="email" className="form-control" placeholder="counsel@firm.com.eg" />
          </div>

          {/* Conditional Fields */}
          {role === 'client' ? (
            <div className="col-12 text-start animate-fade-in">
              <label className="form-label fw-bold small">Legal Specialization</label>
              <select className="form-select">
                <option>Corporate Law</option>
                <option>Regulatory Compliance</option>
                <option>Litigation</option>
              </select>
            </div>
          ) : (
            <div className="col-12 text-start animate-fade-in">
              <label className="form-label fw-bold small">Commercial Register Number</label>
              <input type="text" className="form-control" placeholder="CR-123456" />
            </div>
          )}

          <div className="col-12 text-start">
            <label className="form-label fw-bold small">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" />
          </div>

          <button className="btn btn-dark w-100 py-2 mt-4">Create account →</button>

          <p className="text-center mt-4 text-muted">
            Already have an account?{' '}
            <span className="text-dark fw-bold" style={{ cursor: 'pointer' }} onClick={onSwitch}>
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;