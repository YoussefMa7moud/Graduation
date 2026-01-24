import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PMService } from '../../services/ProjectManager/PMService';
import { toast } from 'react-toastify';
import './PMDashboard.css';

// Define TypeScript interfaces for better type safety and professionalism
interface Proposal {
    id: number;
    projectTitle: string;
    clientName: string;
    budgetUsd: number;
    durationDays: number;
}

interface ActiveProject {
    id: number;
    projectTitle: string;
    projectType: string;
    // Add other fields as needed based on your data structure
}

interface RecentActivity {
    id: number;
    description: string;
    timestamp: string;
}

interface UpcomingDeadline {
    id: number;
    projectTitle: string;
    deadline: string;
    daysLeft: number;
}

const PMDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'proposals' | 'projects'>('all');
    const [error, setError] = useState<string | null>(null);

    // Mock data for new sections (replace with real API calls if available)
    const [recentActivities] = useState<RecentActivity[]>([
        { id: 1, description: "Proposal for 'Tech Doc Project A' accepted", timestamp: "2 hours ago" },
        { id: 2, description: "New project 'API Documentation' started", timestamp: "1 day ago" },
        { id: 3, description: "Client feedback received for 'User Manual B'", timestamp: "3 days ago" },
    ]);

    const [upcomingDeadlines] = useState<UpcomingDeadline[]>([
        { id: 1, projectTitle: "Tech Doc Project A", deadline: "2023-10-15", daysLeft: 5 },
        { id: 2, projectTitle: "API Documentation", deadline: "2023-10-20", daysLeft: 10 },
        { id: 3, projectTitle: "User Manual B", deadline: "2023-10-25", daysLeft: 15 },
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setError(null);
                const [pending, active] = await Promise.all([
                    PMService.getPendingProposals(),
                    PMService.getActiveProjects()
                ]);
                setProposals(pending);
                setActiveProjects(active);
            } catch (err) {
                const errorMessage = "Failed to load dashboard data. Please try again.";
                setError(errorMessage);
                toast.error(errorMessage);
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

    // Enhanced search/filter: Now filters both proposals and active projects by multiple fields, with type filter
    const filteredProposals = useMemo(() => {
        let filtered = proposals;
        if (searchTerm) {
            filtered = filtered.filter(prop =>
                prop.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [proposals, searchTerm]);

    const filteredProjects = useMemo(() => {
        let filtered = activeProjects;
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.projectType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [activeProjects, searchTerm]);

    // Limit proposals to 4 for display, with View More
    const displayedProposals = filteredProposals.slice(0, 4);

    if (loading) {
        return (
        
                <div className="pm-dashboard-content">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading dashboard...</p>
                    </div>
                </div>
         
        );
    }

    if (error) {
        return (
          
                <div className="pm-dashboard-content">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                </div>
         
        );
    }

    return (
     
            <div className="pm-dashboard-content">
                {/* Enhanced Header with Stats */}
                <header className="dashboard-main-header">
                    <div className="header-left">
                        <h1 className="display-title">Project Manager Dashboard</h1>
                        <p className="subtitle">Oversee incoming proposals and manage active technical documentation projects.</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-card">
                            <h3>{proposals.length}</h3>
                            <p>Pending Proposals</p>
                        </div>
                        <div className="stat-card">
                            <h3>{activeProjects.length}</h3>
                            <p>Active Projects</p>
                        </div>
                    </div>
                </header>

                {/* Advanced Search and Filter Bar */}
                <div className="search-filter-bar">
                    <div className="search-wrapper">
                        <i className="bi bi-search" aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder="Search proposals and projects..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search proposals and projects"
                        />
                    </div>
                    <div className="filter-dropdown">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as 'all' | 'proposals' | 'projects')}
                            className="filter-select"
                        >
                            <option value="all">All</option>
                            <option value="proposals">Proposals Only</option>
                            <option value="projects">Projects Only</option>
                        </select>
                    </div>
                </div>

                {/* Proposal Requests Section with Limit and View More */}
                {(filterType === 'all' || filterType === 'proposals') && (
                    <section className="dashboard-section mt-5" aria-labelledby="proposals-heading">
                        <h2 
                            id="proposals-heading" 
                            className="section-label clickable" 
                           
                            style={{ cursor: 'pointer' }}
                        >
                            Proposal Requests <span className="count-pill">{filteredProposals.length}</span>
                            <i className="bi bi-chevron-right" style={{ marginLeft: 'auto' }}></i>
                        </h2>
                        {displayedProposals.length === 0 ? (
                            <p className="no-data">No pending proposals match your search.</p>
                        ) : (
                            <>
                                <div className="proposal-grid" role="list">
                                    {displayedProposals.map(prop => (
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
                                {filteredProposals.length > 4 && (
                                    <div className="view-more-container">
                                        <button
                                            className="btn-view-more"
                                            onClick={() => navigate('/proposalrequests')}
                                            aria-label="View all proposal requests"
                                        >
                                            View More Proposals
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* Active Projects Section */}
                {(filterType === 'all' || filterType === 'projects') && (
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
                )}

                {/* New Section: Recent Activities */}
                <section className="dashboard-section mt-5" aria-labelledby="recent-activities-heading">
                    <h2 id="recent-activities-heading" className="section-label">Recent Activities</h2>
                    <div className="activity-list">
                        {recentActivities.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <p>{activity.description}</p>
                                <span className="activity-timestamp">{activity.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* New Section: Upcoming Deadlines */}
                <section className="dashboard-section mt-5" aria-labelledby="upcoming-deadlines-heading">
                    <h2 id="upcoming-deadlines-heading" className="section-label">Upcoming Deadlines</h2>
                    <div className="deadline-list">
                        {upcomingDeadlines.map(deadline => (
                            <div key={deadline.id} className="deadline-item">
                                <h4>{deadline.projectTitle}</h4>
                                <p>Deadline: {deadline.deadline}</p>
                                <span className={`days-left ${deadline.daysLeft <= 7 ? 'urgent' : ''}`}>
                                    {deadline.daysLeft} days left
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

             
            </div>
    
    );
};

export default PMDashboard;