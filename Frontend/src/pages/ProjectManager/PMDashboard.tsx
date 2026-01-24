import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PMService } from '../../services/ProjectManager/PMService';
import PMLayout from '../../components/ProjectManager/PMLayout';
import { toast } from 'react-toastify';
import './PMDashboard.css';

const PMDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<any[]>([]);
    const [activeProjects, setActiveProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const pending = await PMService.getPendingProposals();
                const active = await PMService.getActiveProjects();
                setProposals(pending);
                setActiveProjects(active);
            } catch (err) {
                toast.error("Failed to load dashboard data. Please try again.");
                console.error('Error loading dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleAction = async (id: number, status: 'ACCEPTED' | 'DENIED') => {
        try {
            await PMService.updateStatus(id, status);
            toast.success(`Proposal ${status.toLowerCase()} successfully.`);
            setProposals(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            toast.error("Failed to update proposal status. Please try again.");
            console.error('Error updating proposal status:', err);
        }
    };

    const filteredProjects = activeProjects.filter(project =>
        project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <PMLayout>
                <div className="pm-dashboard-content">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
            </PMLayout>
        );
    }

    return (
        <PMLayout>
            <div className="pm-dashboard-content">
                <header className="dashboard-main-header">
                    <div>
                        <h1 className="display-title">Project Manager Dashboard</h1>
                        <p className="subtitle">Oversee incoming proposals and manage active technical documentation projects.</p>
                    </div>
                    <div className="search-wrapper">
                        <i className="bi bi-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search projects"
                        />
                    </div>
                </header>

                <section className="dashboard-section mt-5" aria-labelledby="proposals-heading">
                    <h2 id="proposals-heading" className="section-label">
                        Proposal Requests <span className="count-pill">{proposals.length}</span>
                    </h2>
                    {proposals.length === 0 ? (
                        <p className="no-data">No pending proposals at this time.</p>
                    ) : (
                        <div className="proposal-grid" role="list">
                            {proposals.map(prop => (
                                <div key={prop.id} className="proposal-card-modern" role="listitem">
                                    <span className="tag-new" aria-label="New proposal">NEW</span>
                                    <h3>{prop.projectTitle}</h3>
                                    <p className="client-subtext">Client: {prop.clientName}</p>
                                    <div className="card-stats">
                                        <span>Budget: ${prop.budgetUsd}</span> • <span>Duration: {prop.durationDays} Days</span>
                                    </div>
                                    <div className="card-btns">
                                        <button
                                            className="btn-accept-sm"
                                            onClick={() => handleAction(prop.id, 'ACCEPTED')}
                                            aria-label={`Accept proposal for ${prop.projectTitle}`}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn-deny-sm"
                                            onClick={() => handleAction(prop.id, 'DENIED')}
                                            aria-label={`Deny proposal for ${prop.projectTitle}`}
                                        >
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="dashboard-section mt-5" aria-labelledby="active-projects-heading">
                    <h2 id="active-projects-heading" className="section-label">Active Projects</h2>
                    {filteredProjects.length === 0 ? (
                        <p className="no-data">No active projects match your search.</p>
                    ) : (
                        <div className="table-responsive-custom">
                            <table className="modern-pm-table" role="table" aria-label="Active projects table">
                                <thead>
                                    <tr>
                                        <th scope="col">Project Name</th>
                                        <th scope="col">Type</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Technical Documentation</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map(project => (
                                        <tr key={project.id}>
                                            <td className="fw-bold">{project.projectTitle}</td>
                                            <td>{project.projectType}</td>
                                            <td><span className="badge-active" aria-label="Active status">Active</span></td>
                                            <td>
                                                <button
                                                    className="doc-link-item"
                                                    onClick={() => navigate(`/pm/workspace/${project.id}`)}
                                                    aria-label={`View technical documentation for ${project.projectTitle}`}
                                                >
                                                    <i className="bi bi-file-earmark-pdf" aria-hidden="true"></i> miu.pdf
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-open-workspace"
                                                    onClick={() => navigate(`/pm/workspace/${project.id}`)}
                                                    aria-label={`Open workspace for ${project.projectTitle}`}
                                                >
                                                    Open Workspace
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </PMLayout>
    );
};

export default PMDashboard;