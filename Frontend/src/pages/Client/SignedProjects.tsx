import React, { useState, useEffect } from "react";
import './SignedProjects.css';
import api from '../../services/api';

interface SignedProjectDTO {
  id: number;
  projectName: string;
  projectType: string;
  companyName: string;
  signedAt: string;
  fileName: string;
  fileSize: number;
  contractType: string;
}

const SignedProjects: React.FC = () => {
  const [projects, setProjects] = useState<SignedProjectDTO[]>([]);
  const [selected, setSelected] = useState<SignedProjectDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignedProjects = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/contracts/client/signed');
        setProjects(response.data);
        if (response.data.length > 0) {
            setSelected(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching signed projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedProjects();
  }, []);

  const handleDownload = async (project: SignedProjectDTO) => {
      try {
          const response = await api.get(`/api/contracts/records/${project.id}/pdf`, {
              responseType: 'blob', // Important: This tells axios to treat the response as binary data
              headers: {
                  'Accept': 'application/pdf'
              }
          });
          
          // Create a blob from the response data
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', project.fileName || `contract-${project.id}.pdf`);
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          link.remove();
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error("Download failed", error);
          alert("Failed to download the contract. Please try again.");
      }
  };

  const formatSize = (bytes: number) => {
      if (bytes === 0) return 'Unknown';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="signed-container container page-fade-in">
        {/* Header */}
        <div className="signed-header">
          <div>
            <h4 className="fw-bold">Signed Projects Repository</h4>
            <p className="text-muted">
              Secure audit trail and historical record of all completed engagements for legal and operational reference.
            </p>
          </div>

   
        </div>

        <div className="signed-layout">
          {/* LEFT TABLE */}
          <div className="signed-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PROJECT NAME</th>
                  <th>SIGNED DATE</th>
                  <th>COMPANY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                    <tr><td colSpan={5} className="text-center p-4">Loading records...</td></tr>
                ) : projects.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-4">No signed contracts found.</td></tr>
                ) : (
                    projects.map(p => (
                    <tr key={p.id} className={selected?.id === p.id ? 'active' : ''}>
                        <td>#{p.id}</td>
                        <td>
                        <strong>{p.projectName}</strong>
                        <div className="sub">{p.projectType} · {p.contractType}</div>
                        </td>
                        <td>{new Date(p.signedAt).toLocaleDateString()}</td>
                        <td>{p.companyName}</td>
                        <td>
                        <button className="eye-icon-btn" onClick={() => setSelected(p)}>
                            <i className={`bi ${selected?.id === p.id ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* RIGHT PANEL */}
          {selected && (
            <div className="signed-details">
                <div className="details-header">
                <span className="badge signed">SIGNED</span>
                <h6>{selected.projectName}</h6>
                </div>

                <div className="details-files">
                    <div className="file">
                        <div>
                            <strong>1. Signed Contract</strong>
                            <small>{selected.fileName}</small>
                        </div>
                        <span>{formatSize(selected.fileSize)}</span>
                    </div>
                </div>

                <button className="download" onClick={() => handleDownload(selected)}>
                    Download Contract PDF
                </button>

                <div className="audit">
                <h6>AUDIT METADATA</h6>
                <div><span>Signed With</span><span>{selected.companyName}</span></div>
                <div><span>Date</span><span>{new Date(selected.signedAt).toLocaleString()}</span></div>
                <div><span>Contract Type</span><span>{selected.contractType}</span></div>
                <div><span>Validation</span><span className="verified">VERIFIED</span></div>
                </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SignedProjects;

