import React, { useState, type ChangeEvent } from 'react';
import ClientHeader from '../../components/Client/ClientHeader';
import './CreateProposal.css';

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

  // Generic input change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Checkbox handler
  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
      const arr = prev[name as keyof FormData] as string[];
      if (checked) return { ...prev, [name]: [...arr, value] };
      return { ...prev, [name]: arr.filter(v => v !== value) };
    });
  };

  const handleSave = () => {
    console.log('Saving proposal:', formData);
    // TODO: Send formData to backend API
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
              <input type="text" name="projectName" placeholder="Project Name" value={formData.projectName} onChange={handleChange} />
              <input type="text" name="targetCompany" placeholder="Target Company" value={formData.targetCompany} onChange={handleChange} />
              <select name="contractType" value={formData.contractType} onChange={handleChange}>
                <option value="">Contract Type</option>
                <option value="Lease">Lease</option>
                <option value="Software License">Software License</option>
                <option value="Employment">Employment</option>
                <option value="Service Agreement">Service Agreement</option>
              </select>
              <textarea name="contractSummary" placeholder="Brief Contract Summary" value={formData.contractSummary} onChange={handleChange} />
              <input type="date" name="contractDate" value={formData.contractDate} onChange={handleChange} />
            </section>

            {/* Legal Requirements */}
            <section className="card-box">
              <h6>Legal Requirements</h6>
              <input type="text" name="jurisdiction" placeholder="Jurisdiction (e.g., Egypt)" value={formData.jurisdiction} onChange={handleChange} />
              <div className="checkbox-group">
                {['Company Policies','SRS','SDD','Other'].map(rule => (
                  <label key={rule}>
                    <input type="checkbox" name="complianceRules" value={rule} checked={formData.complianceRules.includes(rule)} onChange={handleCheckbox} />
                    {rule}
                  </label>
                ))}
              </div>
              <textarea name="clausesOfConcern" placeholder="Clauses of Concern / Special Instructions" value={formData.clausesOfConcern} onChange={handleChange} />
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Standard">Standard</option>
                <option value="Urgent">Urgent</option>
              </select>
            </section>

            {/* Analysis Preferences */}
            <section className="card-box">
              <h6>Analysis Preferences</h6>
              <div className="checkbox-group">
                {['Extract Obligations','Validate Against OCL','Simplify Legal Terms'].map(goal => (
                  <label key={goal}>
                    <input type="checkbox" name="analysisGoals" value={goal} checked={formData.analysisGoals.includes(goal)} onChange={handleCheckbox} />
                    {goal}
                  </label>
                ))}
              </div>
              <select name="reviewLevel" value={formData.reviewLevel} onChange={handleChange}>
                <option value="Standard">Standard</option>
                <option value="Urgent">Urgent</option>
              </select>
              <textarea name="additionalNotes" placeholder="Additional Notes" value={formData.additionalNotes} onChange={handleChange} />
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
