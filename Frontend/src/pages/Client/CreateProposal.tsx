import React, { useState, type ChangeEvent } from 'react';
import ClientHeader from '../../components/Client/ClientHeader';
import './CreateProposal.css';
import { useNavigate } from 'react-router-dom';

interface FormData {
  projectName: string;
  targetCompany: string;
  contractType: string;
  contractSummary: string;
  contractDate: string;
  jurisdiction: string;
  complianceRules: string[];
  clausesOfConcern: string;
  priority: string;
  analysisGoals: string[];
  reviewLevel: string;
  additionalNotes: string;
}

const CreateProposal: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    targetCompany: '',
    contractType: '',
    contractSummary: '',
    contractDate: '',
    jurisdiction: '',
    complianceRules: [],
    clausesOfConcern: '',
    priority: 'Standard',
    analysisGoals: [],
    reviewLevel: 'Standard',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim())
      newErrors.projectName = 'Project name is required';

    if (!formData.targetCompany.trim())
      newErrors.targetCompany = 'Target company is required';

    if (!formData.contractType)
      newErrors.contractType = 'Please select contract type';

    if (!formData.contractSummary.trim())
      newErrors.contractSummary = 'Contract summary is required';

    if (!formData.jurisdiction.trim())
      newErrors.jurisdiction = 'Jurisdiction is required';

    if (formData.complianceRules.length === 0)
      newErrors.complianceRules = 'Select at least one compliance rule';

    if (formData.analysisGoals.length === 0)
      newErrors.analysisGoals = 'Select at least one analysis goal';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
      const arr = prev[name as keyof FormData] as string[];
      if (checked) return { ...prev, [name]: [...arr, value] };
      return { ...prev, [name]: arr.filter(v => v !== value) };
    });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const existing = JSON.parse(localStorage.getItem('proposals') || '[]');

    const newProposal = {
      id: Date.now().toString(),
      ...formData,
      status: 'PENDING',
      submittedAt: new Date().toLocaleDateString(),
    };

    localStorage.setItem('proposals', JSON.stringify([newProposal, ...existing]));

    // ✅ Navigate to proposal submission page
    navigate('/proposals/submission');
  };

  return (
    <>
      <ClientHeader />
      <div className="create-page container page-fade-in">
        {/* Header */}
        <div className="create-header">
          <h2>Create Project Proposal</h2>
          <p>Submit your contract proposal for legal review. The company will handle document validation and follow-ups.</p>
        </div>

        <div className="create-layout">
          {/* LEFT FORM */}
          <div className="create-left">
            {/* Project Info */}
            <section className="card-box">
              <h6>Project Information</h6>

              <label htmlFor="projectName">Project Name *</label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                value={formData.projectName}
                onChange={handleChange}
              />
              {errors.projectName && <small className="error">{errors.projectName}</small>}

              <label htmlFor="targetCompany">Target Company *</label>
              <input
                id="targetCompany"
                name="targetCompany"
                type="text"
                value={formData.targetCompany}
                onChange={handleChange}
              />
              {errors.targetCompany && <small className="error">{errors.targetCompany}</small>}

              <label htmlFor="contractType">Contract Type *</label>
              <select
                id="contractType"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
              >
                <option value="">Select contract type</option>
                <option value="Lease">Lease</option>
                <option value="Software License">Software License</option>
                <option value="Employment">Employment</option>
                <option value="Service Agreement">Service Agreement</option>
              </select>
              {errors.contractType && <small className="error">{errors.contractType}</small>}

              <label htmlFor="contractSummary">Contract Summary *</label>
              <textarea
                id="contractSummary"
                name="contractSummary"
                rows={4}
                value={formData.contractSummary}
                onChange={handleChange}
              />
              {errors.contractSummary && <small className="error">{errors.contractSummary}</small>}

              <label htmlFor="contractDate">Contract Date</label>
              <input
                id="contractDate"
                name="contractDate"
                type="date"
                value={formData.contractDate}
                onChange={handleChange}
              />
            </section>

            {/* Legal Requirements */}
            <section className="card-box">
              <h6>Legal Requirements</h6>

              <label htmlFor="jurisdiction">Jurisdiction *</label>
              <input
                id="jurisdiction"
                name="jurisdiction"
                type="text"
                value={formData.jurisdiction}
                onChange={handleChange}
              />
              {errors.jurisdiction && <small className="error">{errors.jurisdiction}</small>}

              <label>Compliance Rules *</label>
              <div className="checkbox-group">
                {['Company Policies', 'SRS', 'SDD', 'Other'].map(rule => (
                  <label key={rule}>
                    <input
                      type="checkbox"
                      name="complianceRules"
                      value={rule}
                      checked={formData.complianceRules.includes(rule)}
                      onChange={handleCheckbox}
                    />
                    {rule}
                  </label>
                ))}
              </div>
              {errors.complianceRules && <small className="error">{errors.complianceRules}</small>}

              <label htmlFor="clausesOfConcern">Clauses of Concern</label>
              <textarea
                id="clausesOfConcern"
                name="clausesOfConcern"
                rows={3}
                value={formData.clausesOfConcern}
                onChange={handleChange}
              />

              <label htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Standard">Standard</option>
                <option value="Urgent">Urgent</option>
              </select>
            </section>

            {/* Analysis Preferences */}
            <section className="card-box">
              <h6>Analysis Preferences</h6>

              <label>Analysis Goals *</label>
              <div className="checkbox-group">
                {['Extract Obligations', 'Validate Against OCL', 'Simplify Legal Terms'].map(goal => (
                  <label key={goal}>
                    <input
                      type="checkbox"
                      name="analysisGoals"
                      value={goal}
                      checked={formData.analysisGoals.includes(goal)}
                      onChange={handleCheckbox}
                    />
                    {goal}
                  </label>
                ))}
              </div>
              {errors.analysisGoals && <small className="error">{errors.analysisGoals}</small>}

              <label htmlFor="reviewLevel">Review Level</label>
              <select
                id="reviewLevel"
                name="reviewLevel"
                value={formData.reviewLevel}
                onChange={handleChange}
              >
                <option value="Standard">Standard</option>
                <option value="Urgent">Urgent</option>
              </select>

              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                rows={3}
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="create-right">
            <button className="btn-primary-full" onClick={handleSave}>Save Proposal</button>
            <button className="btn-secondary-full">Preview Proposal</button>

            <div className="progress-box">
              <span>Form Completion</span>
              <strong>0%</strong>
              <div className="progress-bar"><div style={{ width: '0%' }} /></div>
              <p>Your proposal will be saved and reviewed by the company.</p>
            </div>

            <div className="guidelines-box">
              <h6>Guidelines</h6>
              <ul>
                <li>Provide a clear project title and summary</li>
                <li>Select applicable compliance rules</li>
                <li>Specify any clauses of concern or special instructions</li>
                <li>Choose priority level for the review</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default CreateProposal;
