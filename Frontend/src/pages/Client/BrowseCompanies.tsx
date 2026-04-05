import React, { useState, useEffect } from 'react';
import { getAllCompanies } from '../../services/Company/companyService';
import CompanyCard from '../../components/Client/CompanyCard';
import ProposalSubmissionModal from '../../components/Client/ProposalSubmissionModal';
import './BrowseCompanies.css';

interface Company {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  userId: number;
  verified?: boolean;
}


const BrowseCompanies: React.FC = () => {
  const [companies, setCompanies]       = useState<Company[]>([]);
  const [loading, setLoading]           = useState<boolean>(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false); 
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy]             = useState<'name' | 'verified'>('name');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getAllCompanies();
      setCompanies(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadData();
  }, []);

 const filteredCompanies = companies
    .filter(c => {
      const matchesSearch  = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
      return matchesSearch ;
    })
    .sort((a, b) => {
      if (sortBy === 'verified') return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      return a.name.localeCompare(b.name);
    });



  return (
   <div className="browse-container container mt-4 mb-5 page-fade-in">

 
       
        

     <div className="toolbar mb-4">
        {/* Search */}
        <div className="toolbar-search">
          <i className="bi bi-search toolbar-search-icon" />
          <input
            type="text"
            className="toolbar-input"
            placeholder="Search company name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
       {searchTerm && (
            <button className="toolbar-clear" onClick={() => setSearchTerm('')}>
              <i className="bi bi-x" />
            </button>
          )}
        </div>

       

       <select
          className="toolbar-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'verified')}
        >
          <option value="name">Sort: Name</option>
          <option value="verified">Sort: Verified First</option>
        </select>

        <div className="toolbar-view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <i className="bi bi-grid-3x3-gap" />
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <i className="bi bi-list-ul" />
          </button>
        </div>
      </div>

      <p className="results-count mb-3">
        Showing <strong>{filteredCompanies.length}</strong> of {companies.length} partners
      </p>

    {filteredCompanies.length === 0 ? (
       <div className="empty-state">
          <i className="bi bi-building-slash empty-state-icon" />
          <h5>No partners found</h5>
          <p>Try adjusting your search or sector filter.</p>
          <button className="btn-reset" onClick={() => { setSearchTerm(''); setFilterSector('all'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={`company-grid ${viewMode === 'list' ? 'company-grid--list' : 'row g-4'}`}>
          {filteredCompanies.map((c) => (
            <div
              className={viewMode === 'grid' ? 'col-lg-3 col-md-4 col-sm-6' : 'list-item'}
              key={c.id}
            >
              <CompanyCard
                company={c}
                onOpen={() => {
                  setSelectedCompany(c);
                  setIsModalOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedCompany && (
        <ProposalSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          company={selectedCompany}
        />
      )}
    </div>
  );
};

export default BrowseCompanies;