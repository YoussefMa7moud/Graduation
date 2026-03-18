import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { saveUser } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../config/api.config';

const CompanySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editProfile');
  const { user, refreshUser } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [description, setDescription] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [title, setTitle] = useState('');
  const [companyRegNo, setCompanyRegNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
     if (user?.role === 'software_company') {
         api.get('/api/company/profile')
            .then(res => {
                const data = res.data;
                setCompanyName(data.name || '');
                setDescription(data.description || '');
                setNationalId(data.nationalId || '');
                setTitle(data.title || '');
                setCompanyRegNo(data.companyRegNo || '');
                setPhoneNumber(data.phoneNumber || '');
            })
            .catch(err => {
                console.error("Failed to load company profile", err);
            });
     }
  }, [user]);

  const tabs = [
    { key: 'editProfile', label: 'Company Profile', icon: 'bi-building' },
    { key: 'security', label: 'Security', icon: 'bi-shield-lock' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // 1. Update Profile (Name)
      await api.put('/api/users/profile', {
        firstName,
        lastName
      });

      // 2. Update Company Details
      await api.put('/api/company/profile', {
        name: companyName,
        description,
        nationalId,
        title,
        companyRegNo,
        phoneNumber
      });

      // 3. Update Logo (if changed)
      if (logo instanceof File) {
        const formData = new FormData();
        formData.append('file', logo);
        await api.post('/api/images/company', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // update localStorage
      const updatedUser = { 
        ...user, 
        firstName, 
        lastName,
        userId: user?.userId || 0,
        email: user?.email,
        role: user?.role,
        companyName: companyName
      } as any;
      
      saveUser(updatedUser);
      refreshUser();

      toast.success("Company Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to update profile.");
    }
  };


  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { currentPassword, newPassword, confirmPassword } = Object.fromEntries(formData.entries());

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    try {
      await api.put('/api/users/password', { currentPassword, newPassword });
      toast.success("Password updated successfully!");
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.response?.data || "Security update failed.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'editProfile':
        return (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
             
            {/* BIG LOGO HEADER */}
            <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                <div className="logo-wrapper" style={{ position: 'relative' }}>
                    <div style={styles.largeAvatarPreview}>
                        {logo ? (
                             <img src={URL.createObjectURL(logo)} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                             <img 
                                src={`${API_BASE_URL}/api/images/company/${user?.userId}`} 
                                alt="Company Logo" 
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'; 
                                    e.currentTarget.parentElement!.innerText = companyName?.substring(0,1) || 'C';
                                }}
                             />
                        )}
                    </div>
                    {/* Floating edit icon */}
                    <label style={styles.editLogoBtn}>
                        <i className="bi bi-camera-fill"></i>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setLogo(e.target.files?.[0] || null)}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
                <h2 style={{ marginTop: '20px', fontWeight: 800, color: '#0f172a', fontSize: '28px' }}>
                    {companyName || 'My Company'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '15px' }}>{user?.email}</p>
            </div>

            <form style={styles.form} onSubmit={handleUpdateProfile}>

              <div className="form-section-animated">
                 <h6 style={styles.sectionHeader}><i className="bi bi-person-badge me-2"></i>Owner Contact Details</h6>
                 <div className="row g-3">
                    <div className="col-md-6">
                        <label style={styles.label}>First Name</label>
                        <input type="text" className="input-animated" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                        <label style={styles.label}>Last Name</label>
                        <input type="text" className="input-animated" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                        <label style={styles.label}>Job Title (Role)</label>
                        <input type="text" className="input-animated" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                        <label style={styles.label}>Phone Number</label>
                        <input type="text" className="input-animated" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                    <div className="col-md-12">
                         <label style={styles.label}>Owner National ID</label>
                         <input type="text" className="input-animated" value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
                     </div>
                 </div>
              </div>

              <div className="form-section-animated" style={{ marginTop: '20px' }}>
                 <h6 style={styles.sectionHeader}><i className="bi bi-briefcase me-2"></i>Business Information</h6>
                 <div className="row g-3">
                    <div className="col-md-6">
                        <label style={styles.label}>Company/Business Name</label>
                        <input type="text" className="input-animated" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                        <label style={styles.label}>Company Registration No.</label>
                        <input type="text" className="input-animated" value={companyRegNo} onChange={(e) => setCompanyRegNo(e.target.value)} required />
                    </div>
                    <div className="col-md-12">
                        <label style={styles.label}>Company Profile Description</label>
                        <textarea 
                            className="input-animated"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            style={{ minHeight: '120px', resize: 'vertical' }} 
                            placeholder="Tell clients about your company..."
                        />
                    </div>
                 </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                  <button type="submit" className="save-btn" style={styles.button}>
                      <i className="bi bi-floppy-fill me-2"></i> Save Company Profile
                  </button>
              </div>
            </form>
          </div>
        );

      case 'security':
        return (
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="bi bi-shield-lock-fill text-mint" style={{ fontSize: '36px' }}></i>
                </div>
                <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '28px' }}>Security & Privacy</h2>
                <p style={{ color: '#64748b' }}>Update your password to keep your account secure.</p>
            </div>

            <form style={{ maxWidth: '500px', margin: '0 auto' }} onSubmit={handleUpdatePassword}>
              <div className="form-section-animated">
                  <div className="mb-4" style={styles.passwordField}>
                    <label style={styles.label}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showCurrent ? 'text' : 'password'} name="currentPassword" placeholder="Current Password" required className="input-animated" style={{ paddingRight: '40px' }} />
                        <i className={`bi ${showCurrent ? 'bi-eye-slash' : 'bi-eye'}`} style={styles.eyeIcon} onClick={() => setShowCurrent(!showCurrent)}></i>
                    </div>
                  </div>
                  <div className="mb-4" style={styles.passwordField}>
                    <label style={styles.label}>New Password</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showNew ? 'text' : 'password'} name="newPassword" placeholder="New Password" required className="input-animated" style={{ paddingRight: '40px' }} />
                        <i className={`bi ${showNew ? 'bi-eye-slash' : 'bi-eye'}`} style={styles.eyeIcon} onClick={() => setShowNew(!showNew)}></i>
                    </div>
                  </div>
                  <div className="mb-4" style={styles.passwordField}>
                    <label style={styles.label}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm New Password" required className="input-animated" style={{ paddingRight: '40px' }} />
                        <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} style={styles.eyeIcon} onClick={() => setShowConfirm(!showConfirm)}></i>
                    </div>
                  </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                  <button type="submit" className="save-btn" style={styles.button}>
                      <i className="bi bi-shield-check me-2"></i> Update Password
                  </button>
              </div>
            </form>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
    <style>{`
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .glass-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
        border: 1px solid rgba(226, 232, 240, 0.8);
        animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .tab-pill {
        padding: 12px 28px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        font-size: 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #64748b;
        background: transparent;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tab-pill.active {
        background: #10b981;
        color: white;
        box-shadow: 0 8px 16px rgba(16, 185, 129, 0.25);
        transform: translateY(-2px);
      }
      .tab-pill:hover:not(.active) {
        background: #f1f5f9;
        color: #0f172a;
      }
      .input-animated {
        width: 100%;
        padding: 14px 18px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        font-size: 15px;
        color: #0f172a;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background-color: #f8fafc;
        outline: none;
      }
      .input-animated:focus {
        border-color: #10b981;
        background-color: #ffffff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        transform: translateY(-2px);
      }
      .save-btn {
        padding: 16px 32px;
        border-radius: 50px;
        border: none;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: white;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      }
      .save-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 24px rgba(16, 185, 129, 0.35);
      }
      .logo-wrapper {
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .logo-wrapper:hover {
        transform: scale(1.05);
      }
      .form-section-animated {
        background: #ffffff;
        padding: 30px;
        border-radius: 16px;
        border: 1px solid #f1f5f9;
        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        transition: all 0.3s ease;
      }
      .form-section-animated:hover {
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        border-color: #e2e8f0;
      }
    `}</style>

    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
       <div className="glass-container" style={{ width: '100%' }}>
          
          {/* Centered Tab Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid #f1f5f9' }}>
            {tabs.map(tab => (
                <div 
                    key={tab.key} 
                    className={`tab-pill ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    <i className={`bi ${tab.icon}`}></i>
                    {tab.label}
                </div>
            ))}
          </div>
          
          <main>{renderContent()}</main>

       </div>
    </div>
    </>
  );
};

export default CompanySettings;

const styles: { [key: string]: React.CSSProperties } = {
  largeAvatarPreview: { 
      width: '160px', 
      height: '160px', 
      borderRadius: '50%', 
      backgroundColor: '#10b981', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontWeight: 'bold', 
      fontSize: '60px', 
      overflow: 'hidden', 
      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)', 
      border: '6px solid #fff' 
  },
  editLogoBtn: {
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      width: '40px',
      height: '40px',
      backgroundColor: '#0f172a',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      border: '3px solid white',
      transition: 'transform 0.2s',
      zIndex: 2
  },
  form: { display: 'flex', flexDirection: 'column' },
  sectionHeader: { color: '#0f172a', fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center' },
  label: { fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#475569', display: 'block' },
  passwordField: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: '16px', top: '42px', cursor: 'pointer', color: '#64748b', fontSize: '18px', zIndex: 10 }
};
