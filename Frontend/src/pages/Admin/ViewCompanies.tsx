import React, { useEffect, useState } from 'react';
import adminService from '../../services/Admin/admin.service';
import LoadingAnimation from '../../components/LoadingAnimation';
import { toast } from 'react-toastify';

const ViewCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllCompanies()
      .then(setCompanies)
      .catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <div>
      <h2 className="mb-4 fw-bold text-dark">Companies List</h2>
      <div className="card shadow-sm border-0 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Company Name</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Registration No</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 fw-medium text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-secondary">{c.companyRegNo}</td>
                  <td className="px-4 py-3 text-secondary">{c.phoneNumber}</td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No companies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewCompanies;
