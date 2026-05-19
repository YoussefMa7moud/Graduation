import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getProjectById,
  generateProjectGuidelines,
  validateTechnicalDocument,
  type CompanyProjectDTO,
  type TechDocViolation,
} from '../../services/CompanyProjectRepo';
import {
  collectTechnicalDocumentPlainText,
  saveTechnicalDocumentFromDom,
} from '../../utils/technicalDocStorage';
import { getProjectTasks } from '../../services/pmTasks.service';
import { toast } from 'react-toastify';
import { parseOclRulesForDisplay } from '../../utils/oclRulesParser';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes pd-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes pd-fade-in { from{opacity:0} to{opacity:1} }
@keyframes pd-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

.pd-root { font-family:'Inter',-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; animation:pd-fade-in .3s ease both; display:flex; flex-direction:column; gap:24px; }

/* ── Breadcrumb ── */
.pd-breadcrumb { display:flex; align-items:center; gap:8px; font-size:13px; color:#64748b; }
.pd-breadcrumb a { color:#3b82f6; text-decoration:none; font-weight:500; }
.pd-breadcrumb a:hover { text-decoration:underline; }

/* ── Top bar (validate) ── */
.pd-top-bar {
  display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
  background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
  border:1px solid rgba(255,255,255,0.08); border-radius:16px;
  padding:20px 26px; color:#fff;
  box-shadow:0 4px 20px rgba(15,23,42,0.25);
  animation:pd-fade-up .35s ease both;
}
.pd-top-bar-left { display:flex; align-items:center; gap:14px; }
.pd-top-bar-icon {
  width:46px; height:46px; border-radius:12px; flex-shrink:0;
  background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.25);
  display:flex; align-items:center; justify-content:center; font-size:20px; color:#60a5fa;
}
.pd-top-bar-title { font-size:18px; font-weight:700; letter-spacing:-0.01em; }
.pd-top-bar-sub { font-size:12px; color:rgba(255,255,255,0.55); margin-top:2px; }
.pd-validate-btn {
  display:flex; align-items:center; gap:8px;
  padding:0 22px; height:42px; border-radius:11px; border:none;
  background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff;
  font-size:13px; font-weight:600; cursor:pointer; font-family:inherit;
  box-shadow:0 2px 10px rgba(37,99,235,0.3);
  transition:opacity .15s,transform .12s,box-shadow .15s;
  white-space:nowrap;
}
.pd-validate-btn:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 4px 18px rgba(37,99,235,0.4); }
.pd-validate-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

