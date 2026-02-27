import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { verifySignature } from '../services/Contract/verify';
import type { SignatureVerificationDTO } from '../services/Contract/verify';
import { CheckCircle, AlertTriangle, FileText, Calendar, User, Briefcase, FileSignature, ShieldCheck } from 'lucide-react';
import './VerifySignature.css';

const VerifySignature: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [data, setData] = useState<SignatureVerificationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Extract ?type= parameter from URL
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type');

    const fetchVerification = async () => {
      try {
        const result = await verifySignature(Number(id), type);
        setData(result);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerification();
  }, [id, location.search]);

  if (loading) {
    return (
      <div className="verify-loading">
        <div className="spinner"></div>
        <p>Verifying Blockchain & Digital Signatures...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="verify-error">
        <AlertTriangle size={64} className="error-icon" />
        <h2>Verification Failed</h2>
        <p>We could not find a valid digital signature record for this document.</p>
        <Link to="/" className="home-link">Return to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        
        <div className="verify-header">
          <ShieldCheck size={48} className="success-icon" />
          <h1>Document Authenticated</h1>
          <p>This document has been verified as a legally binding electronic contract.</p>
        </div>

        <div className="verify-card">
          <div className="card-top">
            <div className="doc-info">
              <h3><FileText size={18} /> {data.contractTitle}</h3>
              <span className="doc-id">Submission ID: #{data.submissionId}</span>
            </div>
            <div className="status-badge authentic">
              <CheckCircle size={16} /> Authentic
            </div>
          </div>

          <div className="parties-grid">
            {/* Party A / Company */}
            <div className="party-card">
              <div className="party-role">Software Company (Party A)</div>
              <div className="party-details">
                <div className="d-row">
                  <Briefcase size={16} /> <strong>{data.companyName}</strong>
                </div>
                <div className="d-row">
                  <User size={16} /> {data.companySignatoryName || 'Authorized Signatory'}
                </div>
                <div className="d-row">
                  <Calendar size={16} /> {data.companySignedAt ? new Date(data.companySignedAt).toLocaleString() : 'Pending/Not Signed'}
                </div>
              </div>
              
              <div className="signature-display">
                <div className="sig-label"><FileSignature size={14} /> Digital Signature</div>
                {data.companySignatureBase64 ? (
                  <img src={data.companySignatureBase64.startsWith('data:image') ? data.companySignatureBase64 : `data:image/png;base64,${data.companySignatureBase64}`} alt="Company Signature" className="sig-img" />
                ) : (
                  <div className="sig-placeholder">Not Signed</div>
                )}
              </div>
            </div>

            {/* Party B / Client */}
            <div className="party-card">
              <div className="party-role">Client (Party B)</div>
              <div className="party-details">
                <div className="d-row">
                  <Briefcase size={16} /> <strong>{data.clientName}</strong>
                </div>
                <div className="d-row">
                  <User size={16} /> {data.clientSignatoryName || 'Authorized Signatory'}
                </div>
                <div className="d-row">
                  <Calendar size={16} /> {data.clientSignedAt ? new Date(data.clientSignedAt).toLocaleString() : 'Pending/Not Signed'}
                </div>
              </div>
              
              <div className="signature-display">
                <div className="sig-label"><FileSignature size={14} /> Digital Signature</div>
                {data.clientSignatureBase64 ? (
                  <img src={data.clientSignatureBase64.startsWith('data:image') ? data.clientSignatureBase64 : `data:image/png;base64,${data.clientSignatureBase64}`} alt="Client Signature" className="sig-img" />
                ) : (
                  <div className="sig-placeholder">Not Signed</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="verify-footer">
            <p className="legal-notice">
              Electronic signatures are compliant with Egyptian ITIDA regulations. 
              This digital record is maintained securely on our servers.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifySignature;
