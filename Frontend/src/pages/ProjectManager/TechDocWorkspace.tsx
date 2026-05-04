import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TechnicalDocTemplate from '../../assets/Technical_Document_Template.pdf';

// ─── Design tokens — light theme matching PMLayout (#f8fafc base) ─────────────
const tk = {
  // Surface hierarchy
  pageBg:       '#f8fafc',   // matches PMLayout backgroundColor exactly
  cardBg:       '#ffffff',
  cardBgAlt:    '#f8fafc',
  rowHover:     '#f1f5f9',

  // Borders
  border:       '#e2e8f0',
  borderStrong: '#cbd5e1',

  // Text
  textPrimary:  '#0f172a',
  textSecondary:'#334155',
  textMuted:    '#64748b',
  textDim:      '#94a3b8',

  // Accent — navy blue (matches typical MIU / academic palette)
  accent:       '#1d4ed8',
  accentMid:    '#2563eb',
  accentLight:  '#3b82f6',
  accentBg:     '#eff6ff',
  accentBorder: '#bfdbfe',

  // Semantic
  success:      '#059669',
  successBg:    '#ecfdf5',
  successBorder:'#a7f3d0',
  gold:         '#b45309',
  goldBg:       '#fffbeb',
  goldBorder:   '#fde68a',

  // Fonts
  sans:         '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono:         '"JetBrains Mono", "Fira Code", "Courier New", monospace',

  // Shape
  radius:       '10px',
  radiusLg:     '14px',
  shadow:       '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
  shadowMd:     '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
};

// ─── Injected CSS — only transitions, hovers, keyframes ──────────────────────
const INJECTED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes tdw-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tdw-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes tdw-pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
    50%       { box-shadow: 0 0 0 4px rgba(5,150,105,0); }
  }

  .tdw-card {
    transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
  }
  .tdw-doc-card {
    cursor: pointer;
  }
  .tdw-doc-card:hover {
    box-shadow: 0 8px 28px rgba(37,99,235,0.13), 0 2px 6px rgba(0,0,0,0.04) !important;
    border-color: #93c5fd !important;
    transform: translateY(-2px);
  }
  .tdw-doc-card:hover .tdw-arrow {
    transform: translateX(4px);
    color: #2563eb;
  }
  .tdw-arrow {
    transition: transform 0.18s ease, color 0.18s ease;
  }
  .tdw-validate-btn {
    transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
  }
  .tdw-validate-btn:hover:not(:disabled) {
    background: #1e40af !important;
    box-shadow: 0 4px 16px rgba(29,78,216,0.30) !important;
    transform: translateY(-1px);
  }
  .tdw-validate-btn:active:not(:disabled) {
    transform: scale(0.97);
  }
  .tdw-detail-row:hover {
    background: #f8fafc !important;
  }
  .tdw-open-btn {
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .tdw-open-btn:hover {
    background: #eff6ff !important;
    border-color: #93c5fd !important;
    color: #1d4ed8 !important;
  }
  .tdw-stat-card {
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .tdw-stat-card:hover {
    border-color: #cbd5e1 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
  }
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconPdf = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      fill="#fef2f2" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14,2 14,8 20,8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="6.5" y="18" fontSize="5.5" fontWeight="700" fill="#ef4444" fontFamily="sans-serif">PDF</text>
  </svg>
);

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>
);

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

const IconLayers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 2,7 12,12 22,7 12,2"/>
    <polyline points="2,17 12,22 22,17"/>
    <polyline points="2,12 12,17 22,12"/>
  </svg>
);

