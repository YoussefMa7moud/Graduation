import React from 'react';


const ClientDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="d-flex vh-100 overflow-hidden">

   

      {/* MAIN CONTENT (ONLY SCROLLABLE PART) */}
      <div className="flex-grow-1 d-flex flex-column bg-light overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </div>

    </div>
  );
};

export default ClientDashboardLayout;
