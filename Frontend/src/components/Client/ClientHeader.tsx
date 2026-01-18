import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';



const ClientHeader: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    console.log('Sign out clicked');
    navigate('/login'); // Replace with actual sign-out logic
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    navigate('/settings'); // Navigate to settings page
  };

  return (
    <header
      style={{
        position: 'sticky',
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
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <i className="bi bi-briefcase fs-5"></i>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            LexGuard AI
          </h1>
          <div
            style={{
              fontSize: '9px',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Client Dashboard
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: 500 }}>
        <Link to="/BrowseCompanies" style={{ textDecoration: 'none', color: '#1e293b' }}>
          Dashboard
        </Link>
        <Link to="/proposals" style={{ textDecoration: 'none', color: '#1e293b' }}>
          Proposals
        </Link>
        <Link to="/OngoingProjects" style={{ textDecoration: 'none', color: '#1e293b' }}>
          Contracts
        </Link>
     
         <Link to="/SignedProjects" style={{ textDecoration: 'none', color: '#1e293b' }}>
          Projects Archives
        </Link>
      </nav>

      {/* Search Input */}
      <div style={{ flexGrow: 1, maxWidth: '400px', margin: '0 40px', position: 'relative' }}>
        <i
          className="bi bi-search"
          style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
          }}
        ></i>
        <input
          type="text"
          placeholder="Search companies..."
          style={{
            width: '100%',
            padding: '10px 15px 10px 40px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#f1f5f9',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Right Icons + Avatar */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}
        ref={dropdownRef}
      >
        <i className="bi bi-bell fs-5 text-secondary"></i>

        {/* Avatar */}
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#17253b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          CL
          <span
            style={{
              display: 'inline-block',
              marginLeft: '6px',
              width: '6px',
              height: '6px',
              borderRight: '2px solid white',
              borderBottom: '2px solid white',
              transform: dropdownOpen ? 'rotate(-135deg)' : 'rotate(45deg)',
              transition: 'transform 0.2s',
            }}
          ></span>

          {/* Dropdown Menu */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
              minWidth: '160px',
              opacity: dropdownOpen ? 1 : 0,
              transform: dropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
              pointerEvents: dropdownOpen ? 'auto' : 'none',
              transition: 'all 0.2s ease-in-out',
              overflow: 'hidden',
              zIndex: 1000,
            }}
          >
            {/* Settings */}
            <div
              onClick={handleSettings}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <i className="bi bi-gear"></i>
              Settings
            </div>

            {/* Sign Out */}
            <div
              onClick={handleSignOut}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626', // red color
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')} // light red hover
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <i className="bi bi-box-arrow-right"></i>
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
