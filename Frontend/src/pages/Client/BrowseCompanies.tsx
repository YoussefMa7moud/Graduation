import React, { useState, useEffect } from 'react';
import { getAllCompanies } from '../../services/Company/companyService';
import CompanyCard from '../../components/Client/CompanyCard';
import ProposalPickerModal from '../../components/Client/ProposalPickerModal';
import ClientHeader from '../../components/Client/ClientHeader';
import LoadingAnimation from '../../components/LoadingAnimation';

const BrowseCompanies: React.FC = () => {
  // Always initialize with an empty array
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getAllCompanies();
      // Ensure data is an array before setting state
      setCompanies(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingAnimation />;

  return (
    <>
      <ClientHeader />
      <div className="container mt-4 mb-5">
        <div className="row g-4">
          {/* Defensive check: only map if companies is an array and has items */}
          {companies && companies.length > 0 ? (
            companies.map((c) => (
              <div className="col-md-4 d-flex" key={c?.id || Math.random()}>
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
              <p className="text-muted">No companies found in the database.</p>
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