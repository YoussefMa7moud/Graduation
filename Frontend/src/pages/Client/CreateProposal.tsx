import React, { useState, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitProposal } from '../../services/Client/ProposalDocumnet'; // Ensure this path is correct
import './CreateProposal.css';

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

  // STUB: Replace this with your actual Auth Context/User logic
  const loggedInClientId = "550e8400-e29b-41d4-a716-446655440000"; 

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

  const requiredFields: (keyof FormData)[] = [
    'projectName',
    'projectDescription',
    'problemSolved',
    'projectType',
    'mainFeatures',
    'expectedDuration',
    'budgetRange'
  ];

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
    if (!formData.budgetRange) newErrors.budgetRange = 'Budget is required';
    if (!formData.expectedDuration) newErrors.expectedDuration = 'Duration is required';
    if (!formData.projectType) newErrors.projectType = 'Project type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'budgetRange' || name === 'expectedDuration') {
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

    // Mapping React state to Spring Boot Entity DTO
    const payload = {
      clientId: loggedInClientId,
      projectTitle: formData.projectName,
      projectType: formData.projectType,
      problemSolved: formData.problemSolved,
      description: formData.projectDescription,
      mainFeatures: formData.mainFeatures,
      userRoles: formData.userRoles,
      scalability: formData.scalability,
      durationDays: parseInt(formData.expectedDuration),
      budgetUsd: parseFloat(formData.budgetRange),
      ndaRequired: formData.ndaRequired,
      codeOwnership: formData.codeOwnership,
      maintenancePeriod: formData.maintenancePeriod,
    };

    try {
      await SubmitProposal(payload);
      navigate('/proposals/submission');
    } catch (error) {
      alert("Error submitting proposal. Please check if the server is connected.");
      console.error(error);
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
        <p>Define your software requirements and legal terms for pricing calculation.</p>
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
            <textarea name="mainFeatures" placeholder="Auth, Payment, Dashboard..." rows={3} value={formData.mainFeatures} onChange={handleChange} />
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
            <h6>💰 Time & Budget</h6>
            <div className="two-cols">
              <div>
                <label>Duration (Days) *</label>
                <input name="expectedDuration" type="text" value={formData.expectedDuration} onChange={handleChange} placeholder="90" />
                {errors.expectedDuration && <small className="error">{errors.expectedDuration}</small>}
              </div>
              <div>
                <label>Budget (USD) *</label>
                <input name="budgetRange" type="text" value={formData.budgetRange} onChange={handleChange} placeholder="5000" />
                {errors.budgetRange && <small className="error">{errors.budgetRange}</small>}
              </div>
            </div>
          </section>

          <section className="card-box">
            <h6>📜 Ownership & Legal</h6>
            <div className="nda-container">
              <div className="nda-info">
                <strong>NDA Required?</strong>
                <p>Enable if a non-disclosure agreement is needed.</p>
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
                  <option value="Client">Client (Full Ownership)</option>
                  <option value="Company">Company (License)</option>
                  <option value="Shared">Shared</option>
                </select>
              </div>
              <div>
                <label>Maintenance Period</label>
                <select name="maintenancePeriod" value={formData.maintenancePeriod} onChange={handleChange}>
                  <option value="None">None</option>
                  <option value="1 Month">1 Month (Free)</option>
                  <option value="3 Months">3 Months</option>
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

          <div className="progress-box">
            <span>Form Completion</span>
            <strong className={progress === 100 ? "complete-text" : ""}>{progress}%</strong>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>{progress < 100 ? 'Fill all fields marked with *' : 'Ready to save!'}</p>
          </div>

          <div className="guidelines-box">
            <h6>Tips for Filling</h6>
            <ul>
              <li>Use <strong>numbers only</strong> for budget and duration.</li>
              <li>Toggle the <strong>NDA</strong> switch for sensitive projects.</li>
              <li>Provide clear <strong>Functional Requirements</strong>.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateProposal;