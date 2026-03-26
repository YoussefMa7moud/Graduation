// ============================================================
// Smart Pricing Engine — calculatePrice(formData)
// ============================================================
// Pure utility functions for automatic budget estimation.
// Each pricing component is its own function for testability.
// ============================================================

import {
  PROJECT_TYPE_COSTS,
  FEATURE_DEFINITIONS,
  DEFAULT_FEATURE_COST,
  ROLE_COSTS,
  SCALABILITY_COSTS,
  DURATION_TIERS,
  NDA_COST,
  OWNERSHIP_COSTS,
  MAINTENANCE_COSTS,
  type FeatureDefinition,
} from './pricingConfig';

// ---- Types ----

export interface DetectedFeature {
  name: string;
  cost: number;
  matched: boolean; // true = matched keyword, false = unrecognized extra
}

export interface PriceBreakdown {
  projectType: { label: string; cost: number };
  features: { items: DetectedFeature[]; total: number };
  roles: { count: number; cost: number };
  scalability: { label: string; cost: number };
  duration: { days: number; multiplier: number; label: string };
  extras: {
    nda: number;
    ownership: number;
    maintenance: number;
    total: number;
  };
  subtotal: number;   // before duration multiplier
  total: number;       // after duration multiplier
}

export interface ProposalFormData {
  projectType: string;
  mainFeatures: string;
  userRoles: string;
  scalability: string;
  expectedDuration: string;
  ndaRequired: boolean;
  codeOwnership: string;
  maintenancePeriod: string;
}

// ---- Feature Extraction ----

/**
 * Parse the free-text "Main Features / Modules" field.
 * 1. Split by commas, newlines, semicolons
 * 2. For each token, check against keyword map (synonym normalization)
 * 3. Return list of detected features (recognized + extras)
 */
export function extractFeatures(text: string): DetectedFeature[] {
  if (!text.trim()) return [];

  // Split input into individual tokens
  const tokens = text
    .split(/[,;\n]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  const matchedFeatures = new Set<string>();
  const detectedFeatures: DetectedFeature[] = [];

  for (const token of tokens) {
    let found = false;

    for (const def of FEATURE_DEFINITIONS) {
      // Check if any keyword appears in the token OR the token appears in any keyword
      const isMatch = def.keywords.some(
        kw => token.includes(kw) || kw.includes(token)
      );

      if (isMatch && !matchedFeatures.has(def.name)) {
        matchedFeatures.add(def.name);
        detectedFeatures.push({
          name: def.name,
          cost: def.cost,
          matched: true,
        });
        found = true;
        break;
      }
    }

    // If no keyword matched, treat as an unrecognized "extra" feature
    if (!found && !matchedFeatures.has(token)) {
      matchedFeatures.add(token);
      detectedFeatures.push({
        name: capitalize(token),
        cost: DEFAULT_FEATURE_COST,
        matched: false,
      });
    }
  }

  return detectedFeatures;
}

// ---- Roles Cost ----

export function calculateRolesCost(rolesText: string): { count: number; cost: number } {
  if (!rolesText.trim()) return { count: 0, cost: 0 };

  const roles = rolesText
    .split(/[,;\n]+/)
    .map(r => r.trim())
    .filter(r => r.length > 0);

  const count = roles.length;

  if (count <= 1) return { count, cost: ROLE_COSTS.single };
  if (count === 2) return { count, cost: ROLE_COSTS.dual };
  return { count, cost: ROLE_COSTS.multi };
}

// ---- Duration Multiplier ----

export function getDurationInfo(daysStr: string): { days: number; multiplier: number; label: string } {
  const days = parseInt(daysStr) || 0;
  if (days <= 0) return { days: 0, multiplier: 1.0, label: 'Not specified' };

  for (const tier of DURATION_TIERS) {
    if (days <= tier.maxDays) {
      return { days, multiplier: tier.multiplier, label: tier.label };
    }
  }

  return { days, multiplier: 1.0, label: 'Standard' };
}

// ---- Extras ----

export function calculateExtras(
  ndaRequired: boolean,
  codeOwnership: string,
  maintenancePeriod: string
): { nda: number; ownership: number; maintenance: number; total: number } {
  const nda = ndaRequired ? NDA_COST : 0;
  const ownership = OWNERSHIP_COSTS[codeOwnership] ?? 0;
  const maintenance = MAINTENANCE_COSTS[maintenancePeriod] ?? 0;

  return {
    nda,
    ownership,
    maintenance,
    total: nda + ownership + maintenance,
  };
}

// ---- Main Calculator ----

/**
 * calculatePrice(formData) → PriceBreakdown
 *
 * Formula:
 *   Total = (ProjectType + Features + Roles + Scalability + Extras) × DurationMultiplier
 */
export function calculatePrice(form: ProposalFormData): PriceBreakdown {
  // A. Project type
  const projectTypeCost = PROJECT_TYPE_COSTS[form.projectType] ?? 0;

  // B. Features
  const detectedFeatures = extractFeatures(form.mainFeatures);
  const featuresTotalCost = detectedFeatures.reduce((sum, f) => sum + f.cost, 0);

  // C. Roles
  const rolesResult = calculateRolesCost(form.userRoles);

  // D. Scalability
  const scalabilityCost = SCALABILITY_COSTS[form.scalability] ?? 0;

  // E. Duration
  const durationInfo = getDurationInfo(form.expectedDuration);

  // F. Extras
  const extras = calculateExtras(form.ndaRequired, form.codeOwnership, form.maintenancePeriod);

  // Calculate
  const subtotal = projectTypeCost + featuresTotalCost + rolesResult.cost + scalabilityCost + extras.total;
  const total = Math.round(subtotal * durationInfo.multiplier);

  return {
    projectType: { label: form.projectType || 'Not selected', cost: projectTypeCost },
    features: { items: detectedFeatures, total: featuresTotalCost },
    roles: { count: rolesResult.count, cost: rolesResult.cost },
    scalability: { label: form.scalability, cost: scalabilityCost },
    duration: durationInfo,
    extras,
    subtotal,
    total,
  };
}

// ---- Helpers ----

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
