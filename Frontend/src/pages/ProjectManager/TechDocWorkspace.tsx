import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMLayout from '../../components/ProjectManager/PMLayout';
import './PMStyles.css';

const TechnicalDocWorkspace: React.FC = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    return (
       
            <div className="workspace-container animate-fade-in">
                <div className="workspace-header">
                    <div>
                        <h2 className="title-navy">Project Workspace: #{projectId}</h2>
                        <p className="text-muted">Manage documentation and technical validation for this project.</p>
                    </div>
                    <button className="btn-validate" onClick={() => alert("OCL Validation Started...")}>
                        <i className="bi bi-shield-check"></i> Validate with OCL
                    </button>
                </div>

                <div className="workspace-grid">
                    {/* File Card */}
                    <div className="doc-card" onClick={() => navigate(`/TechDocEditor`)}>
                        <div className="doc-icon">
                            <i className="bi bi-file-earmark-pdf-fill"></i>
                        </div>
                        <div className="doc-info">
                            <h4>miu.pdf</h4>
                            <p>Base: Technical_Document_template.pdf</p>
                            <span className="status-tag">Template Loaded</span>
                        </div>
                        <i className="bi bi-chevron-right arrow-icon"></i>
                    </div>

                    {/* Project Details Card */}
                    <div className="details-card">
                        <h5>Project Context</h5>
                        <div className="detail-item">
                            <span>Status:</span> <strong className="text-success">Active</strong>
                        </div>
                        <div className="detail-item">
                            <span>Last Edited:</span> <span>Just now</span>
                        </div>
                    </div>
                </div>
            </div>
       
    );
};

export default TechnicalDocWorkspace;