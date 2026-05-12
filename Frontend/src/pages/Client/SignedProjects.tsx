import React, { useState, useEffect } from "react";
import './SignedProjects.css';
import api from '../../services/api';
import { verifyContract, type ContractVerifyResponse } from '../../services/Contract/ContractRepo';

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

  // ── Hash verification state ───────────────────────────────────────────────
  const [verifyResult, setVerifyResult] = useState<ContractVerifyResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

  // ── When selected contract changes, run verification ─────────────────────
  useEffect(() => {
    if (!selected) {
      setVerifyResult(null);
      return;
    }

    const runVerify = async () => {
      setIsVerifying(true);
      setVerifyResult(null);
      try {
        const result = await verifyContract(selected.id);
        setVerifyResult(result);
      } catch {
        // If verify fails (e.g. legacy record with no hash), show neutral state
        setVerifyResult({
          verified: false,
          status: 'NO_HASH',
          storedHash: null,
          message: 'Could not verify contract integrity',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    runVerify();
  }, [selected?.id]);

  // ── Helper: render the Validation row value ───────────────────────────────
  const renderValidation = () => {
    if (isVerifying) {
      return (
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
          Verifying...
        </span>
      );
    }

    if (!verifyResult) return <span style={{ color: '#64748b' }}>—</span>;

    switch (verifyResult.status) {
      case 'VERIFIED':
        return <span className="verified">✓ VERIFIED</span>;
      case 'TAMPERED':
        return <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠ TAMPERED</span>;
      case 'NO_HASH':
        return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hash (legacy)</span>;
      default:
        return <span style={{ color: '#64748b' }}>—</span>;
    }
  };

  const handleDownload = async (project: SignedProjectDTO) => {
    try {
      const response = await api.get(`/api/contracts/records/${project.id}/pdf`, {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' }
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', project.fileName || `contract-${project.id}.pdf`);
      document.body.appendChild(link);
      link.click();
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
              {/* ── Real verification result ── */}
              <div><span>Validation</span><span>{renderValidation()}</span></div>
              {/* ── Show truncated fingerprint if verified ── */}
              {verifyResult?.storedHash && (
                <div>
                  <span>Fingerprint</span>
                  <span
                    style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all' }}
                    title={verifyResult.storedHash}
                  >
                    {verifyResult.storedHash.substring(0, 16)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignedProjects;
