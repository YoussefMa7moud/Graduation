/** localStorage key for technical document editor fields (per project). */
export const LEGACY_TECH_DOC_KEY = 'miu_doc_v2';

export function getTechnicalDocStorageKey(projectId: number): string {
  return `miu_doc_v2_project_${projectId}`;
}

/** True when a contenteditable field has no real user text (only <br>, whitespace, etc.). */
export function isEmptyEditorHtml(html: string | null | undefined): boolean {
  return stripHtml(String(html ?? '')) === '';
}

/** Old ch1 intro hint text that was saved as real content in some drafts. */
const LEGACY_CH1_INTRO_PLACEHOLDER =
  'Setting out the aims and objectives of your project, explaining the overall intention and specific steps that will be taken to achieve it.';

/** Drop empty fields and legacy placeholder text mistaken for saved content. */
export function normalizeTechnicalDocFieldStore(
  store: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, html] of Object.entries(store)) {
    if (id === 'tde-ch1_intro' && stripHtml(html) === LEGACY_CH1_INTRO_PLACEHOLDER) {
      continue;
    }
    if (!isEmptyEditorHtml(html)) {
      out[id] = html;
    }
  }
  return out;
}

/** Preserve paragraph/line breaks; only collapse repeated spaces on the same line. */
function stripHtml(html: string): string {
  if (!html) return '';
  let text: string;
  try {
    const d = document.createElement('div');
    d.innerHTML = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n');
    text = d.textContent || d.innerText || '';
  } catch {
    text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&nbsp;/gi, ' ');
  }
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Reads saved editor fields for a project and returns concatenated plain text
 * with field boundaries preserved (helps validation find content in long sections).
 */
export function collectTechnicalDocumentPlainText(projectId: number): string {
  if (typeof window === 'undefined') return '';
  const key = getTechnicalDocStorageKey(projectId);
  let raw = localStorage.getItem(key);
  if (!raw) {
    raw = localStorage.getItem(LEGACY_TECH_DOC_KEY);
  }
  if (!raw) return '';
  try {
    const obj = JSON.parse(raw) as Record<string, string>;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const parts: string[] = [];
      for (const [fieldId, html] of Object.entries(obj)) {
        const plain = stripHtml(String(html ?? ''));
        if (!plain) continue;
        const label = fieldId.replace(/^tde-/, '').replace(/-/g, ' ');
        parts.push(`[${label}]\n${plain}`);
      }
      return parts.join('\n\n');
    }
  } catch {
    return stripHtml(raw);
  }
  return stripHtml(raw);
}

/** Returns canonical JSON string of stored editor fields, or undefined if none / invalid. */
export function getStoredTechnicalDocumentFieldsJson(projectId: number): string | undefined {
  if (typeof window === 'undefined' || !Number.isFinite(projectId) || projectId <= 0) return undefined;
  const key = getTechnicalDocStorageKey(projectId);
  let raw = localStorage.getItem(key) ?? localStorage.getItem(LEGACY_TECH_DOC_KEY);
  if (!raw?.trim()) return undefined;
  try {
    const obj = JSON.parse(raw) as unknown;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return JSON.stringify(obj);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** Force-save current editor fields from the DOM (call before validation if editor is open). */
export function saveTechnicalDocumentFromDom(projectId: number): void {
  if (typeof document === 'undefined' || !Number.isFinite(projectId) || projectId <= 0) return;
  const store: Record<string, string> = {};
  document.querySelectorAll<HTMLElement>('[id^="tde-"]').forEach(el => {
    if (!isEmptyEditorHtml(el.innerHTML)) {
      store[el.id] = el.innerHTML;
    }
  });
  if (Object.keys(store).length > 0) {
    localStorage.setItem(getTechnicalDocStorageKey(projectId), JSON.stringify(store));
    localStorage.setItem('miu_doc_last_saved', new Date().toISOString());
  }
}
