import React from 'react';

// This interface solves the error you're seeing in AuthPage
interface LoginFormProps {
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  return (
    <div className="form-inner-container d-flex flex-column justify-content-center align-items-center h-100 p-5">
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="fw-bold mb-2 text-start">Welcome back</h2>
        <p className="text-muted mb-5 text-start">Enter your credentials to access your legal workspace.</p>

        <form>
          <div className="mb-4 text-start">
            <label className="form-label fw-bold small">Work Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input 
                type="email" 
                className="form-control border-start-0 ps-0" 
                placeholder="counsel@firm.com.eg" 
              />
            </div>
          </div>

          <div className="mb-4 text-start">
            <div className="d-flex justify-content-between">
              <label className="form-label fw-bold small">Security Password</label>
              <span className="text-muted small cursor-pointer" style={{ cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input 
                type="password" 
                className="form-control border-start-0 border-end-0 ps-0" 
                placeholder="••••••••" 
              />
              <span className="input-group-text bg-white border-start-0">
                <i className="bi bi-eye text-muted" style={{ cursor: 'pointer' }}></i>
              </span>
            </div>
          </div>

          <button className="btn btn-dark w-100 py-2 mb-4 d-flex justify-content-center align-items-center">
            Sign in to LexAI <i className="bi bi-arrow-right ms-2"></i>
          </button>

          <div className="text-center mb-4">
            <div className="divider-text mb-4"><span>OR</span></div>
            <p className="text-muted">
              New to the platform?{' '}
              <span 
                className="text-dark fw-bold" 
                style={{ cursor: 'pointer' }} 
                onClick={onSwitch} // This triggers the slide animation
              >
                Create an account
              </span>
            </p>
          </div>

          <div className="d-flex justify-content-center gap-4 opacity-50 small fw-bold" style={{ fontSize: '10px' }}>
            <span>🛡️ TOTAL SECURITY</span>
            <span>⚖️ COMPLIANCE VALIDATED</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;