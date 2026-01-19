import React, { useState } from 'react';
import './ClientAccountSettings.css';

const ClientAccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editProfile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const tabs = [
    { key: 'editProfile', label: 'Edit Profile', icon: 'bi-person' },
    { key: 'professional', label: 'Professional Credentials', icon: 'bi-briefcase' },
    { key: 'notifications', label: 'Notifications', icon: 'bi-bell' },
    { key: 'security', label: 'Security & Privacy', icon: 'bi-shield-lock' },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, section: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(`Submitting ${section}:`, data);
    // Replace this with your backend API call
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'editProfile':
        return (
          <div className="card">
            <h2>Edit Profile</h2>
            <form className="settings-form" onSubmit={(e) => handleSubmit(e, 'editProfile')}>
              <input type="text" name="fullName" placeholder="Full Name" required />
              <input type="email" name="email" placeholder="Email Address" required />
              <input type="text" name="phone" placeholder="Phone Number" />
              <button type="submit">Save Changes</button>
            </form>
          </div>
        );
      case 'professional':
        return (
          <div className="card">
            <h2>Professional Credentials</h2>
            <form className="settings-form" onSubmit={(e) => handleSubmit(e, 'professional')}>
              <input type="text" name="jobTitle" placeholder="Job Title / Position" />
              <input type="text" name="company" placeholder="Company / Organization" />
              <input type="text" name="certificates" placeholder="Certificates / Licenses" />
              <button type="submit">Save Changes</button>
            </form>
          </div>
        );
      case 'notifications':
        return (
          <div className="card">
            <h2>Notification Settings</h2>
            <div className="toggle-group">
              <label className="toggle">
                Email Notifications
                <input type="checkbox" name="emailNotifications" />
                <span className="slider"></span>
              </label>
              <label className="toggle">
                SMS Notifications
                <input type="checkbox" name="smsNotifications" />
                <span className="slider"></span>
              </label>
       
            </div>
          </div>
        );
     case 'security':
  return (
    <div className="card">
      <h2>Security & Privacy</h2>
      <form className="settings-form" onSubmit={(e) => handleSubmit(e, 'security')}>
        {/* Current Password */}
        <div className="password-field">
          <input
            type={showCurrent ? 'text' : 'password'}
            name="currentPassword"
            placeholder="Current Password"
            required
          />
          <i
            className={`bi ${showCurrent ? 'bi-eye-slash' : 'bi-eye'} eye-icon`}
            onClick={() => setShowCurrent(!showCurrent)}
          ></i>
        </div>

        {/* New Password */}
        <div className="password-field">
          <input
            type={showNew ? 'text' : 'password'}
            name="newPassword"
            placeholder="New Password"
            required
          />
          <i
            className={`bi ${showNew ? 'bi-eye-slash' : 'bi-eye'} eye-icon`}
            onClick={() => setShowNew(!showNew)}
          ></i>
        </div>

        {/* Confirm Password */}
        <div className="password-field">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
          />
          <i
            className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} eye-icon`}
            onClick={() => setShowConfirm(!showConfirm)}
          ></i>
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );

      default:
        return null;
    }
  };

  return (
    <div>

      <div className="settings-container">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="avatar">CL</div>
            <div className="profile-info">
              <div className="name">Client Name</div>
              <div className="email">client@example.com</div>
            </div>
          </div>

          {/* Tabs */}
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="settings-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default ClientAccountSettings;
