import React, { useEffect, useState } from 'react';
import adminService, { type AdminDto, type CreateAdminRequest } from '../../services/Admin/admin.service';
import { toast } from 'react-toastify';
import LoadingAnimation from '../../components/LoadingAnimation';

const ManageAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<AdminDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newAdmin, setNewAdmin] = useState<CreateAdminRequest>({ email: '', password: '', firstName: '', lastName: '' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createAdmin(newAdmin);
      toast.success('Admin created successfully!');
      setShowAddForm(false);
      setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await adminService.deleteAdmin(id);
        toast.success('Admin deleted successfully');
        fetchAdmins();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete admin');
      }
    }
  };

  if (loading && admins.length === 0) return <LoadingAnimation />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Manage Admins</h2>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowAddForm(!showAddForm)}>
          <i className={`bi ${showAddForm ? 'bi-x' : 'bi-plus-lg'} me-2`}></i>
          {showAddForm ? 'Cancel' : 'Add New Admin'}
        </button>
      </div>

      {showAddForm && (
        <div className="card shadow-sm border-0 bg-white mb-4 slide-down">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Create New Admin</h5>
            <form onSubmit={handleAddSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted small">First Name</label>
                  <input type="text" className="form-control bg-light" required value={newAdmin.firstName} onChange={e => setNewAdmin({...newAdmin, firstName: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Last Name</label>
                  <input type="text" className="form-control bg-light" required value={newAdmin.lastName} onChange={e => setNewAdmin({...newAdmin, lastName: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Email Address</label>
                  <input type="email" className="form-control bg-light" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Password</label>
                  <input type="password" className="form-control bg-light" required value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="submit" className="btn btn-primary px-4 shadow-sm">Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Name</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">Email</th>
                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td className="px-4 py-3 fw-medium">{admin.firstName} {admin.lastName}</td>
                  <td className="px-4 py-3 text-muted">{admin.email}</td>
                  <td className="px-4 py-3 text-end">
                    <button className="btn btn-sm btn-outline-danger shadow-sm px-3" onClick={() => handleDelete(admin.id)}>
                      <i className="bi bi-trash-fill"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;
