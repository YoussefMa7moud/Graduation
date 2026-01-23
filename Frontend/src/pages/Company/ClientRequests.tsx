import React, { useState, useEffect, useRef } from 'react';
import { submissionService } from '../../services/Company/Proposlals'; 
import { Modal, Button, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const ALLOWED_STATUSES = ['WAITING_FOR_COMPANY', 'WAITING_FOR_NDA', 'REJECTED_WITH_NOTE', 'RESUBMITTED'];

  useEffect(() => { loadSubmissions(); }, []);

  const loadSubmissions = async () => {
    try {
      const res = await submissionService.getCompanyQueue();
      const filtered = (res || []).filter((sub: any) => ALLOWED_STATUSES.includes(sub.status));
      setSubmissions(filtered); 
    } catch (err) {
      toast.error("Error loading project queue.");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_COMPANY': return 'status-waiting-company';
      case 'WAITING_FOR_NDA': return 'status-waiting-nda';
      case 'REJECTED_WITH_NOTE': return 'status-rejected-note';
      case 'RESUBMITTED': return 'status-resubmitted';
      default: return 'bg-light text-dark';
    }
  };

  const handleSaveAsPDF = async () => {
    if (!selectedSub || !pdfExportRef.current) return;
    const toastId = toast.loading("Generating PDF Proposal...");
    try {
      const element = pdfExportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedSub.proposalTitle}_Official_Proposal.pdf`);
      toast.update(toastId, { render: "PDF Downloaded!", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(toastId, { render: "PDF Generation failed.", type: "error", isLoading: false, autoClose: 2000 });
    }
  };

  const handleAccept = async (sub: any) => {
    const nextStatus = sub.ndaRequired ? 'WAITING_FOR_NDA' : 'ACCEPTED';
    try {
      await submissionService.updateStatus(sub.id, nextStatus);
      toast.success(`Proposal Accepted. New Status: ${nextStatus.replace(/_/g, ' ')}`);
      loadSubmissions();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeclineSubmit = async () => {
    if (!selectedSub) return;
    try {
      if (declineType === 'delete') {
        await submissionService.deleteSubmission(selectedSub.id);
        toast.info("Submission permanently rejected.");
      } else {
        await submissionService.updateStatus(selectedSub.id, 'REJECTED_WITH_NOTE', rejectionNote);
        toast.warning("Submission rejected with feedback note.");
      }
      setShowDeclineModal(false);
      setRejectionNote('');
      loadSubmissions();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  return (
    <div className="container mt-4 pb-5">
      <ToastContainer position="top-right" theme="colored" />
      
      <div className="mb-4">
        <h2 className="fw-bold text-dark m-0">Project Requests</h2>
        <p className="text-muted small">Manage incoming client proposals and software contracts.</p>
      </div>

      <div className="projects-table-card overflow-hidden border shadow-sm rounded-3">
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
              const actionsDisabled = ['WAITING_FOR_NDA', 'REJECTED_WITH_NOTE'].includes(sub.status);
              return (
                <tr key={sub.id} className="border-bottom">
                  <td className="ps-4 py-4">
                    <div className="fw-bold text-dark">{sub.proposalTitle}</div>
                    <button className="btn btn-link btn-sm p-0 text-decoration-none mt-1 fw-bold" onClick={() => { setSelectedSub(sub); setShowViewModal(true); }}>
                      VIEW PROPOSAL <i className="bi bi-arrow-right"></i>
                    </button>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{sub.clientCompanyName || sub.clientName}</div>
                    <div className="text-muted small">{sub.clientType}</div>
                  </td>
                  <td className="small text-muted">{sub.proposedAt ? new Date(sub.proposedAt).toLocaleDateString('en-GB') : 'N/A'}</td>
                  <td className="text-center">
                    <span className={`status-badge ${getStatusBadgeClass(sub.status)}`}>{sub.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="pe-4 text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button className={`btn-action btn-decline ${actionsDisabled ? 'disabled-btn' : ''}`} disabled={actionsDisabled} onClick={() => { if (!actionsDisabled) { setSelectedSub(sub); setShowDeclineModal(true); } }}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <button className={`btn-action btn-accept ${actionsDisabled ? 'disabled-btn' : ''}`} disabled={actionsDisabled} onClick={() => { if (!actionsDisabled) handleAccept(sub); }}>
                        <i className="bi bi-check2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- OFFICIAL PROPOSAL MODAL --- */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="xl" centered scrollable>
        <Modal.Body className="proposal-modal-content p-0">
          <div className="proposal-document" ref={pdfExportRef}>
            <div className="pdf-header-accent">
              <div className="doc-label">Official Project Proposal</div>
              <h1 className="fw-bold mb-2">{selectedSub?.proposalTitle}</h1>
              <div className="text" style={{fontSize: '14px', letterSpacing: '1px', opacity: 0.9}}>
                {selectedSub?.clientCompanyName || selectedSub?.clientName}
              </div>
            </div>

            <div className={`nda-standalone-alert ${selectedSub?.ndaRequired ? 'nda-required' : 'nda-standard'}`}>
              <div className="d-flex align-items-center gap-3">
                <i className={`bi ${selectedSub?.ndaRequired ? 'bi-shield-lock-fill' : 'bi-shield-check'}`} style={{fontSize: '24px'}}></i>
                <div>
                  <div className="fw-bold small text-uppercase">Confidentiality Protocol</div>
                  <div className="fw-bold h5 mb-0">{selectedSub?.ndaRequired ? "NDA REQUIRED" : "STANDARD DISCLOSURE"}</div>
                </div>
              </div>
            </div>

            <div className="doc-grid mb-5">
              <div className="data-item">
                <div className="data-label">Client Type</div>
                <div className="fw-bold">{selectedSub?.clientType}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Financials</div>
                <div className="fw-bold text-success">${selectedSub?.budgetUsd?.toLocaleString()}</div>
              </div>
              <div className="data-item">
                <div className="data-label">IP Rights</div>
                <div className="fw-bold">{selectedSub?.codeOwnership}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Timeline</div>
                <div className="fw-bold">{selectedSub?.durationDays} Days</div>
              </div>
              <div className="data-item">
                <div className="data-label">Project Type</div>
                <div className="fw-bold">{selectedSub?.projectType}</div>
              </div>
              <div className="data-item">
                <div className="data-label">Scalability</div>
                <div className="fw-bold">{selectedSub?.scalability} Scale</div>
              </div>
              <div className="data-item">
                <div className="data-label">Maintenance Period</div>
                <div className="fw-bold">{selectedSub?.maintenancePeriod}</div>
              </div>
              <div className="data-item">
                <div className="data-label">User Access</div>
                <div className="fw-bold">{selectedSub?.userRoles || "Standard"}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="data-label">Problem Definition</div>
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
            <Button variant="outline-dark" className="rounded-pill px-4" onClick={() => setShowViewModal(false)}>CLOSE</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* --- DECLINE MODAL --- */}
      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)} centered>
        <Modal.Header closeButton className="border-0"><Modal.Title className="fw-bold h5">Decline Proposal</Modal.Title></Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="custom-radio-container">
            <div className={`custom-radio-item ${declineType === 'delete' ? 'active-radio' : ''}`} onClick={() => setDeclineType('delete')}>
              <Form.Check type="radio" id="radio-delete" name="declineOption" checked={declineType === 'delete'} onChange={() => {}} />
              <label className="ms-3 mb-0 pointer">Permanently Reject Submission</label>
            </div>
            <div className={`custom-radio-item mt-2 ${declineType === 'note' ? 'active-radio' : ''}`} onClick={() => setDeclineType('note')}>
              <Form.Check type="radio" id="radio-note" name="declineOption" checked={declineType === 'note'} onChange={() => {}} />
              <label className="ms-3 mb-0 pointer">Reject with Feedback for Client to Modify</label>
            </div>
          </div>
          
          {declineType === 'note' && (
            <Form.Group className="mt-4">
              <Form.Label className="small fw-bold text-muted">MODIFICATION FEEDBACK</Form.Label>
              <Form.Control as="textarea" rows={4} className="shadow-sm border-secondary-subtle" placeholder="Describe the required modifications..." value={rejectionNote} onChange={(e: any) => setRejectionNote(e.target.value)} />
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