import React, { useState, useEffect } from 'react';
import StatCard from '../../components/Company/CompanyHome/StatCard';
import Header from '../../components/Company/CompanyHome/Header';
import Modal from '../../components/Company/CompanyHome/Modal';
import AddManagerForm from '../../components/Company/CompanyHome/AddManagerForm';
import { getDashboardStats, registerProjectManager, getProjectManagers, updateProjectManager, deleteProjectManager } from '../../services/Company/companyService';
import { toast } from 'react-toastify';
import './CompanyHome.css';

// Define the Manager Interface
interface Manager {
  id: number;
  name: string;
  email: string;
  role: string;
  dept: string;
  status: 'Active' | 'Inactive' ;
  history?: string[];
}

const CompanyHome: React.FC = () => {
  // 1. STATE MANAGEMENT
  const [managers, setManagers] = useState<Manager[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  
  const [stats, setStats] = useState({
      totalContracts: 0,
      activeRequests: 0,
      totalProjectManagers: 0
  });

  useEffect(() => {
    loadDashboardStats();
    loadProjectManagers();
  }, []);

  const loadDashboardStats = async () => {
    const data = await getDashboardStats();
    if (data) {
        setStats(data);
    }
  };

  const loadProjectManagers = async () => {
      const data = await getProjectManagers();
      if (data) {
          // Map backend entity to frontend Manager interface
          // Backend ProjectManager has: id, user: { firstName, lastName, email, role }
          const mappedManagers = data.map((pm: any) => ({
              id: pm.id,
              name: `${pm.user.firstName} ${pm.user.lastName}`,
              email: pm.user.email,
              role: "Project Manager", // Fixed role
              dept: "Projects",        // Default or remove if not needed
              status: "Active",        // Default since we removed status management
              history: []
          }));
          setManagers(mappedManagers);
      }
  };

  // 2. HANDLERS
  const handleAddManager = async (newData: any) => {
    try {
        await registerProjectManager(newData);
        toast.success("Project Manager registered successfully!");
        setIsAddModalOpen(false);
        loadDashboardStats();
        loadProjectManagers();
    } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to register manager");
    }
  };

  const handleEditManager = async (updatedData: any) => {
    if (!selectedManager) return;
    try {
        // We only support updating firstName, lastName, email in the UI form currently
        // We need to split name back to first/last if form returns full name or handle accordingly
        // Assuming AddManagerForm (reused) returns firstName, lastName logic we added:
        await updateProjectManager(selectedManager.id, {
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email
        });
        toast.success("Project Manager updated successfully");
        setIsEditModalOpen(false);
        loadProjectManagers();
    } catch (error: any) {
        toast.error("Failed to update manager");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this manager? This action cannot be undone.")) {
      try {
          await deleteProjectManager(id);
          toast.success("Project Manager deleted successfully");
          loadProjectManagers();
          loadDashboardStats();
      } catch (error) {
          toast.error("Failed to delete manager");
      }
    }
  };
  
  // Toggle status removed as requested

  const openEdit = (manager: Manager) => {
    setSelectedManager(manager);
    setIsEditModalOpen(true);
  };

  const openHistory = (manager: Manager) => {
    setSelectedManager(manager);
    setIsHistoryModalOpen(true);
  };

  return (
    <>
    <div className="container page-fade-in">
  
      <div className="corporate-container w-100 p-0">
        <div className="row g-4 mb-5">
           {/* Stat cards remain the same */}
           {/* Stat cards remain the same */}
           <div className="col-md-4"><StatCard title="Total Contracts" value={stats.totalContracts.toLocaleString()} icon="bi-file-earmark-text" variant="gray" /></div>
           <div className="col-md-4"><StatCard title="Active Requests" value={stats.activeRequests.toString()} icon="bi-people" variant="mint" /></div>
           <div className="col-md-4"><StatCard title="Project Managers" value={stats.totalProjectManagers.toString()} icon="bi-people" variant="blue" /></div>
        </div>

        <div className="flat-table-container bg-white rounded-4 shadow-sm border overflow-hidden w-100">
          <div className="p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
            <h5 className="fw-bold m-0"><i className="bi bi-people-fill me-2 text-mint"></i> Project Managers</h5>
            <button className="btn btn-mint text-white px-4 py-2 rounded-3 fw-bold" onClick={() => setIsAddModalOpen(true)}>
              + Add Project Manager
            </button>
          </div>


          <table className="table corporate-table align-middle mb-0 w-100">
            <thead>
              <tr className="text-muted small text-uppercase bg-light">
                <th className="ps-5 py-3 border-0">Manager Name</th>
                {/* Removed Role/Dept and Status columns as requested */}
                <th className="text-end pe-5 border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id} className="manager-row border-bottom">
                  <td className="ps-5 py-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-box">{m.name.charAt(0)}</div>
                      <div>
                        <div className="fw-bold">{m.name}</div>
                        <div className="text-muted small">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Removed Role/Dept and Status columns */}
                  <td className="text-end pe-5">
                    <div className="action-icons">
                      <i className="bi bi-pencil me-3 cursor-pointer text-primary" onClick={() => openEdit(m)}></i>
                      <i className="bi bi-clock-history me-3 cursor-pointer text-info" onClick={() => openHistory(m)}></i>
                      <i className="bi bi-trash cursor-pointer text-danger" onClick={() => handleDelete(m.id)}></i>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Manager Account">
        <AddManagerForm onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddManager} />
      </Modal>

      {/* MODAL: EDIT */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Manager Account">
        <AddManagerForm 
          onClose={() => setIsEditModalOpen(false)} 
          onSubmit={handleEditManager} 
          initialData={selectedManager} 
        />
      </Modal>

      {/* MODAL: HISTORY */}
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Project History">
        <div className="p-2">
            <h6>Projects for <strong>{selectedManager?.name}</strong></h6>
            <ul className="list-group list-group-flush mt-3">
                {selectedManager?.history?.length ? selectedManager.history.map((project, idx) => (
                    <li key={idx} className="list-group-item ps-0 border-0">
                        <i className="bi bi-check2-circle text-success me-2"></i> {project}
                    </li>
                )) : <p className="text-muted">No past projects found.</p>}
            </ul>
        </div>
        
      </Modal>
      </div>
    </>
  );
};

export default CompanyHome;