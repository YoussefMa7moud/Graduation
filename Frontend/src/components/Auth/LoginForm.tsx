import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// This interface solves the error you're seeing in AuthPage
interface LoginFormProps {
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Call login service
      await login({ email, password });
      
      // Redirect to home page on successful login
      toast.success("Logged in successfully!");
    } catch (err: any) {
      // Display error message
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-inner-container d-flex flex-column justify-content-center align-items-center h-100 p-5">
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="fw-bold mb-2 text-start">Welcome back</h2>
        <p className="text-muted mb-5 text-start">Enter your credentials to access your legal workspace.</p>

        {/* Error message display */}
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
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
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <span 
                className="input-group-text bg-white border-start-0"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
              </span>
            </div>
          </div>

          <button 
            type="submit"
            className="btn btn-dark w-100 py-3 mb-4 d-flex justify-content-center align-items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign in to LexAI <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
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