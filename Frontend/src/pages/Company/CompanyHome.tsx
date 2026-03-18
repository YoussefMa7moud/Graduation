import React, { useState, useEffect } from 'react';
import StatCard from '../../components/Company/CompanyHome/StatCard';
import Modal from '../../components/Company/CompanyHome/Modal';
import AddManagerForm from '../../components/Company/CompanyHome/AddManagerForm';
import AddEmployeeForm from '../../components/Company/CompanyHome/AddEmployeeForm';
import { getDashboardStats, registerProjectManager, getProjectManagers, updateProjectManager, deleteProjectManager, getEmployees, registerEmployee, updateEmployee, deleteEmployee } from '../../services/Company/companyService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
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

interface Employee {
  id: number;
  user: {
      firstName: string;
      lastName: string;
      email: string;
  };
  canViewContracts: boolean;
  canAddPolicy: boolean;
  canSignContract: boolean;
  canAcceptProposals: boolean;
}

const CompanyHome: React.FC = () => {
  // 1. STATE MANAGEMENT
  const { user } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [stats, setStats] = useState({
      totalContracts: 0,
      activeRequests: 0,
      totalProjectManagers: 0
  });

  useEffect(() => {
    loadDashboardStats();
    loadProjectManagers();
    loadEmployees();
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

  const loadEmployees = async () => {
      const data = await getEmployees();
      if (data) setEmployees(data);
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

  const handleAddEmployee = async (newData: any) => {
    try {
        await registerEmployee(newData);
        toast.success("Employee registered successfully!");
        setIsAddEmployeeModalOpen(false);
        loadEmployees();
    } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to register employee");
    }
  };

  const handleEditEmployee = async (updatedData: any) => {
    if (!selectedEmployee) return;
    try {
        await updateEmployee(selectedEmployee.id, updatedData);
        toast.success("Employee updated successfully");
        setIsEditEmployeeModalOpen(false);
        loadEmployees();
    } catch (error: any) {
        toast.error("Failed to update employee");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
          await deleteEmployee(id);
          toast.success("Employee deleted successfully");
          loadEmployees();
      } catch (error) {
          toast.error("Failed to delete employee");
      }
    }
  };
  
  // Toggle status removed as requested

  const openEdit = (manager: Manager) => {
    setSelectedManager(manager);
    setIsEditModalOpen(true);
  };

  const openEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditEmployeeModalOpen(true);
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

        {user?.role === 'company_employee' ? (
          <div className="bg-white rounded-4 shadow-sm border p-5 text-center mt-4">
             <div className="mb-4">
                <i className="bi bi-shield-check text-mint" style={{ fontSize: '4rem' }}></i>
             </div>
             <h3 className="fw-bold mb-3">Welcome to LexGuard AI Company Portal</h3>
             <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
               You are logged in as an authorized employee. Use the navigation menu on the left to access client requests, your contract repository, or the policy engine based on your assigned permissions.
             </p>
          </div>
        ) : (
        <>
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

        {/* EMPLOYEES TABLE */}
        {user?.role !== 'company_employee' && (
        <div className="flat-table-container bg-white rounded-4 shadow-sm border overflow-hidden w-100 mt-5">
          <div className="p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
            <h5 className="fw-bold m-0"><i className="bi bi-person-badge-fill me-2 text-primary"></i> Company Employees</h5>
            <button className="btn btn-primary text-white px-4 py-2 rounded-3 fw-bold" onClick={() => setIsAddEmployeeModalOpen(true)}>
              + Add Employee
            </button>
          </div>

          <table className="table corporate-table align-middle mb-0 w-100">
            <thead>
              <tr className="text-muted small text-uppercase bg-light">
                <th className="ps-5 py-3 border-0">Employee Name</th>
                <th className="border-0">Permissions</th>
                <th className="text-end pe-5 border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="manager-row border-bottom">
                  <td className="ps-5 py-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-box bg-primary text-white">{(e.user?.firstName || 'E').charAt(0)}</div>
                      <div>
                        <div className="fw-bold">{`${e.user?.firstName} ${e.user?.lastName}`}</div>
                        <div className="text-muted small">{e.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                       {e.canViewContracts && <span className="badge bg-secondary">View Contracts</span>}
                       {e.canAddPolicy && <span className="badge bg-info text-dark">Add Policy</span>}
                       {e.canSignContract && <span className="badge bg-success">Sign Contract</span>}
                       {e.canAcceptProposals && <span className="badge bg-warning text-dark">Accept Proposals</span>}
                       {!e.canViewContracts && !e.canAddPolicy && !e.canSignContract && !e.canAcceptProposals && <span className="text-muted small">No special permissions</span>}
                    </div>
                  </td>
                  <td className="text-end pe-5">
                    <div className="action-icons">
                      <i className="bi bi-pencil me-3 cursor-pointer text-primary" onClick={() => openEditEmployee(e)}></i>
                      <i className="bi bi-trash cursor-pointer text-danger" onClick={() => handleDeleteEmployee(e.id)}></i>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        </>
        )}
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

      {/* MODAL: ADD EMPLOYEE */}
      <Modal isOpen={isAddEmployeeModalOpen} onClose={() => setIsAddEmployeeModalOpen(false)} title="Create Employee Account">
        <AddEmployeeForm onClose={() => setIsAddEmployeeModalOpen(false)} onSubmit={handleAddEmployee} />
      </Modal>

      {/* MODAL: EDIT EMPLOYEE */}
      <Modal isOpen={isEditEmployeeModalOpen} onClose={() => setIsEditEmployeeModalOpen(false)} title="Edit Employee Permissions">
        <AddEmployeeForm 
          onClose={() => setIsEditEmployeeModalOpen(false)} 
          onSubmit={handleEditEmployee} 
          initialData={selectedEmployee} 
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