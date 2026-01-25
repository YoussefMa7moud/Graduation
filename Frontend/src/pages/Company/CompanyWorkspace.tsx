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
  const [complianceScore, setComplianceScore] = useState<number>(100);
  const [isValidatingAI, setIsValidatingAI] = useState(false);
  const [isValidatingOCL, setIsValidatingOCL] = useState(false);
  const [activeTab, setActiveTab] = useState<'intel' | 'chat'>('intel');
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ContractChatMessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Helper: De-duplicate Violations ---
  const getUniqueViolations = (list: ViolationDTO[]) => {
    return list.filter((v, index, self) =>
      index === self.findIndex((t) => (
        t.clauseId === v.clauseId && t.reason === v.reason
      ))
    );
  };

  // --- Logic: Apply Violations to Sections ---
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
            }
            if (results.complianceScore !== undefined) setComplianceScore(results.complianceScore);
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

  // --- Auto-save Logic ---
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
  const handleUpdate = (sId: string, cId: string, val: string) => {
    setSections(prev => prev.map(s => s.id === sId ? {
      ...s, clauses: s.clauses.map(c => c.id === cId ? { ...c, text: val, violation: undefined } : c)
    } : s));
    
    if (draft) {
      setDraft(prev => prev ? { ...prev, aiValidated: false, oclValidated: false } : prev);
      setViolations([]);
      setComplianceScore(100);
    }
  };

  const handleKeys = (e: React.KeyboardEvent, sIdx: number, cIdx: number) => {
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
      
      // FIX: Filter duplicates from the backend response
      const uniqueViolations = getUniqueViolations(result.violations);
      
      setViolations(uniqueViolations);
      setComplianceScore(result.complianceScore);
      applyViolationsToClauses(uniqueViolations);

      if (result.isValid) {
        toast.success('AI validation passed!');
      } else {
        toast.warning(`AI found ${uniqueViolations.length} unique issues.`);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'AI validation failed.');
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
      toast.error(e?.message || 'OCL validation failed.');
    } finally {
      setIsValidatingOCL(false);
    }
  };

  const handleSendToClient = async () => {
    if (!submissionId) return;
    if (!draft?.aiValidated || !draft?.oclValidated) {
      toast.error('Validate with AI and OCL first.');
      return;
    }
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

  // --- Polling for Chat ---
  useEffect(() => {
    if (!submissionId || activeTab !== 'chat') return;
    const interval = setInterval(async () => {
      try {
        const messages = await getChatMessages(submissionId);
        setChatMessages(messages);
      } catch (e) { console.error('Poll error', e); }
    }, 3000);
    return () => clearInterval(interval);
  }, [submissionId, activeTab]);

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ws-wrapper">
      <header className="ws-nav">
        <div className="nav-info">
          <span className="doc-label">Enterprise / <strong>Main Contract</strong></span>
          <div className="compliance-tag">EGY-LAW COMPLIANT ONLY</div>
        </div>
        <div className="nav-btns">
          <button className="btn-sec" onClick={handleValidateAI} disabled={isValidatingAI}>
            {isValidatingAI ? 'Validating...' : 'Validate using AI'}
          </button>
          <button className="btn-navy" onClick={handleValidateOCL} disabled={isValidatingOCL}>
            {isValidatingOCL ? 'Validating...' : 'Validate using OCL'}
          </button>
          {draft?.aiValidated && draft?.oclValidated && !draft?.sentToClient && (
            <button className="btn-success" onClick={handleSendToClient} style={{ marginLeft: '10px' }}>
              Send to Client
            </button>
          )}
        </div>
      </header>

      <div className="ws-content">
        <section className="editor-scroller">
          <div className="a4-page cover-page">
            <h1 className="cover-title">Software Development Agreement</h1>
            <div className="cover-grid">
              <div className="cover-block">
                <span className="cover-label">Prepared for:</span>
                <p>{parties?.partyB?.signatory || '[Client.Name]'}</p>
                <p><strong>{parties?.partyB?.name || '[Client.Company]'}</strong></p>
              </div>
              <div className="cover-block">
                <span className="cover-label">Prepared by:</span>
                <p>{parties?.partyA?.signatory || '[Sender.Name]'}</p>
                <p><strong>{parties?.partyA?.name || '[Sender.Company]'}</strong></p>
              </div>
            </div>
          </div>

          <div className="a4-page">
            <div className="locked-legal-text">
              <p>This Agreement governs the relationship between <strong>{parties?.partyA?.name || 'Developer'}</strong> and <strong>{parties?.partyB?.name || 'Client'}</strong>.</p>
              <div className="egypt-notice"><i className="bi bi-info-circle-fill me-2"></i> EGYPTIAN STATUTORY RULES APPLY.</div>
            </div>

            {sections.map((section, sIdx) => (
              <div key={section.id} className="section-container">
                <h3 className="section-h3">{section.num}. {section.title}</h3>
                {section.clauses.map((clause, cIdx) => (
                  <div key={clause.id} className="clause-row">
                    <span className="c-num">{section.num}.{cIdx + 1}</span>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <textarea
                        className={`c-input ${clause.violation ? 'violation-highlight' : ''}`}
                        value={clause.text}
                        onChange={(e) => handleUpdate(section.id, clause.id, e.target.value)}
                        onKeyDown={(e) => handleKeys(e, sIdx, cIdx)}
                        rows={1}
                        placeholder="Enter clause text..."
                      />
                      {clause.violation && (
                        <div className="violation-tooltip" title={`${clause.violation.reason}\nSuggestion: ${clause.violation.suggestion}`}>
                          <i className="bi bi-exclamation-triangle-fill text-danger"></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="signature-area">
              <div className="sig-row">
                <div className="sig-box"><span>Client Signature</span></div>
                <div className="sig-box"><span>Developer Signature</span></div>
              </div>
              <div className="sig-row mt-3">
                <div className="sig-date">Date: ____ / ____ / 2026</div>
                <div className="sig-date">Date: ____ / ____ / 2026</div>
              </div>
            </div>
          </div>
        </section>

        <aside className="ws-sidebar">
          <div className="tabs">
            <button className={activeTab === 'intel' ? 'active' : ''} onClick={() => setActiveTab('intel')}>Intelligence</button>
            <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>Collaboration</button>
          </div>
          <div className="side-body">
            {activeTab === 'intel' ? (
              <div className="intel-pane">
                <div className="risk-card">
                  <div className="d-flex justify-content-between">
                    <small>COMPLIANCE</small> 
                    <span className={complianceScore >= 90 ? "text-mint" : "text-warning"}>{complianceScore.toFixed(0)}%</span>
                  </div>
                  <div className="p-bar">
                    <div className="p-fill" style={{ width: `${complianceScore}%`, backgroundColor: complianceScore >= 90 ? '#00ff88' : '#ffaa00' }}></div>
                  </div>
                </div>
                {violations.length > 0 && (
                  <div className="violations-list" style={{ marginTop: '20px' }}>
                    <small style={{ fontWeight: 'bold', color: '#ff4444' }}>VIOLATIONS ({violations.length})</small>
                    {violations.map((v, idx) => (
                      <div key={idx} className="rule-item" style={{ color: '#ff4444', marginBottom: '10px' }}>
                        <i className="bi bi-x-circle-fill me-2"></i>
                        <strong>{v.clauseId}:</strong> {v.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="chat-pane">
                <div className="chat-msgs">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`msg ${msg.senderName.includes('Company') ? 'company' : 'client'}`}>
                      <strong>{msg.senderName}:</strong> {msg.message}
                    </div>
                  ))}
                </div>
                <div className="chat-input-wrap">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Message..." onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()} />
                  <button onClick={handleSendChatMessage}><i className="bi bi-send-fill"></i></button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompanyWorkspace;