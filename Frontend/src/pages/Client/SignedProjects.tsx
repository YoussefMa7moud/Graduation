
import React, { useState } from "react";
import ClientHeader from '../../components/Client/ClientHeader';
import './SignedProjects.css';

interface Project {
  id: string;
  name: string;
  type: string;
  completionDate: string;
  client: string;
  status: 'SIGNED';
  files: {
    label: string;
    name: string;
    size: string;
  }[];
}

const projects: Project[] = [
  {
    id: '#942',
    name: 'Commercial Lease - Cairo Plaza',
    type: 'Real Estate · Law 13/1948',
    completionDate: 'Oct 24, 2024',
    client: 'Al-Futtaim Group',
    status: 'SIGNED',
    files: [
      { label: 'Original Proposal', name: 'Proposal.pdf', size: '2.4MB' },
      { label: 'Final Signed Contracts', name: 'Lease_Agreement_Final.pdf', size: '1.8MB' },
      { label: 'Technical Documents', name: 'Floor_Plans.pdf', size: '940KB' },
    ],
  },
  {
    id: '#938',
    name: 'Master Service Agreement (SWE)',
    type: 'Tech Services · Egypt Civil Code',
    completionDate: 'Sep 12, 2024',
    client: 'Global Tech Sol.',
    status: 'SIGNED',
    files: [
      { label: 'Original Proposal', name: 'MSA_Proposal.pdf', size: '1.9MB' },
      { label: 'Final Signed Contracts', name: 'MSA_Final.pdf', size: '2.2MB' },
    ],
  },
];

const SignedProjects: React.FC = () => {
  const [selected, setSelected] = useState<Project>(projects[0]);

  return (
    <>
      <ClientHeader />

      <div className="signed-container container page-fade-in">
        {/* Header */}
        <div className="signed-header">
          <div>
            <h4 className="fw-bold">Signed Projects Repository</h4>
            <p className="text-muted">
              Secure audit trail and historical record of all completed engagements for legal and operational reference.
            </p>
          </div>

          <div className="signed-actions">
            <button className="btn btn-outline-secondary">Filter</button>
            <button className="btn btn-dark">Bulk Export</button>
          </div>
        </div>

        <div className="signed-layout">
          {/* LEFT TABLE */}
          <div className="signed-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PROJECT NAME</th>
                  <th>COMPLETION DATE</th>
                  <th>CLIENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className={selected.id === p.id ? 'active' : ''}>
                    <td>{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="sub">{p.type}</div>
                    </td>
                    <td>{p.completionDate}</td>
                    <td>{p.client}</td>
                    <td>
                    <button className="eye-icon-btn" onClick={() => setSelected(p)}>
  <i className={`bi ${selected.id === p.id ? 'bi-eye-slash' : 'bi-eye'}`}></i>
</button>
      </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              Showing 5 of 142 completed projects
              <div>
                <button>Prev</button>
                <button>Next</button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="signed-details">
            <div className="details-header">
              <span className="badge signed">SIGNED</span>
              <h6>{selected.name}</h6>
            </div>

            <div className="details-files">
              {selected.files.map((f, i) => (
                <div className="file" key={i}>
                  <div>
                    <strong>{i + 1}. {f.label}</strong>
                    <small>{f.name}</small>
                  </div>
                  <span>{f.size}</span>
                </div>
              ))}
            </div>

            <button className="download">Download Complete Bundle</button>

            <div className="audit">
              <h6>AUDIT METADATA</h6>
              <div><span>Archived By</span><span>System Admin (Auto)</span></div>
              <div><span>Retention Policy</span><span>10 Years (Corporate)</span></div>
              <div><span>Hash Verification</span><span className="verified">SHA-256 VERIFIED</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignedProjects;

