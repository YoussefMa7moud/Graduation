import React, { useState, useEffect } from 'react';
import { getAllCompanies } from '../../services/Company/companyService';
import CompanyCard from '../../components/Client/CompanyCard';
import ProposalSubmissionModal from '../../components/Client/ProposalSubmissionModal'; // Renamed for clarity
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
  
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'all' ? true : c.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const sectors = Array.from(new Set(companies.map(c => c.sector).filter(Boolean)));

  if (loading) return <div className="loader-container"><h4>Loading Partners...</h4></div>;

  return (
    <div className="browse-container container mt-4 mb-5 page-fade-in">
      <div className="text-center mb-5">
        <h2 className="fw-bold section-title">Partner Companies</h2>
        <p className="text-muted">Select a company to pitch your project proposal</p>
      </div>

      {/* Search & Filters */}
      <div className="row mb-5 justify-content-center">
        <div className="col-md-8 d-flex gap-2 p-2 rounded-pill shadow-sm bg-white border">
          <input
            type="text"
            className="form-control border-0 bg-transparent ms-3"
            placeholder="Search company name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select border-0 bg-transparent w-auto"
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
          >
            <option value="all">All Industries</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-4">
        {filteredCompanies.map((c) => (
          <div className="col-lg-3 col-md-4 col-sm-6" key={c.id}>
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

      {/* The New Submission Modal */}
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