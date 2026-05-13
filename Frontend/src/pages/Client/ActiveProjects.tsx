import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  getContractDraft, 
  getChatMessages, 
  sendChatMessage, 
  getContractParties,
  signClient,
  type ContractDraftResponse, 
  type ContractChatMessageDTO,
  type ContractPartiesResponse
} from '../../services/Contract/mainContract';
import { X, Eraser } from 'lucide-react';
import './ActiveProjects.css';
import './ActiveProjectsModal.css';
import '../Company/CompanyWorkspace.css';

const ActiveProjectWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project; 

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- State ---
  const [parties, setParties] = useState<ContractPartiesResponse | null>(null);
  const [draft, setDraft] = useState<ContractDraftResponse | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ContractChatMessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!project?.id) {
      toast.error("Project ID not found.");
      navigate('/OngoingProjects');
      return;
    }

    const loadWorkspaceData = async () => {
      setIsLoading(true);
      try {
        const [draft, messages, partiesRes] = await Promise.all([
          getContractDraft(project.id).catch(() => null),
          getChatMessages(project.id).catch(() => []),
          getContractParties(project.id).catch(() => null),
        ]);
        
        setParties(partiesRes);
        setChatMessages(messages);

        if (draft?.contractPayloadJson) {
          const payload = JSON.parse(draft.contractPayloadJson);
          if (payload.sections) setSections(payload.sections);
        }
        setDraft(draft);
      } catch (error) {
        toast.error("Failed to load workspace data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceData();
  }, [project?.id, navigate]);

  const internalScrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Poll for New Messages
  useEffect(() => {
    if (!project?.id || isLoading) return;
    const interval = setInterval(async () => {
      try {
        const freshMessages = await getChatMessages(project.id);
        // Only update state and scroll if the message count actually changed
        if (freshMessages.length !== chatMessages.length) {
          setChatMessages(freshMessages);
        }
      } catch (e) { console.error('Chat poll failed', e); }
    }, 4000);
    return () => clearInterval(interval);
  }, [project?.id, chatMessages.length, isLoading]);

  useEffect(() => {
    internalScrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !project?.id) return;
    setIsSending(true);
    try {
      const sentMsg = await sendChatMessage({ submissionId: project.id, message: newMessage.trim() });
      setChatMessages(prev => [...prev, sentMsg]);
      setNewMessage("");
      // Scroll immediately after sending
      setTimeout(internalScrollToBottom, 100);
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
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
    if (!project?.id) return;
    const base64 = getCanvasBase64();
    if (!base64.trim()) {
      toast.error('Please draw your signature first.');
      return;
    }
    setSigning(true);
    try {
      const draftRes = await signClient({ 
        submissionId: project.id, 
        signatureBase64: base64,
        contractPayloadJson: draft?.contractPayloadJson || "{}"
      });
      setDraft(draftRes);
      setIsSignModalOpen(false);
      toast.success('Your signature has been recorded. The company will now finalize the agreement.');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Signing failed.');
    } finally {
      setSigning(false);
    }
  };

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div><p>Loading Workspace...</p></div>;

  return (
    <div className="workspace-wrapper">
      <div className="workspace-container">
        {/* Header */}
        <div className="workspace-header">
          <div className="header-left">
            <h2 className="page-heading">Active Project Workspace</h2>
            <div className="breadcrumbs">
              <span className="crumb-text">Reviewing <strong>Agreement</strong> for</span>
              <span className="project-badge">{project?.company || "Company"}</span>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* LEFT COLUMN: Contract Viewer */}
          <div className="left-column">
            <div className="contract-viewer-panel">
              <div className="viewer-toolbar">
                <div className="toolbar-left">
                   <i className="bi bi-file-text-fill text-teal"></i>
                   <span className="doc-name">MASTER_AGREEMENT_V1.pdf</span>
                </div>
                <div className="toolbar-right">
                  <span className="status-indicator"><span className="dot"></span> {project?.status}</span>
                  <span className="divider"></span>
                  <span className="meta-text">Egyptian Jurisdiction</span>
                </div>
              </div>

              <div className="scrollable-viewer">
                <div className="document-container">
                  <div className="doc-page cover">
                    <h1 className="cover-title">Software Development Agreement</h1>
                    <div className="cover-grid">
                      <div className="cover-block">
                        <span className="cover-label">Prepared for:</span>
                        <p className="party-name">{parties?.partyB?.signatory || 'Authorized Representative'}</p>
                        <p className="party-company">{parties?.partyB?.name || project?.company}</p>
                      </div>
                      <div className="cover-block">
                        <span className="cover-label">Prepared by:</span>
                        <p className="party-name">{parties?.partyA?.signatory || 'Legal Counsel'}</p>
                        <p className="party-company">{parties?.partyA?.name || 'LegalReview AI'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="doc-page recitals-page">
                    <h2 className="formal-heading">RECITALS</h2>
                    <div className="formal-text">
                      <p>This Software Development Agreement (this <strong>"Agreement"</strong>) is made and entered into as of the date of final electronic signature (the <strong>"Effective Date"</strong>), by and between:</p>
                      <div className="party-details">
                        <p><strong>DEVELOPER:</strong> {parties?.partyA?.name || 'Developer Firm'}, represented by {parties?.partyA?.signatory || 'Representative'}</p>
                        <p><strong>CLIENT:</strong> {parties?.partyB?.name || project?.company}, represented by {parties?.partyB?.signatory || 'Representative'}</p>
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
                      <p className="arabic-text">يخضع هذا الاتفاق للقانون المصري وحده، ولا يخضع لأي تحكيم دولي.</p>
                      <div className="egypt-notice">
                        <i className="bi bi-shield-check-fill me-2"></i> 
                        ELECTRONIC SIGNATURES SUBJECT TO EGYPTIAN ITIDA REGULATIONS.
                      </div>
                    </div>

                    <h2 className="formal-heading center mt-4 mb-5">OPERATIVE PROVISIONS</h2>

                    {/* Sections and Clauses */}
                    {sections.map((section) => (
                      <div key={section.id} className="section-container">
                        <div className="section-header-row">
                          <h3 className="section-h3">{section.num}. {section.title}</h3>
                        </div>
                        {section.clauses.map((clause: any, cIdx: number) => (
                          <div key={clause.id} className="clause-row">
                            <span className="c-num">{section.num}.{cIdx + 1}</span>
                            <div className="clause-input-wrapper">
                              <div className="c-input static-clause-display">{clause.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    <div className="signature-area mt-5 pt-4" style={{borderTop: '2px solid #f1f5f9'}}>
                      <div className="d-flex justify-content-between">
                        <div style={{width: '40%', borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', alignItems: 'flex-end', height: '80px'}}>
                          <div className="w-100">
                            <span style={{fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px'}}>Client (Authorized Signatory)</span>
                            {draft?.clientSignedAt && (
                              <div className="text-success fw-bold">[Digitally Signed]</div>
                            )}
                          </div>
                        </div>
                        <div style={{width: '40%', borderBottom: '1px solid #0f172a', paddingBottom: '8px', display: 'flex', alignItems: 'flex-end', height: '80px'}}>
                          <div className="w-100">
                            <span style={{fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px'}}>Developer (Authorized Signatory)</span>
                            {draft?.companySignedAt && (
                              <div className="text-success fw-bold">[Digitally Signed]</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <div style={{fontWeight: 700, fontSize: '14px'}}>Dated: {draft?.clientSignedAt ? new Date(draft.clientSignedAt).toLocaleDateString('en-GB') : '_________'}</div>
                        <div style={{fontWeight: 700, fontSize: '14px'}}>Dated: {draft?.companySignedAt ? new Date(draft.companySignedAt).toLocaleDateString('en-GB') : '_________'}</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Chat & Actions */}
          <div className="right-column">
            {/* Chat Panel */}
            <div className="card chat-card">
              <div className="card-header-custom">
                <div className="header-title">
                  <i className="bi bi-chat-left-text-fill text-teal"></i> Collaboration
                </div>
                <div className="online-indicator"></div>
              </div>

              {/* Added ref and internal scrolling logic here */}
              <div className="chat-area" ref={chatContainerRef}>
                {chatMessages.length === 0 ? (
                  <div className="empty-chat">No messages yet.</div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble-row ${!msg.senderName.includes('Company') ? 'outgoing' : 'incoming'}`}>
                      <div className="chat-meta">
                        {msg.senderName} <span className="time">• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="chat-bubble">{msg.message}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="chat-input-row">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isSending}
                />
                <button className="send-btn" onClick={handleSendMessage} disabled={isSending}>
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="card actions-card">
              <div className="card-header-custom">
                <div className="header-title">
                  <i className="bi bi-shield-lock-fill text-teal"></i> Project Controls
                </div>
              </div>
              
              <div className="reviewer-info">
                 <small>ASSIGNED REVIEWER</small>
                 <strong>{parties?.partyA?.name || "Legal Team"}</strong>
              </div>

              <div className="action-buttons">
                {draft?.sentToClient && !draft?.clientSignedAt ? (
                  <button className="btn-primary-block" onClick={() => setIsSignModalOpen(true)}>
                    <i className="bi bi-pen-fill"></i> Approve & Sign
                  </button>
                ) : draft?.clientSignedAt && !draft?.companySignedAt ? (
                  <button className="btn-primary-block" disabled style={{ opacity: 0.7 }}>
                    <i className="bi bi-clock-fill"></i> Waiting for Company
                  </button>
                ) : draft?.companySignedAt ? (
                  <button className="btn-success w-100" disabled style={{ opacity: 0.9 }}>
                    <i className="bi bi-check-circle-fill"></i> Fully Executed
                  </button>
                ) : (
                  <button className="btn-primary-block" disabled style={{ opacity: 0.5 }}>
                    <i className="bi bi-lock-fill"></i> Agreement Locked
                  </button>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>

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
              By signing, you confirm that you are authorized to bind <strong>{parties?.partyB?.name || 'Client'}</strong> and agree to the finalized terms of the Master Agreement.
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
};

export default ActiveProjectWorkspace;