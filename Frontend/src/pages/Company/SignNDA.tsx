import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Scale, X, PenTool, Eraser, Code, Coins, Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getNdaParties,
  getNdaDraft,
  signClient,
  signCompany,
  type NdaPartiesResponse,
  type NdaDraftResponse,
} from '../../services/Contract/nda';
import { useAuth } from '../../contexts/AuthContext';
import { frontendRoles } from '../../utils/role.utils';
import './SignNDA.css';

const defaultParties = {
  partyA: { name: '', signatory: '', title: '', email: '', details: '', date: '' },
  partyB: { name: '', signatory: '', title: '', email: '', details: '', date: '' },
};

const NDASigning: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const project = (location.state as { project?: { id: number; company?: string } })?.project;
  const submissionId = project?.id;
  const isCompany = user?.role === frontendRoles.SOFTWARE_COMPANY;

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [parties, setParties] = useState<NdaPartiesResponse | null>(null);
  const [draft, setDraft] = useState<NdaDraftResponse | null>(null);

  const [formData, setFormData] = useState({
    partyA: { ...defaultParties.partyA, date: new Date().toLocaleDateString() },
    partyB: { ...defaultParties.partyB, date: new Date().toLocaleDateString() },
    purpose: 'Software Development Outsourcing',
    assets: 'Full Tech Stack (Source code, schemas, and logic)',
    duration: '3 Years',
    disputeResolution: 'Cairo Economic Court',
    penaltyAmount: '50,000 EGP',
    includePenalty: true,
    nonSolicitation: true,
    nonSolicitationPeriod: '12 Months',
    dataPrivacyLaw151: true,
    ipOwnershipProtection: true,
    languagePriority: 'Arabic',
    noLicenseClause: true,
    subcontractorLiability: true,
  });

  useEffect(() => {
        if (!submissionId) {
      toast.error('No project context. Open from Ongoing Projects or Client Requests.');
      navigate(isCompany ? '/ContractRepository' : '/OngoingProjects');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [partiesRes, draftRes] = await Promise.all([
          getNdaParties(submissionId),
          getNdaDraft(submissionId).catch(() => null),
        ]);
        if (cancelled) return;
        setParties(partiesRes);
        setDraft(draftRes || null);
        setFormData((prev) => ({
          ...prev,
          partyA: {
            name: partiesRes.partyA.name,
            signatory: partiesRes.partyA.signatory,
            title: partiesRes.partyA.title,
            email: partiesRes.partyA.email,
            details: partiesRes.partyA.details,
            date: new Date().toLocaleDateString(),
          },
          partyB: {
            name: partiesRes.partyB.name,
            signatory: partiesRes.partyB.signatory,
            title: partiesRes.partyB.title,
            email: partiesRes.partyB.email,
            details: partiesRes.partyB.details,
            date: new Date().toLocaleDateString(),
          },
        }));
      } catch (e: any) {
        if (!cancelled) {
          toast.error(e?.response?.data?.error || e?.message || 'Failed to load NDA data.');
          navigate('/OngoingProjects');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [submissionId, navigate]);

  const generateProvisions = () => {
    const p: string[] = [];
    if (formData.ipOwnershipProtection) p.push('IP Ownership: Nothing in this agreement shall be construed as transferring ownership of developed software or source code; all IP remains with the Discloser.');
    if (formData.includePenalty) p.push(`Liquidated Damages: A breach of confidentiality shall incur a penalty of ${formData.penaltyAmount} as pre-agreed damages.`);
    if (formData.nonSolicitation) p.push(`Non-Solicitation: Parties shall not solicit employees for ${formData.nonSolicitationPeriod} post-termination.`);
    if (formData.dataPrivacyLaw151) p.push('Data Privacy: Receiver must comply with Egypt Law No. 151 of 2020 for all personal data processed.');
    if (formData.noLicenseClause) p.push('No License: Disclosure does not grant any patent, copyright, or IP license to the Receiver.');
    if (formData.languagePriority === 'Arabic') p.push('Language: This agreement is bilingual; the Arabic version takes precedence before Egyptian Courts.');
    if (formData.subcontractorLiability) p.push('Liability: Receiver remains fully liable for any breach by its Permitted Receivers.');
    return p.length ? p.join(' ') : 'No additional provisions.';
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => { setIsDrawing(false); canvasRef.current?.getContext('2d')?.beginPath(); };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const ev = 'touches' in e ? e.touches[0] : e;
    const x = ('clientX' in ev ? ev.clientX : 0) - rect.left;
    const y = ('clientY' in ev ? ev.clientY : 0) - rect.top;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const getCanvasBase64 = (): string => {
    const c = canvasRef.current;
    if (!c) return '';
    return c.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
  };

  const handleConfirmSign = async () => {
    if (!submissionId || !parties) return;
    const base64 = getCanvasBase64();
    if (!base64.trim()) {
      toast.error('Please draw your signature first.');
      return;
    }
    const provisions = generateProvisions();
    const payload = {
      partyA: formData.partyA,
      partyB: formData.partyB,
      purpose: formData.purpose,
      assets: formData.assets,
      duration: formData.duration,
      disputeResolution: formData.disputeResolution,
      provisions,
    };
    const contractPayloadJson = JSON.stringify(payload);
    setSigning(true);
    try {
      if (parties.actor === 'client') {
        await signClient({ submissionId, signatureBase64: base64, contractPayloadJson });
        setDraft((d) => (d ? { ...d, clientSigned: true } : { submissionId, clientSigned: true, companySigned: false }));
        setIsSignModalOpen(false);
        toast.success('Your signature has been recorded. Waiting for the company to sign.');
      } else {
        await signCompany({ submissionId, signatureBase64: base64, contractPayloadJson });
        setDraft((d) => (d ? { ...d, companySigned: true } : { submissionId, clientSigned: true, companySigned: true }));
        setIsSignModalOpen(false);
        toast.success('NDA fully executed. Contract saved.');
        setTimeout(() => navigate(parties.actor === 'company' ? '/ContractRepository' : '/OngoingProjects'), 1500);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Signing failed.');
    } finally {
      setSigning(false);
    }
  };

  const clientSigned = draft?.clientSigned ?? false;
  const companySigned = draft?.companySigned ?? false;
  const isClient = parties?.actor === 'client';
  const showSignBtn = isClient ? !clientSigned : clientSigned && !companySigned;
  const bindName = isClient ? formData.partyB.name : formData.partyA.name;

  if (loading) {
    return (
      <div className="nda-signing-page">
        <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="nda-signing-page">
      <div className="nda-preview-section">
        <div className="document-paper">
          <div className="one-nda-header">
            <div className="one-nda-branding"><div className="branding-dot" /><span>one<strong>NDA</strong></span></div>
            <div className="v-tag">v2.1</div>
          </div>
          <div className="doc-body">
            <h2 className="main-title">Mutual Non-Disclosure Agreement</h2>
            <div className="doc-grid-section">
              <div className="grid-label">PARTIES AND EXECUTION</div>
              <table className="execution-table">
                <thead><tr><th>Party 1 (Company)</th><th>Party 2 (Client)</th></tr></thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="p-row"><strong>Entity details:</strong> {formData.partyA.details || '—'}</div>
                      <div className="p-row signature-row"><strong>Signature:</strong> {companySigned ? <span className="sig-placeholder">[Digitally Signed]</span> : '_________________'}</div>
                      <div className="p-row"><strong>Name:</strong> {formData.partyA.signatory}</div>
                      <div className="p-row"><strong>Title:</strong> {formData.partyA.title}</div>
                      <div className="p-row"><strong>Email:</strong> {formData.partyA.email}</div>
                      <div className="p-row"><strong>Date:</strong> {formData.partyA.date}</div>
                    </td>
                    <td>
                      <div className="p-row"><strong>Entity details:</strong> {formData.partyB.details || '—'}</div>
                      <div className="p-row signature-row"><strong>Signature:</strong> {clientSigned ? <span className="sig-placeholder">[Digitally Signed]</span> : '_________________'}</div>
                      <div className="p-row"><strong>Name:</strong> {formData.partyB.signatory}</div>
                      <div className="p-row"><strong>Title:</strong> {formData.partyB.title}</div>
                      <div className="p-row"><strong>Email:</strong> {formData.partyB.email}</div>
                      <div className="p-row"><strong>Date:</strong> {formData.partyB.date}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="doc-grid-section">
              <div className="grid-label">VARIABLES</div>
              <table className="variables-table">
                <tbody>
                  <tr><td className="var-key">Purpose:</td><td>{formData.purpose} ({formData.assets})</td></tr>
                  <tr><td className="var-key">Confidentiality period:</td><td>{formData.duration}</td></tr>
                  <tr><td className="var-key">Governing law:</td><td>Arab Republic of Egypt</td></tr>
                  <tr><td className="var-key">Dispute Resolution Method:</td><td>{formData.disputeResolution}</td></tr>
                  <tr><td className="var-key">Special Provisions:</td><td className="special-txt">{generateProvisions()}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="doc-grid-section">
              <div className="grid-label">TERMS</div>
              <div className="terms-scroll-preview">
                <p><strong>1. What is Confidential Information?</strong> Information disclosed by the Discloser to the Receiver in connection with the Purpose.</p>
                <p><strong>2. Who can I share it with?</strong> Permitted Receivers on a &quot;need to know&quot; basis who agree to confidentiality.</p>
                <p><strong>3. What are my obligations?</strong> Use only for Purpose, keep secure, and destroy/erase within 30 days of request.</p>
                <p><strong>4. Duration:</strong> Obligations last until the end of the Confidentiality Period.</p>
                <p><strong>5. Governing Law:</strong> This agreement is subject to the Governing Law and resolved by the Dispute Resolution Method.</p>
              </div>
            </div>
          </div>
          <div className="watermark">oneNDA v2.1 Egypt</div>
        </div>
      </div>

        <div className="nda-actions-section">

        {clientSigned && !companySigned && isClient && (
          <div className="alert alert-info mb-3">Waiting for the company to sign. You will be notified when the NDA is fully executed.</div>
        )}
        {companySigned && (
          <div className="alert alert-success mb-3">This NDA has been fully executed and saved.</div>
        )}

        {showSignBtn && (
          <button type="button" className="signing-btn" onClick={() => setIsSignModalOpen(true)} disabled={signing}>
            <PenTool size={18} /> {isClient ? 'Sign & Finalize (Client)' : 'Sign as Company'}
          </button>
        )}
      </div>

      {isSignModalOpen && (
        <div className="modal-backdrop">
          <div className="signature-modal">
            <div className="modal-head"><h3>Apply Digital Signature</h3><button type="button" className="close" onClick={() => setIsSignModalOpen(false)}><X size={20} /></button></div>
            <p className="modal-sub">By signing, you confirm that you are authorized to bind <strong>{bindName || (isClient ? 'Client' : 'Company')}</strong>.</p>
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} width={520} height={200} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onMouseMove={draw} />
              <button type="button" className="canvas-clear" onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 520, 200)}><Eraser size={14} /> Clear</button>
            </div>
            <div className="modal-foot">
              <button type="button" className="cancel" onClick={() => setIsSignModalOpen(false)}>Cancel</button>
              <button type="button" className="confirm" onClick={handleConfirmSign} disabled={signing}>
                {signing ? 'Signing…' : 'Confirm & Sign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NDASigning;
