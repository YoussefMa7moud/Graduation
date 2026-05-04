import React, { useState, useEffect } from 'react';
import StatCard from '../../components/Company/CompanyHome/StatCard';
import { getDashboardStats } from '../../services/Company/companyService';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CompanyHome.css';

interface MonthlyStat {
    name: string;
    contracts: number;
    requests: number;
}

const CompanyHome: React.FC = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
      totalContracts: 0,
      activeRequests: 0,
      totalProjectManagers: 0,
      graphData: [] as MonthlyStat[]
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    const data = await getDashboardStats();
    if (data) {
        setStats(data);
    }
  };

  return (
    <div className="container page-fade-in py-4">
      <div className="corporate-container w-100 p-0" style={{ backgroundColor: 'transparent' }}>
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
            <div>
               <h3 className="fw-bold mb-1 text-dark">Dashboard Overview</h3>
               <p className="text-muted">Welcome back! Here is what's happening today.</p>
            </div>
        </div>

        {/* 3 Overview Stat Cards */}
        <div className="row g-4 mb-5">
           <div className="col-md-4">
               <StatCard title="Total Contracts" value={stats.totalContracts.toLocaleString()} icon="bi-file-earmark-text" variant="gray" />
           </div>
           <div className="col-md-4">
               <StatCard title="Active Requests" value={stats.activeRequests.toString()} icon="bi-envelope-paper" variant="mint" />
           </div>
           {user?.role !== 'company_employee' && (
             <div className="col-md-4">
                 <StatCard title="Project Managers" value={stats.totalProjectManagers.toString()} icon="bi-people" variant="blue" />
             </div>
           )}
        </div>

        {/* Conditional Layout based on Role */}
        {user?.role === 'company_employee' ? (
          <div className="bg-white rounded-4 shadow-sm border p-5 text-center mt-4">
             <div className="mb-4">
                <i className="bi bi-shield-check text-mint" style={{ fontSize: '4rem' }}></i>
             </div>
             <h3 className="fw-bold mb-3">Welcome to SoftwareGuard Company Portal</h3>
             <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
               You are logged in as an authorized employee. Use the navigation menu on the left to access client requests, your contract repository, or the policy engine based on your assigned permissions.
             </p>
          </div>
        ) : (
          <div className="bg-white rounded-4 shadow-sm border p-4 w-100 mt-2">
             <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h5 className="fw-bold m-0 text-dark">
                    <i className="bi bi-graph-up-arrow me-2 text-mint"></i> 
                    Company Trajectory (6 Months)
                </h5>
             </div>
             
             {/* Recharts Trajectory Graph */}
             {stats.graphData && stats.graphData.length > 0 ? (
                 <div style={{ width: '100%', height: '400px' }}>
                     <ResponsiveContainer width="100%" height="100%">
                         <LineChart
                             data={stats.graphData}
                             margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                         >
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis 
                                 dataKey="name" 
                                 axisLine={false} 
                                 tickLine={false} 
                                 tick={{ fill: '#64748b', fontSize: 13 }} 
                                 dy={10} 
                             />
                             <YAxis 
                                 axisLine={false} 
                                 tickLine={false} 
                                 tick={{ fill: '#64748b', fontSize: 13 }} 
                                 dx={-10}
                                 allowDecimals={false}
                             />
                             <Tooltip 
                                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                 labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                             />
                             <Legend 
                                 verticalAlign="top" 
                                 height={36} 
                                 iconType="circle"
                                 wrapperStyle={{ fontSize: '14px', fontWeight: 500, color: '#475569' }} 
                             />
                             
                             <Line 
                                 name="Active Requests" 
                                 type="monotone" 
                                 dataKey="requests" 
                                 stroke="#3b82f6" 
                                 strokeWidth={3}
                                 dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                                 activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }}
                                 animationDuration={1500}
                             />
                             <Line 
                                 name="Signed Contracts" 
                                 type="monotone" 
                                 dataKey="contracts" 
                                 stroke="#10b981" 
                                 strokeWidth={3}
                                 dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                                 activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                                 animationDuration={1500}
                             />
                         </LineChart>
                     </ResponsiveContainer>
                 </div>
             ) : (
                 <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Loading trajectory data...
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyHome;