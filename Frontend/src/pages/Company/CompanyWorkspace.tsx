import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CompanyWorkspace.css';

interface Clause {
  id: string;
  text: string;
  violation?: { law: string; article: string; suggestion: string };
}

interface Section {
  id: string;
  title: string;
  num: number;
  clauses: Clause[];
}

const CompanyWorkspace: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([
    { id: 's1', num: 1, title: "DEVELOPER'S DUTIES", clauses: [{ id: 'c1', text: "" }] },
    { id: 's2', num: 2, title: "DELIVERY", clauses: [{ id: 'c2', text: "" }] },
    { id: 's3', num: 3, title: "COMPENSATION", clauses: [{ id: 'c3', text: "" }] },
    { id: 's4', num: 4, title: "INTELLECTUAL PROPERTY RIGHTS", clauses: [{ id: 'c4', text: "" }] },
    { id: 's5', num: 5, title: "CHANGE IN SPECIFICATIONS", clauses: [{ id: 'c5', text: "" }] },
    { id: 's6', num: 6, title: "CONFIDENTIALITY", clauses: [{ id: 'c6', text: "" }] },
    { id: 's7', num: 7, title: "DEVELOPER WARRANTIES", clauses: [{ id: 'c7', text: "" }] },
    { id: 's8', num: 8, title: "INDEMNIFICATION", clauses: [{ id: 'c8', text: "" }] },
    { id: 's10', num: 10, title: "APPLICABLE LAW", clauses: [{ id: 'c10', text: "This Software Development Agreement and the interpretation of its terms shall be governed by and construed in accordance with the laws of Egypt and subject to the exclusive jurisdiction of the courts located in Cairo, Egypt." }] },
  ]);

  const [activeTab, setActiveTab] = useState<'intel' | 'chat'>('intel');
  const [chatInput, setChatInput] = useState("");

  const handleUpdate = (sId: string, cId: string, val: string) => {
    setSections(prev => prev.map(s => s.id === sId ? {
      ...s, clauses: s.clauses.map(c => c.id === cId ? { ...c, text: val } : c)
    } : s));
  };

  const handleKeys = (e: React.KeyboardEvent, sIdx: number, cIdx: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newSections = [...sections];
      newSections[sIdx].clauses.splice(cIdx + 1, 0, { id: `cl-${Date.now()}`, text: "" });
      setSections(newSections);
    } else if (e.key === 'Backspace' && sections[sIdx].clauses[cIdx].text === "" && sections[sIdx].clauses.length > 1) {
      e.preventDefault();
      const newSections = [...sections];
      newSections[sIdx].clauses.splice(cIdx, 1);
      setSections(newSections);
    }
  };

  return (
    <div className="ws-wrapper">
      <header className="ws-nav">
        <div className="nav-info">
          <span className="doc-label">Enterprise / <strong>SLA_v2_Egypt.pdf</strong></span>
          <div className="compliance-tag">EGY-LAW COMPLIANT ONLY</div>
        </div>
        <div className="nav-btns">
          <button className="btn-sec">Export Draft</button>
          <button className="btn-navy">Re-Analyze AI</button>
        </div>
      </header>

      <div className="ws-content">
        <section className="editor-scroller">
          
          {/* PAGE 1: COVER PAGE */}
          <div className="a4-page cover-page">
            <h1 className="cover-title">Software Development Agreement</h1>
            <div className="cover-grid">
              <div className="cover-block">
                <span className="cover-label">Prepared for:</span>
                <p>[Client.FirstName] [Client.LastName]</p>
                <p><strong>[Client.Company]</strong></p>
              </div>
              <div className="cover-block">
                <span className="cover-label">Prepared by:</span>
                <p>[Sender.FirstName] [Sender.LastName]</p>
                <p><strong>[Sender.Company]</strong></p>
              </div>
            </div>
          </div>

          {/* PAGE 2: RECITALS & INTRO */}
          <div className="a4-page">
            <div className="locked-legal-text">
              <p>This Software Development Agreement (the “Agreement”) states the terms and conditions that govern the contractual agreement between <strong>[Sender.Company]</strong> having his principal place of business at 200 Clock Tower Pl Carmel, California(CA), 93923, (the “Developer”), and <strong>[Client.Company]</strong> having its principal place of business at 200 Gainsborough Cir Folsom, California(CA), 95630 (the “Client”) who agrees to be bound by this Agreement.</p>
              
              <p><strong>WHEREAS</strong>, the Client has conceptualized [QUICK DESCRIPTION OF SOFTWARE] (the “Software”), which is described in further detail on Exhibit A, and the Developer is a contractor with whom the Client has come to an agreement to develop the Software.</p>
              
              <p><strong>NOW, THEREFORE</strong>, In consideration of the mutual covenants and promises made by the parties to this Software Development Agreement, the Developer and the Client (individually, each a “Party” and collectively, the “Parties”) covenant and agree as follows:</p>
              
              <div className="egypt-notice">
                <i className="bi bi-info-circle-fill me-2"></i>
                NOTICE: This document is drafted for exclusive compliance with Egyptian Statutory Rules.
              </div>
            </div>

            {/* DYNAMIC SECTIONS START HERE */}
            {sections.map((section, sIdx) => (
              <div key={section.id} className="section-container">
                <h3 className="section-h3">{section.num}. {section.title}</h3>
                {section.clauses.map((clause, cIdx) => (
                  <div key={clause.id} className="clause-row">
                    <span className="c-num">{section.num}.{cIdx + 1}</span>
                    <textarea
                      className="c-input"
                      value={clause.text}
                      onChange={(e) => handleUpdate(section.id, clause.id, e.target.value)}
                      onKeyDown={(e) => handleKeys(e, sIdx, cIdx)}
                      rows={1}
                      placeholder="Enter clause text..."
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* SIGNATURE BLOCK */}
            <div className="signature-area">
              <div className="sig-row">
                <div className="sig-box"><span>Client Signature</span></div>
                <div className="sig-box"><span>Developer Signature</span></div>
              </div>
              <div className="sig-row mt-3">
                <div className="sig-date">Date: ____ / ____ / 2026</div>
                <div className="sig-date">Date: ____ / ____ / 2026</div>
              </div>
            </div>
          </div>

        </section>

        {/* SIDEBAR */}
        <aside className="ws-sidebar">
          <div className="tabs">
            <button className={activeTab === 'intel' ? 'active' : ''} onClick={() => setActiveTab('intel')}>Intelligence</button>
            <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>Collaboration</button>
          </div>
          <div className="side-body">
            {activeTab === 'intel' ? (
              <div className="intel-pane">
                <div className="risk-card">
                  <div className="d-flex justify-content-between"><small>COMPLIANCE</small> <span className="text-mint">92%</span></div>
                  <div className="p-bar"><div className="p-fill" style={{width: '92%'}}></div></div>
                </div>
                <div className="rule-list">
                  <div className="rule-item"><i className="bi bi-check2-all text-mint"></i> Egyptian Civil Code Art. 147</div>
                  <div className="rule-item"><i className="bi bi-check2-all text-mint"></i> Labor Law No. 12</div>
                </div>
              </div>
            ) : (
              <div className="chat-pane">
                <div className="chat-msgs">
                  <div className="msg system">Legal AI: Document updated to Cairo Jurisdiction.</div>
                </div>
                <div className="chat-input-wrap">
                  <input type="text" placeholder="Send message..." />
                  <button><i className="bi bi-send-fill"></i></button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CompanyWorkspace;