// src/pages/Client/ActiveProjectWorkspace.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ClientHeader from '../../components/Client/ClientHeader';
import './ActiveProjects.css';

interface ChatMessage {
  id: number;
  sender: string;
  time: string;
  text: string;
  type: 'incoming' | 'outgoing';
}

interface ContractDetails {
  id: string;
  title: string;
  companyName: string;
  contractType: string;
  content: string;
  totalValue: string;
  status: string;
  reviewerName: string;
  chatHistory: ChatMessage[];
}

// Mock DB for fallback / demo
const MOCK_DB: Record<string, ContractDetails> = {
  "proj_001": {
    id: "proj_001",
    title: "Annual Compliance Audit 2024",
    companyName: "Cairo Plaza Estates",
    contractType: "Audit Services Agreement",
    totalValue: "EGP 150,000",
    status: "In Review",
    reviewerName: "Dr. Ahmed Salem",
    content: `
      <h3 class="contract-title">ANNUAL COMPLIANCE AUDIT AGREEMENT</h3>
      <p class="contract-text"><strong>BETWEEN:</strong> Cairo Plaza Estates (The "Client") AND LegalReview AI (The "Auditor").</p>
      <h4 class="clause-header">1. SCOPE OF AUDIT</h4>
      <p class="contract-text">The Auditor shall review all financial records for the fiscal year 2023 in compliance with Egyptian Corporate Law No. 159 of 1981.</p>
    `,
    chatHistory: [
      { id: 1, sender: "Dr. Ahmed Salem", time: "09:00 AM", text: "I have started the initial review of the financial annexures.", type: "incoming" },
      { id: 2, sender: "You", time: "09:30 AM", text: "Please check if the tax filings match the new 2024 regulations.", type: "outgoing" }
    ]
  },
  "proj_002": {
    id: "proj_002",
    title: "Service Level Agreement Review",
    companyName: "Nile Bank Corp",
    contractType: "SLA Framework",
    totalValue: "USD 200,000",
    status: "Validation",
    reviewerName: "Counselor Nadia Zaki",
    content: `
      <h3 class="contract-title">SERVICE LEVEL AGREEMENT</h3>
      <p class="contract-text"><strong>EFFECTIVE DATE:</strong> Nov 04, 2023</p>
      <h4 class="clause-header">1. UPTIME GUARANTEE</h4>
      <p class="contract-text">Service Provider guarantees 99.9% uptime. Failure to meet this metric results in a 10% penalty credit.</p>
    `,
    chatHistory: [
      { id: 1, sender: "Counselor Nadia Zaki", time: "11:00 AM", text: "The Data Sovereignty clause looks solid.", type: "incoming" }
    ]
  },
  "default": {
    id: "unknown",
    title: "Generic Contract",
    companyName: "Unknown Client",
    contractType: "General Agreement",
    totalValue: "TBD",
    status: "Drafting",
    reviewerName: "Legal Team",
    content: `<p class="contract-text">Contract data loading...</p>`,
    chatHistory: []
  }
};

const ActiveProjectWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clickedProject = location.state?.project; // Project passed from OngoingProjects

  const [projectData, setProjectData] = useState<ContractDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  // Load project either from clicked project or fallback
  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      if (clickedProject) {
        // Map OngoingProjects structure to ContractDetails
        setProjectData({
          id: clickedProject.id,
          title: clickedProject.title,
          companyName: clickedProject.company,
          contractType: clickedProject.steps?.[0] || "Contract",
          content: "<p>Contract content will appear here...</p>",
          totalValue: "TBD",
          status: clickedProject.status,
          reviewerName: clickedProject.reviewer,
          chatHistory: []
        });
      } else {
        setProjectData(MOCK_DB["proj_001"]); // default project
      }
      setIsLoading(false);
    }, 500);
  }, [clickedProject]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fb' }}>
        <div className="spinner-border text-teal" role="status">Loading Workspace...</div>
      </div>
    );
  }

  if (!projectData) return <div>Project not found</div>;

  return (
    <div className="workspace-wrapper">
      <ClientHeader />

      <div className="workspace-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title">
            <h2>Active Project Workspace</h2>
            <p>
              Reviewing <strong>{projectData.contractType}</strong> for <span className="project-name">{projectData.companyName}</span>
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary active-doc">
              <i className="bi bi-file-text"></i> {projectData.contractType}
            </button>
            <button className="btn-secondary" onClick={() => navigate('/OngoingProjects')}>
              <i className="bi bi-arrow-left"></i> Back to List
            </button>
          </div>
        </div>

        <div className="main-grid">
          {/* LEFT COLUMN: Contract Viewer */}
          <div className="left-column">
            <div className="contract-viewer-card">
              <div className="document-toolbar">
                <span className="doc-label">DOCUMENT PREVIEW</span>
                <div className="doc-meta">
                  <span>Status: <strong style={{ color: '#0f8f83' }}>{projectData.status}</strong></span>
                  <span className="separator">|</span>
                  <span>Value: {projectData.totalValue}</span>
                </div>
              </div>

              <div className="contract-paper">
                <div dangerouslySetInnerHTML={{ __html: projectData.content }} />

                <div className="signature-section">
                  <div className="signature-block">
                    <div className="sign-line"></div>
                    <span>For {projectData.companyName}</span>
                  </div>
                  <div className="signature-block">
                    <div className="sign-line"></div>
                    <span>For Service Provider</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Chat & Actions */}
          <div className="right-column">
            <div className="card sticky-panel">
              <div className="collab-header">
                <div className="collab-title">
                  <i className="bi bi-chat-left-text-fill" style={{ color: '#0f8f83' }}></i> Collaboration Panel
                </div>
                <div className="online-dot"></div>
              </div>

              <div className="chat-container">
                {projectData.chatHistory.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px' }}>
                    No messages yet. Start the conversation!
                  </div>
                )}

                {projectData.chatHistory.map((msg) => (
                  <div key={msg.id} className={`chat-message message-${msg.type}`}>
                    <div className="chat-meta">{msg.sender} • {msg.time}</div>
                    <div className="chat-bubble">{msg.text}</div>
                  </div>
                ))}
              </div>

              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <i className="bi bi-send-fill send-icon"></i>
              </div>
            </div>

            <div className="card">
              <div className="action-card-header">
                <i className="bi bi-lock-fill"></i> Project Controls
              </div>
              <div style={{ fontSize: '13px', marginBottom: '16px', color: '#64748b' }}>
                Reviewer: <strong>{projectData.reviewerName}</strong>
              </div>
              <button className="btn-primary-action">
                <i className="bi bi-pen-fill"></i> Approve & Sign
              </button>
              <button className="btn-outline-action">
                <i className="bi bi-flag-fill"></i> Request Changes
              </button>
            </div>
          </div>
        </div>

        <div className="page-footer">
          © 2024 LexGuard AI — Secured Workspace
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectWorkspace;
