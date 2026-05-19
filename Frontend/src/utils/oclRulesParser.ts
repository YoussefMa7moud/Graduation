export interface ClauseOclConstraint {
  clauseId: string;
  sectionTitle: string;
  clauseText: string;
  oclCode: string;
  explanation: string;
}

export interface ParsedOclRule {
  name: string;
  code: string;
  explanation: string;
  sectionTitle?: string;
  clauseText?: string;
}

function generateHeuristicExplanation(ocl: string): string {
  const explanations: string[] = [];
  if (/->forAll/i.test(ocl)) explanations.push('This rule checks that ALL items in a collection satisfy a condition.');
  if (/->exists/i.test(ocl)) explanations.push('This rule verifies that at least one item meets the specified criteria.');
  if (/->size\(\)/i.test(ocl)) explanations.push('This rule validates the count/size of a collection.');
  if (/->isUnique/i.test(ocl)) explanations.push('This rule ensures uniqueness of values within a collection.');
  if (/->select/i.test(ocl)) explanations.push('This rule filters elements based on a condition.');
  if (/->includes/i.test(ocl)) explanations.push('This rule checks that a collection contains a specific element.');
  if (/implies/i.test(ocl)) explanations.push('This rule defines a conditional requirement (if A then B).');
  if (/not |<>|!=|oclIsUndefined/i.test(ocl)) explanations.push('This rule enforces that certain values must not be empty or invalid.');
  if (/>=|<=|>|</i.test(ocl) && !/->/.test(ocl.split(/>=|<=|>|</)[0].slice(-3))) {
    explanations.push('This rule enforces a numeric boundary constraint.');
  }
  if (explanations.length === 0) {
    explanations.push('This constraint enforces a business rule defined in the contract.');
  }
  return explanations.join(' ');
}

/** Parse versioned JSON bundle saved at PM assignment. */
export function parseClauseOclBundle(raw: string | null | undefined): ClauseOclConstraint[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as { version?: number; constraints?: ClauseOclConstraint[] };
    if (Array.isArray(parsed.constraints)) {
      return parsed.constraints.filter(c => c?.oclCode?.trim());
    }
  } catch {
    /* legacy plain-text OCL */
  }
  return [];
}

/** Display rules for PM workspace: structured clauses first, else legacy context blocks. */
export function parseOclRulesForDisplay(raw: string | null | undefined): ParsedOclRule[] {
  const structured = parseClauseOclBundle(raw);
  if (structured.length > 0) {
    return structured.map((c, i) => {
      const invMatch = c.oclCode.match(/inv\s+([\w]+)\s*:/i);
      const name = invMatch
        ? invMatch[1]
        : `${c.sectionTitle || 'Clause'} (${c.clauseId || i + 1})`;
      return {
        name,
        code: c.oclCode.trim(),
        explanation: c.explanation?.trim() || generateHeuristicExplanation(c.oclCode),
        sectionTitle: c.sectionTitle,
        clauseText: c.clauseText,
      };
    });
  }

  if (!raw?.trim()) return [];
  const chunks = raw.split(/(?=context\s)/gi).filter(s => s.trim());
  return chunks.map((chunk, i) => {
    const invMatch = chunk.match(/inv\s+([\w]+)\s*:/i);
    const name = invMatch ? invMatch[1] : `Rule ${i + 1}`;
    return {
      name,
      code: chunk.trim(),
      explanation: generateHeuristicExplanation(chunk.trim()),
    };
  });
}
