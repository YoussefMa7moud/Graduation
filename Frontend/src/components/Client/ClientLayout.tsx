// ClientDashboardLayout.tsx — FIXED
import React from 'react';
import ClientHeader from './ClientHeader';

const ClientDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* Header sits in normal flow — its own sticky handles positioning */}
      <ClientHeader />

      {/* Page content scrolls naturally; no overflow clipping on parent */}
      <main style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
          {children}
        </div>
      </main>

    </div>
  );
};

export default ClientDashboardLayout;