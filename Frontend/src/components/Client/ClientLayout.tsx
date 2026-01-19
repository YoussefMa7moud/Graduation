import React from 'react';
import ClientHeader from './ClientHeader'; // Adjust the path as needed

const ClientDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    /* h-100 and flex-column makes the container fill the screen and stack vertically */
    <div className="d-flex flex-column vh-100 overflow-hidden">
      
      {/* 1. Header is outside the scrollable area so it stays fixed at the top */}
      <ClientHeader />

      {/* 2. Main Content Area */}
      <div className="flex-grow-1 overflow-y-auto bg-light">
        {/* The p-4 padding now only affects your page content, not the header */}
        <div className="p-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {children}
        </div>
      </div>

    </div>
  );
};

export default ClientDashboardLayout;