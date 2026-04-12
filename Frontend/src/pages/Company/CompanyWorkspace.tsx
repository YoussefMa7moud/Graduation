import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getContractParties,
  getContractDraft,
  saveContractDraft,
  validateWithAI,
  validateWithOCL,
  sendToClient,
  sendChatMessage,
  getChatMessages,
  type ContractPartiesResponse,
  type ContractDraftResponse,
  type ContractChatMessageDTO,
  type ViolationDTO,
  signCompany,
} from '../../services/Contract/mainContract';
import { X, Eraser, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './CompanyWorkspace.css';
import '../Client/ActiveProjectsModal.css'; // Reusing the same modal CSS

interface Clause {
  id: string;
  text: string;
  violation?: ViolationDTO;
}

interface Section {
  id: string;
  title: string;
  num: number;
  clauses: Clause[];
}

const CompanyWorkspace: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const submissionId = (location.state as { submissionId?: number })?.submissionId;
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [sections, setSections] = useState<Section[]>([
    { id: 's1', num: 1, title: "DEVELOPER'S DUTIES", clauses: [{ id: 'c1', text: "" }] },
    { id: 's2', num: 2, title: "DELIVERY", clauses: [{ id: 'c2', text: "" }] },
    { id: 's3', num: 3, title: "COMPENSATION", clauses: [{ id: 'c3', text: "" }] },
    { id: 's4', num: 4, title: "INTELLECTUAL PROPERTY RIGHTS", clauses: [{ id: 'c4', text: "" }] },
    { id: 's5', num: 5, title: "CHANGE IN SPECIFICATIONS", clauses: [{ id: 'c5', text: "" }] },
    { id: 's6', num: 6, title: "CONFIDENTIALITY", clauses: [{ id: 'c6', text: "" }] },
    { id: 's7', num: 7, title: "DEVELOPER WARRANTIES", clauses: [{ id: 'c7', text: "" }] },
    { id: 's8', num: 8, title: "INDEMNIFICATION", clauses: [{ id: 'c8', text: "" }] },
    { id: 's10', num: 10, title: "APPLICABLE LAW", clauses: [{ id: 'c10', text: "This Software Development Agreement and the interpretation of its terms shall be governed by and construed in accordance with the laws of Egypt and subject to the exclusive jurisdiction of the courts located in Cairo, Egypt." }] },
  ]);

  const [parties, setParties] = useState<ContractPartiesResponse | null>(null);
  const [draft, setDraft] = useState<ContractDraftResponse | null>(null);
  const [violations, setViolations] = useState<ViolationDTO[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isValidatingAI, setIsValidatingAI] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ContractChatMessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitleInput, setSectionTitleInput] = useState("");

  // --- Signature State ---
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signing, setSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isEmployee = user?.role === 'company_employee';
  const canSign = !isEmployee || user?.permissions?.canSignContract === true;
  const isLocked = Boolean(draft?.sentToClient);
  
  
  // --- Helpers ---
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const resolveClauseNumber = (clauseId: string): string => {
    for (const section of sections) {
      const index = section.clauses.findIndex(c => c.id === clauseId);
      if (index !== -1) return `${section.num}.${index + 1}`;
    }
    return clauseId;
  };

  const getUniqueViolations = (list: ViolationDTO[]) => {
    return list.filter((v, index, self) =>
      index === self.findIndex((t) => (
        t.clauseId === v.clauseId && t.reason === v.reason
      ))
    );
  };

  const applyViolationsToClauses = useCallback((violationsList: ViolationDTO[]) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        clauses: section.clauses.map((clause) => {
          const matchedViolation = violationsList.find((v) => v.clauseId === clause.id);
          return { ...clause, violation: matchedViolation };
        }),
      }))
    );
  }, []);

  // --- Load Initial Data ---
  useEffect(() => {
    if (!submissionId) {
      toast.error('No submission ID provided');
      navigate('/OngoingContracts');
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [partiesRes, draftRes, messagesRes] = await Promise.all([
          getContractParties(submissionId),
          getContractDraft(submissionId).catch(() => null),
          getChatMessages(submissionId).catch(() => []),
        ]);
        if (cancelled) return;

        setParties(partiesRes);
        setChatMessages(messagesRes);

        if (draftRes?.contractPayloadJson) {
          try {
            lastSavedPayloadRef.current = draftRes.contractPayloadJson; // Initialize it!
            const payload = JSON.parse(draftRes.contractPayloadJson);
            if (payload.sections) {
              // Strip any leaked 'violation' properties from corrupted drafts
              const sanitizedSections = payload.sections.map((s: any) => ({
                ...s,
                clauses: s.clauses.map((c: any) => {
                  const { violation, ...rest } = c;
                  return rest;
                })
              }));
              setSections(sanitizedSections);
            }
          } catch (e) { console.error('Payload parse error', e); }
        }

        if (draftRes?.validationResultsJson) {
          try {
            const results = JSON.parse(draftRes.validationResultsJson);
            if (results.violations) {
              const unique = getUniqueViolations(results.violations);
              setViolations(unique);
              applyViolationsToClauses(unique);
              setIsValidated(true);
            }
          } catch (e) { console.error('Validation parse error', e); }
        }

        setDraft(draftRes);
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [submissionId, navigate, applyViolationsToClauses]);

  useEffect(() => { scrollToBottom(); }, [chatMessages, isChatOpen]);

  // --- Auto-refresh Chat ---
  useEffect(() => {
    if (!submissionId) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await getChatMessages(submissionId);
        setChatMessages(msgs);
      } catch (e) { }
    }, 5000);
    return () => clearInterval(interval);
  }, [submissionId]);

  // --- Auto-save ---
  const lastSavedPayloadRef = useRef<string | null>(null);

  const saveDraft = useCallback(async () => {
    if (!submissionId || !isDirty.current) return;
    
    // Strip UI-only state (like 'violation') before saving so it doesn't trigger backend validation resets
    const cleanSections = sections.map(s => ({
      ...s,
      clauses: s.clauses.map(c => {
        const { violation, ...rest } = c;
        return rest;
      })
    }));
    
    const contractPayload = JSON.stringify({ sections: cleanSections });
    
    // Prevent redundant saves if identical
    if (lastSavedPayloadRef.current === contractPayload) {
      isDirty.current = false;
      return;
    }

    try {
      lastSavedPayloadRef.current = contractPayload;
      const savedDraft = await saveContractDraft({
        submissionId,
        contractPayloadJson: contractPayload,
      });
      setDraft(savedDraft);
      isDirty.current = false;
    } catch (e) { 
      console.error('Auto-save failed', e);
      lastSavedPayloadRef.current = null; // reset if failed
    }
  }, [submissionId, sections]);

  useEffect(() => {
    if (isEmployee) return; // Employees should never auto-save
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => saveDraft(), 2000);
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
  }, [sections, saveDraft, isEmployee]);

  // --- Handlers ---
  const isDirty = useRef(false);

  const handleUpdate = (sId: string, cId: string, val: string, target: HTMLTextAreaElement) => {
    if (isEmployee || isLocked) return; // Employees or locked contracts cannot edit
    if (sId === 's10') return;

    target.style.height = 'inherit';
    target.style.height = `${target.scrollHeight}px`;

    isDirty.current = true; // Mark as edited
    setSections(prev => prev.map(s => s.id === sId ? {
      ...s, clauses: s.clauses.map(c => c.id === cId ? { ...c, text: val } : c)
    } : s));
  };

  const handleKeys = (e: React.KeyboardEvent, sIdx: number, cIdx: number) => {
    if (sections[sIdx].id === 's10') {
      if (e.key === 'Enter' || e.key === 'Backspace') {
        e.preventDefault();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      isDirty.current = true;
      const newSections = [...sections];
      newSections[sIdx].clauses.splice(cIdx + 1, 0, { id: `cl-${Date.now()}`, text: "" });
      setSections(newSections);
    } else if (e.key === 'Backspace' && sections[sIdx].clauses[cIdx].text === "" && sections[sIdx].clauses.length > 1) {
      e.preventDefault();
      isDirty.current = true;
      const newSections = [...sections];
      newSections[sIdx].clauses.splice(cIdx, 1);
      setSections(newSections);
    }
  };

  const handleAddSection = () => {
    if (isEmployee || isLocked) return;
    isDirty.current = true;
    setSections(prev => {
      const newSection: Section = {
        id: `s-custom-${Date.now()}`,
        num: 0,
        title: "NEW SECTION",
        clauses: [{ id: `c-custom-${Date.now()}`, text: "" }]
      };
      const newSections = [...prev];
      const s10Idx = newSections.findIndex(s => s.id === 's10');
      if (s10Idx !== -1) {
        newSections.splice(s10Idx, 0, newSection);
      } else {
        newSections.push(newSection);
      }
      
      let currentNum = 1;
      return newSections.map((s) => {
        if (s.id === 's10') return { ...s, num: 10 };
        const updated = { ...s, num: currentNum };
        currentNum++;
        return updated;
      });
    });
  };

  const handleRemoveSection = (sId: string) => {
    if (isEmployee || isLocked || sId === 's10') return;
    isDirty.current = true;
    setSections(prev => {
      const filtered = prev.filter(s => s.id !== sId);
      let currentNum = 1;
      return filtered.map(s => {
        if (s.id === 's10') return { ...s, num: 10 };
        const updated = { ...s, num: currentNum };
        currentNum++;
        return updated;
      });
    });
  };

  const handleStartRename = (sId: string, currentTitle: string) => {
    if (isEmployee || isLocked || sId === 's10') return;
    setEditingSectionId(sId);
    setSectionTitleInput(currentTitle);
  };

  const handleSaveRename = (sId: string) => {
    if (isEmployee || isLocked || sId === 's10') return;
    isDirty.current = true;
    setSections(prev => prev.map(s => s.id === sId ? { ...s, title: sectionTitleInput } : s));
    setEditingSectionId(null);
  };


  const handleValidateContract = async () => {
    if (!submissionId) return;
    setIsValidatingAI(true);
    try {
      await saveDraft();
      
      // Call sequentially to merge validation objects properly in backend
      await validateWithAI(submissionId);
      const result = await validateWithOCL(submissionId);
      
      if (result.violations && result.violations.length > 0) {
        const uniqueViolations = getUniqueViolations(result.violations);
        setViolations(uniqueViolations);
        applyViolationsToClauses(uniqueViolations);
        setIsValidated(true);
      } else {
        setViolations([]);
        applyViolationsToClauses([]);
        setIsValidated(true);
      }

      const hasIssues = result.violations && result.violations.length > 0;
      if (!hasIssues) {
        toast.success('Contract validated successfully! No issues found.');
      } else {
        toast.warning(`Validation found ${result.violations.length} issues.`);
      }

      // Fetch fresh draft so UI unlocks
      const updatedDraft = await getContractDraft(submissionId);
      setDraft(updatedDraft);

    } catch (e: any) {
      toast.error('Validation failed.');
    } finally {
      setIsValidatingAI(false);
    }
  };

  const handleSendToClient = async () => {
    if (!submissionId) return;
    try {
      await sendToClient(submissionId);
      toast.success('Sent to client.');
      const updated = await getContractDraft(submissionId);
      setDraft(updated);
    } catch (e: any) { toast.error('Send failed.'); }
  };

  const handleSendChatMessage = async () => {
    if (!submissionId || !chatInput.trim()) return;
    try {
      const msg = await sendChatMessage({ submissionId, message: chatInput.trim() });
      setChatMessages(prev => [...prev, msg]);
      setChatInput("");
    } catch (e) { toast.error('Message failed.'); }
  };

  // --- Signature Logic ---
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getCanvasBase64 = (): string => {
    const c = canvasRef.current;
    if (!c) return '';
    return c.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
  };

  const handleConfirmSign = async () => {
    if (!submissionId) return;
    const base64 = getCanvasBase64();
    if (!base64.trim()) {
      toast.error('Please draw your signature first.');
      return;
    }
    setSigning(true);
    try {
      const contractPayload = JSON.stringify({ sections });
      const draftRes = await signCompany({ 
        submissionId: submissionId, 
        signatureBase64: base64,
        contractPayloadJson: contractPayload
      });
      setDraft(draftRes);
      setIsSignModalOpen(false);
      toast.success('Contract fully executed! Redirecting to Repository...');
      setTimeout(() => {
        navigate('/ContractRepository');
      }, 2000);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Signing failed.');
    } finally {
      setSigning(false);
    }
  };

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ws-wrapper">
      <header className="ws-nav">
        <div className="nav-info">
          <span className="doc-label">Legal Workspace / <strong>{parties?.partyA?.name || 'Contract'}</strong></span>
          <div className="compliance-tag">This Contract is governed exclusively by the laws of Egypt.</div>
        </div>
        <div className="nav-btns">
          {!isEmployee && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {!isLocked && (
                <>
                  <button className="btn-navy" onClick={handleValidateContract} disabled={isValidatingAI}>
                    {isValidatingAI ? 'Validating...' : 'Validate Contract (AI + Policy)'}
                  </button>

                  <button 
                    className="btn-success" 
                    onClick={handleSendToClient} 
                    disabled={!draft?.aiValidated || !draft?.oclValidated}
                    title={(!draft?.aiValidated || !draft?.oclValidated) ? "You must pass the validation first" : ""}
                    style={{ 
                      marginLeft: '10px', 
                      opacity: (!draft?.aiValidated || !draft?.oclValidated) ? 0.6 : 1, 
                      cursor: (!draft?.aiValidated || !draft?.oclValidated) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Finalize & Send
                  </button>
                </>
              )}

              {isLocked && !draft?.clientSignedAt && (
                <div style={{ marginLeft: '10px', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <i className="bi bi-clock-fill"></i> Waiting for Client to Sign
                </div>
              )}

              {isLocked && draft?.clientSignedAt && !draft?.companySignedAt && (
                <button 
                  className="btn-success" 
                  onClick={() => {
                    if (canSign) setIsSignModalOpen(true);
                    else toast.error("You do not have permission to sign contracts.");
                  }} 
                  style={{ 
                    marginLeft: '10px',
                    opacity: canSign ? 1 : 0.5, 
                    cursor: canSign ? 'pointer' : 'not-allowed'
                  }}
                  title={!canSign ? "Missing 'Sign Contracts' permission" : ""}
                >
                  Sign Final Agreement
                </button>
              )}
              
              {isLocked && draft?.companySignedAt && (
                <div style={{ marginLeft: '10px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  <i className="bi bi-check-circle-fill"></i> Fully Executed
                </div>
              )}
            </div>
          )}
          {isEmployee && (
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Read-Only View</span>
          )}
        </div>
      </header>

      <div className="ws-content">
        <main className="editor-scroller">
          <div className="document-container">
            <div className="doc-page cover">
              <h1 className="cover-title">Software Development Agreement</h1>
              <div className="cover-grid">
                <div className="cover-block">
                  <span className="cover-label">Prepared for:</span>
                  <p className="party-name">{parties?.partyB?.signatory || '[Signatory]'}</p>
                  <p className="party-company">{parties?.partyB?.name || '[Company Name]'}</p>
                </div>
                <div className="cover-block">
                  <span className="cover-label">Prepared by:</span>
                  <p className="party-name">{parties?.partyA?.signatory || '[Signatory]'}</p>
                  <p className="party-company">{parties?.partyA?.name || '[Company Name]'}</p>
                </div>
              </div>
            </div>

            <div className="doc-page recitals-page">
              <h2 className="formal-heading">RECITALS</h2>
              <div className="formal-text">
                <p>This Software Development Agreement (this <strong>"Agreement"</strong>) is made and entered into as of the date of final electronic signature (the <strong>"Effective Date"</strong>), by and between:</p>
                <div className="party-details">
                  <p><strong>DEVELOPER:</strong> {parties?.partyA?.name || '[Developer Company]'}, represented by {parties?.partyA?.signatory || '[Signatory]'}</p>
                  <p><strong>CLIENT:</strong> {parties?.partyB?.name || '[Client Company]'}, represented by {parties?.partyB?.signatory || '[Signatory]'}</p>
                </div>
                <p><strong>WHEREAS</strong>, the Client desires to engage the Developer to provide custom software development services in accordance with the specifications set forth herein;</p>
                <p><strong>WHEREAS</strong>, the Developer possesses the necessary technical expertise, resources, and qualifications to perform such services; and</p>
                <p><strong>WHEREAS</strong>, the Parties mutually agree to be legally bound by all terms, conditions, and stipulations contained within this Agreement.</p>
                <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants and promises hereinafter set forth, the Parties agree as follows:</p>
              </div>
            </div>

            <div className="doc-page body">
              <div className="locked-legal-text">
                <p>This Agreement is governed exclusively by the laws of the Arab Republic of Egypt, is not subject to international arbitration, and any dispute shall be resolved solely by Egyptian courts.</p>
                <p>يخضع هذا الاتفاق للقانون المصري وحده، ولا يخضع لأي تحكيم دولي.</p>
                <div className="egypt-notice">
                  <i className="bi bi-shield-check-fill me-2"></i> 
                  ELECTRONIC SIGNATURES SUBJECT TO EGYPTIAN ITIDA REGULATIONS.
                </div>
              </div>

              <h2 className="formal-heading center mt-4 mb-5">OPERATIVE PROVISIONS</h2>

              {sections.map((section, sIdx) => (
                <div key={section.id} className="section-container">
                  <div className="section-header-row">
                    {editingSectionId === section.id ? (
                      <div className="section-rename-wrapper">
                        <span className="section-num-static">{section.num}.</span>
                        <input 
                          type="text" 
                          value={sectionTitleInput} 
                          onChange={(e) => setSectionTitleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(section.id);
                          }}
                          className="section-title-input"
                          autoFocus
                        />
                        <button className="icon-btn success" onClick={() => handleSaveRename(section.id)}>
                          <Check size={16} />
                        </button>
                        <button className="icon-btn danger" onClick={() => setEditingSectionId(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <h3 className="section-h3">
                        {section.num}. {section.title}
                        {!isEmployee && !isLocked && section.id !== 's10' && (
                          <div className="section-actions">
                            <button className="icon-btn edit" onClick={() => handleStartRename(section.id, section.title)} title="Rename Section">
                              <Edit2 size={14} />
                            </button>
                            <button className="icon-btn danger" onClick={() => handleRemoveSection(section.id)} title="Delete Section">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </h3>
                    )}
                  </div>
                  {section.clauses.map((clause, cIdx) => (
                    <div key={clause.id} className={`clause-row ${clause.violation ? 'has-issue' : ''}`}>
                      <span className="c-num">{section.num}.{cIdx + 1}</span>
                      <div className="clause-input-wrapper">
                        {section.id === 's10' || isEmployee || isLocked ? (
                          <div className="c-input static-clause-display">{clause.text}</div>
                        ) : (
                          <textarea
                            className="c-input"
                            value={clause.text}
                            onChange={(e) => handleUpdate(section.id, clause.id, e.target.value, e.target)}
                            onKeyDown={(e) => handleKeys(e, sIdx, cIdx)}
                            placeholder="Type contract clause here..."
                            rows={1}
                          />
                        )}
                        {clause.violation && (
                          <div className="violation-marker">
                            <i className="bi bi-exclamation-circle-fill"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {!isEmployee && !isLocked && (
                <div className="add-section-wrapper">
                  <button className="btn-add-section" onClick={handleAddSection}>
                    <Plus size={18} className="me-2" /> Add New Section
                  </button>
                </div>
              )}

              <div className="signature-area">
                <div className="sig-row">
                  <div className="sig-box">
                    <span>Client (Authorized Signatory)</span>
                    {draft?.clientSignedAt && (
                      <div className="text-success mt-2 fw-bold">[Digitally Signed]</div>
                    )}
                  </div>
                  <div className="sig-box">
                    <span>Developer (Authorized Signatory)</span>
                    {draft?.companySignedAt && (
                      <div className="text-success mt-2 fw-bold">[Digitally Signed]</div>
                    )}
                  </div>
                </div>
                <div className="sig-row mt-4">
                  <div className="sig-date">
                    {draft?.clientSignedAt ? `Dated: ${new Date(draft.clientSignedAt).toLocaleDateString('en-GB')}` : `Dated: ${new Date().toLocaleDateString('en-GB')}`}
                  </div>
                  <div className="sig-date">
                    {draft?.companySignedAt ? `Dated: ${new Date(draft.companySignedAt).toLocaleDateString('en-GB')}` : `Dated: ${new Date().toLocaleDateString('en-GB')}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="ws-sidebar">
          <div className="side-body">
              <div className="intel-container">
                {/* 1. Initial State: Waiting for validation */}
                {!isValidated && !isValidatingAI && (
                  <div className="intel-placeholder">
                    <div className="placeholder-icon"><i className="bi bi-file-earmark-lock2"></i></div>
                    <h4>Ready for Review</h4>
                    <p>Click <strong>"AI Legal Check"</strong> to scan for risks and Egyptian law compliance.</p>
                  </div>
                )}

                {/* 2. Loading State */}
                {isValidatingAI && (
                  <div className="intel-placeholder validation-active">
                    <div className="radar-spinner"></div>
                    <h4 className="pulse-text">Scanning Document...</h4>
                    <p>Cross-referencing with Egyptian Law and Company Policies</p>
                    <div className="scan-progress-bar">
                      <div className="scan-progress-fill"></div>
                    </div>
                  </div>
                )}

                {/* 3. Success State: 0 Violations */}
                {isValidated && violations.length === 0 && (
                  <div className="intel-placeholder success-state">
                    <div className="placeholder-icon success"><i className="bi bi-check-circle-fill"></i></div>
                    <h4>Compliant Draft</h4>
                    <p>No legal violations detected in the current version.</p>
                    <div className="status-tag">Status: Verified</div>
                  </div>
                )}

                {/* 4. Violation List */}
                {isValidated && violations.length > 0 && (
                  <div className="violation-list">
                    <div className="intel-summary mb-3">
                      <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                      {violations.length} points to review
                    </div>
                    {violations.map((v, i) => (
                      <div key={i} className={`violation-card ${v.type === 'LAW' ? 'law-issue' : 'policy-issue'}`}>
                        <div className="v-header">
                          <span className="v-id">Clause {resolveClauseNumber(v.clauseId)}</span>
                          <span className={`v-severity ${v.type === 'LAW' ? 'law' : 'policy'}`}>
                            {v.type === 'LAW' ? 'Egyptian Law' : 'Policy'}
                          </span>
                        </div>
                        <p className="v-reason">{v.reason}</p>
                        {v.suggestion && (
                          <div className="v-suggestion">
                            <strong>Suggested Fix</strong>
                            <p>{v.suggestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

          </div>
        </aside>
      </div>

      {/* LinkedIn-style Sticky Footer Chat */}
      <div className={`sticky-chat-widget ${isChatOpen ? 'open' : 'closed'}`}>
        <div className="chat-header" onClick={() => setIsChatOpen(!isChatOpen)}>
          <div className="chat-title">
            <i className="bi bi-chat-dots-fill me-2" style={{ color: "#fff" }}></i> Collaboration
            {chatMessages.length > 0 && <span className="chat-badge">{chatMessages.length}</span>}
          </div>
          <i className={`bi bi-chevron-${isChatOpen ? 'down' : 'up'}`} style={{ color: "#fff" }}></i>
        </div>
        
        {isChatOpen && (
          <div className="chat-body-content">
            <div className="chat-msgs">
              {chatMessages.map(m => (
                <div key={m.id} className={`chat-bubble-wrap ${m.senderName.includes('Company') ? 'sent' : 'received'}`}>
                  <div className="bubble-meta">{m.senderName}</div>
                  <div className="bubble">{m.message}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {!isEmployee && (
              <div className="chat-input-area">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message…"
                  onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                />
                <button onClick={handleSendChatMessage}>➤</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {isSignModalOpen && (
        <div className="custom-modal-backdrop">
          <div className="signature-modal">
            <div className="modal-head">
              <h3>Apply Digital Signature</h3>
              <button type="button" className="close-btn" onClick={() => setIsSignModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <p className="modal-sub">
              By signing, you confirm that you are authorized to bind <strong>{parties?.partyA?.name || 'Company'}</strong> and agree to the finalized terms of the Master Agreement.
            </p>
            
            <div className="canvas-wrapper">
              <canvas 
                ref={canvasRef} 
                width={520} 
                height={200} 
                onMouseDown={startDrawing} 
                onMouseUp={stopDrawing} 
                onMouseLeave={stopDrawing} 
                onMouseMove={draw} 
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
              />
              <button type="button" className="canvas-clear" onClick={clearCanvas}>
                <Eraser size={14} /> Clear
              </button>
            </div>
            
            <div className="modal-foot">
              <button type="button" className="btn-cancel" onClick={() => setIsSignModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-confirm" onClick={handleConfirmSign} disabled={signing}>
                {signing ? 'Signing…' : 'Confirm & Sign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyWorkspace;