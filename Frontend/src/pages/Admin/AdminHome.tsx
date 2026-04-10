import React from 'react';

const AdminHome: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4 fw-bold text-dark">Admin Dashboard</h2>
      <div className="card shadow-sm border-0 border-top border-primary border-4 rounded-3">
        <div className="card-body p-4">
          <h5 className="card-title text-muted fw-bold">Welcome to the Administration Portal</h5>
          <p className="card-text text-secondary mt-3">
            Use the sidebar to navigate through the system and manage:
            <br/><br/>
            <ul>
              <li><strong>Admins:</strong> Add or remove administrative accounts.</li>
              <li><strong>Companies:</strong> View all registered software companies.</li>
              <li><strong>Employees:</strong> View all company employees in the system.</li>
              <li><strong>Clients:</strong> Overview of all individual and corporate clients.</li>
              <li><strong>Projects:</strong> See all project proposals and status.</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
