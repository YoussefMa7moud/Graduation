import React, { useEffect, useState } from 'react';
import adminService from '../../services/Admin/admin.service';
import LoadingAnimation from '../../components/LoadingAnimation';
import { toast } from 'react-toastify';

const ViewClients: React.FC = () => {
  const [persons, setPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getAllClientPersons(),
      adminService.getAllClientCompanies()
    ])
    .then(([p, c]) => {
      setPersons(p);
      setCompanies(c);
    })
    .catch(() => toast.error('Failed to load clients'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <div>
      <h2 className="mb-4 fw-bold text-dark">Clients List</h2>

      {/* INDIVIDUAL CLIENTS */}
      <h4 className="mb-3 mt-5 fw-semibold text-primary">Individual Clients</h4>
      <div className="card shadow-sm border-0 bg-white mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">First Name</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Last Name</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {persons.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3 fw-medium">{p.firstName}</td>
                  <td className="px-4 py-3 fw-medium">{p.lastName}</td>
                  <td className="px-4 py-3 text-secondary">{p.phoneNumber}</td>
                </tr>
              ))}
              {persons.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No individual clients.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPANY CLIENTS */}
      <h4 className="mb-3 mt-5 fw-semibold text-primary">Corporate Clients</h4>
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
                  <td className="px-4 py-3 fw-medium">{c.companyName}</td>
                  <td className="px-4 py-3 text-secondary">{c.companyRegNo}</td>
                  <td className="px-4 py-3 text-secondary">{c.phoneNumber}</td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No corporate clients.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewClients;
