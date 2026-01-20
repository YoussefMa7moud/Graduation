import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ClientHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { logout } = useAuth();
  const mainColor = "#0f172a";

  // Fixed handleClickOutside to prevent the menu from closing prematurely
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/auth");
    }
  };

  // FIXED: Settings button handler
  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents dropdown from closing before navigation
    setDropdownOpen(false);
    navigate("/settings");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        height: "72px",
        backgroundColor: mainColor,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1280px", // Matches standard Bootstrap container width
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Brand Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "200px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "8px",
              borderRadius: "8px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
            }}
          >
            <i className="bi bi-briefcase fs-5"></i>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              LexGuard AI
            </h1>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Client Dashboard
            </div>
          </div>
        </div>

        {/* Navigation - Centered */}
        <nav style={{ display: "flex", gap: "30px" }}>
          {[
            { name: "Dashboard", path: "/BrowseCompanies" },
            { name: "My Proposals", path: "/proposals" },
            { name: "Ongoing Projects", path: "/OngoingProjects" },
            { name: "My Contracts", path: "/SignedProjects" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                textDecoration: "none",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: isActive(item.path) ? 700 : 500,
                opacity: isActive(item.path) ? 1 : 0.7,
                position: "relative",
                padding: "8px 0",
              }}
            >
              {item.name}
              {isActive(item.path) && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#ffffff",
                    borderRadius: "2px",
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            minWidth: "200px",
            justifyContent: "flex-end",
          }}
          ref={dropdownRef}
        >
          <i
            className="bi bi-bell fs-5"
            style={{ color: "#ffffff", cursor: "pointer", opacity: 0.8 }}
          ></i>

          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              height: "40px",
              padding: "0 12px",
              borderRadius: "20px",
              backgroundColor: "#ffffff",
              color: mainColor,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div
              style={{
                backgroundColor: mainColor,
                color: "#fff",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
              }}
            >
              CL
            </div>
            <i
              className={`bi bi-chevron-${dropdownOpen ? "up" : "down"}`}
              style={{ fontSize: "12px" }}
            ></i>

            {/* Dropdown Content */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  minWidth: "180px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  zIndex: 1001,
                }}
              >
                <div
                  onClick={handleSettings} // Correctly triggers settings navigation
                  style={{
                    padding: "12px 16px",
                    color: "#1e293b",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <i className="bi bi-gear"></i> Settings
                </div>
                <div
                  onClick={handleSignOut}
                  style={{
                    padding: "12px 16px",
                    color: "#ef4444",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    borderTop: "1px solid #f1f5f9",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fef2f2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <i className="bi bi-box-arrow-right"></i> Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
