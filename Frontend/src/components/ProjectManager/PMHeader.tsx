import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.png";

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string[];
}

/* ─── Inline CSS ───────────────────────────────────────────────────────────── */
const HEADER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .pmh-root {
    position: sticky; top: 0; z-index: 1000; width: 100%;
    height: 64px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  }
  .pmh-inner {
    width: 100%; max-width: 1320px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px;
  }
  .pmh-brand {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; color: #fff;
  }
  .pmh-brand-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .pmh-brand-icon img { height: 26px; }
  .pmh-brand-text h1 {
    margin: 0; font-size: 16px; font-weight: 700;
    letter-spacing: -0.01em; line-height: 1.2;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .pmh-brand-text span {
    font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.35);
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  /* ── Nav tabs ── */
  .pmh-nav {
    display: flex; align-items: center; gap: 2px;
    background: rgba(255,255,255,0.04);
    padding: 4px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .pmh-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 16px; border: none; border-radius: 9px;
    background: transparent; color: rgba(255,255,255,0.55);
    font-size: 13px; font-weight: 500; cursor: pointer;
    font-family: inherit; text-decoration: none;
    transition: all 0.18s ease; white-space: nowrap;
    position: relative;
  }
  .pmh-tab:hover {
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.06);
  }
  .pmh-tab--active {
    color: #fff !important;
    background: rgba(59,130,246,0.18) !important;
    box-shadow: 0 1px 6px rgba(59,130,246,0.15);
  }
  .pmh-tab--active .pmh-tab-icon {
    color: #60a5fa;
  }
  .pmh-tab-icon {
    display: flex; align-items: center; flex-shrink: 0;
    transition: color 0.18s ease;
  }
  .pmh-tab-badge {
    font-size: 10px; font-weight: 700;
    min-width: 18px; height: 18px; padding: 0 5px;
    border-radius: 10px;
    background: rgba(239,68,68,0.2); color: #fca5a5;
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }

  /* ── User dropdown ── */
  .pmh-user-wrap {
    position: relative; display: flex; align-items: center;
  }
  .pmh-user-btn {
    height: 38px; padding: 0 14px 0 6px; border-radius: 20px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff; display: flex; align-items: center; gap: 8px;
    font-weight: 600; font-size: 13px; cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .pmh-user-btn:hover {
    background: rgba(255,255,255,0.12);
    border-color: rgba(255,255,255,0.16);
  }
  .pmh-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .pmh-dropdown {
    position: absolute; top: 46px; right: 0;
    background: #fff; border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08);
    min-width: 200px; overflow: hidden;
    border: 1px solid #e2e8f0; z-index: 1001;
    animation: pmh-drop-in 0.15s ease;
  }
  @keyframes pmh-drop-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pmh-drop-header {
    padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
  }
  .pmh-drop-name { font-size: 14px; font-weight: 600; color: #0f172a; }
  .pmh-drop-email { font-size: 11px; color: #64748b; margin-top: 2px; }
  .pmh-drop-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px; font-size: 13px; cursor: pointer;
    color: #334155; transition: background 0.12s;
    border: none; background: none; width: 100%;
    font-family: inherit; text-align: left;
  }
  .pmh-drop-item:hover { background: #f8fafc; }
  .pmh-drop-item--danger { color: #ef4444; }
  .pmh-drop-item--danger:hover { background: #fef2f2; }
  .pmh-drop-divider { height: 1px; background: #f1f5f9; }
`;

/* ─── Icons ────────────────────────────────────────────────────────────── */
const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconWorkspace = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconProposals = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const IconTasks = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const PMHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth() as { logout: () => Promise<void>; user: User | null };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.firstName || user?.email || "Project Manager";
  const initials =
    (user?.firstName?.charAt(0) || "P") +
    (user?.lastName?.charAt(0) || "M");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/auth");
    }
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const tabs = [
    { name: "Dashboard",  path: "/ProjectManagerHome",       icon: <IconDashboard /> },
    { name: "Tasks",      path: "/ProjectTasks",             icon: <IconTasks /> },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HEADER_CSS }} />
      <header className="pmh-root">
        <div className="pmh-inner">

          {/* ── Brand ── */}
          <Link to="/ProjectManagerHome" className="pmh-brand">
            <div className="pmh-brand-icon">
              <img src={logo} alt="SG" />
            </div>
            <div className="pmh-brand-text">
              <h1>SoftwareGuard</h1>
              <span>Project Manager</span>
            </div>
          </Link>

          {/* ── Navigation ── */}
          <nav className="pmh-nav">
            {tabs.map(tab => (
              <Link
                key={tab.name}
                to={tab.path}
                className={`pmh-tab ${isActive(tab.path) ? 'pmh-tab--active' : ''}`}
              >
                <span className="pmh-tab-icon">{tab.icon}</span>
                {tab.name}
              </Link>
            ))}
          </nav>

          {/* ── User ── */}
          <div className="pmh-user-wrap" ref={dropdownRef}>
            <button
              className="pmh-user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="pmh-avatar">{initials.toUpperCase()}</div>
              <span>{displayName}</span>
              <i className={`bi bi-chevron-${dropdownOpen ? "up" : "down"}`} style={{ fontSize: 10, opacity: 0.6 }} />
            </button>

            {dropdownOpen && (
              <div className="pmh-dropdown">
                <div className="pmh-drop-header">
                  <div className="pmh-drop-name">{displayName}</div>
                  <div className="pmh-drop-email">{user?.email}</div>
                </div>
                <button className="pmh-drop-item" onClick={() => { setDropdownOpen(false); navigate("/PMsettings"); }}>
                  <i className="bi bi-gear" /> Settings
                </button>
                <div className="pmh-drop-divider" />
                <button className="pmh-drop-item pmh-drop-item--danger" onClick={handleSignOut}>
                  <i className="bi bi-box-arrow-right" /> Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
};

export default PMHeader;
