import React from 'react';
import PMHeader from './PMHeader';

const PMLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="d-flex flex-column vh-100 overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      <PMHeader />
      <div className="flex-grow-1 overflow-y-auto">
        <div className="p-4" style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PMLayout;