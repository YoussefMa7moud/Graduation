import React, { useState, useEffect } from 'react';
import './MyProposals.css';
import { useNavigate } from 'react-router-dom';
import { GetAllProposals, DeleteProposal, UpdateProposal } from '../../services/Client/ProposalDocumnet'; 
import ViewProposalModal from '../../components/ViewProposalModal';

// 1. Full Interface matching CreateProposal and Backend DTO
interface Proposal {
  id: number;
  projectTitle: string;
  projectType: string;
  problemSolved: string;
  description: string;
  mainFeatures: string;
  userRoles: string;
  scalability: string;
  durationDays: number;
  budgetUsd: number;
  ndaRequired: boolean;
  codeOwnership: string;
  maintenancePeriod: string;
  status: string;
  createdAt: string;
  hasContract?: boolean; // Added check from backend
}

const MyProposals: React.FC = () => {
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Done' | 'In Progress' | 'Submitted'>('All');
  const [showFilter, setShowFilter] = useState(false);
  
  // Modal State
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Proposals on Load
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setIsLoading(true);
        const storedAuthUser = localStorage.getItem('auth_user'); 
        const token = localStorage.getItem('auth_token');
        if (storedAuthUser && token) {
          const userData = JSON.parse(storedAuthUser);
          const id = userData.userId; 
          if (id) {
            const [responseData, subsResponse] = await Promise.all([
              GetAllProposals(id),
              fetch('/api/submissions/my-submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
              }).then(res => res.ok ? res.json() : [])
            ]);
            
            if (Array.isArray(responseData)) {
              setProposals(responseData);
            } else if (responseData && typeof responseData === 'object' && responseData.id) {
              setProposals([responseData]);
            } else {
              setProposals([]);
            }
            
            setSubmissions(Array.isArray(subsResponse) ? subsResponse : []);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setProposals([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal({ ...proposal }); 
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editingProposal) {
      try {
        await UpdateProposal(editingProposal.id, editingProposal);
        setProposals((prev) =>
          prev.map((p) => (p.id === editingProposal.id ? editingProposal : p))
        );
        // Using alert since toast was removed/unused, or re-add toast import
        alert("Proposal updated successfully!");
        setShowModal(false);
        setEditingProposal(null);
      } catch (error) {
        console.error(error);
        alert("Failed to update proposal.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await DeleteProposal(id);
        setProposals((prev) => prev.filter((p) => p.id !== id));
        alert("Proposal deleted successfully!");
      } catch (error) {
        alert("You cannot delete this proposal it is linked to an ongoing project or proposal.");
      }
    }
  };

  const handleView = (proposal: Proposal) => {
    setSelectedProposal(proposal); 
  };

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = p.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="container page-fade-in mt-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold">My Project Proposals</h4>
          <button className="btn btn-new fw-bold" onClick={() => navigate('/proposals/new')}>
            + Start New Proposal
          </button>
        </div>

        {/* Search + Filter */}
        <div className="d-flex gap-3 mb-4 align-items-center position-relative">
          <input
            type="text"
            placeholder="Search by project title..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="bi bi-funnel-fill filter-icon" onClick={() => setShowFilter(!showFilter)}></i>

          {showFilter && (
            <div className="filter-panel shadow-sm">
              <h6 className="mb-2">Filter by Status</h6>
              <div className="d-flex flex-column gap-2">
                {['All', 'In Progress', 'Done', 'Submitted'].map((status) => (
                  <label key={status} className="filter-option">
                    <input
                      type="radio"
                      name="statusFilter"
                      checked={filterStatus === status}
                      onChange={() => setFilterStatus(status as any)}
                    /> {status}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flat-table-container bg-white rounded-4 shadow-sm border overflow-hidden w-100 mb-5">
          {isLoading ? (
            <div className="p-5 text-center text-muted">Loading proposals...</div>
          ) : (
            <table className="table corporate-table align-middle mb-0 w-100">
              <thead>
                <tr className="text-muted small text-uppercase bg-light">
                  <th className="ps-4 py-3 border-0">Project Title</th>
                  <th className="border-0">Created At</th>
                  <th className="border-0">NDA Required</th>
                  <th className="border-0">Status</th>
                  <th className="text-end pe-4 border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.length > 0 ? (
                  filteredProposals.map((p) => (
                    <tr key={p.id} className="proposal-row border-bottom">
                      <td className="ps-4 py-3 fw-medium">{p.projectTitle}</td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${p.ndaRequired ? 'bg-info-subtle text-info' : 'bg-light text-muted'}`}>
                          {p.ndaRequired ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${(p.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                          {p.status || "Submitted"}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        {['Pending', 'Rejected with Note'].includes(p.status || 'Pending') && !p.hasContract ? (
                            <>
                                <i className="bi bi-pencil text-new cursor-pointer me-3" onClick={() => handleEdit(p)} title="Edit Proposal"></i>
                                {p.status !== 'Rejected with Note' && (
                                     <i className="bi bi-trash text-danger cursor-pointer" onClick={() => handleDelete(p.id)} title="Delete Proposal"></i>
                                )}
                            </>
                        ) : (
                                <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    onClick={() => handleView(p)}
                                    title="View Proposal Details"
                                >
                                    <i className="bi bi-eye"></i> View
                                </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">No proposals found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Stat Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card stat-card bg-mint-light">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-robot fs-3 text-mint me-2"></i>
                <h6 className="fw-bold text-mint mb-0">AI Suggestions</h6>
              </div>
              <p className="small text-muted mb-0">Get automated recommendations to improve your proposals.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card bg-dark-blue-light">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-bar-chart-line fs-3 text-dark-blue me-2"></i>
                <h6 className="fw-bold text-dark-blue mb-0">Approval Rate</h6>
              </div>
              <p className="small text-muted mb-0">Track your proposal success rate.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card bg-orange-light">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-headset fs-3 text-orange me-2"></i>
                <h6 className="fw-bold text-orange mb-0">Need Support?</h6>
              </div>
              <p className="small text-muted mb-0">Contact our team for guidance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FULL EDIT MODAL - ALL FIELDS */}
      {showModal && editingProposal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal wide-modal">
            <div className="edit-modal-header">
               <h5 className="fw-bold mb-0">
                  <i className="bi bi-pencil-square me-2" style={{color: '#17253b'}}></i>
                  Edit Proposal
               </h5>
               <button className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
            </div>
            
            <div className="modal-scroll-area">
                {editingProposal.status === 'Rejected with Note' && (
                  <div className="rejection-note-card shadow-sm">
                    <h6><i className="bi bi-exclamation-triangle-fill"></i> Feedback from Company</h6>
                    <p className="small mb-0 text-dark">
                      {submissions.find(s => s.proposalId === editingProposal.id)?.rejectionNote || 'No specific note provided.'}
                    </p>
                  </div>
                )}
                <div className="row g-4">
                    <div className="col-md-8">
                        <label className="small fw-bold mb-1">Project Title <span className="text-danger">*</span></label>
                        <input className="form-control bg-light border-0" value={editingProposal.projectTitle} onChange={(e) => setEditingProposal({...editingProposal, projectTitle: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                        <label className="small fw-bold mb-1">Project Type <span className="text-danger">*</span></label>
                        <select className="form-select bg-light border-0" value={editingProposal.projectType} onChange={(e) => setEditingProposal({...editingProposal, projectType: e.target.value})}>
                            <option value="Web App">Web App</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="AI System">AI System</option>
                            <option value="API">API/Backend</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="small fw-bold mb-1">Problem Solved <span className="text-danger">*</span></label>
                        <textarea className="form-control bg-light border-0" rows={2} value={editingProposal.problemSolved} onChange={(e) => setEditingProposal({...editingProposal, problemSolved: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <label className="small fw-bold mb-1">Detailed Description <span className="text-danger">*</span></label>
                        <textarea className="form-control bg-light border-0" rows={4} value={editingProposal.description} onChange={(e) => setEditingProposal({...editingProposal, description: e.target.value})} />
                    </div>
                    <div className="col-12">
                        <label className="small fw-bold mb-1">Main Features <span className="text-danger">*</span></label>
                        <textarea className="form-control bg-light border-0" rows={2} value={editingProposal.mainFeatures} onChange={(e) => setEditingProposal({...editingProposal, mainFeatures: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold mb-1">User Roles (e.g. Admin, Client)</label>
                        <input className="form-control bg-light border-0" value={editingProposal.userRoles} onChange={(e) => setEditingProposal({...editingProposal, userRoles: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold mb-1">Scalability</label>
                        <select className="form-select bg-light border-0" value={editingProposal.scalability} onChange={(e) => setEditingProposal({...editingProposal, scalability: e.target.value})}>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold mb-1">Expected Duration (Days) <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-0"><i className="bi bi-calendar3"></i></span>
                            <input type="number" className="form-control bg-light border-0" value={editingProposal.durationDays} onChange={(e) => setEditingProposal({...editingProposal, durationDays: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold mb-1">Estimated Budget (USD) <span className="text-danger">*</span></label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-0">$</span>
                            <input type="number" className="form-control bg-light border-0" value={editingProposal.budgetUsd} onChange={(e) => setEditingProposal({...editingProposal, budgetUsd: parseFloat(e.target.value) || 0})} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold mb-1">Code Ownership</label>
                        <select className="form-select bg-light border-0" value={editingProposal.codeOwnership} onChange={(e) => setEditingProposal({...editingProposal, codeOwnership: e.target.value})}>
                            <option value="Client">Client</option>
                            <option value="Company">Company</option>
                            <option value="Shared">Shared</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="small fw-bold mb-1">Maintenance Period</label>
                        <select className="form-select bg-light border-0" value={editingProposal.maintenancePeriod} onChange={(e) => setEditingProposal({...editingProposal, maintenancePeriod: e.target.value})}>
                            <option value="None">None</option>
                            <option value="1 Month">1 Month</option>
                            <option value="3 Months">3 Months</option>
                        </select>
                    </div>
                    <div className="col-12 mt-4">
                        <div className="form-check form-switch p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                            <input className="form-check-input m-0" type="checkbox" role="switch" id="ndaSwitch" style={{width: '40px', height: '20px', cursor: 'pointer', outline:'none', boxShadow:'none'}} checked={editingProposal.ndaRequired} onChange={(e) => setEditingProposal({...editingProposal, ndaRequired: e.target.checked})} />
                            <label className="form-check-label fw-bold mb-0 cursor-pointer" htmlFor="ndaSwitch">Require Non-Disclosure Agreement (NDA)</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-end mt-4 pt-3 border-top gap-2">
              <button className="btn btn-secondary-custom shadow-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary-custom shadow-sm" onClick={handleSave}><i className="bi bi-check2-circle me-2"></i>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedProposal && (
        <ViewProposalModal 
            proposal={selectedProposal} 
            onClose={() => setSelectedProposal(null)} 
        />
      )}
    </>
  );
};

export default MyProposals;