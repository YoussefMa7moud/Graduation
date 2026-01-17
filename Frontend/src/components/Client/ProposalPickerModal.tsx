// components/Client/ProposalPickerModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Company/CompanyHome/Modal';

const ProposalPickerModal = ({ isOpen, onClose, company }: any) => {
  const navigate = useNavigate();
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  const proposals = [
    { id: 1, title: "Commercial Lease Review" },
    { id: 2, title: "Software License Agreement" },
    { id: 3, title: "Employment Contract Template" }
  ];

  const handleSend = () => {
    if (!selectedProposal) return;
    onClose();
    navigate('/client/proposals');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Proposal">
      <p className="small text-muted mb-3">
        Send proposal to <strong>{company?.name}</strong>
      </p>

      {proposals.map(p => (
        <div
          key={p.id}
          className={`border rounded-3 p-3 mb-2 cursor-pointer 
            ${selectedProposal === p.id ? 'border-success bg-success-subtle' : ''}`}
          onClick={() => setSelectedProposal(p.id)}
        >
          {p.title}
        </div>
      ))}

      <button
        className="btn btn-mint w-100 mt-3"
        disabled={!selectedProposal}
        onClick={handleSend}
      >
        Send Proposal
      </button>
    </Modal>
  );
};

export default ProposalPickerModal;
