import React, { useState } from "react";
import { Home, MessageSquare, FileText, Compass, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const CustomerNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "home", label: "Home", icon: Home, path: "/Home" },
    { name: "browse", label: "Browse", icon: Compass, path: "/browse" },
    { name: "contracts", label: "Contracts", icon: FileText, },
    { name: "chat", label: "Chat", icon: MessageSquare,  },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: "16px",
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 24px",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: "1500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "9999px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          padding: "12px 32px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#fff" }}>Contract</span>
          <span style={{ color: "#FFD60A" }}>AI</span>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {navItems.map(({ name, label, icon: Icon, path }) => (
            <button
              key={name}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor:
                  location.pathname === path ? "#FFD60A" : "transparent",
                color:
                  location.pathname === path ? "#001D3D" : "#fff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        {/* Profile Icon + Dropdown */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              padding: "10px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            <User size={24} color="#fff" />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "55px",
                right: 0,
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                overflow: "hidden",
                minWidth: "160px",
                zIndex: 100,
              }}
            >
              <button
                onClick={() => navigate("/my-account")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  color: "#001D3D",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                My Account
              </button>
              <button
                onClick={() => alert("Logged out")}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  color: "#d90429",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f2f2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
