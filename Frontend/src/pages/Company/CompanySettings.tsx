import React, { useState } from 'react';

const CompanySettings: React.FC = () => {
  const [companyName, setCompanyName] = useState('Egyptian National Construction Co.');
  const [timezone, setTimezone] = useState('(GMT+02:00) Cairo, Egypt');

  const styles = {
    container: {
      width: '100%',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#1e293b',
    },
    headerSection: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      margin: '0 0 8px 0',
    },
    description: {
      fontSize: '14px',
      color: '#64748b',
      margin: 0,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eef2f6',
      padding: '40px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    },
    row: {
      display: 'flex',
      gap: '32px',
      marginBottom: '32px',
    },
    fieldGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '12px',
    },
    label: {
      fontSize: '11px',
      fontWeight: '800',
      color: '#94a3b8',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '14px',
      color: '#1e293b',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    select: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      fontSize: '14px',
      color: '#1e293b',
      appearance: 'none' as 'none',
      cursor: 'pointer',
    },
    logoSection: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '12px',
    },
    logoUploadArea: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    previewBox: {
      width: '80px',
      height: '80px',
      borderRadius: '10px',
      border: '2px dashed #cbd5e1',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    replaceBtn: {
      backgroundColor: '#f1f5f9',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '700',
      color: '#1e293b',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    hint: {
      fontSize: '12px',
      color: '#94a3b8',
    }
  };

  return (
    <div style={styles.container}>
       <div className="container page-fade-in">
      {/* 1. HEADER */}
      <div style={styles.headerSection}>
        <h2 style={styles.title}>Company Profile</h2>
        <p style={styles.description}>Configure your organization's identity on the platform.</p>
      </div>

      {/* 2. FORM CARD */}
      <div style={styles.card}>
        {/* Name and Timezone Row */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Company Name</label>
            <input 
              style={styles.input} 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>System Timezone</label>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <select 
                style={styles.select} 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option>(GMT+02:00) Cairo, Egypt</option>
                <option>(GMT+00:00) London, UK</option>
                <option>(GMT-05:00) New York, USA</option>
              </select>
              <i 
                className="bi bi-chevron-down" 
                style={{ position: 'absolute', right: '16px', top: '15px', pointerEvents: 'none', color: '#64748b' }}
              ></i>
            </div>
          </div>
        </div>

        {/* Logo Row */}
        <div style={styles.logoSection}>
          <label style={styles.label}>Company Logo</label>
          <div style={styles.logoUploadArea}>
            <div style={styles.previewBox}>
              <i className="bi bi-image text-muted fs-4"></i>
            </div>
            <button 
              style={styles.replaceBtn}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              Replace Logo
            </button>
            <span style={styles.hint}>JPG, PNG or SVG. Max 2MB.</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CompanySettings;