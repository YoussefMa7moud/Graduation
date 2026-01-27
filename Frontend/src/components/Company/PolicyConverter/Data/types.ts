
export interface ValidationResult {
  label: string;
  standard: string;
}

export interface OCLGenerationResponse {
  explanation: string;
  oclCode: string;
  articleRef: string;
  validation: ValidationResult[];
  category: string;
  keywords: string[];
}

export interface PolicyInput {
  id: string;
  name: string;
  framework: string;
  text: string;
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  result: OCLGenerationResponse;
}

export const LegalFramework = {
  DEVELOPERS_DUTIES: "DEVELOPER'S DUTIES",
  DELIVERY: "DELIVERY",
  COMPENSATION: "COMPENSATION",
  INTELLECTUAL_PROPERTY: "INTELLECTUAL PROPERTY RIGHTS",
  CHANGE_IN_SPECIFICATIONS: "CHANGE IN SPECIFICATIONS",
  CONFIDENTIALITY: "CONFIDENTIALITY",
  WARRANTIES: "DEVELOPER WARRANTIES",
  INDEMNIFICATION: "INDEMNIFICATION",
} as const;

// This creates a type out of the object values
export type LegalFrameworkType = (typeof LegalFramework)[keyof typeof LegalFramework];