const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={tk.accentMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
const TechnicalDocWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [validating, setValidating] = useState(false);
  const [validated,  setValidated]  = useState(false);
  const [now, setNow] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('miu_doc_last_saved');
    if (raw) {
      const d = new Date(raw);
      setNow(
        d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' · ' +
        d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      );
    } else {
      setNow('Never saved');
    }
  }, []);

  const handleValidate = () => {
    if (validated || validating) return;
    setValidating(true);
    setTimeout(() => { setValidating(false); setValidated(true); }, 1800);
  };

  // ─── Divider ───────────────────────────────────────────────────────────────
  const Divider = () => (
    <div style={{ height: 1, background: tk.border, margin: '0' }} />
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INJECTED_CSS }} />

      {/*
        No wrapper div with its own padding/maxWidth/background.
        PMLayout already provides: background #f8fafc, p-4, maxWidth 1280px, overflow-y-auto.
        We render directly into that space.
      */}
      <div style={{ fontFamily: tk.sans, animation: 'tdw-fade-up 0.35s ease both' }}>

        {/* ── Page header ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 16,
          marginBottom: 24, flexWrap: 'wrap',
        }}>
          {/* Title block */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
            }}>
              {/* Back link */}
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tk.textMuted, fontSize: 13, fontFamily: tk.sans,
                  padding: 0, display: 'flex', alignItems: 'center', gap: 4,
                  fontWeight: 400,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
                Projects
              </button>
              <span style={{ color: tk.border, fontSize: 14 }}>/</span>
              <span style={{
                fontSize: 12, color: tk.textMuted,
                fontFamily: tk.mono, letterSpacing: '.03em',
              }}>
                Workspace
              </span>
            </div>

            <h2 style={{
              margin: '0 0 4px',
              fontSize: 22, fontWeight: 600,
              color: tk.textPrimary, letterSpacing: '-.02em',
              fontFamily: tk.sans,
            }}>
              Project Workspace
            </h2>
            <p style={{
              margin: 0, fontSize: 13, color: tk.textMuted, fontWeight: 400,
            }}>
              Manage documentation and technical validation for this project.
            </p>
          </div>

          {/* Validate button */}
          <button
            className="tdw-validate-btn"
            onClick={handleValidate}
            disabled={validating || validated}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0 18px', height: 40,
              borderRadius: tk.radius,
              border: 'none',
              background: validated
                ? tk.success
                : tk.accent,
              color: '#fff',
              fontSize: 13, fontWeight: 500, fontFamily: tk.sans,
              cursor: (validating || validated) ? 'default' : 'pointer',
              boxShadow: validated
                ? '0 2px 8px rgba(5,150,105,0.25)'
                : '0 2px 8px rgba(29,78,216,0.22)',
              whiteSpace: 'nowrap', flexShrink: 0,
              letterSpacing: '.01em',
            }}
          >
            {validating ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: 'tdw-fade-in 0.1s', transformOrigin:'center' }}>
                  <line x1="12" y1="2" x2="12" y2="6"/>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  <line x1="18" y1="12" x2="22" y2="12"/>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                  <line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="7.76" y1="16.24" x2="4.93" y2="19.07"/>
                  <line x1="2" y1="12" x2="6" y2="12"/>
                  <line x1="7.76" y1="7.76" x2="4.93" y2="4.93"/>
                </svg>
                Validating…
              </>
            ) : validated ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Validated
              </>
            ) : (
              <>
                <IconShield />
                Validate with OCL
              </>
            )}
          </button>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12, marginBottom: 20,
          animation: 'tdw-fade-up 0.4s ease 0.05s both',
        }}>
          {[
            { icon: <IconLayers />,  label: 'Document type', value: 'Technical Doc',   mono: false },
            { icon: <IconClock />,   label: 'Last modified', value: now || 'Just now', mono: false },
          ].map((s, i) => (
            <div
              key={i}
              className="tdw-stat-card"
              style={{
                background: tk.cardBg,
                border: `1px solid ${tk.border}`,
                borderRadius: tk.radius,
                padding: '14px 16px',
                boxShadow: tk.shadow,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                color: tk.textDim, fontSize: 11, fontWeight: 500,
                letterSpacing: '.05em', textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                {s.icon} {s.label}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 500, color: tk.textSecondary,
                fontFamily: s.mono ? tk.mono : tk.sans,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main content grid ─────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 16,
          alignItems: 'start',
          animation: 'tdw-fade-up 0.4s ease 0.10s both',
        }}>

          {/* ── Document card ── */}
          <div
            className="tdw-card tdw-doc-card"
            onClick={() => window.open(TechnicalDocTemplate, '_blank')}
            style={{
              background: tk.cardBg,
              border: `1px solid ${tk.border}`,
              borderRadius: tk.radiusLg,
              padding: '22px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              boxShadow: tk.shadow,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 3, borderRadius: '14px 14px 0 0',
              background: `linear-gradient(90deg, ${tk.accentMid}, ${tk.accentLight})`,
            }} />

            {/* PDF icon */}
            <div style={{
              width: 52, height: 52, borderRadius: 10, flexShrink: 0,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconPdf />
            </div>

            {/* Doc info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <h4 style={{
                  margin: 0, fontSize: 15, fontWeight: 600,
                  color: tk.textPrimary, letterSpacing: '-.01em',
                }}>
                  Technical Document
                </h4>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '.05em',
                  background: tk.goldBg, color: tk.gold,
                  border: `1px solid ${tk.goldBorder}`,
                  padding: '1px 7px', borderRadius: 20,
                }}>
                  TEMPLATE
                </span>
              </div>
              <p style={{
                margin: '0 0 10px', fontSize: 11,
                color: tk.textDim, fontFamily: tk.mono,
                letterSpacing: '.02em',
              }}>
                Technical_Document_template.pdf
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  background: tk.successBg, color: tk.success,
                  border: `1px solid ${tk.successBorder}`,
                  padding: '2px 9px', borderRadius: 20,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: tk.success, display: 'inline-block',
                    animation: 'tdw-pulse-dot 2.5s ease-in-out infinite',
                  }} />
                  Template loaded
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  background: tk.accentBg, color: tk.accentMid,
                  border: `1px solid ${tk.accentBorder}`,
                  padding: '2px 9px', borderRadius: 20,
                }}>
                  11 sections
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="tdw-arrow" style={{ color: tk.textDim, flexShrink: 0 }}>
              <IconChevron />
            </div>
          </div>

          {/* ── Context card ── */}
          <div
            className="tdw-card"
            style={{
              background: tk.cardBg,
              border: `1px solid ${tk.border}`,
              borderRadius: tk.radiusLg,
              overflow: 'hidden',
              boxShadow: tk.shadow,
            }}
          >
            {/* Card header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: `1px solid ${tk.border}`,
              display: 'flex', alignItems: 'center', gap: 7,
              background: tk.cardBgAlt,
            }}>
              <IconInfo />
              <span style={{
                fontSize: 11, fontWeight: 600, color: tk.textMuted,
                letterSpacing: '.06em', textTransform: 'uppercase',
              }}>
                Project context
              </span>
            </div>

            {/* Rows */}
            {[
              {
                label: 'Status',
                value: (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: tk.success, fontSize: 12, fontWeight: 600,
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: tk.success, display: 'inline-block',
                      animation: 'tdw-pulse-dot 2.5s ease-in-out infinite',
                    }} />
                    Active
                  </span>
                ),
              },
              {
                label: 'OCL validation',
                value: (
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: validated ? tk.success : validating ? tk.accentMid : tk.textDim,
                  }}>
                    {validated ? '✓ Passed' : validating ? 'Running…' : 'Not run'}
                  </span>
                ),
              },
              {
                label: 'Last edited',
                value: <span style={{ fontSize: 12, color: tk.textSecondary }}>{now || 'Just now'}</span>,
              },
              {
                label: 'Format',
                value: <span style={{ fontSize: 11, color: tk.textMuted, fontFamily: tk.mono }}>MIU / A4</span>,
              },
            ].map((row, i, arr) => (
              <React.Fragment key={i}>
                <div
                  className="tdw-detail-row"
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '11px 18px',
                  }}
                >
                  <span style={{ fontSize: 12, color: tk.textMuted, fontWeight: 400 }}>
                    {row.label}
                  </span>
                  {row.value}
                </div>
                {i < arr.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            {/* CTA */}
            <div style={{ padding: '12px 18px', borderTop: `1px solid ${tk.border}` }}>
              <button
                className="tdw-open-btn"
                onClick={() => navigate('/TechDocEditor')}
                style={{
                  width: '100%', height: 34,
                  borderRadius: 7,
                  border: `1px solid ${tk.border}`,
                  background: 'transparent',
                  color: tk.textMuted,
                  fontSize: 12, fontWeight: 500, fontFamily: tk.sans,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <IconEdit />
                Start working on the document
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <p style={{
          marginTop: 28, fontSize: 11,
          color: tk.textDim, fontFamily: tk.mono,
          letterSpacing: '.03em', textAlign: 'center',
          animation: 'tdw-fade-in 0.5s ease 0.2s both',
        }}>
          MIU Faculty of Computer Science · Technical Documentation System
        </p>

      </div>
    </>
  );
};

export default TechnicalDocWorkspace;