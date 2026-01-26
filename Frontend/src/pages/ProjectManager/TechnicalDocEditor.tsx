// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Document, Page, pdfjs } from 'react-pdf';
// import { motion } from 'framer-motion';
// import {
//   ArrowLeft,
//   Save,
//   Type,
//   MousePointer2,
//   Plus,
//   Download,
//   ZoomIn,
//   ZoomOut,
//   Loader2
// } from 'lucide-react';
// import { PDFDocument, rgb } from 'pdf-lib';
// import './TechnicalDocEditor.css';

// // Configure PDF.js Worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// interface TextElement {
//   id: string;
//   pageNumber: number;
//   x: number;
//   y: number;
//   text: string;
//   fontSize: number;
//   width?: number;
//   height?: number;
// }

// const TechnicalDocEditor: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
//   const templatePath = "/Technical_Document_Template.pdf";

//   // --- State ---
//   const [elements, setElements] = useState<TextElement[]>([]);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [scale, setScale] = useState(1.2);
//   const [numPages, setNumPages] = useState(0);
//   const [isExporting, setIsExporting] = useState(false);

//   const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // --- Effects ---
//   useEffect(() => {
//     const saved = localStorage.getItem(`tech_edits_${projectId}`);
//     if (saved) {
//       try {
//         setElements(JSON.parse(saved));
//       } catch (e) {
//         console.error("Failed to parse saved edits", e);
//       }
//     }
//   }, [projectId]);

//   // --- Logic Helpers ---
//   const addTextField = (pageNumber: number, x: number, y: number) => {
//     const newEl: TextElement = {
//       id: `text_${Date.now()}`,
//       pageNumber,
//       x,
//       y,
//       text: "Click to edit",
//       fontSize: 16,
//       width: 150,
//       height: 30
//     };
//     setElements(prev => [...prev, newEl]);
//     setSelectedId(newEl.id);
//   };

//   const updateText = (id: string, text: string) => {
//     setElements(prev => prev.map(el => el.id === id ? { ...el, text } : el));
//   };

//   const updatePosition = (id: string, pageNumber: number, x: number, y: number) => {
//     setElements(prev => prev.map(el => el.id === id ? { ...el, pageNumber, x, y } : el));
//   };

//   const handleSave = () => {
//     localStorage.setItem(`tech_edits_${projectId}`, JSON.stringify(elements));
//     alert("Progress saved locally!");
//   };

//   // --- Professional Export Logic ---
//   const handleExport = async () => {
//     if (isExporting) return;
    
//     try {
//       setIsExporting(true);

//       // 1. Load the original template
//       const response = await fetch(templatePath);
//       if (!response.ok) throw new Error("Template PDF not found");
//       const arrayBuffer = await response.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);

//       // 2. Overlay user elements
//       for (let i = 0; i < pdfDoc.getPageCount(); i++) {
//         const pageNum = i + 1;
//         const page = pdfDoc.getPage(i);
//         const { height } = page.getSize();
        
//         const pageElements = elements.filter(el => el.pageNumber === pageNum);
        
//         pageElements.forEach(el => {
//           // IMPORTANT: Web coordinates (top-left 0,0) to PDF coordinates (bottom-left 0,0)
//           // We divide by current scale to get 'original' point sizes
//           const pdfX = el.x / scale;
//           const pdfY = height - (el.y / scale) - (el.fontSize / scale);

//           page.drawText(el.text, {
//             x: pdfX,
//             y: pdfY,
//             size: el.fontSize / scale,
//             color: rgb(0, 0, 0),
//           });
//         });
//       }

//       // 3. Generate and Trigger Download
   
// const pdfBytes: Uint8Array = await pdfDoc.save();


// // Use the array-wrap syntax with an explicit type cast if the error persists
// const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });


// const url = URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `Project_${projectId}_Technical_Doc.pdf`;
//       document.body.appendChild(link);
//       link.click();
      
//       // Cleanup
//       document.body.removeChild(link);
//       setTimeout(() => URL.revokeObjectURL(url), 100);
      
