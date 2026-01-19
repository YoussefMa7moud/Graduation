import React, { useState, useEffect } from 'react';
import { getAllCompanies } from '../../services/Company/companyService';
import CompanyCard from '../../components/Client/CompanyCard';
import ProposalPickerModal from '../../components/Client/ProposalPickerModal';
import './BrowseCompanies.css';

interface Company {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  userId: number;
  sector?: string; 
  verified?: boolean;
}

const BrowseCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Restored Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getAllCompanies();
      setCompanies(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadData();
  }, []);

  // Restored Filtering Logic
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerified = filterVerified === 'all' 
      ? true 
      : filterVerified === 'verified' ? c.verified : !c.verified;
      
    const matchesSector = filterSector === 'all' 
      ? true 
      : c.sector === filterSector;
    
    return matchesSearch && matchesVerified && matchesSector;
  });

  const sectors = Array.from(new Set(companies.map(c => c.sector).filter(Boolean)));

  if (loading) return <div className="text-center mt-5 p-5"><h4>Loading Companies...</h4></div>;

  return (
    <>
      <div className="browse-container container mt-4 mb-5 page-fade-in">
        <h4 className="fw-bold mb-4" style={{ color: '#0f172a' }}>Browse & Search Companies</h4>

        {/* Restored Search & Filters Bar */}
        <div className="row mb-4 g-2 align-items-center filter-bar p-3 rounded shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterVerified}
              onChange={e => setFilterVerified(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterSector}
              onChange={e => setFilterSector(e.target.value)}
            >
              <option value="all">All Industries</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Updated Grid for modern Cards */}
        <div className="row g-4">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((c) => (
              <div className="col-md-4 d-flex" key={c.id}>
                <CompanyCard 
                  company={c} 
                  onSubmit={() => {
                    setSelectedCompany(c);
                    setIsModalOpen(true);
                  }} 
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center mt-5">
              <p className="text-muted">No companies match your search criteria.</p>
            </div>
          )}
        </div>

        <ProposalPickerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          company={selectedCompany} 
        />
      </div>
    </>
  );
};

export default BrowseCompanies;