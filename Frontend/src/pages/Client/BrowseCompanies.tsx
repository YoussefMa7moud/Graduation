import React, { useState } from 'react';
import CompanyCard from '../../components/Client/CompanyCard';
import ProposalPickerModal from '../../components/Client/ProposalPickerModal';
import './BrowseCompanies.css';
import ClientHeader from '../../components/Client/ClientHeader';

interface Company {
  id: number;
  name: string;
  sector: string;
  verified: boolean;
  description: string;
  activeProjects: string[]; // active projects array
}

const companies: Company[] = [
  {
    id: 1,
    name: "Cairo Plaza Estates",
    sector: "Real Estate & Development",
    verified: true,
    description: "Leading real estate developer focusing on commercial and residential properties.",
    activeProjects: ["Downtown Towers", "Greenfield Villas"]
  },
  {
    id: 2,
    name: "Nile Bank Corp",
    sector: "Financial Services",
    verified: false,
    description: "Premier bank offering corporate and personal financial solutions.",
    activeProjects: ["Corporate Loan Program", "Mobile Banking App"]
  },
  {
    id: 3,
    name: "Alexandria TechHub",
    sector: "Technology & Software",
    verified: true,
    description: "Innovative tech hub building software for modern enterprise needs.",
    activeProjects: ["AI Analytics Platform", "Blockchain Payments"]
  },
  {
    id: 4,
    name: "Delta Energy Solutions",
    sector: "Energy & Utilities",
    verified: true,
    description: "Renewable energy projects and sustainable power solutions.",
    activeProjects: ["Solar Farm Alexandria", "Wind Turbine Project"]
  },
  {
    id: 5,
    name: "MedCare Pharmaceuticals",
    sector: "Healthcare & Pharma",
    verified: false,
    description: "Research-driven pharmaceutical company producing high-quality medications.",
    activeProjects: ["COVID-19 Vaccine Distribution", "New Pain Relief Formula"]
  },
];

const BrowseCompanies: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');

  const handleSubmitClick = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  // Filter companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified =
      filterVerified === 'all' ? true :
      filterVerified === 'verified' ? c.verified :
      !c.verified;
    const matchesSector = filterSector === 'all' ? true : c.sector === filterSector;
    return matchesSearch && matchesVerified && matchesSector;
  });

  const sectors = Array.from(new Set(companies.map(c => c.sector)));

  return (
    <>
      <ClientHeader />
      <div className="browse-container container page-fade-in">
        <h4 className="fw-bold mb-4 no-border">Browse & Search Companies</h4>

        {/* Search & Filters */}
        <div className="row mb-4 g-2 align-items-center filter-bar p-3 rounded">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control filter-input"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select filter-input"
              value={filterVerified}
              onChange={e => setFilterVerified(e.target.value)}
            >
              <option value="all">All Companies</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select filter-input"
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

        {/* Company Cards */}
        <div className="row g-4">
          {filteredCompanies.map(c => (
            <div className="col-md-4 d-flex" key={c.id}>
              <CompanyCard company={c} onSubmit={handleSubmitClick} />
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <p className="text-muted">No companies match your search/filter criteria.</p>
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
