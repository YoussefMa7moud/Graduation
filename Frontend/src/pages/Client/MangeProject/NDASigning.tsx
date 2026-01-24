import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck, User, ShieldCheck, Clock, Globe, Scale, 
  AlertCircle, X, ChevronRight, ChevronLeft, PenTool, Eraser
} from 'lucide-react';
import { toast } from 'react-toastify';
import './NDASigning.css';

const NDASigning: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- Form Data Mapping ---
  const [formData, setFormData] = useState({
    agreementType: 'Mutual',
    partyA: { type: 'Company', role: 'Both', name: 'Nile Tech Solutions', id: 'CR-123456', signatory: 'Mustafa Kamel', email: 'mustafa@niletech.eg' },
    partyB: { type: 'Company', role: 'Both', name: '', id: '', email: '' },
    purpose: '',
    infoTypes: [] as string[],
    recipients: [] as string[],
    duration: '2 Years',
    useRestriction: 'Only for the stated purpose',
    governingLaw: 'Arab Republic of Egypt',
    disputeResolution: 'Egyptian Courts',
    termination: 'By mutual written agreement',
    remedies: [] as string[]
  });

  // --- Logic: Dispute Resolution Rule ---
  useEffect(() => {
    if (formData.partyA.type === 'Individual' || formData.partyB.type === 'Individual') {
      setFormData(prev => ({ ...prev, disputeResolution: 'Egyptian Courts' }));
    }
  }, [formData.partyA.type, formData.partyB.type]);

  const handleCheckbox = (listName: 'infoTypes' | 'recipients' | 'remedies', value: string) => {
    setFormData(prev => {
      const list = prev[listName] as string[];
      return {
        ...prev,
        [listName]: list.includes(value) ? list.filter(i => i !== value) : [...list, value]
      };
    });
  };

  // --- Signature Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="nda-signing-page">
      {/* LEFT: exact oneNDA v2.1 Preview */}
      <div className="nda-preview-section">
        <div className="document-paper">
          <div className="one-nda-header">
            <div className="one-nda-branding">
              <div className="branding-dot"></div>
              <span>one<strong>NDA</strong></span>
            </div>
            <div className="v-tag">v2.1</div>
          </div>

          <div className="doc-body">
            <h2 className="main-title">Mutual Non-Disclosure Agreement</h2>
            
            <div className="doc-grid-section">
              <div className="grid-label">PARTIES</div>
              <div className="party-box-container">
                <div className="party-box">
                  <strong>Party 1: {formData.partyA.name}</strong><br/>
                  <small>{formData.partyA.type} | {formData.partyA.email}</small>
                </div>
                <div className="party-box">
                  <strong>Party 2: {formData.partyB.name || '__________'}</strong><br/>
                  <small>{formData.partyB.type} | {formData.partyB.email || 'pending email'}</small>
                </div>
              </div>
            </div>

            <div className="doc-grid-section">
              <div className="grid-label">VARIABLES</div>
              <div className="variable-row"><span>Purpose:</span> <strong>{formData.purpose || 'Software Development Project'}</strong></div>
              <div className="variable-row"><span>Confidentiality period:</span> <strong>{formData.duration}</strong></div>
              <div className="variable-row"><span>Governing law:</span> <strong>{formData.governingLaw}</strong></div>
              <div className="variable-row"><span>Dispute Resolution:</span> <strong>{formData.disputeResolution}</strong></div>
            </div>

            <div className="doc-grid-section">
              <div className="grid-label">TERMS</div>
              <p className="terms-text"><strong>1. What is Confidential Information?</strong> Information disclosed by the Discloser to the Receiver in connection with the Purpose.</p>
              <p className="terms-text"><strong>2. Sharing:</strong> The Receiver may share with Permitted Receivers who need to know for the Purpose.</p>
              <p className="terms-text"><strong>3. Obligations:</strong> Receiver must keep info secure and only use it for the Purpose.</p>
              {formData.infoTypes.includes('Client / User Data') && (
                 <p className="highlight-clause"><strong>Special Provision:</strong> Receiver must comply with Law No. 151 of 2020 (Egypt Data Protection).</p>
              )}
            </div>
          </div>
          <div className="watermark">oneNDA v2.1 Preview</div>
        </div>
      </div>

      {/* RIGHT: 12-Step Questionnaire */}
      <div className="nda-form-section">
        <div className="step-indicator">
          <div className="step-count">STEP {step} <span>of 12</span></div>
          <div className="progress-track"><div className="fill" style={{width: `${(step/12)*100}%`}}></div></div>
        </div>

        <div className="questionnaire-body">
          {step === 1 && (
            <div className="q-wrap">
              <label className="q-label">🧩 STEP 1 — Agreement Type</label>
              <p className="q-text">Q1. What type of NDA do you want to create?</p>
              <div className="radio-card-list">
                <div className={`r-card ${formData.agreementType === 'Mutual' ? 'active' : ''}`} onClick={() => setFormData({...formData, agreementType: 'Mutual'})}>
                  <div className="r-circle"></div>
                  <div><strong>Mutual NDA</strong><small>Both parties disclose information</small></div>
                </div>
                <div className={`r-card ${formData.agreementType === 'One-Way' ? 'active' : ''}`} onClick={() => setFormData({...formData, agreementType: 'One-Way'})}>
                  <div className="r-circle"></div>
                  <div><strong>One-Way NDA</strong><small>Only one party discloses information</small></div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="q-wrap">
              <label className="q-label">👥 STEP 2 — Party Identification</label>
              <p className="q-text">Identify the second party (Party B):</p>
              <div className="btn-toggle-group mb-3">
                <button className={formData.partyB.type === 'Individual' ? 'active' : ''} onClick={() => setFormData({...formData, partyB: {...formData.partyB, type: 'Individual'}})}>Individual</button>
                <button className={formData.partyB.type === 'Company' ? 'active' : ''} onClick={() => setFormData({...formData, partyB: {...formData.partyB, type: 'Company'}})}>Company</button>
              </div>
              <input type="text" className="legal-input" placeholder="Legal Name of Party B" value={formData.partyB.name} onChange={(e) => setFormData({...formData, partyB: {...formData.partyB, name: e.target.value}})} />
            </div>
          )}

          {step === 3 && (
            <div className="q-wrap">
              <label className="q-label">🎯 STEP 3 — Purpose of Disclosure</label>
              <p className="q-text">Q6. What is the purpose of sharing confidential information?</p>
              <div className="grid-options">
                {['Software Development Project', 'Web / Mobile Application Development', 'SaaS Platform Evaluation', 'System Integration', 'Source Code Review', 'Technical Consultation'].map(p => (
                  <button key={p} className={`opt-pill ${formData.purpose === p ? 'active' : ''}`} onClick={() => setFormData({...formData, purpose: p})}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="q-wrap">
              <label className="q-label">🔐 STEP 4 — Confidential Information Type</label>
              <p className="q-text">Q7. What information will be considered confidential?</p>
              <div className="checkbox-list">
                {['Source Code', 'Algorithms & Logic', 'Software Architecture', 'Database Structure', 'API Keys & Credentials', 'UI/UX Designs', 'Technical Documentation', 'Client / User Data'].map(t => (
                  <label key={t} className="check-item">
                    <input type="checkbox" checked={formData.infoTypes.includes(t)} onChange={() => handleCheckbox('infoTypes', t)} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="q-wrap">
              <label className="q-label">👥 STEP 5 — Allowed Recipients</label>
              <p className="q-text">Q8. Who is allowed to access the confidential information?</p>
              <div className="checkbox-list">
                {['Employees', 'Contractors', 'Technical Consultants', 'Legal Advisors', 'Affiliates'].map(r => (
                  <label key={r} className="check-item">
                    <input type="checkbox" checked={formData.recipients.includes(r)} onChange={() => handleCheckbox('recipients', r)} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="q-wrap">
              <label className="q-label">⏳ STEP 6 — Confidentiality Duration</label>
              <p className="q-text">Q9. How long should confidentiality obligations last?</p>
              <div className="radio-pill-list">
                {['1 Year', '2 Years', '3 Years', '5 Years'].map(d => (
                  <button key={d} className={`pill ${formData.duration === d ? 'active' : ''}`} onClick={() => setFormData({...formData, duration: d})}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="q-wrap">
              <label className="q-label">🔄 STEP 7 — Use & Restrictions</label>
              <p className="q-text">Q10. Confidential information may be used:</p>
              <button className={`opt-pill w-100 mb-2 ${formData.useRestriction === 'Only for the stated purpose' ? 'active' : ''}`} onClick={() => setFormData({...formData, useRestriction: 'Only for the stated purpose'})}>Only for the stated purpose</button>
              <button className={`opt-pill w-100 ${formData.useRestriction === 'For stated purpose and internal evaluation' ? 'active' : ''}`} onClick={() => setFormData({...formData, useRestriction: 'For stated purpose and internal evaluation'})}>Stated purpose and internal evaluation only</button>
            </div>
          )}

          {step === 8 && (
            <div className="q-wrap">
              <label className="q-label">🚫 STEP 8 — Confidentiality Exclusions</label>
              <p className="q-text">Q11. Standard exclusions (Auto-selected):</p>
              <div className="readonly-list">
                <div className="r-item">☑ Publicly available information</div>
                <div className="r-item">☑ Information independently developed</div>
                <div className="r-item">☑ Information obtained legally from third parties</div>
                <div className="r-item">☑ Information disclosed by law or court order</div>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="q-wrap">
              <label className="q-label">🏛 STEP 9 — Governing Law</label>
              <p className="q-text">Q12. Governing law of this agreement:</p>
              <div className="locked-field">
                <span className="flag">🇪🇬</span> Arab Republic of Egypt <small>(Locked)</small>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="q-wrap">
              <label className="q-label">⚖️ STEP 10 — Dispute Resolution</label>
              <p className="q-text">Q13. How should disputes be resolved?</p>
              <div className="radio-card-list">
                <div className={`r-card ${formData.disputeResolution === 'Egyptian Courts' ? 'active' : ''}`} onClick={() => setFormData({...formData, disputeResolution: 'Egyptian Courts'})}>
                  <div className="r-circle"></div>
                  <div><strong>Egyptian Courts</strong><small>Standard litigation process</small></div>
                </div>
                {formData.partyA.type === 'Company' && formData.partyB.type === 'Company' && (
                  <div className={`r-card ${formData.disputeResolution === 'Arbitration' ? 'active' : ''}`} onClick={() => setFormData({...formData, disputeResolution: 'Arbitration'})}>
                    <div className="r-circle"></div>
                    <div><strong>Arbitration (CRCICA)</strong><small>Cairo Regional Centre for International Commercial Arbitration</small></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 11 && (
            <div className="q-wrap">
              <label className="q-label">🧾 STEP 11 — Termination</label>
              <p className="q-text">Q14. When can this agreement be terminated?</p>
              <div className="radio-pill-list vertical">
                {['By mutual written agreement', 'With 30 days prior notice', 'Automatically at project completion'].map(t => (
                  <button key={t} className={`pill ${formData.termination === t ? 'active' : ''}`} onClick={() => setFormData({...formData, termination: t})}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {step === 12 && (
            <div className="q-wrap">
              <label className="q-label">🚨 STEP 12 — Breach & Remedies</label>
              <p className="q-text">Q15. In case of breach, you may seek:</p>
              <div className="checkbox-list">
                {['Injunctive relief', 'Financial compensation', 'Both'].map(rem => (
                  <label key={rem} className="check-item">
                    <input type="checkbox" checked={formData.remedies.includes(rem)} onChange={() => handleCheckbox('remedies', rem)} />
                    <span>{rem}</span>
                  </label>
                ))}
              </div>
              <button className="signing-trigger" onClick={() => setIsSignModalOpen(true)}>
                <PenTool size={18} /> Sign & Send Agreement
              </button>
            </div>
          )}
        </div>

        <div className="step-nav">
          <button className="nav-btn prev" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft size={18} /> Previous</button>
          {step < 12 && <button className="nav-btn next" onClick={() => setStep(step + 1)}>Next <ChevronRight size={18} /></button>}
        </div>
      </div>

      {/* DRAWING SIGNATURE MODAL */}
      {isSignModalOpen && (
        <div className="modal-backdrop">
          <div className="signature-modal">
            <div className="modal-head">
              <h3>Draw Your Signature</h3>
              <button className="close" onClick={() => setIsSignModalOpen(false)}><X size={20}/></button>
            </div>
            <p className="modal-sub">By signing, you agree to the terms of this oneNDA as <strong>{formData.partyA.signatory}</strong>.</p>
            
            <div className="canvas-container">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={220}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
              />
              <button className="canvas-clear" onClick={clearSignature}><Eraser size={14} /> Clear</button>
            </div>

            <div className="modal-foot">
              <button className="cancel" onClick={() => setIsSignModalOpen(false)}>Cancel</button>
              <button className="confirm" onClick={() => toast.success("NDA Signed and Sent!")}>Confirm & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NDASigning;