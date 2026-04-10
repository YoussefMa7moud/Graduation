import React, { useEffect, useState } from 'react';
import adminService from '../../services/Admin/admin.service';
import LoadingAnimation from '../../components/LoadingAnimation';
import { toast } from 'react-toastify';

const ViewEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllEmployees()
      .then(setEmployees)
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <div>
      <h2 className="mb-4 fw-bold text-dark">Employees List</h2>
      <div className="card shadow-sm border-0 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Company</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Title</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">National ID</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold text-center">Contracts</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold text-center">Policies</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id}>
                  <td className="px-4 py-3 fw-medium text-dark">{e.company?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-secondary">{e.title}</td>
                  <td className="px-4 py-3 text-secondary">{e.nationalId}</td>
                  <td className="px-4 py-3 text-center">
                    {e.canViewContracts ? <i className="bi bi-check-circle-fill text-success fs-5"></i> : <i className="bi bi-x-circle text-danger fs-5"></i>}
                  </td>
                  <td className="px-4 py-3 text-center">
                     {e.canAddPolicy ? <i className="bi bi-check-circle-fill text-success fs-5"></i> : <i className="bi bi-x-circle text-danger fs-5"></i>}
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployees;
