import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="d-flex vh-100 overflow-hidden bg-light">
      <div className="flex-shrink-0" style={{ width: '280px', backgroundColor: '#17253b' }}>
        <AdminSidebar />
      </div>

      <div className="flex-grow-1 d-flex flex-column overflow-y-auto">
        <div className="p-4">
          <div className="container-fluid fade-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
