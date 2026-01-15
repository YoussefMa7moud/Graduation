import React from 'react';

const CorporateHeader: React.FC = () => {
  const styles = {
    header: {
      position: 'sticky' as 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      height: '72px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #eef2f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      /* This negative margin cancels out the p-4 from DashboardLayout */
      margin: '-24px -24px 24px -24px', 
    },
    brandIconBox: {
      backgroundColor: '#f8fafc',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    brandText: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
      lineHeight: '1.2'
    },
    brandSub: {
      fontSize: '9px',
      fontWeight: '800',
      color: '#94a3b8',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.8px'
    },
    searchWrapper: {
      maxWidth: '400px',
      flexGrow: 1,
      margin: '0 40px'
    },
    searchInput: {
      backgroundColor: '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 15px 10px 40px',
      fontSize: '14px',
      width: '100%'
    },
    searchIcon: {
      position: 'absolute' as 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8'
    },
    notificationDot: {
      position: 'absolute' as 'absolute',
      top: '0',
      right: '0',
      width: '8px',
      height: '8px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      border: '2px solid #ffffff'
    },
    userInfo: {
      borderLeft: '1px solid #e2e8f0',
      paddingLeft: '20px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#17253b', 
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px'
    }
  };

  return (
    <header style={styles.header}>
      <div className="d-flex align-items-center gap-3">
        <div style={styles.brandIconBox}>
          <i className="bi bi-building fs-5"></i>
        </div>
        <div>
          <h1 style={styles.brandText}>LexGuard AI Corporate</h1>
          <div style={styles.brandSub}>Company Administration Dashboard</div>
        </div>
      </div>

      <div style={styles.searchWrapper} className="d-none d-md-block">
        <div className="position-relative">
          <i className="bi bi-search" style={styles.searchIcon}></i>
          <input 
            type="text" 
            style={styles.searchInput} 
            placeholder="Search team..." 
          />
        </div>
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="position-relative" style={{ cursor: 'pointer' }}>
          <i className="bi bi-bell fs-5 text-secondary"></i>
          <span style={styles.notificationDot}></span>
        </div>

        <div className="d-flex align-items-center gap-3" style={styles.userInfo}>
          <div className="text-end d-none d-lg-block">
            <div className="fw-bold" style={{ fontSize: '14px', color: '#1e293b' }}>Admin User</div>
            <div style={styles.brandSub}>COMPANY SUPERADMIN</div>
          </div>
          <div style={styles.avatar}>AU</div>
        </div>
      </div>
    </header>
  );
};

export default CorporateHeader;