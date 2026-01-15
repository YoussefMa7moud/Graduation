import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    /* 1. vh-100: Locks the entire layout to the screen height.
      2. overflow-hidden: Prevents the sidebar and header from moving.
      3. d-flex: Puts sidebar and content side-by-side.
    */
    <div className="d-flex vh-100 overflow-hidden">
      
      {/* SIDEBAR: Stays static because its height is 100vh and the parent is locked */}
      <div className="flex-shrink-0" style={{ width: '260px', backgroundColor: '#17253b' }}>
        <Sidebar />
      </div>

      {/* MAIN CONTENT AREA:
        We set overflow-y-auto here so that ONLY this section becomes scrollable.
      */}
      <div className="flex-grow-1 d-flex flex-column bg-light overflow-y-auto">
        
        {/* If you have a Top Navbar, put it here (outside the scroll area if you want it fixed too) */}
        
        <div className="p-4">
          {children}
        </div>

      </div>
      
    </div>
  );
};

export default DashboardLayout;