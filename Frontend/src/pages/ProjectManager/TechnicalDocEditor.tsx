import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PMLayout from '../../components/ProjectManager/PMLayout';
import './PMStyles.css';

const TechnicalDocEditor: React.FC = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const templatePath = "/Technical_Document_Template.pdf";
    const [notes, setNotes] = useState("");

    // Load notes from localStorage on component mount
    useEffect(() => {
        const savedNotes = localStorage.getItem(`techNotes_${projectId}`);
        if (savedNotes) {
            setNotes(savedNotes);
        }
    }, [projectId]);

    // Function to save notes to localStorage
    const saveNotes = () => {
        localStorage.setItem(`techNotes_${projectId}`, notes);
        alert("Notes saved locally!");
    };

    return (
        <PMLayout>
            <div className="editor-page-container animate-fade-in">
                <div className="editor-top-bar">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left"></i> Back to Workspace
                    </button>
                    <div className="editor-title">
                        Editing <strong>Technical Document Template</strong> for Project #{projectId}
                    </div>
                    <button className="btn-save-main" onClick={saveNotes}>Save Progress</button>
                </div>

                <div className="editor-main-layout">
                    
                    <div className="pdf-viewer-section">
                        <iframe 
                            src={templatePath}  // Removed #toolbar=0 to show the PDF toolbar, allowing filling of form fields and saving the edited PDF locally via the viewer's save option
                            title="Technical Template"
                            className="pdf-iframe"
                        />
                    </div>

                  
                    <div className="edit-controls-section">
                        <div className="edit-card">
                            <label><i className="bi bi-pencil-square"></i> Technical Notes & Overrides</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add project-specific technical requirements here..."
                                className="tech-textarea"
                            />
                        </div>
                        <div className="action-box">
                            <button className="btn-ocl-action">
                                <i className="bi bi-cpu"></i> Run OCL Validation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PMLayout>
    );
};

export default TechnicalDocEditor;