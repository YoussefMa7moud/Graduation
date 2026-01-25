import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const CompanySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editProfile');
  const { user } = useAuth(); // user contains firstName, lastName, email, role
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form states for firstName, lastName, timezone, logo
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [timezone, setTimezone] = useState('(GMT+02:00) Cairo, Egypt');
  const [logo, setLogo] = useState<File | null>(null);

  const tabs = [
    { key: 'editProfile', label: 'Company Info', icon: 'bi-building' },
    { key: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { key: 'security', label: 'Security', icon: 'bi-shield-lock' },
  ];

const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('auth_token');

    await axios.put('/api/users/profile', {
      firstName,
      lastName
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // update localStorage
    const updatedUser = { ...user, firstName, lastName };
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));

    toast.success("Profile updated successfully!");
  } catch (err) {
    toast.error("Failed to update profile.");
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
      const token = localStorage.getItem('auth_token');
      await axios.put('/api/users/password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Company Info</h2>
            <form style={styles.form} onSubmit={handleUpdateProfile}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={styles.input}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ position: 'relative', marginTop: '12px' }}>
                <select
                  name="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  style={styles.select}
                >
                  <option>(GMT+02:00) Cairo, Egypt</option>
                  <option>(GMT+00:00) London, UK</option>
                  <option>(GMT-05:00) New York, USA</option>
                </select>
                <i className="bi bi-chevron-down" style={{ position: 'absolute', right: '10px', top: '12px', color: '#64748b', pointerEvents: 'none' }}></i>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={styles.label}>Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files?.[0] || null)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.button}>Save Changes</button>
            </form>
          </div>
        );

      case 'notifications':
        return (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Notification Settings</h2>
            <p style={styles.textMuted}>Notification preferences coming soon.</p>
          </div>
        );

      case 'security':
        return (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Security & Privacy</h2>
            <form style={styles.form} onSubmit={handleUpdatePassword}>
              <div style={styles.passwordField}>
                <input type={showCurrent ? 'text' : 'password'} name="currentPassword" placeholder="Current Password" required style={styles.passwordInput} />
                <i className={`bi ${showCurrent ? 'bi-eye-slash' : 'bi-eye'}`} style={styles.eyeIcon} onClick={() => setShowCurrent(!showCurrent)}></i>
              </div>
              <div style={styles.passwordField}>
                <input type={showNew ? 'text' : 'password'} name="newPassword" placeholder="New Password" required style={styles.passwordInput} />
                <i className={`bi ${showNew ? 'bi-eye-slash' : 'bi-eye'}`} style={styles.eyeIcon} onClick={() => setShowNew(!showNew)}></i>
              </div>
              <div style={styles.passwordField}>
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm New Password" required style={styles.passwordInput} />
                <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} style={styles.eyeIcon} onClick={() => setShowConfirm(!showConfirm)}></i>
              </div>
              <button type="submit" style={styles.button}>Update Password</button>
            </form>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {firstName?.substring(0,1) || 'C'}
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>
              {`${firstName} ${lastName}`}
            </div>
            <div style={styles.profileEmail}>{user?.email}</div>
          </div>
        </div>
        {tabs.map(tab => (
          <div key={tab.key} style={{...styles.tab, ...(activeTab === tab.key ? styles.activeTab : {})}} onClick={() => setActiveTab(tab.key)}>
            <i className={`bi ${tab.icon}`} style={{ marginRight: '8px' }}></i>
            <span>{tab.label}</span>
          </div>
        ))}
      </aside>
      <main style={styles.content}>{renderContent()}</main>
    </div>
  );
};

export default CompanySettings;

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', gap: '24px', padding: '24px', flexWrap: 'wrap', fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' },
  sidebar: { flex: '1 1 220px', minWidth: '220px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' },
  profileCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '12px', flexShrink: 0 },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#17253b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' },
  profileInfo: { display: 'flex', flexDirection: 'column' },
  profileName: { fontWeight: 600 },
  profileEmail: { fontSize: '12px', color: '#64748b' },
  tab: { display: 'flex', alignItems: 'center', padding: '12px', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s', fontWeight: 500, color: '#1e293b' },
  activeTab: { backgroundColor: '#e0f2fe', fontWeight: 600 },
  content: { flex: '3 1 500px', minWidth: '300px' },
  card: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  cardTitle: { marginBottom: '16px', fontSize: '20px', color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#1e293b' },
  select: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', color: '#1e293b', appearance: 'none', cursor: 'pointer' },
  button: { padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#17253b', color: '#fff', cursor: 'pointer', fontWeight: 600 },
  passwordField: { position: 'relative', display: 'flex', alignItems: 'center' },
  passwordInput: { width: '100%', padding: '10px 30px 10px 12px', border: 'none', borderBottom: '1px solid #cbd5e1', backgroundColor: 'transparent', outline: 'none', color: '#1e293b', fontSize: '14px' },
  eyeIcon: { position: 'absolute', right: '8px', cursor: 'pointer', color: '#64748b', fontSize: '16px' },
  label: { fontSize: '12px', fontWeight: 600, marginBottom: '4px' },
  textMuted: { color: '#64748b' }
};
