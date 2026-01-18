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
      <p class="contract-text">The Auditor shall review all financial records for the fiscal year 2023 in compliance with Egyptian Corporate Law No. 159 of 1981. The audit will encompass balance sheets, income statements, and cash flow statements.</p>
      <h4 class="clause-header">2. ACCESS TO RECORDS</h4>
      <p class="contract-text">The Client agrees to provide the Auditor with full and unrestricted access to all books, accounts, and vouchers. Failure to provide access within 5 business days will result in a project delay penalty.</p>
      <h4 class="clause-header highlight-clause">3. CONFIDENTIALITY</h4>
      <p class="contract-text">The Auditor agrees to keep all findings strictly confidential. No data shall be shared with third parties without written consent from the Client.</p>
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
      <p class="contract-text">Service Provider guarantees 99.9% uptime. Failure to meet this metric results in a 10% penalty credit applied to the next billing cycle.</p>
      <h4 class="clause-header highlight-clause">2. DATA SOVEREIGNTY</h4>
      <p class="contract-text">All data must be stored on servers physically located within the Arab Republic of Egypt.</p>
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
  const clickedProject = location.state?.project; 

  const [projectData, setProjectData] = useState<ContractDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Logic: If passed via navigation state, use that ID, otherwise fallback to mock
      const targetId = clickedProject?.id || "proj_001";
      const data = MOCK_DB[targetId] || MOCK_DB["proj_001"];
      
      setProjectData(data);
      setIsLoading(false);
    }, 600);
  }, [clickedProject]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Workspace...</p>
      </div>
    );
  }

  if (!projectData) return <div>Project not found</div>;

  return (
    <div className="workspace-wrapper">
      <ClientHeader />

      <div className="workspace-container">
        {/* Page Header */}
        <div className="workspace-header">
          <div className="header-left">
            <h2 className="page-heading">Active Project Workspace</h2>
            <div className="breadcrumbs">
              <span className="crumb-text">Reviewing <strong>{projectData.contractType}</strong> for</span>
              <span className="project-badge">{projectData.companyName}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary active">
              <i className="bi bi-file-earmark-text"></i> Agreement
            </button>
            <button className="btn-secondary">
              <i className="bi bi-paperclip"></i> Attachments
            </button>
            <button className="btn-secondary">
              <i className="bi bi-download"></i> Export PDF
            </button>
          </div>
        </div>

        <div className="main-grid">
          {/* LEFT COLUMN: Contract Viewer */}
          <div className="left-column">
            <div className="contract-viewer-panel">
              <div className="viewer-toolbar">
                <div className="toolbar-left">
                   <i className="bi bi-file-text-fill text-teal"></i>
                   <span className="doc-name">MASTER SERVICE AGREEMENT_v3.pdf</span>
                </div>
                <div className="toolbar-right">
                  <span className="status-indicator">
                    <span className="dot"></span> {projectData.status}
                  </span>
                  <span className="divider"></span>
                  <span className="meta-text">Page 1 of 4</span>
                </div>
              </div>

              <div className="scrollable-viewer">
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
          </div>

          {/* RIGHT COLUMN: Chat & Actions */}
          <div className="right-column">
            {/* Chat Panel */}
            <div className="card chat-card">
              <div className="card-header-custom">
                <div className="header-title">
                  <i className="bi bi-chat-left-text-fill text-teal"></i>
                  Collaboration
                </div>
                <div className="online-indicator"></div>
              </div>

              <div className="chat-area">
                {projectData.chatHistory.length === 0 ? (
                  <div className="empty-chat">No messages yet.</div>
                ) : (
                  projectData.chatHistory.map((msg) => (
                    <div key={msg.id} className={`chat-bubble-row ${msg.type}`}>
                      <div className="chat-meta">
                        {msg.sender} <span className="time">• {msg.time}</span>
                      </div>
                      <div className="chat-bubble">{msg.text}</div>
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
                />
                <button className="send-btn">
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="card actions-card">
              <div className="card-header-custom">
                <div className="header-title">
                  <i className="bi bi-shield-lock-fill text-teal"></i>
                  Project Controls
                </div>
              </div>
              
              <div className="reviewer-info">
                 <small>ASSIGNED REVIEWER</small>
                 <strong>{projectData.reviewerName}</strong>
              </div>

              <div className="action-buttons">
                <button className="btn-primary-block">
                  <i className="bi bi-pen-fill"></i> Approve & Sign
                </button>
                <button className="btn-outline-block">
                  <i className="bi bi-flag-fill"></i> Request Changes
                </button>
              </div>
              
              <div className="footer-estimate">
                Est. Completion: Oct 25, 2024
              </div>
            </div>
          </div>
        </div>

        <div className="page-footer">
          © 2024 LexGuard AI — Secured Workspace v8.1.0
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectWorkspace;