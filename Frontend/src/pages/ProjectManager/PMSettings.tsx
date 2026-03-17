import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { saveUser } from '../../utils/auth.utils';
import { normalizeRole } from '../../utils/role.utils';

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  .pms-container {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .pms-sidebar {
    flex: 1 1 220px;
    min-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-right: 1px solid #e2e8f0;
    padding-right: 16px;
  }
  .pms-content {
    flex: 3 1 500px;
    min-width: 300px;
  }
  .pms-profile-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f1f5f9;
    border-radius: 12px;
    margin-bottom: 8px;
    flex-shrink: 0;
  }
  .pms-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #0f172a;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    flex-shrink: 0;
  }
  .pms-profile-name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }
  .pms-profile-email {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .pms-tab {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #334155;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.15s ease, color 0.15s ease;
    width: 100%;
  }
  .pms-tab:hover { background: #f1f5f9; color: #0f172a; }
  .pms-tab--active { background: #eff6ff; color: #1d4ed8; font-weight: 600; }
  .pms-tab--active:hover { background: #dbeafe; }
  .pms-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
  }
  .pms-card-title {
    margin: 0 0 20px;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  .pms-muted { font-size: 13px; color: #94a3b8; margin: 0; }
  .pms-form { display: flex; flex-direction: column; gap: 16px; }
  .pms-row { display: flex; gap: 14px; }
  .pms-row > .pms-field { flex: 1; }
  .pms-field { display: flex; flex-direction: column; gap: 5px; }
  .pms-label { font-size: 12px; font-weight: 500; color: #64748b; letter-spacing: 0.01em; }
  .pms-input {
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    color: #0f172a;
    background: #ffffff;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
    width: 100%;
  }
  .pms-input::placeholder { color: #94a3b8; }
  .pms-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .pms-password-wrap { position: relative; display: flex; align-items: center; }
  .pms-password-wrap .pms-input { padding-right: 40px; }
  .pms-eye-btn {
    position: absolute; right: 10px; background: none; border: none;
    cursor: pointer; color: #94a3b8; display: flex; align-items: center;
    padding: 0; transition: color 0.15s ease;
  }
  .pms-eye-btn:hover { color: #2563eb; }
  .pms-btn {
    align-self: flex-start;
    height: 38px;
    padding: 0 20px;
    border: none;
    border-radius: 8px;
    background: #0f172a;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }
  .pms-btn:hover { background: #1e293b; box-shadow: 0 3px 10px rgba(15,23,42,0.22); }
  .pms-btn:active { transform: scale(0.98); }
  @media (max-width: 768px) {
    .pms-container { flex-direction: column; }
    .pms-sidebar {
      flex-direction: row; border-right: none;
      border-bottom: 1px solid #e2e8f0;
      padding-right: 0; padding-bottom: 12px;
      overflow-x: auto; gap: 4px;
    }
    .pms-tab { flex: 1 0 auto; justify-content: center; white-space: nowrap; width: auto; }
    .pms-profile-card { display: none; }
    .pms-content { min-width: 100%; }
    .pms-row { flex-direction: column; }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPerson = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconBell = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Password field ───────────────────────────────────────────────────────────
interface PasswordFieldProps {
  name: string;
  label: string;
  show: boolean;
  onToggle: () => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ name, label, show, onToggle }) => (
  <div className="pms-field">
    <label className="pms-label">{label}</label>
    <div className="pms-password-wrap">
      <input
        className="pms-input"
        type={show ? 'text' : 'password'}
        name={name}
        placeholder={label}
        required
      />
      <button type="button" className="pms-eye-btn" onClick={onToggle} tabIndex={-1}>
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const PMAccountSettings: React.FC = () => {
  const [activeTab,   setActiveTab]   = useState('editProfile');
  const { user, refreshUser }         = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const tabs = [
    { key: 'editProfile',   label: 'Edit Profile',       icon: <IconPerson /> },
    { key: 'notifications', label: 'Notifications',      icon: <IconBell />   },
    { key: 'security',      label: 'Security & Privacy', icon: <IconShield /> },
  ];

  // ── Mirrors ClientAccountSettings.handleUpdateProfile exactly ──────────────
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await api.put('/api/users/profile', data);

      // Map backend response to frontend User format.
      // Backend returns User entity with 'id', frontend expects 'userId'.
      const updatedUser = {
        userId:      response.data.id        || response.data.userId || user?.userId || 0,
        email:       response.data.email     || data.email           as string,
        role:        user?.role              || normalizeRole(response.data.role),
        firstName:   response.data.firstName || data.firstName       as string,
        lastName:    response.data.lastName  || data.lastName        as string,
        companyName: user?.companyName,
      };

      // Write to localStorage first, then refresh context from it
      saveUser(updatedUser);
      refreshUser();

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to update profile.');
    }
  };

  // ── Mirrors ClientAccountSettings.handleUpdatePassword exactly ─────────────
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { currentPassword, newPassword, confirmPassword } = Object.fromEntries(formData.entries());

    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match!');
    }

    try {
      await api.put('/api/users/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data || 'Security update failed.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'editProfile':
        return (
          <div className="pms-card">
            <h2 className="pms-card-title">Edit Profile</h2>
            <form className="pms-form" onSubmit={handleUpdateProfile}>
              <div className="pms-row">
                <div className="pms-field">
                  <label className="pms-label">First name</label>
                  <input
                    className="pms-input"
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    defaultValue={user?.firstName}
                    required
                  />
                </div>
                <div className="pms-field">
                  <label className="pms-label">Last name</label>
                  <input
                    className="pms-input"
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    defaultValue={user?.lastName}
                    required
                  />
                </div>
              </div>
              <div className="pms-field">
                <label className="pms-label">Email address</label>
                <input
                  className="pms-input"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  defaultValue={user?.email}
                  required
                />
              </div>
              <button className="pms-btn" type="submit">Save Changes</button>
            </form>
          </div>
        );

      case 'notifications':
        return (
          <div className="pms-card">
            <h2 className="pms-card-title">Notification Settings</h2>
            <p className="pms-muted">Notification preferences coming soon.</p>
          </div>
        );

      case 'security':
        return (
          <div className="pms-card">
            <h2 className="pms-card-title">Security &amp; Privacy</h2>
            <form className="pms-form" onSubmit={handleUpdatePassword}>
              <PasswordField
                name="currentPassword"
                label="Current Password"
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
              />
              <PasswordField
                name="newPassword"
                label="New Password"
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm New Password"
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />
              <button className="pms-btn" type="submit">Update Password</button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  const initials =
    (user?.firstName?.charAt(0) || '') +
    (user?.lastName?.charAt(0)  || user?.email?.charAt(0) || 'U');

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName || user?.lastName || user?.email || 'User';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pms-container">

        <aside className="pms-sidebar">
          <div className="pms-profile-card">
            <div className="pms-avatar">{initials.toUpperCase()}</div>
            <div>
              <div className="pms-profile-name">{displayName}</div>
              <div className="pms-profile-email">{user?.email}</div>
            </div>
          </div>

          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`pms-tab${activeTab === tab.key ? ' pms-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        <main className="pms-content">
          {renderContent()}
        </main>

      </div>
    </>
  );
};

export default PMAccountSettings;