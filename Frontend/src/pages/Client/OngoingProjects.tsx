import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyActiveSubmissions } from '../../services/Client/RetriveSubmitions'; 
import { withdrawSubmission } from '../../services/Client/withdrawSubmission';
import { getContractDraft, getChatMessages, sendChatMessage, type ContractDraftResponse, type ContractChatMessageDTO } from '../../services/Contract/mainContract';
import { toast } from 'react-toastify';
import './OngoingProjects.css';

interface Project {
  id: number;
  title: string;
  company: string;
  status: string;
  rawStatus: string; 
  progress: number;
  steps: string[];
  activeStep: number;
  startDate: string;
  reviewer: string;
  statusType: 'neutral' | 'success' | 'warning' | 'danger';
  feedback?: string; 
}

const OngoingProjects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [contractDrafts, setContractDrafts] = useState<Record<number, ContractDraftResponse>>({});
  const [chatMessages, setChatMessages] = useState<Record<number, ContractChatMessageDTO[]>>({});
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({});

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getMyActiveSubmissions();
      const filteredData = data.filter((item: any) => item.status !== "COMPLETED");
      const mappedData = filteredData.map((item: any) => mapBackendToUI(item));
      setProjects(mappedData);
    } catch (error) {
      toast.error("Failed to fetch ongoing projects.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refined Mapping Logic for Lifecycle Steps
   */
  const mapBackendToUI = (submission: any): Project => {
    const s = submission.status; 
    let stepOneLabel = "Submission";
    let activeStep = 0;
    let progress = 0;
    let statusType: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';

    // 1. WAITING FOR NDA (New Initial Step)
    if (s === "WAITING_FOR_NDA") {
      activeStep = 0;
      progress = 30; // "Little progress" as requested
      stepOneLabel = "Waiting for NDA";
      statusType = 'warning';
    } 
    // 2. OTHER INITIAL STATES
    else if (["WAITING_FOR_COMPANY", "REJECTED", "REJECTED_WITH_NOTE", "RESUBMITTED"].includes(s)) {
      activeStep = 0;
      progress = 20;
      stepOneLabel = s.replace(/_/g, ' '); 
      if (s.includes("REJECTED")) statusType = 'danger';
      else if (s === "WAITING_FOR_COMPANY") statusType = 'warning';
      else statusType = 'success'; // Resubmitted
    } 
    // 3. MIDDLE & FINAL STEPS
    else if (s === "ACCEPTED") {
      activeStep = 1; progress = 40; statusType = 'success';
    } else if (s === "CONSTRUCTING_CONTRACT" || s === "REVIEWING") {
      activeStep = 2; progress = 60; statusType = 'success';
    } else if (s === "VALIDATION") {
      activeStep = 3; progress = 80; statusType = 'success';
    } else if (s === "WAITING_FOR_SIGNING" || s === "SIGNING") {
      activeStep = 4; progress = 100; statusType = 'success';
    }

    return {
      id: submission.id,
      title: submission.proposalTitle,
      company: submission.companyName,
      status: s.replace(/_/g, ' '), 
      rawStatus: s, 
      progress: progress,
      steps: [stepOneLabel, "Accepted", "Reviewing", "Validation", "Signing"],
      activeStep: activeStep,
      startDate: new Date(submission.updatedAt).toLocaleDateString(),
      reviewer: submission.companyName, 
      statusType: statusType,
      feedback: submission.rejectionNote 
    };
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Refined Navigation Handler
   */
  const handleManageContracts = (p: Project) => {
    switch (p.rawStatus) {
      case 'WAITING_FOR_NDA':
        // Navigate to the NDA Signing page
        navigate('/NDASigning', { state: { project: p } });
        break;
      case 'REJECTED_WITH_NOTE':
        // Navigate to the feedback/resubmit page
        navigate('/ProposalFeedback', { state: { project: p } });
        break;
      case 'WAITING_FOR_SIGNING':
      case 'SIGNING':
      case 'VALIDATION':
      case 'CONSTRUCTING_CONTRACT':
        // Navigate to the Active Contract Workspace
        navigate('/ActiveProjects', { state: { project: p } });
        break;
      default:
        // Default navigation
        navigate('/ActiveProjects', { state: { project: p } });
    }
  };

  const handleWithdraw = async (submissionId: number) => {
    if (!window.confirm("Are you sure you want to withdraw this proposal?")) return;
    setIsProcessing(true);
    try {
      await withdrawSubmission(submissionId);
      toast.success("Proposal withdrawn successfully");
      fetchProjects(); 
    } catch (error) {
      toast.error("Failed to withdraw proposal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpandProject = async (projectId: number) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
      return;
    }

    setExpandedProject(projectId);
    
    // Load contract draft and chat messages
    try {
      const [draft, messages] = await Promise.all([
        getContractDraft(projectId).catch(() => null),
        getChatMessages(projectId).catch(() => []),
      ]);
      
      setContractDrafts(prev => ({ ...prev, [projectId]: draft || {} as ContractDraftResponse }));
      setChatMessages(prev => ({ ...prev, [projectId]: messages }));
    } catch (e: any) {
      console.error('Failed to load contract data', e);
    }
  };

  const handleSendChatMessage = async (projectId: number) => {
    const message = chatInputs[projectId]?.trim();
    if (!message) return;

    try {
      const newMessage = await sendChatMessage({
        submissionId: projectId,
        message,
      });
      setChatMessages(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newMessage],
      }));
      setChatInputs(prev => ({ ...prev, [projectId]: '' }));
    } catch (e: any) {
      toast.error('Failed to send message.');
    }
  };

  // Poll for new chat messages when project is expanded
  useEffect(() => {
    if (!expandedProject) return;

    const interval = setInterval(async () => {
      try {
        const messages = await getChatMessages(expandedProject);
        setChatMessages(prev => ({ ...prev, [expandedProject]: messages }));
      } catch (e) {
        console.error('Failed to fetch chat messages', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [expandedProject]);

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="ongoing-container container">
      <h2 className="page-title">Ongoing Client Projects</h2>
      <p className="page-subtitle">Track your project status across the lifecycle.</p>

      {projects.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No ongoing projects found.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => {
            // Manage is disabled if we are waiting on the company or just resubmitted
            const isManageDisabled = p.rawStatus === "WAITING_FOR_COMPANY" || p.rawStatus === "RESUBMITTED";
            
            // Withdraw is enabled for initial stages
            const showWithdraw = ["WAITING_FOR_COMPANY", "RESUBMITTED", "WAITING_FOR_NDA"].includes(p.rawStatus);

            const showContractPreview = p.rawStatus === "CONSTRUCTING_CONTRACT" || p.rawStatus === "REVIEWING" || p.rawStatus === "VALIDATION";
            const isExpanded = expandedProject === p.id;
            const draft = contractDrafts[p.id];
            const messages = chatMessages[p.id] || [];

            return (
              <div className="project-card" key={p.id}>
                <div className="card-header">
                  <h3>{p.title}</h3>
                  <span className={`badge status-${p.statusType}`}>{p.status}</span>
                </div>
                <span className="company-name">{p.company}</span>

                <div className="progress">
                  <span>PROGRESS</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-fill bg-${p.statusType}`} style={{ width: `${p.progress}%` }}></div>
                </div>

                <div className="steps">
                  {p.steps.map((s, idx) => (
                    <div key={idx} className={`step ${idx <= p.activeStep ? "done" : ""} ${idx === 0 ? `step-one-${p.statusType}` : ""}`}>
                      <div className="dot-wrapper">
                        <span className="dot" />
                        {idx !== p.steps.length - 1 && (
                          <span className={`line ${idx < p.activeStep ? "active" : ""}`} />
                        )}
                      </div>
                      <span className="step-label">{s}</span>
                    </div>
                  ))}
                </div>

                <div className="meta">
                  <div><small>LAST UPDATE</small><strong>{p.startDate}</strong></div>
                  <div><small>ASSIGNED COMPANY</small><strong>{p.reviewer}</strong></div>
                </div>

                <div className="card-actions d-flex gap-2">
                  <button 
                    className="primary flex-grow-1" 
                    onClick={() => handleManageContracts(p)}
                    disabled={isManageDisabled || isProcessing}
                    style={{ 
                      opacity: isManageDisabled ? 0.5 : 1, 
                      cursor: isManageDisabled ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {isManageDisabled ? 'Action Pending' : 'Manage Project'}
                  </button>

                  {showWithdraw && (
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleWithdraw(p.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Withdraw Proposal'}
                    </button>
                  )}

                  {showContractPreview && (
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => handleExpandProject(p.id)}
                    >
                      {isExpanded ? 'Hide Preview' : 'View Contract & Chat'}
                    </button>
                  )}
                </div>

                {isExpanded && showContractPreview && (
                  <div className="contract-preview-section" style={{ marginTop: '20px', padding: '20px', borderTop: '1px solid #dee2e6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {/* Contract Preview */}
                      <div>
                        <h5 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Contract Preview</h5>
                        <div style={{ 
                          background: '#f8f9fa', 
                          padding: '15px', 
                          borderRadius: '8px', 
                          maxHeight: '400px', 
                          overflowY: 'auto',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}>
                          {draft?.contractPayloadJson ? (
                            (() => {
                              try {
                                const payload = JSON.parse(draft.contractPayloadJson);
                                if (payload.sections && Array.isArray(payload.sections)) {
                                  return payload.sections.map((section: any, idx: number) => (
                                    <div key={idx} style={{ marginBottom: '20px' }}>
                                      <h6 style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                        {section.num}. {section.title}
                                      </h6>
                                      {section.clauses?.map((clause: any, cIdx: number) => (
                                        <p key={cIdx} style={{ marginBottom: '8px', paddingLeft: '15px' }}>
                                          {section.num}.{cIdx + 1} {clause.text}
                                        </p>
                                      ))}
                                    </div>
                                  ));
                                }
                                return <p>Contract content loading...</p>;
                              } catch (e) {
                                return <p>Contract preview unavailable</p>;
                              }
                            })()
                          ) : (
                            <p>No contract draft available yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Chat Section */}
                      <div>
                        <h5 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Request Modifications</h5>
                        <div style={{ 
                          background: '#f8f9fa', 
                          padding: '15px', 
                          borderRadius: '8px', 
                          maxHeight: '300px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ 
                            flex: 1, 
                            overflowY: 'auto', 
                            marginBottom: '15px',
                            minHeight: '200px'
                          }}>
                            {messages.length === 0 ? (
                              <p style={{ fontSize: '14px', color: '#6c757d', fontStyle: 'italic' }}>
                                No messages yet. Request modifications here.
                              </p>
                            ) : (
                              messages.map((msg) => (
                                <div 
                                  key={msg.id} 
                                  style={{ 
                                    marginBottom: '10px',
                                    padding: '8px',
                                    background: msg.senderName.includes('Company') ? '#e0f2fe' : '#f0fdf4',
                                    borderRadius: '6px',
                                    fontSize: '13px'
                                  }}
                                >
                                  <strong>{msg.senderName}:</strong> {msg.message}
                                  <small style={{ display: 'block', marginTop: '5px', opacity: 0.7 }}>
                                    {new Date(msg.createdAt).toLocaleString()}
                                  </small>
                                </div>
                              ))
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="text"
                              placeholder="Type your message..."
                              value={chatInputs[p.id] || ''}
                              onChange={(e) => setChatInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendChatMessage(p.id);
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              onClick={() => handleSendChatMessage(p.id)}
                              style={{
                                padding: '8px 15px',
                                background: '#17253b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OngoingProjects;