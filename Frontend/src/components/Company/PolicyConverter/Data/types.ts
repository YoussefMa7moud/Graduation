
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
  EgyptianDataProtection: "Egyptian Data Protection Law (151/2020)",
  EgyptianCivilCode: "Egyptian Civil Code",
  EgyptianLaborLaw: "Egyptian Labor Law",
  FRA: "Financial Regulatory Authority (FRA) Rules"
} as const;

// This creates a type out of the object values
export type LegalFrameworkType = (typeof LegalFramework)[keyof typeof LegalFramework];