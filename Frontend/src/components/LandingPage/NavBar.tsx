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
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: "#fff" }}>Contract</span>
          <span style={{ color: "#FFD60A" }}>AI</span>
        </div>

        <button
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
      </div>
    </nav>
  );
};

export default Navbar;
