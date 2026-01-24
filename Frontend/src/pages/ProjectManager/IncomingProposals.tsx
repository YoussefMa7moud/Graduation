import React, { useState, useEffect } from 'react';
import PMLayout from '../../components/ProjectManager/PMLayout';
import { PMService } from '../../services/ProjectManager/PMService';
import { toast } from 'react-toastify';
import './IncomingProposals.css';

const IncomingProposals: React.FC = () => {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        try {
            const data = await PMService.getPendingProposals();
            setProposals(data);
        } catch (err) {
            toast.error("Failed to fetch proposals");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'ACCEPTED' | 'DENIED') => {
        try {
            await PMService.updateStatus(id, action);
            toast.success(`Proposal ${action.toLowerCase()} successfully`);
            setProposals(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            toast.error("Action failed");
        }
    };

    return (
        <PMLayout>
            <div className="proposals-container animate-fade-in">
                <header className="proposals-header">
                    <div>
                        <h1 className="page-title">Incoming Proposals</h1>
                        <p className="page-subtitle">Review and approve client project requests.</p>
                    </div>
                    <div className="proposal-stats">
                        <div className="stat-box">
                            <span className="stat-value">{proposals.length}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                </header>

                <div className="proposals-list">
                    {proposals.length === 0 ? (
                        <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <p>No new proposals at the moment.</p>
                        </div>
                    ) : (
                        proposals.map(prop => (
                            <div key={prop.id} className="proposal-row-card">
                                <div className="prop-main-info">
                                    <div className="prop-icon">
                                        <i className="bi bi-file-earmark-plus"></i>
                                    </div>
                                    <div>
                                        <h3>{prop.projectTitle}</h3>
                                        <p className="client-tagline">Client: <strong>{prop.clientName}</strong></p>
                                    </div>
                                </div>

                                <div className="prop-details">
                                    <div className="detail-pill">
                                        <i className="bi bi-currency-dollar"></i> ${prop.budgetUsd.toLocaleString()}
                                    </div>
                                    <div className="detail-pill">
                                        <i className="bi bi-calendar-event"></i> {prop.durationDays} Days
                                    </div>
                                </div>

                                <div className="prop-actions">
                                    <button className="btn-approve" onClick={() => handleAction(prop.id, 'ACCEPTED')}>
                                        <i className="bi bi-check-lg"></i> Approve
                                    </button>
                                    <button className="btn-reject" onClick={() => handleAction(prop.id, 'DENIED')}>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PMLayout>
    );
};

export default IncomingProposals;