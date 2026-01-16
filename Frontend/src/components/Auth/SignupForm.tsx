import React, { useState } from 'react';

interface SignupFormProps {
  onSwitch: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitch }) => {
  const [role, setRole] = useState<'client' | 'company'>('client');
  const [clientType, setClientType] = useState<'individual' | 'corporate'>('individual');

  return (
    <div className="form-inner-container d-flex flex-column justify-content-center align-items-center h-100 p-5 page-fade-in">
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <h2 className="fw-bold mb-1">Create account</h2>
        <p className="text-muted mb-4 small">Join the legal workspace as a provider or a client.</p>

        {/* 1. MAIN ROLE SLIDER */}
        <div className="slider-toggle-container mb-3">
          <div className={`slider-indicator role-${role}`}></div>
          <button 
            type="button" 
            className={role === 'client' ? 'active' : ''} 
            onClick={() => setRole('client')}
          >
            Client / Entity
          </button>
          <button 
            type="button" 
            className={role === 'company' ? 'active' : ''} 
            onClick={() => setRole('company')}
          >
            Software Company
          </button>
        </div>

        {/* 2. SUB-TYPE SLIDER (Only for Client) */}
        {role === 'client' && (
          <div className="d-flex justify-content-center mb-4 animate-fade-in">
            <div className="slider-toggle-container small">
              <div className={`slider-indicator type-${clientType}`}></div>
              <button 
                type="button" 
                className={clientType === 'individual' ? 'active' : ''} 
                onClick={() => setClientType('individual')}
              >
                Individual
              </button>
              <button 
                type="button" 
                className={clientType === 'corporate' ? 'active' : ''} 
                onClick={() => setClientType('corporate')}
              >
                Company
              </button>
            </div>
          </div>
        )}

        <form className="row g-3">
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold x-small-label">FIRST NAME</label>
            <input type="text" className="form-control custom-input" placeholder="Alex" />
          </div>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold x-small-label">LAST NAME</label>
            <input type="text" className="form-control custom-input" placeholder="Smith" />
          </div>

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">EMAIL ADDRESS</label>
            <input type="email" className="form-control custom-input" placeholder="name@domain.com" />
          </div>

          {/* Conditional Fields (Company Name, Desc, Photo) */}
          {(role === 'company' || (role === 'client' && clientType === 'corporate')) && (
            <div className="animate-fade-in row g-3 m-0 p-0">
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY NAME</label>
                <input type="text" className="form-control custom-input" placeholder="LegalTech Solutions" />
              </div>
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">DESCRIPTION</label>
                <textarea className="form-control custom-input" rows={2} placeholder="Brief description..."></textarea>
              </div>
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY LOGO</label>
                <input type="file" className="form-control custom-input" accept="image/*" />
              </div>
            </div>
          )}

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">PASSWORD</label>
            <input type="password" className="form-control custom-input" placeholder="••••••••" />
          </div>

          <button className="btn-navy-flat w-100 py-3 mt-8">Create account →</button>

          <p className="text-center mt-4 text-muted small">
            Already have an account?{' '}
            <span className="text-dark fw-bold cursor-pointer" onClick={onSwitch}>Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;