/* ── Violations Panel ── */
.pd-violations {
  border-radius:14px; overflow:hidden; border:1px solid #e2e8f0;
  animation:pd-fade-up .35s ease .05s both;
}
.pd-violations-header {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:16px 22px;
  font-size:13px; font-weight:700; letter-spacing:-0.01em;
}
.pd-violations-header--pass { background:#ecfdf5; color:#059669; border-bottom:1px solid #a7f3d0; }
.pd-violations-header--fail { background:#fef2f2; color:#dc2626; border-bottom:1px solid #fecaca; }
.pd-violations-header--idle { background:#f8fafc; color:#64748b; border-bottom:1px solid #e2e8f0; }
.pd-violations-body { padding:16px 22px; background:#fff; font-size:13px; color:#334155; line-height:1.7; }
.pd-violation-item {
  display:flex; flex-direction:column; gap:6px; padding:12px 0;
  border-bottom:1px solid #f1f5f9;
}
.pd-violation-item:last-child { border-bottom:none; }
.pd-violation-head {
  display:flex; align-items:center; gap:8px;
  font-size:12px; font-weight:700; color:#0f172a;
}
.pd-violation-icon { flex-shrink:0; color:#dc2626; }
.pd-violation-ocl {
  margin:4px 0 0 26px; padding:10px 14px; background:#0f172a; border-radius:8px;
  font-size:11px; line-height:1.6; color:#a5f3fc; font-family:"JetBrains Mono","Fira Code",monospace;
  white-space:pre-wrap;
}
.pd-violation-ocl-meaning {
  font-size:12px; line-height:1.55; color:#475569; padding-left:26px; margin-top:4px;
}
.pd-violation-explain {
  font-size:13px; line-height:1.65; color:#334155; padding-left:26px; margin-top:8px;
}
.pd-violation-doc {
  font-size:12px; line-height:1.55; color:#64748b; padding-left:26px;
  border-left:2px solid #fecaca; margin-left:24px; padding-top:4px; padding-bottom:4px;
}
.pd-violation-doc-label { font-weight:600; color:#94a3b8; font-size:10px; text-transform:uppercase; letter-spacing:.04em; display:block; margin-bottom:4px; }

/* ── Content Grid ── */
.pd-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; animation:pd-fade-up .35s ease .1s both; }
@media(max-width:900px) { .pd-grid { grid-template-columns:1fr; } }

/* ── Cards ── */
.pd-card {
  background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 14px rgba(0,0,0,0.03);
  transition:border-color .2s,box-shadow .2s;
}
.pd-card:hover { border-color:#cbd5e1; box-shadow:0 4px 18px rgba(0,0,0,0.07); }
.pd-card-head {
  display:flex; align-items:center; gap:10px;
  padding:16px 22px; border-bottom:1px solid #f1f5f9;
  background:#fafbfc;
}
.pd-card-head-icon {
  width:30px; height:30px; border-radius:8px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:13px;
}
.pd-card-head-icon--blue   { background:#eff6ff; color:#2563eb; }
.pd-card-head-icon--violet { background:#f5f3ff; color:#7c3aed; }
.pd-card-head-icon--amber  { background:#fffbeb; color:#d97706; }
.pd-card-head-icon--cyan   { background:#ecfeff; color:#0891b2; }
.pd-card-head-title { font-size:13px; font-weight:700; color:#0f172a; letter-spacing:-0.01em; }
.pd-card-body { padding:18px 22px; }

/* ── Proposal fields ── */
.pd-prop-row { display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid #f8fafc; }
.pd-prop-row:last-child { border-bottom:none; }
.pd-prop-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; min-width:90px; flex-shrink:0; padding-top:1px; }
.pd-prop-value { font-size:13px; color:#0f172a; font-weight:500; }

/* ── OCL Rules ── */
.pd-ocl-list { display:flex; flex-direction:column; gap:0; max-height:420px; overflow-y:auto; }
.pd-ocl-rule { border-bottom:1px solid #f1f5f9; }
.pd-ocl-rule:last-child { border-bottom:none; }
.pd-ocl-rule-head {
  display:flex; align-items:center; gap:8px; padding:12px 18px;
  background:#fafbfc; font-size:11px; font-weight:700; color:#1d4ed8;
  letter-spacing:.03em; text-transform:uppercase;
}
.pd-ocl-rule-num {
  width:22px; height:22px; border-radius:6px; flex-shrink:0;
  background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;
  display:flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:800;
}
.pd-ocl-code {
  margin:0; padding:12px 18px; font-size:12px; line-height:1.7;
  background:#0f172a; color:#a5f3fc; white-space:pre-wrap;
  font-family:"JetBrains Mono","Fira Code",monospace;
}
.pd-ocl-explain {
  padding:10px 18px; font-size:12px; line-height:1.6; color:#475569;
  background:#f8fafc; display:flex; align-items:flex-start; gap:8px;
}
.pd-ocl-explain-icon { flex-shrink:0; color:#d97706; margin-top:1px; }
.pd-ocl-empty {
  padding:28px 18px; text-align:center; color:#94a3b8; font-size:13px;
}

/* ── NDA badge in proposal ── */
.pd-nda-badge {
  display:inline-flex; align-items:center; gap:5px;
  padding:3px 10px; border-radius:20px;
  font-size:11px; font-weight:700;
}
.pd-nda-badge--signed { background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; }
.pd-nda-badge--unsigned { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }

/* ── Project Summary ── */
.pd-summary-actions { display:flex; align-items:center; gap:10px; margin-left:auto; }
.pd-gen-summary-btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:7px 14px; border-radius:9px; border:none; cursor:pointer;
  background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff;
  font-size:12px; font-weight:600; font-family:inherit;
  box-shadow:0 2px 8px rgba(245,158,11,0.3); transition:opacity .15s,transform .1s;
}
.pd-gen-summary-btn:hover:not(:disabled) { transform:translateY(-1px); }
.pd-gen-summary-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
.pd-summary-content {
  font-size:13px; line-height:1.75; color:#334155;
  white-space:pre-wrap; max-height:320px; overflow-y:auto;
}
.pd-summary-empty {
  font-size:13px; color:#94a3b8; line-height:1.6; text-align:center; padding:24px 12px;
}

/* ── Document CTA card ── */
.pd-doc-cta {
  grid-column:1/-1;
  background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%);
  border:1px solid #bfdbfe; border-radius:16px;
  padding:28px 30px; display:flex; align-items:center; justify-content:space-between;
  gap:20px; flex-wrap:wrap;
  animation:pd-fade-up .35s ease .15s both;
  transition:box-shadow .2s;
}
.pd-doc-cta:hover { box-shadow:0 4px 20px rgba(59,130,246,0.1); }
.pd-doc-cta-left { display:flex; align-items:center; gap:16px; }
.pd-doc-cta-icon {
  width:52px; height:52px; border-radius:14px; flex-shrink:0;
  background:#fff; border:1px solid #bfdbfe;
  display:flex; align-items:center; justify-content:center;
  font-size:22px; color:#ef4444;
}
.pd-doc-cta-title { font-size:16px; font-weight:700; color:#0f172a; margin:0 0 4px; }
.pd-doc-cta-sub { font-size:12px; color:#64748b; margin:0; }
.pd-doc-btn {
  display:flex; align-items:center; gap:8px;
  padding:0 22px; height:44px; border-radius:11px; border:none;
  background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:#fff;
  font-size:14px; font-weight:600; cursor:pointer; font-family:inherit;
  box-shadow:0 2px 10px rgba(29,78,216,0.22);
  transition:opacity .15s,transform .12s,box-shadow .15s;
}
.pd-doc-btn:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 4px 18px rgba(29,78,216,0.3); }

/* ── Skeleton ── */
.pd-skeleton {
  background:linear-gradient(90deg,#e2e8f0 25%,#eef2f7 50%,#e2e8f0 75%);
  background-size:200% 100%; animation:pd-shimmer 1.8s ease-in-out infinite;
}
`;

// ─── Component ────────────────────────────────────────────────────────────────
const TechnicalDocWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [project, setProject] = useState<CompanyProjectDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationState, setValidationState] = useState<'idle' | 'running' | 'pass' | 'fail'>('idle');
  const [violations, setViolations] = useState<TechDocViolation[]>([]);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [taskDone, setTaskDone] = useState(0);
  const [taskTotal, setTaskTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        if (!id) { navigate('/ProjectManagerHome', { replace: true }); return; }
        const data = await getProjectById(Number(id));
        setProject(data);
        try {
          const tasks = await getProjectTasks(Number(id));
          setTaskTotal(tasks.length);
          setTaskDone(tasks.filter(t => t.status === 'DONE').length);
        } catch {
          setTaskTotal(0);
          setTaskDone(0);
        }
      } catch {
        toast.error('Failed to load project details.');
        navigate('/ProjectManagerHome', { replace: true });
      } finally { setLoading(false); }
    })();
  }, [id, navigate]);

  const handleGenerateSummary = async () => {
    if (!project || generatingSummary) return;
    setGeneratingSummary(true);
    try {
      const res = await generateProjectGuidelines(project.id);
      setProject(prev =>
        prev ? { ...prev, projectSummary: res.projectSummary } : prev
      );
      toast.success('Project summary generated.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const status = axiosErr.response?.status;
      let msg = axiosErr.response?.data?.error;
      if (!msg) {
        if (status === 503) {
          msg = 'AI is not configured. Add GROQ_API_KEY to Backend/backend/.env and restart the backend.';
        } else {
          msg = axiosErr.message ?? 'Failed to generate project summary.';
        }
      }
      toast.error(msg);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleValidate = async () => {
    if (validationState === 'running' || !project) return;
    setValidationState('running');
    setViolations([]);
    try {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      saveTechnicalDocumentFromDom(project.id);
      await new Promise<void>(resolve => {
        window.setTimeout(() => resolve(), 150);
      });
      const plain = collectTechnicalDocumentPlainText(project.id);
      const result = await validateTechnicalDocument(project.id, plain);
      if (result.valid) {
        setValidationState('pass');
        setViolations([]);
      } else {
        setValidationState('fail');
        setViolations(
          result.violations?.length
            ? result.violations
            : [{
                constraintName: 'Validation',
                whyViolated: 'Issues were reported but no details were returned.',
              }]
        );
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
      const status = axiosErr.response?.status;
      let msg = axiosErr.response?.data?.error;
      if (!msg) {
        if (status === 503) {
          msg = 'AI is not configured. Add GROQ_API_KEY to Backend/backend/.env and restart the backend.';
        } else {
          msg = axiosErr.message ?? 'Validation failed.';
        }
      }
      toast.error(msg);
      setValidationState('idle');
      setViolations([]);
    }
  };

  if (loading || !project) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pd-root">
        <div className="pd-skeleton" style={{ height: 100, borderRadius: 16 }} />
        <div className="pd-skeleton" style={{ height: 60, borderRadius: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="pd-skeleton" style={{ height: 280, borderRadius: 16 }} />
          <div className="pd-skeleton" style={{ height: 280, borderRadius: 16 }} />
        </div>
      </div>
    </>
  );

  const oclDisplayRules = parseOclRulesForDisplay(project.oclRules);
  const hasSummary = Boolean(project.projectSummary?.trim());

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pd-root">

        {/* ── Breadcrumb ── */}
        <div className="pd-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); navigate('/ProjectManagerHome'); }}>Dashboard</a>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{project.projectTitle}</span>
        </div>

        {/* ── Validate Bar ── */}
        <div className="pd-top-bar">
          <div className="pd-top-bar-left">
            <div className="pd-top-bar-icon"><i className="bi bi-shield-check" /></div>
            <div>
              <div className="pd-top-bar-title">{project.projectTitle}</div>
              <div className="pd-top-bar-sub">Check your technical document for conflicts with contract OCL constraints</div>
            </div>
          </div>
          <button className="pd-validate-btn" onClick={handleValidate} disabled={validationState === 'running'}>
            {validationState === 'running' ? (
              <><div className="spinner-border spinner-border-sm" role="status" /> Validating…</>
            ) : (
              <><i className="bi bi-check2-circle" /> Validate Based on Contract</>
            )}
          </button>
        </div>

        {/* ── Violations Panel ── */}
        <div className="pd-violations">
          <div className={`pd-violations-header ${
            validationState === 'pass' ? 'pd-violations-header--pass' :
            validationState === 'fail' ? 'pd-violations-header--fail' :
            'pd-violations-header--idle'
          }`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className={`bi ${
                validationState === 'pass' ? 'bi-check-circle-fill' :
                validationState === 'fail' ? 'bi-x-circle-fill' :
                validationState === 'running' ? 'bi-arrow-repeat' :
                'bi-info-circle'
              }`} />
              {validationState === 'idle' && 'Validation Results'}
              {validationState === 'running' && 'Running validation…'}
              {validationState === 'pass' && 'No Violations Found'}
              {validationState === 'fail' && `${violations.length} Violation${violations.length !== 1 ? 's' : ''} Detected`}
            </div>
            {validationState !== 'idle' && validationState !== 'running' && (
              <button
                onClick={handleValidate}
                style={{ background: 'none', border: '1px solid currentColor', borderRadius: 7, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: 'inherit', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <i className="bi bi-arrow-clockwise me-1" />Re-validate
              </button>
            )}
          </div>
          <div className="pd-violations-body">
            {validationState === 'idle' && (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px 0' }}>
                <i className="bi bi-shield" style={{ fontSize: 28, display: 'block', marginBottom: 8, opacity: 0.5 }} />
                Click <strong>"Validate Based on Contract"</strong> to find conflicts between your saved technical document and OCL constraints (omitted topics are not flagged; requires GROQ_API_KEY on the server).
              </div>
            )}
            {validationState === 'running' && (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '16px 0' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status" />
                Checking each OCL constraint against your full document (including long paragraphs)…
              </div>
            )}
            {validationState === 'pass' && (
              <div style={{ textAlign: 'center', color: '#059669', padding: '16px 0' }}>
                <i className="bi bi-patch-check-fill" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                No conflicts with contract OCL constraints were found in your document.
              </div>
            )}
            {validationState === 'fail' && violations.map((v, i) => (
              <div key={i} className="pd-violation-item">
                <div className="pd-violation-head">
                  <i className="bi bi-exclamation-triangle-fill pd-violation-icon" />
                  <span>Violated: {v.constraintName}</span>
                </div>
                {v.oclCode?.trim() && (
                  <>
                    <div style={{ paddingLeft: 26, marginTop: 8 }}>
                      <span className="pd-violation-doc-label">OCL constraint</span>
                    </div>
                    <pre className="pd-violation-ocl">{v.oclCode}</pre>
                    {v.oclExplanation?.trim() && (
                      <div className="pd-violation-ocl-meaning">{v.oclExplanation}</div>
                    )}
                  </>
                )}
                <div className="pd-violation-explain">
                  <span className="pd-violation-doc-label" style={{ marginBottom: 6, display: 'block' }}>
                    Why this violates the constraint
                  </span>
                  {v.whyViolated}
                </div>
                {v.documentConflict?.trim() && (
                  <div className="pd-violation-doc">
                    <span className="pd-violation-doc-label">In your document</span>
                    {v.documentConflict}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Document CTA ── */}
        <div className="pd-doc-cta">
          <div className="pd-doc-cta-left">
            <div className="pd-doc-cta-icon"><i className="bi bi-file-earmark-pdf-fill" /></div>
            <div>
              <p className="pd-doc-cta-title">Technical Document Template</p>
              <p className="pd-doc-cta-sub">Open the document editor to fill in your SRS/SDD sections based on the project requirements.</p>
            </div>
          </div>
          <button className="pd-doc-btn" onClick={() => navigate(`/TechDocEditor/${project.id}`)}>
            <i className="bi bi-pencil-square" /> Open Document Editor
          </button>
        </div>

        {/* ── Content Grid ── */}
        <div className="pd-grid">

          {/* ── Proposal Info ── */}
          <div className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon pd-card-head-icon--cyan"><i className="bi bi-file-earmark-person" /></div>
              <span className="pd-card-head-title">Client Proposal</span>
            </div>
            <div className="pd-card-body">
              {[
                ['Project Title', project.projectTitle],
                ['Type', project.projectType],
                ['Client', project.clientName],
                ['Budget', project.budgetUsd ? `$${Number(project.budgetUsd).toLocaleString()} USD` : null],
                ['Duration', project.durationDays ? `${project.durationDays} days` : null],
                ['Status', project.status],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="pd-prop-row">
                  <span className="pd-prop-label">{label}</span>
                  <span className="pd-prop-value">{value}</span>
                </div>
              ))}
              {/* NDA Status */}
              <div className="pd-prop-row">
                <span className="pd-prop-label">NDA</span>
                <span className={`pd-nda-badge ${project.ndaSigned ? 'pd-nda-badge--signed' : 'pd-nda-badge--unsigned'}`}>
                  <i className={`bi ${project.ndaSigned ? 'bi-shield-check-fill' : 'bi-shield-x'}`} />
                  {project.ndaSigned ? 'Signed' : 'Not Signed'}
                </span>
              </div>
              {project.projectDescription && (
                <div className="pd-prop-row" style={{ flexDirection: 'column', gap: 4 }}>
                  <span className="pd-prop-label">Description</span>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' }}>
                    {project.projectDescription}
                  </div>
                </div>
              )}
              {project.mainFeatures && (
                <div className="pd-prop-row" style={{ flexDirection: 'column', gap: 4 }}>
                  <span className="pd-prop-label">Main Features</span>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' }}>
                    {project.mainFeatures}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── OCL Constraints ── */}
          <div className="pd-card">
            <div className="pd-card-head">
              <div className="pd-card-head-icon pd-card-head-icon--blue"><i className="bi bi-code-square" /></div>
              <span className="pd-card-head-title">OCL Constraints</span>
              {oclDisplayRules.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 12 }}>
                  {oclDisplayRules.length} clause{oclDisplayRules.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="pd-card-body" style={{ padding: 0 }}>
              {oclDisplayRules.length === 0 ? (
                <div className="pd-ocl-empty">
                  <i className="bi bi-code-slash" style={{ fontSize: 24, display: 'block', marginBottom: 8, opacity: 0.4 }} />
                  No OCL constraints have been extracted for this project yet.
                </div>
              ) : (
                <div className="pd-ocl-list">
                  {oclDisplayRules.map((rule, i) => (
                    <div key={i} className="pd-ocl-rule">
                      <div className="pd-ocl-rule-head">
                        <span className="pd-ocl-rule-num">{i + 1}</span>
                        <span>{rule.sectionTitle ? `${rule.sectionTitle} · ${rule.name}` : rule.name}</span>
                      </div>
                      <pre className="pd-ocl-code">{rule.code}</pre>
                      <div className="pd-ocl-explain">
                        <i className="bi bi-lightbulb-fill pd-ocl-explain-icon" />
                        <span>{rule.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* ── AI Project Summary ── */}
          <div className="pd-card" style={{ gridColumn: '1 / -1' }}>
            <div className="pd-card-head">
              <div className="pd-card-head-icon pd-card-head-icon--amber"><i className="bi bi-file-text" /></div>
              <span className="pd-card-head-title">AI Project Summary</span>
              <div className="pd-summary-actions">
                <button
                  type="button"
                  className="pd-gen-summary-btn"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                >
                  {generatingSummary ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-stars" />
                      {hasSummary ? 'Regenerate Summary' : 'Generate Summary'}
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="pd-card-body">
              {!hasSummary && !generatingSummary ? (
                <div className="pd-summary-empty">
                  <i className="bi bi-journal-text" style={{ fontSize: 28, display: 'block', marginBottom: 10, opacity: 0.5 }} />
                  No summary yet. Click <strong>Generate Summary</strong> to create an overview from the
                  proposal, contract, and OCL constraints.
                </div>
              ) : (
                <div className="pd-summary-content">
                  {generatingSummary && !project.projectSummary ? (
                    <span style={{ color: '#94a3b8' }}>Generating summary…</span>
                  ) : (
                    project.projectSummary || '—'
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Task Progress (small summary) ── */}
          <div className="pd-card" style={{ gridColumn: '1 / -1' }}>
            <div className="pd-card-head">
              <div className="pd-card-head-icon pd-card-head-icon--violet"><i className="bi bi-list-check" /></div>
              <span className="pd-card-head-title">Task Progress</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: taskTotal > 0 && taskDone === taskTotal ? '#059669' : '#64748b' }}>
                {taskDone}/{taskTotal} completed
              </span>
            </div>
            <div className="pd-card-body" style={{ padding: '14px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: taskTotal ? `${(taskDone / taskTotal) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: 4, transition: 'width .3s' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {taskTotal ? `${Math.round((taskDone / taskTotal) * 100)}%` : '0%'}
                </span>
              </div>
              <button
                onClick={() => navigate('/ProjectTasks')}
                style={{ marginTop: 12, background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <i className="bi bi-arrow-right me-1" />Manage Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TechnicalDocWorkspace;