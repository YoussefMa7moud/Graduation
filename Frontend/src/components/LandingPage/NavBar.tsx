import React from "react";

const Navbar: React.FC = () => {
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
          background: "#ffffffff",
          backdropFilter: "blur(10px)",
          border: "1px solid #4c4b4bff",
          borderRadius: "9999px",
          padding: "12px 24px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#000000ff" }}>Contract</span>
          <span style={{ color: "#2563eb" }}>AI</span>
        </div>

        <button
          style={{
            padding: "6px 16px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
