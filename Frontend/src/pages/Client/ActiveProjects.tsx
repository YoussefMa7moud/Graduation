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

  // --- Initial Data Load ---
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

  // --- FIXED CHAT SCROLL LOGIC ---
  // We target the scrollTop of the container specifically to prevent global page jumps
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

  // Scroll only when chatMessages array changes
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
                <div className="contract-paper-stack">
                  <div className="contract-page">
                    
                    {/* Cover Page */}
                    <div className="template-cover">
                      <h1 className="template-title">Software Development Agreement</h1>
                      <div className="template-parties-grid">
                        <div className="party-block">
                          <label>Prepared for:</label>
                          <strong>{parties?.partyB?.signatory || 'Authorized Representative'}</strong>
                          <span>{parties?.partyB?.name || project?.company}</span>
                        </div>
                        <div className="party-block">
                          <label>Prepared by:</label>
                          <strong>{parties?.partyA?.signatory || 'Legal Counsel'}</strong>
                          <span>{parties?.partyA?.name || 'LegalReview AI'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Legal Box */}
                    <div className="legal-governance-box">
                      <p>This Agreement is governed exclusively by the laws of the Arab Republic of Egypt, is not subject to international arbitration, and any dispute shall be resolved solely by Egyptian courts.</p>
                      <p className="arabic-text">يخضع هذا الاتفاق للقانون المصري وحده، ولا يخضع لأي تحكيم دولي.</p>
                    </div>

                    {/* Sections and Clauses */}
                    {sections.map((section) => (
                      <div key={section.id} className="template-section">
                        <h3 className="section-title">{section.num}. {section.title}</h3>
                        {section.clauses.map((clause: any, cIdx: number) => (
                          <div key={clause.id} className="clause-row">
                            <span className="clause-number">{section.num}.{cIdx + 1}</span>
                            <div className="clause-content">{clause.text}</div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Signature Block */}
                    <div className="template-signatures">
                      <div className="sig-line">
                        <div className="line"></div>
                        <label>Client (Authorized Signatory)</label>
                        {draft?.clientSignedAt ? (
                          <div className="text-success fw-bold">[Digitally Signed]</div>
                        ) : (
                          <div className="sig-date">Date: _________</div>
                        )}
                      </div>
                      <div className="sig-line">
                        <div className="line"></div>
                        <label>Developer (Authorized Signatory)</label>
                        {draft?.companySignedAt ? (
                          <div className="text-success fw-bold">[Digitally Signed]</div>
                        ) : (
                          <div className="sig-date">Date: _________</div>
                        )}
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