//     } catch (error) {
//       console.error('Export failed:', error);
//       alert('Failed to export PDF. Please check the console for details.');
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const handleDoubleClick = (pageNum: number, event: React.MouseEvent) => {
//     const rect = canvasRefs.current[pageNum - 1]?.getBoundingClientRect();
//     if (!rect) return;
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
//     addTextField(pageNum, x, y);
//   };

//   return (
//     <div className="canva-editor-root">
//       {/* Top Navigation */}
//       <header className="editor-nav">
//         <div className="nav-group">
//           <button className="icon-btn" onClick={() => navigate(-1)}>
//             <ArrowLeft size={20} />
//           </button>
//           <span className="file-name">Project #{projectId} - Technical Editor</span>
//         </div>

//         <div className="nav-group zoom-controls">
//           <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut size={18} /></button>
//           <span className="zoom-level">{Math.round(scale * 100)}%</span>
//           <button onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn size={18} /></button>
//         </div>

//         <div className="nav-group">
//           <button className="btn-save" onClick={handleSave}>
//             <Save size={16} /> Save
//           </button>
//           <button 
//             className={`btn-export ${isExporting ? 'loading' : ''}`} 
//             onClick={handleExport}
//             disabled={isExporting}
//           >
//             {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
//             {isExporting ? 'Generating...' : 'Export PDF'}
//           </button>
//         </div>
//       </header>

//       <div className="editor-body">
//         {/* Sidebar Tools */}
//         <aside className="editor-sidebar">
//           <button className="sidebar-tool" onClick={() => addTextField(1, 50, 50)}>
//             <Type size={24} />
//             <span>Text</span>
//           </button>
//           <button className="sidebar-tool">
//             <Plus size={24} />
//             <span>Assets</span>
//           </button>
//           <div className="sidebar-divider"></div>
//           <button className="sidebar-tool active">
//             <MousePointer2 size={24} />
//             <span>Select</span>
//           </button>
//         </aside>

//         {/* Canvas */}
//         <main className="document-canvas">
//           <Document
//             file={templatePath}
//             onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//             loading={<div className="loading-state">Initialising PDF Engine...</div>}
//             error={<div className="error-state">Error: Template could not be loaded.</div>}
//           >
//             {Array.from({ length: numPages }, (_, index) => {
//               const pageNum = index + 1;
//               return (
//                 <div
//                   key={`page_${pageNum}`}
//                   className="pdf-page-wrapper"
//                   style={{ position: 'relative', marginBottom: '40px' }}
//                   ref={el => { canvasRefs.current[index] = el; }}
//                   onDoubleClick={(e) => handleDoubleClick(pageNum, e)}
//                 >
//                   <Page
//                     pageNumber={pageNum}
//                     scale={scale}
//                     renderTextLayer={false}
//                     renderAnnotationLayer={false}
//                   />

//                   {/* Interaction Layer */}
//                   <div className="editor-interaction-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
//                     {elements
//                       .filter(el => el.pageNumber === pageNum)
//                       .map(el => (
//                         <motion.div
//                           key={el.id}
//                           drag
//                           dragMomentum={false}
//                           onDragEnd={(_, info) => {
//                             const rect = canvasRefs.current[pageNum - 1]?.getBoundingClientRect();
//                             if (!rect) return;
//                             const offsetX = info.point.x - rect.left;
//                             const offsetY = info.point.y - rect.top;
//                             updatePosition(el.id, pageNum, offsetX, offsetY);
//                           }}
//                           className={`canvas-element ${selectedId === el.id ? 'is-selected' : ''}`}
//                           style={{
//                             position: 'absolute',
//                             left: el.x,
//                             top: el.y,
//                             fontSize: el.fontSize,
//                             cursor: 'move'
//                           }}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setSelectedId(el.id);
//                           }}
//                         >
//                           <div
//                             className="editable-content"
//                             contentEditable
//                             suppressContentEditableWarning
//                             onBlur={(e) => updateText(el.id, e.currentTarget.innerText)}
//                             style={{ minWidth: '20px', outline: 'none', padding: '2px' }}
//                           >
//                             {el.text}
//                           </div>
//                           {selectedId === el.id && <div className="selection-border" />}
//                         </motion.div>
//                       ))}
//                   </div>
//                 </div>
//               );             })}
//           </Document>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default TechnicalDocEditor;