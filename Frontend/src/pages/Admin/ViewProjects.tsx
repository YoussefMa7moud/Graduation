import React, { useEffect, useState } from 'react';
import adminService from '../../services/Admin/admin.service';
import LoadingAnimation from '../../components/LoadingAnimation';
import { toast } from 'react-toastify';

const ViewProjects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllProjects()
      .then(setProjects)
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <div>
      <h2 className="mb-4 fw-bold text-dark">Projects List</h2>
      <div className="card shadow-sm border-0 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Project Title</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Client ID</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Status</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Budget & Duration</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3 fw-medium text-dark">{p.projectTitle || 'N/A'}</td>
                  <td className="px-4 py-3 text-secondary">Client #{p.clientId || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.status?.toUpperCase() === 'APPROVED' ? 'bg-success' : p.status?.toUpperCase() === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {p.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary">${p.budgetUsd} / {p.durationDays} Days</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewProjects;
