import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './ClientAccountSettings.css';
import { useAuth } from '../../contexts/AuthContext';
import { saveUser } from '../../utils/auth.utils';
import { normalizeRole } from '../../utils/role.utils';

const ClientAccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editProfile');
  const { user, refreshUser } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const tabs = [
    { key: 'editProfile', label: 'Edit Profile', icon: 'bi-person' },
    { key: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { key: 'security', label: 'Security & Privacy', icon: 'bi-shield-lock' },
  ];

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await api.put('/api/users/profile', data);
      
      // Map backend response to frontend User format
      // Backend returns User entity with 'id', frontend expects 'userId'
      const updatedUser = {
        userId: response.data.id || response.data.userId || user?.userId || 0,
        email: response.data.email || data.email as string,
        role: user?.role || normalizeRole(response.data.role),
        firstName: response.data.firstName || data.firstName as string,
        lastName: response.data.lastName || data.lastName as string,
        companyName: user?.companyName,
      };
      
      // Update localStorage and refresh context
      saveUser(updatedUser);
      refreshUser();
      
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data || "Failed to update profile.");
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
      toast.error(err.response?.data?.message || err.response?.data || "Security update failed.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'editProfile':
        return (
          <div className="card">
            <h2>Edit Profile</h2>
            <form className="settings-form" onSubmit={handleUpdateProfile}>
              <div className="d-flex gap-2">
                <input type="text" name="firstName" placeholder="First Name" defaultValue={user?.firstName} required />
                <input type="text" name="lastName" placeholder="Last Name" defaultValue={user?.lastName} required />
              </div>
              <input type="email" name="email" placeholder="Email Address" defaultValue={user?.email} required />
              <button type="submit">Save Changes</button>
            </form>
          </div>
        );
      case 'notifications':
        return (
          <div className="card">
            <h2>Notification Settings</h2>
            <p className="text-muted">Notification preferences coming soon.</p>
          </div>
        );
      case 'security':
        return (
          <div className="card">
            <h2>Security & Privacy</h2>
            <form className="settings-form" onSubmit={handleUpdatePassword}>
              <div className="password-field">
                <input type={showCurrent ? 'text' : 'password'} name="currentPassword" placeholder="Current Password" required />
                <i className={`bi ${showCurrent ? 'bi-eye-slash' : 'bi-eye'} eye-icon`} onClick={() => setShowCurrent(!showCurrent)}></i>
              </div>
              <div className="password-field">
                <input type={showNew ? 'text' : 'password'} name="newPassword" placeholder="New Password" required />
                <i className={`bi ${showNew ? 'bi-eye-slash' : 'bi-eye'} eye-icon`} onClick={() => setShowNew(!showNew)}></i>
              </div>
              <div className="password-field">
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm New Password" required />
                <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} eye-icon`} onClick={() => setShowConfirm(!showConfirm)}></i>
              </div>
              <button type="submit">Update Password</button>
            </form>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="settings-container">
      <aside className="settings-sidebar">
        <div className="profile-card">
          <div className="avatar">
            {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || '' || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <div className="name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`.trim()
                : user?.firstName || user?.lastName || user?.email || 'User'}
            </div>
            <div className="email">{user?.email}</div>
          </div>
        </div>
        {tabs.map((tab) => (
          <div key={tab.key} className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            <i className={`bi ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </div>
        ))}
      </aside>
      <main className="settings-content">{renderContent()}</main>
    </div>
  );
};

export default ClientAccountSettings;