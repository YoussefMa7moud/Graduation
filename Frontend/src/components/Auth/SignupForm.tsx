import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface SignupFormProps {
  onSwitch: () => void;
}

// 1. Define the limit based on your database column size (usually 255 for VARCHAR)
const MAX_DESCRIPTION_LENGTH = 255;

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
  const [nationalId, setNationalId] = useState('');
  const [title, setTitle] = useState<'CEO' | 'CTO' | 'Legal Rep' | ''>('');
  const [companyRegNo, setCompanyRegNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
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

      // 2. Additional Validation for Description Length
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        setError(`Description is too long. Max ${MAX_DESCRIPTION_LENGTH} characters.`);
        setIsLoading(false);
        return;
      }

      // Validate phone number
      if (!phoneNumber || phoneNumber.trim() === '') {
        setError('Phone number is required');
        setIsLoading(false);
        return;
      }
      const phoneRegex = /^[\d\s\+\-\(\)]+$/;
      if (!phoneRegex.test(phoneNumber)) {
        setError('Please enter a valid phone number');
        setIsLoading(false);
        return;
      }

      // Validate national ID
      if (!nationalId || nationalId.trim() === '') {
        setError('National ID is required');
        setIsLoading(false);
        return;
      }
      const nationalIdRegex = /^\d+$/;
      if (!nationalIdRegex.test(nationalId) || nationalId.length < 8 || nationalId.length > 20) {
        setError('National ID must be numeric and between 8-20 digits');
        setIsLoading(false);
        return;
      }

      // Validate role-specific fields
      if (role === 'company' || (role === 'client' && clientType === 'corporate')) {
        if (!title || title === '') {
          setError('Title is required');
          setIsLoading(false);
          return;
        }
        if (!companyRegNo || companyRegNo.trim() === '') {
          setError('Company Registration Number is required');
          setIsLoading(false);
          return;
        }
      }

      // Prepare registration data
      const registrationData: any = {
        email,
        password,
        role: role === 'company' ? 'company' : 'client',
        firstName,
        lastName,
        phoneNumber: phoneNumber.trim(),
        nationalId: nationalId.trim(),
      };

      if (role === 'client') {
        registrationData.clientType = clientType;
      }

      if (role === 'company' || (role === 'client' && clientType === 'corporate')) {
        if (companyName) registrationData.companyName = companyName;
        if (description) registrationData.description = description;
        if (companyLogo) registrationData.logo = companyLogo;
        if (companyRegNo) registrationData.companyRegNo = companyRegNo.trim();
        if (title) registrationData.title = title;
      }

      // Call register service
      await register(registrationData);
      
      toast.success("Account Created successfully!");
      
      setTimeout(() => {
        onSwitch();
        setSuccess(false);
        // Reset form
        setFirstName(''); setLastName(''); setEmail(''); setPassword('');
        setCompanyName(''); setDescription(''); setCompanyLogo(null);
        setLogoPreview(null); setNationalId(''); setTitle('');
        setCompanyRegNo(''); setPhoneNumber('');
      }, 2000);

    } catch (err: any) {
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

        {/* ROLE SLIDER */}
        <div className="slider-toggle-container mb-3">
          <div className={`slider-indicator role-${role}`}></div>
          <button type="button" className={role === 'client' ? 'active' : ''} onClick={() => setRole('client')}>Client / Entity</button>
          <button type="button" className={role === 'company' ? 'active' : ''} onClick={() => setRole('company')}>Software Company</button>
        </div>

        {/* SUB-TYPE SLIDER */}
        {role === 'client' && (
          <div className="d-flex justify-content-center mb-4 animate-fade-in">
            <div className="slider-toggle-container small">
              <div className={`slider-indicator type-${clientType}`}></div>
              <button type="button" className={clientType === 'individual' ? 'active' : ''} onClick={() => setClientType('individual')}>Individual</button>
              <button type="button" className={clientType === 'corporate' ? 'active' : ''} onClick={() => setClientType('corporate')}>Company</button>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger mb-4 small"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}

        <form className="row g-3" onSubmit={handleSubmit}>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold x-small-label">FIRST NAME</label>
            <input type="text" className="form-control custom-input" placeholder="Alex" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="col-md-6 text-start">
            <label className="form-label fw-bold x-small-label">LAST NAME</label>
            <input type="text" className="form-control custom-input" placeholder="Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isLoading} />
          </div>

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">EMAIL ADDRESS</label>
            <input type="email" className="form-control custom-input" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
          </div>

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">PHONE NUMBER</label>
            <input type="tel" className="form-control custom-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required disabled={isLoading} />
          </div>

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">NATIONAL ID</label>
            <input type="text" className="form-control custom-input" value={nationalId} onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))} required minLength={8} maxLength={20} disabled={isLoading} />
          </div>

          {(role === 'company' || (role === 'client' && clientType === 'corporate')) && (
            <div className="animate-fade-in row g-3 m-0 p-0">
              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY NAME</label>
                <input type="text" className="form-control custom-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={isLoading} />
              </div>

              {/* 3. MODIFIED DESCRIPTION FIELD WITH LIMITS */}
              <div className="col-12 text-start">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold x-small-label m-0">DESCRIPTION</label>
                  <span className={`x-small-label ${description.length >= MAX_DESCRIPTION_LENGTH ? 'text-danger fw-bold' : 'text-muted'}`}>
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <textarea 
                  className={`form-control custom-input ${description.length >= MAX_DESCRIPTION_LENGTH ? 'border-danger' : ''}`}
                  rows={2} 
                  placeholder="Brief description..."
                  value={description}
                  maxLength={MAX_DESCRIPTION_LENGTH} // Hard stop in browser
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY REGISTRATION NUMBER</label>
                <input type="text" className="form-control custom-input" value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} required disabled={isLoading} />
              </div>

              <div className="col-12 text-start">
                <label className="form-label fw-bold x-small-label">COMPANY LOGO</label>
                <input type="file" className="form-control custom-input" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 1024 * 1024) {
                    setError('Image size must be less than 1MB');
                    e.target.value = '';
                    return;
                  }
                  if (file) {
                    setCompanyLogo(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setLogoPreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} disabled={isLoading} />
                {logoPreview && (
                  <div className="mt-2 d-flex align-items-center">
                    <img src={logoPreview} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                    <button type="button" className="btn btn-sm btn-link text-danger ms-2" onClick={() => {setCompanyLogo(null); setLogoPreview(null);}}>Remove</button>
                  </div>
                )}
              </div>

              <div className="col-12 text-start animate-fade-in">
                <label className="form-label fw-bold x-small-label">TITLE</label>
                <select className="form-control custom-input" value={title} onChange={(e) => setTitle(e.target.value as any)} required disabled={isLoading}>
                  <option value="">Select Title</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="Legal Rep">Legal Rep</option>
                </select>
              </div>
            </div>
          )}

          <div className="col-12 text-start">
            <label className="form-label fw-bold x-small-label">PASSWORD</label>
            <input type="password" className="form-control custom-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={isLoading} />
          </div>

          <button type="submit" className="btn-navy-flat w-100 py-3 mt-4" disabled={isLoading}>
            {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : 'Create account →'}
          </button>

          <p className="text-center mt-4 text-muted small">
            Already have an account? <span className="text-dark fw-bold cursor-pointer" onClick={onSwitch}>Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;