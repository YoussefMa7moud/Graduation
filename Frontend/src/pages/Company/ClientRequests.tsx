import React, { useState, useEffect, useRef } from 'react';
import { submissionService } from '../../services/Company/Proposlals'; 
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ClientRequests.css';

const ClientRequests: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const pdfExportRef = useRef<HTMLDivElement>(null);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineType, setDeclineType] = useState<'delete' | 'note'>('delete');
  const [rejectionNote, setRejectionNote] = useState('');

  // Define allowed statuses for this view
  const ALLOWED_STATUSES = ['WAITING_FOR_COMPANY', 'WAITING_FOR_NDA', 'REJECTED_WITH_NOTE', 'RESUBMITTED'];

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await submissionService.getCompanyQueue();
      // Filter the results based on your specific requirements
      const filtered = (res || []).filter((sub: any) => ALLOWED_STATUSES.includes(sub.status));
      setSubmissions(filtered); 
    } catch (err) {
      console.error("Failed to load submissions:", err);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_COMPANY': return 'status-waiting-company'; // Green
      case 'WAITING_FOR_NDA': return 'status-waiting-nda';       // Blue
      case 'REJECTED_WITH_NOTE': return 'status-rejected-note';   // Red
      case 'RESUBMITTED': return 'status-resubmitted';            // Yellow
      default: return 'bg-light text-dark';
    }
  };

  const handleSaveAsPDF = async () => {
    if (!selectedSub || !pdfExportRef.current) return;
    const element = pdfExportRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedSub.proposalTitle}_Specification.pdf`);
  };

  const handleAccept = async (sub: any) => {
    const nextStatus = sub.ndaRequired ? 'WAITING_FOR_NDA' : 'ACCEPTED';
    try {
      await submissionService.updateStatus(sub.id, nextStatus);
      loadSubmissions();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!selectedSub) return;
    try {
      if (declineType === 'delete') {
        await submissionService.deleteSubmission(selectedSub.id);
      } else {
        await submissionService.updateStatus(selectedSub.id, 'REJECTED_WITH_NOTE', rejectionNote);
      }
      setShowDeclineModal(false);
      setRejectionNote('');
      loadSubmissions();
    } catch (err) {
      console.error("Decline action failed", err);
    }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark m-0">Project Requests</h2>
        <p className="text-muted small">Manage and review incoming software development proposals.</p>
      </div>

      <div className="projects-table-card overflow-hidden shadow-sm border rounded-3">
        <table className="table align-middle mb-0">
          <thead className="bg-light text-uppercase small fw-bold">
            <tr>
              <th className="ps-4 py-3">Project Title</th>
              <th>Client / Company</th>
              <th>Proposed At</th>
              <th className="text-center">Status</th>
              <th className="text-center pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => {
              // Action buttons are disabled for these specific states
              const actionsDisabled = ['WAITING_FOR_NDA', 'REJECTED_WITH_NOTE'].includes(sub.status);

              return (
                <tr key={sub.id} className="border-bottom">
                  <td className="ps-4 py-4">
                    <div className="fw-bold text-dark">{sub.proposalTitle}</div>
                    <button 
                      className="btn btn-link btn-sm p-0 text-decoration-none mt-1 fw-bold"
                      onClick={() => { setSelectedSub(sub); setShowViewModal(true); }}
                    >
                      VIEW SPECIFICATIONS <i className="bi bi-arrow-right"></i>
                    </button>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{sub.clientCompanyName || sub.clientName}</div>
                    <div className="text-muted small">{sub.clientType}</div>
                  </td>
                  <td className="small text-muted">
                    {sub.proposedAt ? new Date(sub.proposedAt).toLocaleDateString('en-GB') : 'N/A'}
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${getStatusBadgeClass(sub.status)}`}>
                      {sub.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="pe-4 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button 
                        className={`btn-action btn-decline ${actionsDisabled ? 'disabled-btn' : ''}`} 
                        onClick={() => { 
                          if (!actionsDisabled) {
                            setSelectedSub(sub);
                            setShowDeclineModal(true);
                          }
                        }}
                        disabled={actionsDisabled}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <button 
                        className={`btn-action btn-accept ${actionsDisabled ? 'disabled-btn' : ''}`} 
                        onClick={() => {
                          if (!actionsDisabled) handleAccept(sub);
                        }}
                        disabled={actionsDisabled}
                      >
                        <i className="bi bi-check2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <div className="p-5 text-center text-muted">No pending requests matching the criteria.</div>
        )}
      </div>

      {/* --- DETAILED PROPOSAL DOCUMENT MODAL --- */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="xl" centered scrollable>
        <Modal.Body className="proposal-modal-content p-0">
          <div className="proposal-document" ref={pdfExportRef}>
            <div className="pdf-header-accent">
              <div className="doc-label">Official Project Specification</div>
              <h1 className="fw-bold mb-3">{selectedSub?.proposalTitle}</h1>
              <div className="d-flex justify-content-center">
                <span className="pdf-badge badge-type">{selectedSub?.projectType}</span>
                <span className="pdf-badge badge-scale">{selectedSub?.scalability} Scale</span>
              </div>
            </div>

            <div className={`nda-standalone-alert ${selectedSub?.ndaRequired ? 'nda-required' : 'nda-standard'}`}>
              <div className="d-flex align-items-center gap-3">
                <i className={`bi ${selectedSub?.ndaRequired ? 'bi-lock-fill' : 'bi-unlock'}`} style={{fontSize: '24px'}}></i>
                <div>
                  <div className="fw-bold small text-uppercase">Confidentiality Level</div>
                  <div className="fw-bold h5 mb-0">
                    {selectedSub?.ndaRequired ? "NDA Required Prior to Disclosure" : "Standard Disclosure Protocol"}
                  </div>
                </div>
              </div>
            </div>

            <div className="doc-grid mb-5">
              <div className="data-item">
                <div className="data-label">Client Name</div>
                <div className="fw-bold">{selectedSub?.clientCompanyName || selectedSub?.clientName}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Project Budget</div>
                <div className="fw-bold text-success">${selectedSub?.budgetUsd?.toLocaleString()}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Intellectual Property</div>
                <div className="fw-bold">{selectedSub?.codeOwnership}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Est. Duration</div>
                <div className="fw-bold">{selectedSub?.durationDays} Days</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="data-label">Problem Context</div>
              <div className="long-text-area">{selectedSub?.problemSolved}</div>
            </div>

            <div className="mb-4">
              <div className="data-label">Main Features</div>
              <div className="long-text-area">{selectedSub?.mainFeatures}</div>
            </div>

            <div className="mb-5 border-top pt-4">
              <div className="data-label">Full Technical Description</div>
              <div className="long-text-area">{selectedSub?.content}</div>
            </div>
          </div>

          <div className="p-4 bg-light border-top text-center">
            <Button variant="dark" className="me-2 rounded-pill px-5 shadow-sm fw-bold" onClick={handleSaveAsPDF} style={{backgroundColor: '#1e293b'}}>
              <i className="bi bi-file-earmark-pdf-fill me-2"></i> DOWNLOAD PDF
            </Button>
            <Button variant="outline-dark" className="rounded-pill px-4" onClick={() => setShowViewModal(false)}>
              CLOSE
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* --- DECLINE MODAL --- */}
      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Decline Proposal</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="custom-radio-container">
            <Form.Check 
              type="radio" 
              id="radio-delete"
              label="Permanently Reject Submission" 
              name="declineOption" 
              checked={declineType === 'delete'} 
              onChange={() => setDeclineType('delete')} 
              className={`custom-radio-item ${declineType === 'delete' ? 'active-radio' : ''}`}
            />
            <Form.Check 
              type="radio" 
              id="radio-note"
              label="Reject with Feedback for Client to Modify" 
              name="declineOption" 
              checked={declineType === 'note'} 
              onChange={() => setDeclineType('note')} 
              className={`custom-radio-item mt-2 ${declineType === 'note' ? 'active-radio' : ''}`}
            />
          </div>
          
          {declineType === 'note' && (
            <Form.Group className="mt-4">
              <Form.Label className="small fw-bold text-muted">MODIFICATION FEEDBACK</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                className="shadow-sm border-secondary-subtle" 
                placeholder="Describe exactly what needs to be changed in the contract or proposal..." 
                value={rejectionNote} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionNote(e.target.value)} 
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeclineModal(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-pill px-4 shadow-sm" onClick={handleDeclineSubmit}>Confirm Decline</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientRequests;