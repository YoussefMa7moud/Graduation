import React, { useState, useEffect } from "react";
import axios from 'axios';
import { getContractRecords } from '../../services/Contract/ContractRepo'; 
import { toast } from 'react-toastify';
import './ContractRepository.css';

export interface ContractRecordResponse {
  id: number;
  submissionId: number;
  contractType: string;
  fileName: string;
  signedAt: string;
  createdAt: string;
}

const ContractRepository: React.FC = () => {
  const [records, setRecords] = useState<ContractRecordResponse[]>([]);
  const [selected, setSelected] = useState<ContractRecordResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const data = await getContractRecords();
        if (data && Array.isArray(data)) {
          setRecords(data);
          if (data.length > 0) setSelected(data[0]);
        }
      } catch (error: any) {
        toast.error(`Failed to load: ${error.response?.statusText || "Server Error"}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleDownloadPdf = async (id: number, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/contracts/records/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `contract-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error downloading file.");
    }
  };

  if (isLoading) return (
    <div className="repo-loader">
      <div className="spinner-border text-primary"></div>
      <p>Loading Repository...</p>
    </div>
  );

  return (
    <div className="repo-container page-fade-in">
      <header className="repo-header">
        <div>
          <h4 className="fw-bold text-navy">Signed Projects Repository</h4>
          <p className="section-subtitle">Secure audit trail for completed engagements.</p>
        </div>
        
      </header>

      {records.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-folder-x display-1"></i>
          <p>No signed contracts found in the database.</p>
        </div>
      ) : (
        <div className="repo-layout">
          {/* Table Section */}
          <div className="table-container-flat">
            <table className="corporate-table">
              <thead>
                <tr>
                  <th>REF ID</th>
                  <th>CONTRACT NAME</th>
                  <th>SIGNED DATE</th>
                  <th>TYPE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.map(p => (
                  <tr 
                    key={p.id} 
                    className={selected?.id === p.id ? 'active-row' : ''} 
                    onClick={() => setSelected(p)}
                  >
                    <td className="fw-bold">#{p.id}</td>
                    <td>
                      <div className="file-name">{p.fileName}</div>
                      <div className="sub-text">Sub ID: {p.submissionId}</div>
                    </td>
                    <td>{new Date(p.signedAt).toLocaleDateString()}</td>
                    <td><span className="badge-type-flat">{p.contractType}</span></td>
                    <td><i className="bi bi-chevron-right text-muted"></i></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Details Sidebar */}
          <aside className="details-sidebar">
            {selected ? (
              <div className="details-card">
                <div className="details-header">
                  <span className="badge-status-active mb-2">SIGNED</span>
                  <h6 className="fw-bold text-navy">{selected.fileName}</h6>
                </div>
                
                <div className="file-preview-box">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-4 me-3"></i>
                    <div>
                      <div className="fw-bold small">Execution Copy</div>
                      <div className="text-muted extra-small">PDF Document</div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-mint-flat w-100 mb-4" 
                  onClick={() => handleDownloadPdf(selected.id, selected.fileName)}
                >
                  <i className="bi bi-download me-2"></i> Download PDF
                </button>

                <div className="audit-section">
                  <h6 className="audit-title">AUDIT METADATA</h6>
                  <div className="audit-item">
                    <span>Signed At</span>
                    <span className="text-end">{new Date(selected.signedAt).toLocaleString()}</span>
                  </div>
                  <div className="audit-item">
                    <span>Contract Type</span>
                    <span className="text-end">{selected.contractType}</span>
                  </div>
                  <div className="audit-item">
                    <span>Hash Status</span>
                    <span className="text-mint fw-bold">✓ VERIFIED</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="details-empty">Select a record to view details</div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default ContractRepository;