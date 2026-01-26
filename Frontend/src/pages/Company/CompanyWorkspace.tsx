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
} from '../../services/Contract/mainContract';
import './CompanyWorkspace.css';

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
  const [isValidatingOCL, setIsValidatingOCL] = useState(false);
  const [activeTab, setActiveTab] = useState<'intel' | 'chat'>('intel');
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ContractChatMessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            const payload = JSON.parse(draftRes.contractPayloadJson);
            if (payload.sections) setSections(payload.sections);
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

  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  // --- Auto-save ---
  const saveDraft = useCallback(async () => {
    if (!submissionId) return;
    const contractPayload = JSON.stringify({ sections });
    try {
      const savedDraft = await saveContractDraft({
        submissionId,
        contractPayloadJson: contractPayload,
      });
      setDraft(savedDraft);
    } catch (e) { console.error('Auto-save failed', e); }
  }, [submissionId, sections]);

  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => saveDraft(), 2000);
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
  }, [sections, saveDraft]);

  // --- Handlers ---
  const handleUpdate = (sId: string, cId: string, val: string, target: HTMLTextAreaElement) => {
    if (sId === 's10') return;

    target.style.height = 'inherit';
    target.style.height = `${target.scrollHeight}px`;

    setSections(prev => prev.map(s => s.id === sId ? {
      ...s, clauses: s.clauses.map(c => c.id === cId ? { ...c, text: val, violation: undefined } : c)
    } : s));
    
    if (isValidated) {
      setIsValidated(false);
      setViolations([]);
    }
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
      const newSections = [...sections];
      newSections[sIdx].clauses.splice(cIdx + 1, 0, { id: `cl-${Date.now()}`, text: "" });
      setSections(newSections);
    } else if (e.key === 'Backspace' && sections[sIdx].clauses[cIdx].text === "" && sections[sIdx].clauses.length > 1) {
      e.preventDefault();
      const newSections = [...sections];
      newSections[sIdx].clauses.splice(cIdx, 1);
      setSections(newSections);
    }
  };

  const handleValidateAI = async () => {
    if (!submissionId) return;
    setIsValidatingAI(true);
    try {
      await saveDraft();
      const result = await validateWithAI(submissionId);
      const uniqueViolations = getUniqueViolations(result.violations);
      
      setViolations(uniqueViolations);
      applyViolationsToClauses(uniqueViolations);
      setIsValidated(true);

      if (result.isValid) {
        toast.success('AI validation passed!');
      } else {
        toast.warning(`AI found ${uniqueViolations.length} issues.`);
      }
    } catch (e: any) {
      toast.error('AI validation failed.');
    } finally {
      setIsValidatingAI(false);
    }
  };

  const handleValidateOCL = async () => {
    if (!submissionId) return;
    setIsValidatingOCL(true);
    try {
      const result = await validateWithOCL(submissionId);
      if (result.isValid) toast.success('OCL validation approved!');
    } catch (e: any) {
      toast.error('OCL validation failed.');
    } finally {
      setIsValidatingOCL(false);
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

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ws-wrapper">
      <header className="ws-nav">
        <div className="nav-info">
          <span className="doc-label">Legal Workspace / <strong>{parties?.partyA?.name || 'Contract'}</strong></span>
          <div className="compliance-tag">This Contract is governed exclusively by the laws of Egypt.</div>
        </div>
        <div className="nav-btns">
          <button className="btn-sec" onClick={handleValidateAI} disabled={isValidatingAI}>
            {isValidatingAI ? 'Analyzing...' : 'AI Legal Check'}
          </button>
          <button className="btn-navy" onClick={handleValidateOCL} disabled={isValidatingOCL}>
            {isValidatingOCL ? 'Verifying...' : 'OCL Validation'}
          </button>
          {draft?.aiValidated && draft?.oclValidated && !draft?.sentToClient && (
            <button className="btn-success" onClick={handleSendToClient} style={{ marginLeft: '10px' }}>
              Finalize & Send
            </button>
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

            <div className="doc-page body">
              <div className="locked-legal-text">
                <p>This Agreement is governed exclusively by the laws of the Arab Republic of Egypt, is not subject to international arbitration, and any dispute shall be resolved solely by Egyptian courts.</p>
                <p>يخضع هذا الاتفاق للقانون المصري وحده، ولا يخضع لأي تحكيم دولي.</p>
                <div className="egypt-notice">
                  <i className="bi bi-shield-check-fill me-2"></i> 
                  ELECTRONIC SIGNATURES SUBJECT TO EGYPTIAN ITIDA REGULATIONS.
                </div>
              </div>

              {sections.map((section, sIdx) => (
                <div key={section.id} className="section-container">
                  <h3 className="section-h3">{section.num}. {section.title}</h3>
                  {section.clauses.map((clause, cIdx) => (
                    <div key={clause.id} className={`clause-row ${clause.violation ? 'has-issue' : ''}`}>
                      <span className="c-num">{section.num}.{cIdx + 1}</span>
                      <div className="clause-input-wrapper">
                        {section.id === 's10' ? (
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

              <div className="signature-area">
                <div className="sig-row">
                  <div className="sig-box"><span>Client (Authorized Signatory)</span></div>
                  <div className="sig-box"><span>Developer (Authorized Signatory)</span></div>
                </div>
                <div className="sig-row mt-4">
                  <div className="sig-date">Dated: {new Date().toLocaleDateString('en-GB')}</div>
                  <div className="sig-date">Dated: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="ws-sidebar">
          <div className="tabs">
            <button className={activeTab === 'intel' ? 'active' : ''} onClick={() => setActiveTab('intel')}>
              <i className="bi bi-cpu-fill me-2"></i> Intelligence
            </button>
            <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
              <i className="bi bi-chat-dots-fill me-2"></i> Collaboration
            </button>
          </div>

          <div className="side-body">
            {activeTab === 'intel' && (
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
                  <div className="intel-placeholder">
                    <div className="spinner-border text-primary mb-3"></div>
                    <h4>Analyzing...</h4>
                    <p>Reviewing clauses against legal frameworks.</p>
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
                      <div key={i} className="violation-card">
                        <div className="v-header">
                          <span className="v-id">Clause {resolveClauseNumber(v.clauseId)}</span>
                          <span className="v-severity">High Risk</span>
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
            )}

            {activeTab === 'chat' && (
              <div className="chat-pane">
                <div className="chat-msgs">
                  {chatMessages.map(m => (
                    <div key={m.id} className={`chat-bubble-wrap ${m.senderName.includes('Company') ? 'sent' : 'received'}`}>
                      <div className="bubble-meta">{m.senderName}</div>
                      <div className="bubble">{m.message}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-area">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message…"
                    onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                  />
                  <button onClick={handleSendChatMessage}>➤</button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CompanyWorkspace;