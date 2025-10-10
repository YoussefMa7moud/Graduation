import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; 

interface NavbarProps {
  showLogin?: boolean;
  showHome?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showLogin = true, showHome = false }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/Auth");
  };

  const handleHomeClick = () => {
    navigate("/"); 
  };

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
          padding: "12px 24px",
        }}
      >
        <div
          className="brand-title"
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            letterSpacing: "-0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ color: "#fff" }}>Contract</span>
          <span style={{ color: "#FFD60A" }}>AI</span>
        </div>

  
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {showHome && (
            <button
              onClick={handleHomeClick}
              style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
       fontSize: "16px",
                fontWeight: 600,
        transition: "transform 0.2s ease, color 0.2s ease",
      }}
              title="Go Home"
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Home size={24} />
              <span>Home</span>
            </button>
          )}

          {showLogin && (
            <button
              onClick={handleLoginClick}
              style={{
                padding: "6px 16px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: "#FFD60A",
                color: "#001D3D",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
