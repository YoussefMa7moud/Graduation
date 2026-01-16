import React, { useState } from 'react';
import StatCard from '../../components/Company/CompanyHome/StatCard';
import Header from '../../components/Company/CompanyHome/Header';
import Modal from '../../components/Company/CompanyHome/Modal';
import AddManagerForm from '../../components/Company/CompanyHome/AddManagerForm';
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
  const [managers, setManagers] = useState<Manager[]>([
    { id: 1, name: "Ahmed Mansour", email: "ahmed.m@lexguard.ai", role: "General Counsel", dept: "CAIRO HQ", status: "Active", history: ["Project Alpha", "Q3 Compliance Audit"] },
    { id: 2, name: "Dina Kamal", email: "dina.k@lexguard.ai", role: "Junior Associate", dept: "COMPLIANCE UNIT", status: "Active", history: ["Contract Review X"] },
    { id: 3, name: "Omar Sherif", email: "omar.s@lexguard.ai", role: "Compliance Lead", dept: "LEGAL OPERATIONS", status: "Inactive", history: ["Global Expansion"] },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  // 2. HANDLERS
  const handleAddManager = (newData: any) => {
    const newManager: Manager = {
      id: Date.now(),
      name: newData.name,
      email: newData.email,
      role: newData.role,
      dept: newData.department,
      status: 'Active',
      history: []
    };
    setManagers([...managers, newManager]);
    setIsAddModalOpen(false);
  };

  const handleEditManager = (updatedData: any) => {
    setManagers(managers.map(m => m.id === selectedManager?.id ? { ...m, ...updatedData, dept: updatedData.department } : m));
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      setManagers(managers.filter(m => m.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setManagers(managers.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return m;
    }));
  };

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
      <Header />
      <div className="corporate-container w-100 p-0">
        <div className="row g-4 mb-5">
           {/* Stat cards remain the same */}
           <div className="col-md-4"><StatCard title="Total Contracts" value="1,284" icon="bi-file-earmark-text" variant="gray" /></div>
           <div className="col-md-4"><StatCard title="Active Requests" value={managers.length.toString()} icon="bi-people" variant="mint" /></div>
           <div className="col-md-4"><StatCard title="Team Leads" value="18" icon="bi-people" variant="blue" /></div>
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
                <th className="border-0">Role / Department</th>
                <th className="border-0">Status</th>
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
                  <td>
                    <div className="fw-bold small">{m.role}</div>
                    <div className="text-muted x-small">{m.dept}</div>
                  </td>
                  <td>
                    <div className="form-check form-switch d-flex align-items-center gap-2">
                      <input 
                        className="form-check-input cursor-pointer" 
                        type="checkbox" 
                        checked={m.status === 'Active'} 
                        onChange={() => toggleStatus(m.id)}
                      />
                      <span className={`status-pill status-${m.status.toLowerCase().replace(' ', '-')}`}>
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
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