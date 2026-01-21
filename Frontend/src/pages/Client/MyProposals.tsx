import React, { useState, useEffect } from 'react';
import './MyProposals.css';
import { useNavigate } from 'react-router-dom';
import { GetAllProposals } from '../../services/Client/ProposalDocumnet'; // Adjust path if needed
import { toast } from 'react-toastify';

// 1. Modified Interface to match your backend DTO
interface Proposal {
  id: number;
  projectTitle: string;
  createdAt: string; 
  ndaRequired: boolean;
  status: 'Done' | 'In Progress';
}

const MyProposals: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize with empty array
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Done' | 'In Progress'>('All');
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch data from API on component mount
// Inside MyProposals.tsx -> useEffect

// Inside MyProposals.tsx -> useEffect

useEffect(() => {
    const fetchProposals = async () => {
        try {
            setIsLoading(true);
            const storedAuthUser = localStorage.getItem('auth_user'); 
            
            if (storedAuthUser) {
                const userData = JSON.parse(storedAuthUser);
                const id = userData.userId; 

                if (id) {
                    const responseData = await GetAllProposals(id);

                    // LOGIC TO HANDLE OBJECT vs ARRAY
                    if (Array.isArray(responseData)) {
                        // Case A: It's already an array [{}, {}]
                        setProposals(responseData);
                    } else if (responseData && typeof responseData === 'object' && responseData.id) {
                        // Case B: It's a single object {id: 1, ...}
                        // Wrap it in brackets [] to make it a list of one
                        setProposals([responseData]);
                    } else {
                        // Case C: It's null or empty
                        setProposals([]);
                    }
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
    setEditingProposal(proposal);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingProposal) {
      setProposals((prev) =>
        prev.map((p) => (p.id === editingProposal.id ? editingProposal : p))
      );
      setShowModal(false);
      setEditingProposal(null);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      setProposals((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // 3. Updated Search Logic for projectTitle
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
          <button 
            className="btn btn-new fw-bold"
            onClick={() => navigate('/proposals/new')}
          >
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
          <i
            className="bi bi-funnel-fill filter-icon"
            onClick={() => setShowFilter(!showFilter)}
            title="Filter proposals"
          ></i>

          {showFilter && (
            <div className="filter-panel shadow-sm">
              <h6 className="mb-2">Filter by Status</h6>
              <div className="d-flex flex-column gap-2">
                {['All', 'In Progress', 'Done'].map((status) => (
                  <label key={status} className="filter-option">
                    <input
                      type="radio"
                      name="statusFilter"
                      value={status}
                      checked={filterStatus === status}
                      onChange={() => setFilterStatus(status as 'All' | 'Done' | 'In Progress')}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table - Modified Columns */}
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
                        <span className={`status-pill status-${p.status.toLowerCase().replace(' ', '-')}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <i className="bi bi-pencil text-new cursor-pointer me-3" onClick={() => handleEdit(p)}></i>
                        <i className="bi bi-trash text-danger cursor-pointer" onClick={() => handleDelete(p.id)}></i>
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
              <p className="small text-muted mb-0">
                Get automated recommendations to improve your proposals.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card bg-dark-blue-light">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-bar-chart-line fs-3 text-dark-blue me-2"></i>
                <h6 className="fw-bold text-dark-blue mb-0">Approval Rate</h6>
              </div>
              <p className="small text-muted mb-0">
                Track your proposal success rate.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stat-card bg-orange-light">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-headset fs-3 text-orange me-2"></i>
                <h6 className="fw-bold text-orange mb-0">Need Support?</h6>
              </div>
              <p className="small text-muted mb-0">
                Contact our team for guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && editingProposal && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5 className="mb-3">Edit Proposal</h5>
            <input
              type="text"
              className="form-control mb-2"
              value={editingProposal.projectTitle}
              onChange={(e) =>
                setEditingProposal({ ...editingProposal, projectTitle: e.target.value })
              }
              placeholder="Project Title"
            />
            <div className="d-flex justify-content-end mt-3">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProposals;