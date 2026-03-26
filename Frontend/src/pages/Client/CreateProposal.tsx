import React, { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitProposal } from '../../services/Client/ProposalDocumnet'; // Ensure this path is correct
import { toast } from 'react-toastify';
import { calculatePrice, type PriceBreakdown } from '../../utils/pricingEngine';
import { ADJUSTMENT_RANGE } from '../../utils/pricingConfig';
import './CreateProposal.css';
import 'react-toastify/dist/ReactToastify.css';


interface FormData {
  projectName: string;
  projectDescription: string;
  problemSolved: string;
  projectType: string;
  mainFeatures: string;
  userRoles: string;
  scalability: string;
  expectedDuration: string;
  budgetRange: string;
  ndaRequired: boolean;
  codeOwnership: string;
  maintenancePeriod: string;
}

const CreateProposal: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectDescription: '',
    problemSolved: '',
    projectType: '',
    mainFeatures: '',
    userRoles: '',
    scalability: 'Small',
    expectedDuration: '',
    budgetRange: '',
    ndaRequired: false,
    codeOwnership: 'Client',
    maintenancePeriod: '1 Month',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetAdjustment, setBudgetAdjustment] = useState(0); // ±10%
  const [animatedTotal, setAnimatedTotal] = useState(0);

  const requiredFields: (keyof FormData)[] = [
    'projectName',
    'projectDescription',
    'problemSolved',
    'projectType',
    'mainFeatures',
    'expectedDuration',
  ];

  // --- Auto-calculate price when relevant fields change ---
  const priceBreakdown: PriceBreakdown = useMemo(() => {
    return calculatePrice({
      projectType: formData.projectType,
      mainFeatures: formData.mainFeatures,
      userRoles: formData.userRoles,
      scalability: formData.scalability,
      expectedDuration: formData.expectedDuration,
      ndaRequired: formData.ndaRequired,
      codeOwnership: formData.codeOwnership,
      maintenancePeriod: formData.maintenancePeriod,
    });
  }, [
    formData.projectType,
    formData.mainFeatures,
    formData.userRoles,
    formData.scalability,
    formData.expectedDuration,
    formData.ndaRequired,
    formData.codeOwnership,
    formData.maintenancePeriod,
  ]);

  // Final price with client adjustment
  const adjustedTotal = Math.round(priceBreakdown.total * (1 + budgetAdjustment / 100));

  // Animate the total number
  useEffect(() => {
    const target = adjustedTotal;
    const duration = 400;
    const startVal = animatedTotal;
    const diff = target - startVal;
    if (diff === 0) return;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotal(Math.round(startVal + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [adjustedTotal]);

  // Keep budgetRange in sync for payload
  useEffect(() => {
    setFormData(prev => ({ ...prev, budgetRange: String(adjustedTotal) }));
  }, [adjustedTotal]);

  useEffect(() => {
    const filledFields = requiredFields.filter(field => {
      const value = formData[field];
      return typeof value === 'string' ? value.trim() !== '' : !!value;
    });

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
    setProgress(percentage);
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.projectDescription.trim()) newErrors.projectDescription = 'Description is required';
    if (!formData.expectedDuration) newErrors.expectedDuration = 'Duration is required';
    if (!formData.projectType) newErrors.projectType = 'Project type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'expectedDuration') {
      const numericValue = value.replace(/\D/g, ''); 
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const payload = {
      projectTitle: formData.projectName,
      projectType: formData.projectType,
      problemSolved: formData.problemSolved,
      description: formData.projectDescription,
      mainFeatures: formData.mainFeatures,
      userRoles: formData.userRoles,
      scalability: formData.scalability,
      durationDays: parseInt(formData.expectedDuration),
      budgetUsd: adjustedTotal,
      ndaRequired: formData.ndaRequired,
      codeOwnership: formData.codeOwnership,
      maintenancePeriod: formData.maintenancePeriod,
    };

    try {
      await SubmitProposal(payload);
       toast.success("Proposal submitted successfully!");
      navigate('/proposals');
     
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error submitting proposal. Please check if the server is connected.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePDF = () => {
    if (!validateForm()) {
      alert("Please fill required fields before saving PDF.");
      return;
    }
    alert("Generating PDF Document...");
  };

  return (
    <div className="create-page container page-fade-in">
      <div className="create-header">
        <h2>Create Project Proposal</h2>
        <p>Define your software requirements and legal terms — budget is calculated automatically.</p>
      </div>

      <div className="create-layout">
        <div className="create-left">
          
          <section className="card-box">
            <h6>📌 Project Basics</h6>
            <div className="two-cols">
              <div>
                <label>Project Title *</label>
                <input name="projectName" value={formData.projectName} onChange={handleChange} placeholder="e.g. AI CRM System" />
                {errors.projectName && <small className="error">{errors.projectName}</small>}
              </div>
              <div>
                <label>Project Type *</label>
                <select name="projectType" value={formData.projectType} onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="Web App">Web App</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="AI System">AI System</option>
                  <option value="API">API/Backend</option>
                </select>
                {errors.projectType && <small className="error">{errors.projectType}</small>}
              </div>
            </div>
            <label>What problem does this software solve? *</label>
            <textarea name="problemSolved" rows={2} value={formData.problemSolved} onChange={handleChange} />
            <label>Project Description *</label>
            <textarea name="projectDescription" rows={3} value={formData.projectDescription} onChange={handleChange} />
          </section>

          <section className="card-box">
            <h6>⚙️ Functional Requirements</h6>
            <label>Main Features / Modules *</label>
            <textarea name="mainFeatures" placeholder="Auth, Payment, Dashboard, Analytics..." rows={3} value={formData.mainFeatures} onChange={handleChange} />
            
            {/* Detected Feature Badges */}
            {priceBreakdown.features.items.length > 0 && (
              <div className="feature-badges">
                {priceBreakdown.features.items.map((f, i) => (
                  <span key={i} className={`feature-badge ${f.matched ? 'matched' : 'extra'}`}>
                    {f.matched ? '✓' : '+'} {f.name}
                    <span className="badge-cost">${f.cost}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="two-cols">
              <div>
                <label>User Roles</label>
                <input name="userRoles" placeholder="Admin, Customer" value={formData.userRoles} onChange={handleChange} />
              </div>
              <div>
                <label>Scalability Expectation</label>
                <select name="scalability" value={formData.scalability} onChange={handleChange}>
                  <option value="Small">Small (1-1k users)</option>
                  <option value="Medium">Medium (1k-50k users)</option>
                  <option value="Large">Large (Enterprise)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card-box">
            <h6>💰 Duration & Pricing</h6>
            <div className="two-cols">
              <div>
                <label>Duration (Days) *</label>
                <input name="expectedDuration" type="text" value={formData.expectedDuration} onChange={handleChange} placeholder="90" />
                {errors.expectedDuration && <small className="error">{errors.expectedDuration}</small>}
              </div>
              <div className="duration-hint">
                {priceBreakdown.duration.days > 0 && (
                  <div className={`duration-tag ${priceBreakdown.duration.multiplier > 1 ? 'rush' : 'relaxed'}`}>
                    {priceBreakdown.duration.label}
                  </div>
                )}
              </div>
            </div>

            {/* === Pricing Breakdown Card === */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <span className="pricing-icon">🧠</span>
                <span>Smart Budget Estimate</span>
              </div>

              <div className="pricing-rows">
                <div className="pricing-row">
                  <span>Project Type</span>
                  <span className="pricing-val">{priceBreakdown.projectType.cost > 0 ? `$${priceBreakdown.projectType.cost.toLocaleString()}` : '—'}</span>
                </div>
                <div className="pricing-row">
                  <span>Features ({priceBreakdown.features.items.length})</span>
                  <span className="pricing-val">{priceBreakdown.features.total > 0 ? `$${priceBreakdown.features.total.toLocaleString()}` : '—'}</span>
                </div>
                <div className="pricing-row">
                  <span>User Roles ({priceBreakdown.roles.count})</span>
                  <span className="pricing-val">{priceBreakdown.roles.cost > 0 ? `$${priceBreakdown.roles.cost.toLocaleString()}` : '$0'}</span>
                </div>
                <div className="pricing-row">
                  <span>Scalability ({priceBreakdown.scalability.label})</span>
                  <span className="pricing-val">{priceBreakdown.scalability.cost > 0 ? `$${priceBreakdown.scalability.cost.toLocaleString()}` : '$0'}</span>
                </div>
                <div className="pricing-row">
                  <span>Extras (NDA + Ownership + Maint.)</span>
                  <span className="pricing-val">{priceBreakdown.extras.total > 0 ? `$${priceBreakdown.extras.total.toLocaleString()}` : '$0'}</span>
                </div>

                {priceBreakdown.duration.multiplier > 1 && (
                  <div className="pricing-row rush-row">
                    <span>⚡ {priceBreakdown.duration.label}</span>
                    <span className="pricing-val">×{priceBreakdown.duration.multiplier}</span>
                  </div>
                )}

                <div className="pricing-divider" />

                <div className="pricing-total-row">
                  <span>Suggested Budget</span>
                  <span className="pricing-total-val">${animatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* ±10% Adjustment Slider */}
              {priceBreakdown.total > 0 && (
                <div className="adjustment-section">
                  <label className="adjustment-label">
                    Fine-tune Budget
                    <span className="adjustment-pct">{budgetAdjustment > 0 ? `+${budgetAdjustment}` : budgetAdjustment}%</span>
                  </label>
                  <input
                    type="range"
                    min={-ADJUSTMENT_RANGE}
                    max={ADJUSTMENT_RANGE}
                    step={1}
                    value={budgetAdjustment}
                    onChange={e => setBudgetAdjustment(Number(e.target.value))}
                    className="adjustment-slider"
                  />
                  <div className="adjustment-bounds">
                    <span>-{ADJUSTMENT_RANGE}%</span>
                    <span>+{ADJUSTMENT_RANGE}%</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="card-box">
            <h6>📜 Ownership & Legal</h6>
            <div className="nda-container">
              <div className="nda-info">
                <strong>NDA Required?</strong>
                <p>Enable if a non-disclosure agreement is needed. <span className="nda-cost-hint">(+$200)</span></p>
              </div>
              <label className="standard-toggle">
                <input type="checkbox" name="ndaRequired" checked={formData.ndaRequired} onChange={handleChange} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="two-cols" style={{ marginTop: '20px' }}>
              <div>
                <label>Code Ownership</label>
                <select name="codeOwnership" value={formData.codeOwnership} onChange={handleChange}>
                  <option value="Client">Client (Full Ownership) +$500</option>
                  <option value="Company">Company (License)</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
              <div>
                <label>Maintenance Period</label>
                <select name="maintenancePeriod" value={formData.maintenancePeriod} onChange={handleChange}>
                  <option value="None">None</option>
                  <option value="1 Month">1 Month (Free)</option>
                  <option value="3 Months">3 Months (+$300)</option>
                  <option value="6 Months">6 Months (+$700)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <aside className="create-right">
          <button 
            className="btn-primary-full" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Proposal'}
          </button>
          
          <button className="btn-secondary-full" onClick={handleSavePDF}>
            Save PDF
          </button>

          {/* Sidebar budget summary */}
          <div className="sidebar-budget-box">
            <span className="sidebar-budget-label">💰 Estimated Budget</span>
            <span className="sidebar-budget-value">${animatedTotal.toLocaleString()}</span>
            {budgetAdjustment !== 0 && (
              <span className="sidebar-budget-adj">
                ({budgetAdjustment > 0 ? '+' : ''}{budgetAdjustment}% adjusted)
              </span>
            )}
          </div>

          <div className="progress-box">
            <span>Form Completion</span>
            <strong className={progress === 100 ? "complete-text" : ""}>{progress}%</strong>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>{progress < 100 ? 'Fill all fields marked with *' : 'Ready to save!'}</p>
          </div>

          <div className="guidelines-box">
            <h6>How Pricing Works</h6>
            <ul>
              <li>Budget is <strong>auto-calculated</strong> based on your inputs.</li>
              <li>Type features like <strong>"auth, payment"</strong> — they're detected automatically.</li>
              <li>Short deadlines (&lt;30 days) add a <strong>rush premium</strong>.</li>
              <li>Use the <strong>slider</strong> to fine-tune ±10%.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateProposal;