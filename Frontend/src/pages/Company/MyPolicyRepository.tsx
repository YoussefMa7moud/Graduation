import React, { useEffect, useState } from 'react';
import './MyPolicyRepository.css';
// Import the new component
import StatCard from '../../components/Company/MyPolicyRepository/StatCard';
import api from '../../services/api';
import { LegalFramework } from '../../components/Company/PolicyConverter/Data/types';

interface Policy {
  id: number;
  policyName: string;
  policyText: string;
  legalFramework: string;
  oclCode: string;
  createdAt: string;
}

const MyPolicyRepository: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('All');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await api.get<Policy[]>('/api/policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await api.delete(`/api/policies/${id}`);
        setPolicies(policies.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting policy:', error);
        alert('Failed to delete policy');
      }
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = 
      policy.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.policyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.oclCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFramework = selectedFramework === 'All' || policy.legalFramework === selectedFramework;

    return matchesSearch && matchesFramework;
  });

  const totalRules = policies.length;

  return (
    <div className="w-100 p-0 m-0">
       <div className="container page-fade-in">
      {/* Search Header */}
      <div className="bg-white p-3 rounded-3 shadow-sm border mb-4 d-flex align-items-center justify-content-between">
        <div className="position-relative flex-grow-1 me-4">
          <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input 
            type="text" 
            className="form-control border-0 bg-light ps-5 py-2 w-100" 
            placeholder="Search policies or rules..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small fw-bold">Associated with:</span>
          <select 
            className="form-select border-0 bg-light py-2 px-3" 
            style={{ width: '220px' }}
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
          >
            <option value="All">All Frameworks</option>
            {Object.values(LegalFramework).map((framework) => (
              <option key={framework} value={framework}>{framework}</option>
            ))}
          </select>
        </div>
      </div>


       {/* NEW: Stat Cards Section */}
      <div className="row g-4">
        <div className="col-md-6">
          <StatCard title="Total Rules" count={totalRules} isActive={false} />
        </div>
        {/* Removed Active Rules Card as requested */}
      </div>


      <br />

      {/* THE TABLE */}
      <div className="bg-white rounded-3 shadow-sm border overflow-hidden w-100 mb-4">
        <table className="table table-hover align-middle mb-0 w-100">
          <thead className="bg-light">
            <tr className="text-muted small text-uppercase">
              <th className="ps-4 py-3 border-0">Policy Name</th>
              <th className="border-0">Policy Text</th>
              <th className="border-0">Associated with</th>
              <th className="border-0">Constraint</th>
              <th className="text-end pe-4 border-0">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Loading policies...</td>
              </tr>
            ) : filteredPolicies.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No policies found matching your search.</td>
              </tr>
            ) : (
              filteredPolicies.map((p) => (
                <tr key={p.id}>
                  <td className="ps-4 py-3">
                    <div className="fw-bold text-dark">{p.policyName}</div>
                  </td>
                  <td className="text-muted small" style={{ maxWidth: '300px' }}>
                    <div className="text-truncate" title={p.policyText}>{p.policyText}</div>
                  </td>
                  <td className="text-muted small">{p.legalFramework}</td>
                  <td className="text-muted small">
                    <code className="text-primary">{p.oclCode}</code>
                  </td>
                  <td className="text-end pe-4">
                    <button 
                      className="btn btn-sm text-danger border-0"
                      onClick={() => handleDelete(p.id)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      
      </div>

     </div>

    </div>
  );
};

export default MyPolicyRepository;