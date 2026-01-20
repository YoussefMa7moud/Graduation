import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface SignupFormProps {
  onSwitch: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitch }) => {
  const [role, setRole] = useState<'client' | 'company'>('client');
  const [clientType, setClientType] = useState<'individual' | 'corporate'>('individual');
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Prepare registration data
      const registrationData: any = {
        email,
        password,
        role: role === 'company' ? 'company' : 'client',
        firstName,
        lastName,
      };

      // Add clientType if role is client
      if (role === 'client') {
        registrationData.clientType = clientType;
      }

      // Add company fields if applicable
      if (role === 'company' || (role === 'client' && clientType === 'corporate')) {
        if (companyName) {
          registrationData.companyName = companyName;
        }
        if (description) {
          registrationData.description = description;
        }
        // Add logo file if provided
        if (companyLogo) {
          registrationData.logo = companyLogo;
        }
      }

      // Call register service
      await register(registrationData);
      
      // Show success message
    toast.success("Account Created successfully!");
      
      // Auto-switch to login after 2 seconds
      setTimeout(() => {
        onSwitch();
        setSuccess(false);
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setCompanyName('');
        setDescription('');
        setCompanyLogo(null);
        setLogoPreview(null);
      }, 2000);
    } catch (err: any) {
      // Display error message
    toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Error message display */}
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Success message display */}
        {success && (
          <div className="alert alert-success mb-4" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            Registration successful! Redirecting to login...
          </div>
        )}

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold x-small-label">FIRST NAME</label>
            <input 
              type="text" 
              className="form-control custom-input" 
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold x-small-label">LAST NAME</label>
            <input 
              type="text" 
              className="form-control custom-input" 
              placeholder="Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">EMAIL ADDRESS</label>
            <input 
              type="email" 
              className="form-control custom-input" 
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Conditional Fields (Company Name, Desc) */}
          {(role === 'company' || (role === 'client' && clientType === 'corporate')) && (
            <div className="animate-fade-in row g-3 m-0 p-0">
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY NAME</label>
                <input 
                  type="text" 
                  className="form-control custom-input" 
                  placeholder="LegalTech Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">DESCRIPTION</label>
                <textarea 
                  className="form-control custom-input" 
                  rows={2} 
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                ></textarea>
              </div>
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY LOGO</label>
                <input 
                  type="file" 
                  className="form-control custom-input" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setError('Image size must be less than 5MB');
                        return;
                      }
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        setError('Please select a valid image file');
                        return;
                      }
                      setCompanyLogo(file);
                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setLogoPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={isLoading}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{ 
                        maxWidth: '100px', 
                        maxHeight: '100px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd'
                      }} 
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => {
                        setCompanyLogo(null);
                        setLogoPreview(null);
                      }}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <small className="text-muted d-block mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</small>
              </div>
            </div>
          )}

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">PASSWORD</label>
            <input 
              type="password" 
              className="form-control custom-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
            <small className="text-muted">Minimum 6 characters</small>
          </div>

          <button 
            type="submit"
            className="btn-navy-flat w-100 py-3 mt-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating account...
              </>
            ) : (
              <>Create account →</>
            )}
          </button>

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