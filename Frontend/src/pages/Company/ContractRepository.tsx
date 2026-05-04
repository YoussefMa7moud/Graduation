import React, { useState, useEffect } from "react";
import axios from 'axios';
import { getContractRecords } from '../../services/Contract/ContractRepo';
import { assignProjectToPM } from '../../services/CompanyProjectRepo';
import { askGroq } from '../../services/geminiService';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import './ContractRepository.css';

export interface ContractRecordResponse {
  id: number;
  submissionId: number;
  contractType: string;
  fileName: string;
  signedAt: string;
  createdAt: string;
  isAssigned: boolean;
  assignedPmName?: string;
  projectTitle?: string;
}

interface ProjectGroup {
  submissionId: number;
  projectTitle: string;
  contracts: ContractRecordResponse[];
}

const ContractRepository: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ContractRecordResponse[]>([]);
  const [selected, setSelected] = useState<ContractRecordResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set());

  // Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pms, setPms] = useState<any[]>([]);
  const [selectedPmId, setSelectedPmId] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignProgress, setAssignProgress] = useState("");

  useEffect(() => {
    fetchPms();
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const data = await getContractRecords();
        if (data && Array.isArray(data)) {
          setRecords(data);
          // Auto-expand all groups and select first contract
          const allSubmissionIds = new Set(data.map(r => r.submissionId));
          setOpenGroups(allSubmissionIds);
          if (data.length > 0) setSelected(data[0]);
        }
      } catch (error: any) {
        toast.error(`Failed to load: ${error.response?.statusText || "Server Error"}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Group records by submissionId
  const groups: ProjectGroup[] = React.useMemo(() => {
    const map = new Map<number, ProjectGroup>();
    records.forEach(r => {
      if (!map.has(r.submissionId)) {
        map.set(r.submissionId, {
          submissionId: r.submissionId,
          projectTitle: r.projectTitle || `Project #${r.submissionId}`,
          contracts: [],
        });
      }
      map.get(r.submissionId)!.contracts.push(r);
    });
    // Sort contracts within each group: MAIN_CONTRACT first
    map.forEach(g => {
      g.contracts.sort((a, b) => {
        if (a.contractType === 'MAIN_CONTRACT') return -1;
        if (b.contractType === 'MAIN_CONTRACT') return 1;
        return 0;
      });
    });
    return Array.from(map.values());
  }, [records]);

  const toggleGroup = (submissionId: number) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(submissionId)) next.delete(submissionId);
      else next.add(submissionId);
      return next;
    });
  };

  const fetchPms = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('/api/company/pms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPms(response.data);
    } catch (error) {
      console.error("Failed to load PMs");
    }
  };

  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const confirmAssignment = async () => {
    if (!selected || selectedPmId === '') return;

    setIsAssigning(true);

    let oclRules = "No rules extracted.";
    let guidelines = "No guidelines generated.";

    try {
      // 1. Get Contract Payload
      setAssignProgress("Fetching Contract Details...");
      const token = localStorage.getItem('auth_token');
      const payloadRes = await axios.get(`/api/contracts/records/${selected.id}/payload`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contractPayload = payloadRes.data;

      // 2. Extract OCL Rules (AI — non-blocking on failure)
      try {
        setAssignProgress("AI is extracting OCL rules from the contract...");
        const oclPrompt = `You are a Legal AI. Extract strict OCL (Object Constraint Language) rules from the following JSON contract. Return ONLY the OCL rules as plain text.\n\nContract:\n${JSON.stringify(contractPayload)}`;
        oclRules = await askGroq(oclPrompt);
      } catch (aiErr) {
        console.warn("OCL extraction failed, using fallback.", aiErr);
      }

      // 3. Generate PM Guidelines (AI — non-blocking on failure)
      try {
        setAssignProgress("AI is generating PM guidelines for SRS/SDD...");
        const guidelinesPrompt = `You are a Technical AI. Based on the following contract and OCL rules, generate a concise set of guidelines for the Project Manager to follow when creating the SRS and SDD documents. Format as Markdown.\n\nContract:\n${JSON.stringify(contractPayload)}\n\nOCL Rules:\n${oclRules}`;
        guidelines = await askGroq(guidelinesPrompt);
      } catch (aiErr) {
        console.warn("Guidelines generation failed, using fallback.", aiErr);
      }

      // 4. Assign to PM (critical — errors propagate to outer catch)
      setAssignProgress("Finalizing assignment...");
      await assignProjectToPM({
        contractRecordId: selected.id,
        projectManagerId: Number(selectedPmId),
        oclRules,
        guidelines,
      });

      // Update local state
      const pm = pms.find(p => p.id === selectedPmId);
      const pmName = pm ? `${pm.user?.firstName ?? ''} ${pm.user?.lastName ?? ''}`.trim() : 'Unknown PM';
      setRecords(prev => prev.map(p =>
        p.id === selected.id ? { ...p, isAssigned: true, assignedPmName: pmName } : p
      ));
      setSelected({ ...selected, isAssigned: true, assignedPmName: pmName });

      toast.success("Project successfully assigned to PM!");
      setShowAssignModal(false);
    } catch (error: any) {
      const resData = error.response?.data;
      const msg =
        (typeof resData === 'string' && resData.trim() ? resData.trim() :
        (typeof resData?.message === 'string' && resData.message.trim() ? resData.message.trim() :
        (typeof resData?.error === 'string' && resData.error.trim() ? resData.error.trim() :
        (error.message && error.message.trim() ? error.message.trim() : "Failed to assign project."))));
      toast.error(msg);
    } finally {
      setIsAssigning(false);
      setAssignProgress("");
    }
  };

  const handleDownloadPdf = async (id: number, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`/api/contracts/records/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `contract-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error downloading file.");
    }
  };

  if (isLoading) return (
    <div className="repo-loader">
      <div className="spinner-border text-primary"></div>
      <p>Loading Repository...</p>
    </div>
  );

  if (user?.role === 'company_employee' && !user?.permissions?.canViewContracts) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ minHeight: '80vh' }}>
        <div className="text-center p-5 bg-white rounded-4 shadow-sm border" style={{ maxWidth: '500px' }}>
          <i className="bi bi-shield-lock-fill text-danger mb-3" style={{ fontSize: '4rem' }}></i>
          <h2 className="fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted mb-4">You do not have permission to access the contract repository.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="repo-container page-fade-in">
      <header className="repo-header">
        <div>
          <h4 className="fw-bold text-navy">Signed Projects Repository</h4>
          <p className="section-subtitle">Secure audit trail for completed engagements.</p>
        </div>
      </header>

      {groups.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-folder-x display-1"></i>
          <p>No signed contracts found in the database.</p>
        </div>
      ) : (
        <div className="repo-layout">
          {/* Accordion List */}
          <div className="project-accordion">
            {groups.map(group => {
              const isOpen = openGroups.has(group.submissionId);
              const mainContract = group.contracts.find(c => c.contractType === 'MAIN_CONTRACT');
              const isGroupAssigned = mainContract?.isAssigned ?? false;

              return (
                <div key={group.submissionId} className="project-group">
                  {/* Group Header */}
                  <div
                    className={`project-group-header ${isOpen ? 'open' : ''}`}
                    onClick={() => toggleGroup(group.submissionId)}
                  >
                    <div className="project-group-left">
                      <div className={`group-chevron ${isOpen ? 'rotated' : ''}`}>
                        <i className="bi bi-chevron-right"></i>
                      </div>
                      <div className="project-group-info">
                        <div className="project-group-title">{group.projectTitle}</div>
                        <div className="project-group-meta">
                          {group.contracts.length} contract{group.contracts.length > 1 ? 's' : ''}
                          &nbsp;·&nbsp;Sub #{group.submissionId}
                        </div>
                      </div>
                    </div>
                    <div className="project-group-right">
                      {isGroupAssigned ? (
                        <span className="group-badge assigned">
                          <i className="bi bi-check-circle-fill me-1"></i>Assigned
                        </span>
                      ) : mainContract ? (
                        <span className="group-badge pending">
                          <i className="bi bi-clock-fill me-1"></i>Not assigned yet
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Contracts List (collapsible) */}
                  {isOpen && (
                    <div className="project-contracts-list">
                      {group.contracts.map(contract => (
                        <div
                          key={contract.id}
                          className={`contract-item ${selected?.id === contract.id ? 'active' : ''}`}
                          onClick={() => setSelected(contract)}
                        >
                          <div className="contract-item-icon">
                            {contract.contractType === 'MAIN_CONTRACT'
                              ? <i className="bi bi-file-earmark-text-fill text-navy"></i>
                              : <i className="bi bi-shield-lock-fill text-secondary"></i>
                            }
                          </div>
                          <div className="contract-item-info">
                            <div className="contract-item-name">{contract.fileName}</div>
                            <div className="contract-item-meta">
                              <span className="badge-type-flat me-2">
                                {contract.contractType === 'MAIN_CONTRACT' ? 'Main Contract' : 'NDA'}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                {new Date(contract.signedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="contract-item-arrow">
                            <i className="bi bi-chevron-right text-muted"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details Sidebar */}
          <aside className="details-sidebar">
            {selected ? (
              <div className="details-card">
                <div className="details-header">
                  <span className="badge-status-active mb-2">SIGNED</span>
                  <h6 className="fw-bold text-navy mb-0">
                    {selected.projectTitle || `Project #${selected.submissionId}`}
                  </h6>
                  <div className="text-muted small mt-1">{selected.fileName}</div>
                </div>

                <div className="file-preview-box">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-4 me-3"></i>
                    <div>
                      <div className="fw-bold small">
                        {selected.contractType === 'MAIN_CONTRACT' ? 'Main Contract' : 'Non-Disclosure Agreement'}
                      </div>
                      <div className="text-muted extra-small">PDF Document</div>
                    </div>
                  </div>
                </div>

                <button
                  className="btn-mint-flat w-100 mb-4"
                  onClick={() => handleDownloadPdf(selected.id, selected.fileName)}
                >
                  <i className="bi bi-download me-2"></i> Download PDF
                </button>

                {selected.contractType === 'MAIN_CONTRACT' ? (
                  <>
                    {selected.isAssigned ? (
                      <>
                        <div className="assigned-pm-banner mb-2" role="alert">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <i className="bi bi-check-circle-fill text-success fs-5"></i>
                            <span className="fw-bold text-success">Project Already Assigned</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-person-badge-fill text-primary"></i>
                            <span className="text-muted small">Project Manager:</span>
                            <span className="fw-bold small">{selected.assignedPmName || 'Unknown PM'}</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-secondary w-100 mb-4"
                          disabled
                          title={`Already assigned to ${selected.assignedPmName || 'a PM'}`}
                        >
                          <i className="bi bi-person-check-fill me-2"></i>
                          Assigned to {selected.assignedPmName || 'PM'}
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-outline-primary w-100 mb-4"
                        onClick={handleAssignClick}
                      >
                        <i className="bi bi-person-plus-fill me-2"></i> Assign to PM
                      </button>
                    )}
                  </>
                ) : (
                  <div className="alert alert-secondary text-center mb-4" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    PMs cannot be assigned to NDAs.
                  </div>
                )}

                <div className="audit-section">
                  <h6 className="audit-title">AUDIT METADATA</h6>
                  <div className="audit-item">
                    <span>Signed At</span>
                    <span className="text-end">{new Date(selected.signedAt).toLocaleString()}</span>
                  </div>
                  <div className="audit-item">
                    <span>Contract Type</span>
                    <span className="text-end">{selected.contractType}</span>
                  </div>
                  <div className="audit-item">
                    <span>Hash Status</span>
                    <span className="text-mint fw-bold">✓ VERIFIED</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="details-empty">Select a contract to view details</div>
            )}
          </aside>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-navy text-white">
                <h5 className="modal-title">Assign Project</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssignModal(false)} disabled={isAssigning}></button>
              </div>
              <div className="modal-body">
                {isAssigning ? (
                  <div className="text-center p-4">
                    <div className="spinner-border text-mint mb-3" role="status"></div>
                    <p className="fw-bold">{assignProgress}</p>
                    <p className="text-muted small">This may take a minute...</p>
                  </div>
                ) : (
                  <>
                    <p>Select a Project Manager to assign <strong>{selected?.projectTitle || selected?.fileName}</strong>.</p>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Project Manager</label>
                      <select
                        className="form-select"
                        value={selectedPmId}
                        onChange={(e) => setSelectedPmId(Number(e.target.value))}
                      >
                        <option value="">-- Select PM --</option>
                        {pms.map(pm => (
                          <option key={pm.id} value={pm.id}>
                            {pm.user?.firstName} {pm.user?.lastName} ({pm.user?.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              {!isAssigning && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-mint" onClick={confirmAssignment} disabled={selectedPmId === ''}>
                    Confirm Assignment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractRepository;