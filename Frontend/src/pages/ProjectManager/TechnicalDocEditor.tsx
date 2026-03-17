import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  ZoomIn,
  ZoomOut,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

// ─── Design tokens — light, matching PMLayout (#f8fafc) ──────────────────────
const tk = {
  canvasBg:    '#e2e8f0',   // document canvas keeps paper feel
  fieldBg:     '#f8faff',
  border:      'rgba(0,0,0,0.09)',
  borderLight: '#e2e8f0',
  dashBorder:  '#c7d2fe',
  text:        '#0f172a',
  textMuted:   '#64748b',
  textHint:    '#a5b4fc',
  textDim:     '#94a3b8',
  nav:         '#1e293b',
  navBorder:   'rgba(255,255,255,0.07)',
  navText:     '#94a3b8',
  navTextSub:  '#475569',
  navActive:   'rgba(59,130,246,0.12)',
  navHighlight:'#60a5fa',
  blue:        '#2563eb',
  sansFont:    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serifFont:   'Georgia, "Times New Roman", serif',
  radius:      '7px',
  radiusSm:    '4px',
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  .tde-field[contenteditable]:empty:before { content:attr(data-ph); color:#a5b4fc; font-style:italic; pointer-events:none; }
  .tde-field[contenteditable]:focus { border-color:#3b82f6 !important; background:#eff6ff !important; outline:none; }
  .tde-inline[contenteditable]:empty:before { content:attr(data-ph); color:#a5b4fc; font-style:italic; }
  .tde-inline[contenteditable]:focus { border-bottom-color:#3b82f6 !important; background:#eff6ff; outline:none; }
  .doc-table { width:100%; border-collapse:collapse; font-size:12px; margin:10px 0; }
  .doc-table th { background:#1e293b; color:#f1f5f9; padding:7px 10px; text-align:left; font-weight:500; font-size:11px; font-family:${tk.sansFont}; }
  .doc-table td { border:0.5px solid #e2e8f0; padding:6px 10px; vertical-align:top; color:#334155; font-size:12px; }
  .doc-table td[contenteditable]:empty:before { content:attr(data-ph); color:#a5b4fc; font-style:italic; }
  .doc-table td[contenteditable]:focus { background:#eff6ff; outline:none; }
  .toc-row  { display:flex; justify-content:space-between; align-items:baseline; font-size:13px; padding:3px 0; color:#222; border-bottom:0.5px dotted #ddd; font-family:${tk.sansFont}; }
  .toc-sub  { padding-left:20px; font-size:12px; color:#555; }
  .toc-sub2 { padding-left:38px; font-size:11px; color:#777; }
  .toc-pg   { color:#999; font-size:11px; font-family:${tk.sansFont}; }
  @keyframes tde-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .tde-sidebar-btn:hover { background:rgba(255,255,255,0.05) !important; color:#cbd5e1 !important; }
`;

// ─── Nav ──────────────────────────────────────────────────────────────────────
interface NavEntry { id: string; label: string; group: string; sub?: boolean }

const NAV: NavEntry[] = [
  { id:'cover',    label:'Cover page',                  group:'Preliminary' },
  { id:'abstract', label:'Abstract',                    group:'Preliminary' },
  { id:'toc',      label:'Table of contents',           group:'Preliminary' },
  { id:'ch1',      label:'Chapter 1 — Introduction',    group:'Chapter 1' },
  { id:'ch1',      label:'1.1  Motivation',              group:'Chapter 1', sub:true },
  { id:'ch1',      label:'1.2  Aims & objectives',       group:'Chapter 1', sub:true },
  { id:'ch1',      label:'1.4  System overview',         group:'Chapter 1', sub:true },
  { id:'ch1',      label:'1.5  Management',              group:'Chapter 1', sub:true },
  { id:'ch2',      label:'Chapter 2 — Background',       group:'Chapter 2' },
  { id:'ch3',      label:'Chapter 3 — Requirements',     group:'Chapter 3' },
  { id:'ch3',      label:'3.2  Functional req.',          group:'Chapter 3', sub:true },
  { id:'ch3',      label:'3.3  Interface req.',           group:'Chapter 3', sub:true },
  { id:'ch3',      label:'3.5  Non-functional req.',      group:'Chapter 3', sub:true },
  { id:'ch4a',     label:'Chapter 4 — Architecture',     group:'Chapter 4' },
  { id:'ch4a',     label:'4.2  Architecture viewpoints',  group:'Chapter 4', sub:true },
  { id:'ch4b',     label:'4.3–4.5  Data & HCI',          group:'Chapter 4' },
  { id:'ch4c',     label:'4.6–4.9  Testing & Deploy',    group:'Chapter 4' },
  { id:'bib',      label:'Bibliography',                 group:'Closing' },
  { id:'app',      label:'Appendix A',                   group:'Closing' },
];

const NAV_GROUPS = Array.from(new Set(NAV.map(n => n.group)));
type FieldStore = Record<string, string>;

// ─── Editable primitives ──────────────────────────────────────────────────────
interface FieldProps { fieldId: string; placeholder: string; style?: React.CSSProperties; oneLine?: boolean }

const Field: React.FC<FieldProps> = ({ fieldId, placeholder, style, oneLine }) => (
  <div id={`tde-${fieldId}`} className="tde-field" contentEditable suppressContentEditableWarning data-ph={placeholder}
    style={{ background:tk.fieldBg, border:`0.5px dashed ${tk.dashBorder}`, borderRadius:tk.radiusSm, padding:'10px 14px', margin:'8px 0', minHeight:oneLine?36:64, fontSize:13, lineHeight:1.7, color:'#1e293b', fontFamily:tk.serifFont, whiteSpace:'pre-wrap', ...style }} />
);

const Inline: React.FC<{ fieldId:string; placeholder:string; style?: React.CSSProperties }> = ({ fieldId, placeholder, style }) => (
  <span id={`tde-${fieldId}`} className="tde-inline" contentEditable suppressContentEditableWarning data-ph={placeholder}
    style={{ borderBottom:`1px dashed ${tk.dashBorder}`, minWidth:80, display:'inline', color:'inherit', fontFamily:'inherit', fontSize:'inherit', ...style }} />
);

const TC: React.FC<{ fieldId:string; placeholder:string }> = ({ fieldId, placeholder }) => (
  <td id={`tde-${fieldId}`} contentEditable suppressContentEditableWarning data-ph={placeholder} />
);

// ─── Doc typography ───────────────────────────────────────────────────────────
const ds = {
  chNum:  { fontSize:11, color:'#64748b', fontFamily:tk.sansFont, fontWeight:500 as const, marginBottom:2 },
  chHead: { fontSize:19, fontWeight:700 as const, borderBottom:'1.5px solid #1e293b', paddingBottom:6, marginBottom:20, color:'#0f172a', fontFamily:tk.sansFont },
  secHead:{ fontSize:15, fontWeight:600 as const, marginTop:24, marginBottom:10, color:'#1e293b', fontFamily:tk.sansFont },
  subHead:{ fontSize:13, fontWeight:600 as const, marginTop:16, marginBottom:8, color:'#334155', fontFamily:tk.sansFont },
  pageNum:{ position:'absolute' as const, bottom:28, right:56, fontSize:10, color:'#bbb', fontFamily:tk.sansFont },
  label:  { fontSize:11, color:tk.textMuted, fontFamily:tk.sansFont, margin:'10px 0 4px', fontWeight:600 as const },
};

const DocPage: React.FC<{ label:string; pageNum?:string; children:React.ReactNode }> = ({ label, pageNum, children }) => (
  <div style={{ width:'100%', maxWidth:760, marginBottom:32 }}>
    <div style={{ fontSize:11, color:'#94a3b8', fontWeight:500, letterSpacing:'.05em', marginBottom:6, fontFamily:tk.sansFont }}>{label}</div>
    <div className="doc-page" style={{ background:'#fff', width:'100%', padding:'72px 80px', boxShadow:'0 1px 3px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.07)', borderRadius:2, position:'relative', minHeight:860, fontFamily:tk.serifFont }}>
      {children}
      {pageNum && <div style={ds.pageNum}>{pageNum}</div>}
    </div>
  </div>
);

const DT: React.FC<{ caption:string; headers:string[]; rows:Array<{id:string;cells:string[]}> }> = ({ caption, headers, rows }) => (
  <>
    <div style={ds.label}>{caption}</div>
    <table className="doc-table">
      <thead><tr>{headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(row=><tr key={row.id}>{row.cells.map((ph,ci)=><TC key={ci} fieldId={`${row.id}_c${ci}`} placeholder={ph}/>)}</tr>)}</tbody>
    </table>
  </>
);

// ─── Sections ─────────────────────────────────────────────────────────────────
const SectionCover: React.FC = () => (
  <DocPage label="Cover page" pageNum="Cover">
    <div className="tde-no-print" style={{ background:'#eff6ff', border:'0.5px solid #bfdbfe', borderRadius:5, padding:'8px 12px', fontSize:11, color:'#1d4ed8', fontFamily:tk.sansFont, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Click any dashed-underlined field to edit it. Use <strong>Save draft</strong> to preserve your work.
    </div>
    <div style={{ textAlign:'center', paddingTop:48 }}>
      <div style={{ fontSize:11, color:'#94a3b8', fontFamily:tk.sansFont, marginBottom:8, letterSpacing:'.07em', textTransform:'uppercase' }}>Technical Document</div>
      <div id="tde-cover_title" className="tde-field" contentEditable suppressContentEditableWarning data-ph="Your Project Title"
        style={{ display:'block', textAlign:'center', fontSize:26, fontWeight:700, lineHeight:1.3, color:'#0f172a', fontFamily:tk.sansFont, borderBottom:`1px dashed ${tk.dashBorder}`, padding:'4px 8px', outline:'none', background:'transparent', marginBottom:4 }} />
      <div style={{ marginTop:36, fontSize:14, color:'#334155', fontFamily:tk.sansFont }}><Inline fieldId="cover_names" placeholder="Student Name(s)" /></div>
      <div style={{ marginTop:8, fontSize:13, color:'#64748b', fontFamily:tk.sansFont }}>Supervised by <Inline fieldId="cover_supervisor" placeholder="Supervisor Name(s)" /></div>
      <div style={{ marginTop:48, fontSize:13, color:'#475569', fontFamily:tk.sansFont }}>Faculty of Computer Science</div>
      <div style={{ fontSize:13, color:'#475569', fontFamily:tk.sansFont }}>Misr International University, Cairo, Egypt</div>
      <div style={{ marginTop:8, fontSize:12, fontFamily:tk.sansFont }}><Inline fieldId="cover_year" placeholder="Academic Year (e.g. 2024–2025)" style={{ color:'#94a3b8' }} /></div>
    </div>
  </DocPage>
);

const SectionAbstract: React.FC = () => (
  <DocPage label="Abstract" pageNum="i">
    <div style={ds.chHead}>Abstract</div>
    <Field fieldId="abstract_body" placeholder="Write a short overview of the work in your project (maximum one page). Summarise the problem being solved, the approach taken, and the key outcomes achieved." />
    <div style={{ marginTop:14, fontSize:12, color:'#94a3b8', fontFamily:tk.sansFont }}>Keywords: <Inline fieldId="abstract_keywords" placeholder="keyword1, keyword2, keyword3" style={{ fontSize:12 }} /></div>
  </DocPage>
);

const SectionTOC: React.FC = () => {
  const row = (label:string, pg:string, cls='') => <div className={`toc-row ${cls}`}><span>{label}</span><span className="toc-pg">{pg}</span></div>;
  return (
    <DocPage label="Table of contents" pageNum="ii">
      <div style={ds.chHead}>Contents</div>
      {row('Abstract','i')}
      <div style={{marginTop:10}}>{row('1  Introduction','1')}</div>
      {row('1.1  Motivation','1','toc-sub')}{row('1.1.1  Problem statement','1','toc-sub2')}
      {row('1.2  Aims and objectives','1','toc-sub')}{row('1.3  Scope','1','toc-sub')}
      {row('1.4  System overview','2','toc-sub')}{row('1.5  Project management and deliverables','2','toc-sub')}
      <div style={{marginTop:10}}>{row('2  Background and Related Work','3')}</div>
      <div style={{marginTop:10}}>{row('3  System Requirements Specification','4')}</div>
      {row('3.2  Functional requirements','4','toc-sub')}{row('3.3  Interface requirements','5','toc-sub')}
      {row('3.4  Design constraints','6','toc-sub')}{row('3.5  Non-functional requirements','7','toc-sub')}
      <div style={{marginTop:10}}>{row('4  System Design','8')}</div>
      {row('4.2  Architecture design viewpoints','8','toc-sub')}{row('4.3  Data design','11','toc-sub')}
      {row('4.4  Human interface design','13','toc-sub')}{row('4.6  Testing plan','13','toc-sub')}
      {row('4.7  Requirements matrix','14','toc-sub')}{row('4.8  System deployment','15','toc-sub')}
      <div style={{marginTop:10}}>{row('Bibliography','15')}</div>
      {row('Appendix A — Git repository','17')}
    </DocPage>
  );
};

const SectionCh1: React.FC = () => (
  <DocPage label="Chapter 1 — Introduction" pageNum="1–2">
    <div style={ds.chNum}>Chapter 1</div><div style={ds.chHead}>Introduction</div>
    <Field fieldId="ch1_intro" placeholder="Setting out the aims and objectives of your project, explaining the overall intention and specific steps that will be taken to achieve it." />
    <div style={ds.secHead}>1.1  Motivation</div><Field fieldId="ch1_motivation" placeholder="Explain the problem being solved and why it matters." />
    <div style={ds.subHead}>1.1.1  Problem statement</div><Field fieldId="ch1_problem" placeholder="Lead the reader from a shared context to the perception of a problem, and on to a proposed solution." />
    <div style={ds.secHead}>1.2  Aims and objectives</div><Field fieldId="ch1_aims" placeholder="List the aims and objectives of your project clearly." />
    <div style={ds.secHead}>1.3  Scope</div><Field fieldId="ch1_scope" placeholder="Define what is and what is not included in this project." />
    <div style={ds.secHead}>1.4  System overview</div><Field fieldId="ch1_sysoverview" placeholder="Explain what your project is meant to achieve and how it functions. Describe or reference a system overview diagram." />
    <div style={ds.subHead}>1.4.1  Business context</div><Field fieldId="ch1_biz" placeholder="Describe the business context for the system." />
    <div style={ds.subHead}>1.4.2  Users characteristics</div><Field fieldId="ch1_users" placeholder="Describe the expected users — their technical level, roles, and needs." />
    <div style={ds.secHead}>1.5  Project management and deliverables</div>
    <div style={ds.subHead}>1.5.1  Time plan</div><Field fieldId="ch1_timeplan" placeholder="Describe the time plan. Include or reference a Gantt chart or milestone table." />
    <div style={ds.subHead}>1.5.2  Deliverables</div><Field fieldId="ch1_deliverables" placeholder="List the final outputs of your project — programs, documents, models, etc." />
  </DocPage>
);

const SectionCh2: React.FC = () => (
  <DocPage label="Chapter 2 — Background and Related Work" pageNum="3">
    <div style={ds.chNum}>Chapter 2</div><div style={ds.chHead}>Background and Related Work</div>
    <div style={ds.secHead}>2.1  Introduction</div><Field fieldId="ch2_intro" placeholder="Brief introduction to this chapter." />
    <div style={ds.secHead}>2.2  Background</div><Field fieldId="ch2_background" placeholder="Start from the very broad domain of your problem then narrow down to the specific area of interest. Discuss key concepts, theories, and technologies." />
    <div style={ds.secHead}>2.3  Related systems</div><Field fieldId="ch2_related" placeholder="Discuss existing systems and research related to your project. Explain what your project does differently or better. Cite references using square brackets, e.g. [1]." />
    <div style={ds.secHead}>2.4  Summary</div><Field fieldId="ch2_summary" placeholder="Short summary of the chapter." />
  </DocPage>
);

const SectionCh3: React.FC = () => (
  <DocPage label="Chapter 3 — System Requirements Specification" pageNum="4–7">
    <div style={ds.chNum}>Chapter 3</div><div style={ds.chHead}>System Requirements Specification</div>
    <div style={ds.secHead}>3.1  Introduction</div><Field fieldId="ch3_intro" placeholder="Brief introduction to this chapter." />
    <div style={ds.secHead}>3.2  Functional requirements</div>
    <div style={ds.subHead}>3.2.1  System functions</div>
    <Field fieldId="ch3_sysfunctions" placeholder={"Describe general functionality using Use Cases. List numbered requirements, e.g.:\n1. The user shall be able to search databases.\n2. The admin shall update security rules."} />
    <div style={ds.subHead}>3.2.2  Detailed functional specification</div>
    <DT caption="Table 3.1 — Function description (duplicate for each function)" headers={['Field','Details']}
      rows={[{id:'ch3_t31r0',cells:['Name','e.g. readFile']},{id:'ch3_t31r1',cells:['Code','e.g. FR01']},{id:'ch3_t31r2',cells:['Priority','Extreme / High / Low']},{id:'ch3_t31r3',cells:['Critical','How essential is this requirement?']},{id:'ch3_t31r4',cells:['Input','e.g. File name']},{id:'ch3_t31r5',cells:['Output','e.g. Boolean']},{id:'ch3_t31r6',cells:['Description','Full description.']},{id:'ch3_t31r7',cells:['Pre-condition','e.g. User must be logged in.']},{id:'ch3_t31r8',cells:['Post-condition','e.g. Redirect to view file page.']},{id:'ch3_t31r9',cells:['Dependency','Dependencies with other requirements.']},{id:'ch3_t31r10',cells:['Risk','Circumstances where requirement may not be satisfied.']}]} />
    <div style={ds.secHead}>3.3  Interface requirements</div>
    <div style={ds.subHead}>3.3.1  User interfaces</div><Field fieldId="ch3_ui" placeholder="Describe the GUI and/or CLI. Include or reference mockups and screen dumps." />
    <div style={ds.subHead}>3.3.2  Hardware interfaces</div><Field fieldId="ch3_hw" placeholder="Describe interfaces to hardware devices relevant to your project." />
    <div style={ds.subHead}>3.3.3  Communications interfaces</div><Field fieldId="ch3_comms" placeholder="Describe network interfaces relevant to your project." />
    <div style={ds.subHead}>3.3.4  Application Programming Interface (API)</div><Field fieldId="ch3_api" placeholder="List external APIs and libraries. For each: name, arguments, return values, and an example invocation." />
    <div style={ds.secHead}>3.4  Design constraints</div>
    <div style={ds.subHead}>3.4.1  Standards compliance</div><Field fieldId="ch3_standards" placeholder="Relevant standards to comply with." oneLine />
    <div style={ds.subHead}>3.4.2  Software constraints</div><Field fieldId="ch3_swconstraints" placeholder="Library and framework version requirements." oneLine />
    <div style={ds.subHead}>3.4.3  Hardware constraints</div><Field fieldId="ch3_hwconstraints" placeholder="Minimum hardware requirements." oneLine />
    <div style={ds.subHead}>3.4.4  Other constraints</div><Field fieldId="ch3_otherconstraints" placeholder="Any other relevant constraints." oneLine />
    <div style={ds.secHead}>3.5  Non-functional requirements</div>
    <Field fieldId="ch3_nfr" placeholder="Specify non-functional attributes: Security, Reliability, Maintainability, Portability, Extensibility, Performance, etc." />
    <div style={ds.secHead}>3.6  Summary</div><Field fieldId="ch3_summary" placeholder="Short summary of the chapter." oneLine />
  </DocPage>
);

const SectionCh4a: React.FC = () => (
  <DocPage label="Chapter 4 — System Design (Architecture)" pageNum="8–11">
    <div style={ds.chNum}>Chapter 4</div><div style={ds.chHead}>System Design</div>
    <div style={ds.secHead}>4.1  Introduction</div><Field fieldId="ch4a_intro" placeholder="Brief introduction to the system design chapter." />
    <div style={ds.secHead}>4.2  Architecture design viewpoints</div>
    <div style={ds.subHead}>4.2.1  Context viewpoint</div><Field fieldId="ch4a_context" placeholder="Describe the system's offered services, actors, and the system boundary. Include or reference a context diagram." />
    <div style={ds.subHead}>4.2.2  Composition viewpoint</div><Field fieldId="ch4a_composition" placeholder="Describe the architectural design and patterns used (e.g. MVC, layered). Explain system decomposition into subsystems and how they collaborate." />
    <div style={{...ds.subHead,marginTop:12}}>Design rationale</div><Field fieldId="ch4a_rationale" placeholder="Explain why you chose this architecture. Discuss alternatives considered and why they were rejected." />
    <div style={ds.subHead}>4.2.3  Logical viewpoint</div><Field fieldId="ch4a_logical" placeholder="Describe the static structure. Reference or embed a UML class diagram." />
    <DT caption="Table 4.1 — Class description (duplicate for each class)" headers={['Property','Details']}
      rows={[{id:'ch4a_t41r0',cells:['Class name','ClassName']},{id:'ch4a_t41r1',cells:['Abstract or concrete','Concrete']},{id:'ch4a_t41r2',cells:['Superclasses','e.g. BaseEntity']},{id:'ch4a_t41r3',cells:['Subclasses','e.g. UserEntity']},{id:'ch4a_t41r4',cells:['Purpose','What this class is responsible for.']},{id:'ch4a_t41r5',cells:['Collaborations','Other classes this interacts with.']},{id:'ch4a_t41r6',cells:['Attributes','List key attributes.']},{id:'ch4a_t41r7',cells:['Operations','List key methods / operations.']}]} />
    <div style={ds.subHead}>4.2.4  Patterns use viewpoint</div><Field fieldId="ch4a_patterns" placeholder="Describe design patterns used. Include UML class or package diagrams and the rationale for each pattern." />
    <div style={ds.subHead}>4.2.5  Algorithm viewpoint</div><Field fieldId="ch4a_algo" placeholder="Provide pseudo-code or PDL for key algorithms. Describe what each component does systematically." />
    <div style={ds.subHead}>4.2.6  Interaction viewpoint</div><Field fieldId="ch4a_interaction" placeholder="Describe object communication and messaging. Reference or embed UML sequence diagrams." />
    <div style={ds.subHead}>4.2.7  Interface viewpoint</div><Field fieldId="ch4a_iface" placeholder="Specify public interface functions: name, arguments, return values, and usage examples." />
  </DocPage>
);

const SectionCh4b: React.FC = () => (
  <DocPage label="Chapter 4 — Data Design & Human Interface" pageNum="11–13">
    <div style={{...ds.secHead,marginTop:0}}>4.3  Data design</div>
    <div style={ds.subHead}>4.3.1  Data description</div><Field fieldId="ch4b_datadesc" placeholder="Explain how the information domain is transformed into data structures. Cover: original data format, capture method, expected database size, number of users, ID format, and date/time formats. Include an ERD." />
    <div style={ds.subHead}>4.3.2  Dataset description</div>
    <DT caption="Table 4.2 — Dataset description" headers={['Property','Details']}
      rows={[{id:'ch4b_t42r0',cells:['Dataset name','Name of the dataset']},{id:'ch4b_t42r1',cells:['Link','URL or repository link']},{id:'ch4b_t42r2',cells:['Type','Images / Text / Tabular / etc.']},{id:'ch4b_t42r3',cells:['Size','Total size in MB or GB']},{id:'ch4b_t42r4',cells:['Number of classes','e.g. 10']},{id:'ch4b_t42r5',cells:['Items per class','e.g. 1,000 images per class']},{id:'ch4b_t42r6',cells:['Dimensions','e.g. 224×224 pixels']},{id:'ch4b_t42r7',cells:['Notes','Additional information about the dataset.']}]} />
    <div style={ds.subHead}>4.3.3  Database design</div><Field fieldId="ch4b_dbdesign" placeholder="Describe the database schema. Include or reference an ER diagram and any other data storage design." />
    <div style={ds.secHead}>4.4  Human interface design</div>
    <div style={ds.subHead}>4.4.1  User interface</div><Field fieldId="ch4b_uidesc" placeholder="Describe the system from the user's perspective. Explain how users complete each feature and what feedback they receive." />
    <div style={ds.subHead}>4.4.2  Screen images</div><Field fieldId="ch4b_screens" placeholder="Describe or reference screenshots and wireframes. Indicate where images or mockups are attached." />
    <div style={ds.subHead}>4.4.3  Screen objects and actions</div><Field fieldId="ch4b_screenobjects" placeholder="Discuss specific screen objects (buttons, forms, lists) and the actions associated with each." />
    <div style={ds.secHead}>4.5  Implementation</div><Field fieldId="ch4b_implementation" placeholder="Describe the implementation: programming languages, platform, problems encountered, and any changes made to the design as a result of implementation." />
  </DocPage>
);

const SectionCh4c: React.FC = () => (
  <DocPage label="Chapter 4 — Testing, Requirements Matrix & Deployment" pageNum="13–15">
    <div style={{...ds.secHead,marginTop:0}}>4.6  Testing plan</div>
    <div style={ds.subHead}>4.6.1  Test scenario X</div><Field fieldId="ch4c_scenarioX" placeholder="Describe possible user actions and behaviors. Identify the technical aspects and possible failure scenarios." />
    <DT caption="Table 4.3 — Test cases for scenario X" headers={['Test case ID','Description','Req. code','Test data','Expected result']}
      rows={[{id:'ch4c_t43r0',cells:['TC01','Describe the test case','FR01','Input data','Expected output']},{id:'ch4c_t43r1',cells:['TC02','Describe the test case','FR01','Input data','Expected output']}]} />
    <div style={ds.subHead}>4.6.2  Test scenario Y</div><Field fieldId="ch4c_scenarioY" placeholder="Describe user actions for this scenario. Reference relevant use cases and sequence diagrams." />
    <DT caption="Table 4.4 — Test cases for scenario Y" headers={['Test case ID','Description','Req. code','Test data','Expected result']}
      rows={[{id:'ch4c_t44r0',cells:['TC03','Describe the test case','FR02','Input data','Expected output']},{id:'ch4c_t44r1',cells:['TC04','Describe the test case','FR02','Input data','Expected output']}]} />
    <div style={ds.secHead}>4.7  Requirements matrix</div>
    <DT caption="Table 4.5 — Requirements matrix" headers={['Req. ID','Description','Class','Test cases','Status']}
      rows={[{id:'ch4c_t45r0',cells:['FR01','Requirement description','ClassName','TC01, TC02','In Progress']},{id:'ch4c_t45r1',cells:['FR02','Requirement description','ClassName','TC03, TC04','Developed']}]} />
    <div style={ds.secHead}>4.8  System deployment</div><Field fieldId="ch4c_deployment" placeholder="Describe the overall system deployment strategy and infrastructure." />
    <div style={ds.subHead}>4.8.1  Frameworks</div><Field fieldId="ch4c_frameworks" placeholder="List and describe the frameworks used." oneLine />
    <div style={ds.subHead}>4.8.2  Tools</div><Field fieldId="ch4c_tools" placeholder="List and describe the development and deployment tools used." oneLine />
    <div style={ds.subHead}>4.8.3  Technologies</div><Field fieldId="ch4c_technologies" placeholder="List and describe the technologies used in the system." oneLine />
    <div style={ds.secHead}>4.9  Summary</div><Field fieldId="ch4c_summary" placeholder="Short summary of the chapter." oneLine />
  </DocPage>
);

const SectionBib: React.FC = () => (
  <DocPage label="Bibliography" pageNum="15–16">
    <div style={ds.chHead}>Bibliography</div>
    <Field fieldId="bib_body" placeholder={'[1] CORMEN, T. H. Introduction to algorithms. MIT press, 2009.\n[2] HOOKS, I. Writing good requirements. In INCOSE International Symposium (1994).\n\nAdd more references here in the same citation format.'} style={{ minHeight:140, fontFamily:tk.sansFont, fontSize:13 }} />
  </DocPage>
);

const SectionApp: React.FC = () => (
  <DocPage label="Appendix A — Git Repository" pageNum="17">
    <div style={ds.chNum}>Appendix A</div><div style={ds.chHead}>Git Repository</div>
    <div style={{ fontSize:13, marginBottom:10, fontFamily:tk.sansFont, color:'#334155' }}>
      Repository link: <Inline fieldId="app_link" placeholder="https://github.com/your-repo" style={{ color:tk.blue }} />
    </div>
    <Field fieldId="app_desc" placeholder="Describe your Git repository and contribution history. Add screenshots from the repository and commit activity charts from the Insights tab." />
    <div style={{...ds.subHead,marginTop:20}}>Figure A.1 — Git insights</div>
    <div style={{ background:tk.fieldBg, border:`0.5px dashed ${tk.dashBorder}`, borderRadius:tk.radiusSm, height:160, display:'flex', alignItems:'center', justifyContent:'center', color:tk.textHint, fontSize:12, fontFamily:tk.sansFont, fontStyle:'italic' }}>
      Screenshot placeholder — paste your Git insights chart here
    </div>
  </DocPage>
);

// ─── Section registry ─────────────────────────────────────────────────────────
const SECTION_IDS = ['cover','abstract','toc','ch1','ch2','ch3','ch4a','ch4b','ch4c','bib','app'] as const;
type SectionId = typeof SECTION_IDS[number];

const SECTION_COMPONENTS: Record<SectionId, React.FC> = {
  cover:SectionCover, abstract:SectionAbstract, toc:SectionTOC,
  ch1:SectionCh1, ch2:SectionCh2, ch3:SectionCh3,
  ch4a:SectionCh4a, ch4b:SectionCh4b, ch4c:SectionCh4c,
  bib:SectionBib, app:SectionApp,
};

// ─── Main component ───────────────────────────────────────────────────────────
const TechnicalDocEditor: React.FC = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SectionId>('cover');
  const [scale,         setScale]         = useState(1.0);
  const [saveOk,        setSaveOk]        = useState(false);
  const [isExporting,   setIsExporting]   = useState(false);

  const canvasRef    = useRef<HTMLDivElement>(null);
  // One ref per section so we can scroll-to on sidebar click
  const sectionRefs  = useRef<Partial<Record<SectionId, HTMLDivElement>>>({});
  // Flag to suppress the IntersectionObserver while a programmatic scroll is running
  const scrollingRef = useRef(false);
  const storageKey   = 'miu_doc_v2';

  // ── Field persistence ─────────────────────────────────────────────────────
  const collectFields = useCallback((): FieldStore => {
    const store: FieldStore = {};
    document.querySelectorAll<HTMLElement>('[id^="tde-"]').forEach(el => { store[el.id] = el.innerHTML; });
    return store;
  }, []);

  const applyFields = useCallback((store: FieldStore) => {
    Object.entries(store).forEach(([id, html]) => { const el = document.getElementById(id); if (el) el.innerHTML = html; });
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try { const store: FieldStore = JSON.parse(raw); requestAnimationFrame(() => applyFields(store)); } catch { /* ignore */ }
  }, [storageKey, applyFields]);

  useEffect(() => {
    const handler = () => localStorage.setItem(storageKey, JSON.stringify(collectFields()));
    document.addEventListener('focusout', handler);
    return () => document.removeEventListener('focusout', handler);
  }, [storageKey, collectFields]);

  // ── IntersectionObserver — update active sidebar item as user scrolls ─────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip if we triggered the scroll ourselves
        if (scrollingRef.current) return;
        // Pick the entry that is most visible (highest intersectionRatio)
        let best: IntersectionObserverEntry | null = null;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
          }
        });
        if (best) {
          const sid = (best as IntersectionObserverEntry).target.getAttribute('data-sid') as SectionId;
          if (sid) setActiveSection(sid);
        }
      },
      {
        root: canvas,
        // Fire when at least 20% of a section enters the viewport
        threshold: [0.1, 0.2, 0.3, 0.5],
      }
    );

    // Observe every section element
    SECTION_IDS.forEach(id => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [scale]); // re-connect when scale changes (elements resize)

  // ── Sidebar click → smooth scroll to section ─────────────────────────────
  const scrollToSection = useCallback((id: SectionId) => {
    const el = sectionRefs.current[id];
    if (!el || !canvasRef.current) return;
    scrollingRef.current = true;
    setActiveSection(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Re-enable observer after scroll animation (~600 ms)
    setTimeout(() => { scrollingRef.current = false; }, 700);
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    localStorage.setItem(storageKey, JSON.stringify(collectFields()));
    localStorage.setItem('miu_doc_last_saved', new Date().toISOString());
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2200);
  }, [storageKey, collectFields]);

  // ── Export via new window ─────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    setIsExporting(true);
    localStorage.setItem(storageKey, JSON.stringify(collectFields()));

    const sectionsHtml = SECTION_IDS.map(id => {
      const el = document.querySelector<HTMLElement>(`.tde-section[data-sid="${id}"]`);
      return el ? el.innerHTML : '';
    }).join('');

    const sharedCss = `
      * { box-sizing:border-box; margin:0; padding:0; }
      body { background:#fff; font-family:Georgia,"Times New Roman",serif; color:#0f172a; }
      .doc-page { background:#fff; width:210mm; min-height:297mm; padding:25mm 28mm; margin:0 auto; page-break-after:always; position:relative; font-family:Georgia,"Times New Roman",serif; }
      .doc-page:last-child { page-break-after:avoid; }
      [contenteditable] { border:none !important; background:transparent !important; outline:none !important; }
      [contenteditable]:empty:before { content:none !important; }
      .tde-no-print { display:none !important; }
      .doc-table { width:100%; border-collapse:collapse; font-size:11pt; margin:10px 0; }
      .doc-table th { background:#1e293b; color:#f1f5f9; padding:6px 9px; text-align:left; font-weight:600; font-size:10pt; font-family:sans-serif; }
      .doc-table td { border:0.5px solid #cbd5e1; padding:5px 9px; vertical-align:top; color:#1e293b; font-size:10.5pt; }
      .toc-row { display:flex; justify-content:space-between; align-items:baseline; font-size:11pt; padding:3px 0; color:#111; border-bottom:0.5px dotted #ccc; font-family:sans-serif; }
      .toc-sub { padding-left:20px; font-size:10pt; color:#444; }
      .toc-sub2 { padding-left:38px; font-size:9.5pt; color:#666; }
      .toc-pg { color:#888; font-size:9.5pt; font-family:sans-serif; }
      @page { size:A4; margin:0; }
      @media print { body { margin:0; } .doc-page { box-shadow:none; } }
    `;

    const printHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>MIU Technical Document</title><style>${sharedCss}</style></head><body>${sectionsHtml}<script>window.onload=function(){window.print();setTimeout(function(){window.close();},800);};<\/script></body></html>`;
    const win = window.open('','_blank','width=900,height=700');
    if (!win) { alert('Pop-up blocked. Please allow pop-ups and try again.'); setIsExporting(false); return; }
    win.document.open(); win.document.write(printHtml); win.document.close();
    setTimeout(() => setIsExporting(false), 3000);
  }, [storageKey, collectFields]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <div style={{
        margin: '-1rem',
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: tk.sansFont,
        borderRadius: 10,
        border: `1px solid ${tk.borderLight}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      }}>

        {/* ── Toolbar ── */}
        <header className="tde-no-print" style={{
          background: tk.nav, height: 50, padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          flexShrink: 0, borderBottom: `1px solid ${tk.navBorder}`, borderRadius: '10px 10px 0 0',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => navigate(-1)} title="Back" style={{ width:30, height:30, borderRadius:6, border:'0.5px solid rgba(255,255,255,0.12)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:tk.navText }}>
              <ArrowLeft size={14} />
            </button>
            <span style={{ fontSize:13, fontWeight:500, color:'#cbd5e1', letterSpacing:'.02em' }}>MIU Technical Document</span>
            <span style={{ fontSize:11, background:'rgba(59,130,246,0.14)', color:'#60a5fa', padding:'2px 8px', borderRadius:20, fontWeight:500, border:'0.5px solid rgba(59,130,246,0.28)' }}>
              {SECTION_IDS.length} sections
            </span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:2, background:'rgba(255,255,255,0.06)', padding:'3px 8px', borderRadius:6, border:'0.5px solid rgba(255,255,255,0.10)' }}>
            <button onClick={() => setScale(v => Math.max(0.5, +(v-0.1).toFixed(1)))} style={{ width:26, height:26, border:'none', background:'transparent', cursor:'pointer', color:tk.navText, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4 }}>
              <ZoomOut size={13} />
            </button>
            <span style={{ fontSize:12, fontWeight:500, color:'#94a3b8', minWidth:38, textAlign:'center' }}>{Math.round(scale*100)}%</span>
            <button onClick={() => setScale(v => Math.min(2.0, +(v+0.1).toFixed(1)))} style={{ width:26, height:26, border:'none', background:'transparent', cursor:'pointer', color:tk.navText, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4 }}>
              <ZoomIn size={13} />
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={handleSave} style={{ display:'flex', alignItems:'center', gap:6, padding:'0 13px', height:32, borderRadius:6, border:'0.5px solid rgba(255,255,255,0.14)', background: saveOk?'rgba(22,101,52,0.35)':'rgba(255,255,255,0.07)', cursor:'pointer', fontSize:12, fontWeight:500, color: saveOk?'#86efac':'#cbd5e1', fontFamily:tk.sansFont, transition:'background .2s,color .2s' }}>
              {saveOk ? <><CheckCircle2 size={13} color="#86efac"/> Saved!</> : <><Save size={13}/> Save draft</>}
            </button>
            <button onClick={handleExport} disabled={isExporting} style={{ display:'flex', alignItems:'center', gap:6, padding:'0 14px', height:32, borderRadius:6, border:'none', background:tk.blue, cursor:isExporting?'not-allowed':'pointer', fontSize:12, fontWeight:500, color:'#fff', fontFamily:tk.sansFont, opacity:isExporting?0.7:1 }}>
              {isExporting ? <><Loader2 size={13} style={{ animation:'tde-spin 1s linear infinite' }}/> Preparing…</> : <><Download size={13}/> Export PDF</>}
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* Sidebar — clicking scrolls to the section */}
          <nav className="tde-no-print" style={{ width:210, background:tk.nav, borderRight:`1px solid ${tk.navBorder}`, overflowY:'auto', flexShrink:0, padding:'6px 0' }}>
            {NAV_GROUPS.map(group => (
              <div key={group}>
                <div style={{ fontSize:10, fontWeight:600, color:'#334155', letterSpacing:'.09em', padding:'10px 14px 3px', textTransform:'uppercase' }}>{group}</div>
                {NAV.filter(n => n.group === group).map((item, idx) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button key={`${item.id}-${idx}`} className="tde-sidebar-btn"
                      onClick={() => scrollToSection(item.id as SectionId)}
                      style={{ display:'block', width:'100%', textAlign:'left', padding: item.sub?'4px 14px 4px 26px':'6px 14px', border:'none', background: isActive?tk.navActive:'transparent', color: isActive?tk.navHighlight:(item.sub?tk.navTextSub:tk.navText), fontSize: item.sub?11:12, cursor:'pointer', fontFamily:tk.sansFont, fontWeight: isActive?500:400, borderLeft:`2px solid ${isActive?'#3b82f6':'transparent'}`, transition:'background .1s,color .1s' }}>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Canvas — ALL sections rendered and stacked, scroll to navigate */}
          <main ref={canvasRef} style={{ flex:1, overflowY:'auto', background:tk.canvasBg, padding:'24px 20px', display:'flex', flexDirection:'column', alignItems:'center' }}>
            {SECTION_IDS.map(id => {
              const Comp = SECTION_COMPONENTS[id];
              return (
                <div
                  key={id}
                  className="tde-section"
                  data-sid={id}
                  ref={el => { if (el) sectionRefs.current[id] = el; }}
                  style={{
                    // Always visible — scrolling replaces show/hide
                    display: 'block',
                    width: '100%',
                    maxWidth: 760,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    // When scale > 1 the transform expands beyond the box model,
                    // so we add bottom margin to prevent sections overlapping.
                    marginBottom: scale !== 1 ? `${Math.round((scale - 1) * 880)}px` : '32px',
                    // Scroll-margin pushes the section a bit below the top edge
                    // when scrollIntoView fires, so the page label stays visible.
                    scrollMarginTop: '16px',
                  }}
                >
                  <Comp />
                </div>
              );
            })}
            {/* Bottom padding so the last section can scroll to the top */}
            <div style={{ height: '60vh', flexShrink: 0 }} />
          </main>
        </div>
      </div>
    </>
  );
};

export default TechnicalDocEditor;