/**
 * Role Utilities v2.0
 *
 * This file establishes a robust, type-safe system for handling user roles.
 * It normalizes roles received from the backend into a consistent format for frontend use,
 * preventing case-sensitivity issues and providing a single source of truth for role definitions.
 */

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

/**
 * Defines the clean, normalized, and type-safe roles used throughout the frontend.
 * Using a union of string literals provides compile-time safety.
 */
export type FrontendRole = 
  | 'client_individual'
  | 'client_corporate'
  | 'software_company'
  | 'admin'
  | 'project_manager'
  | 'unknown'; // Represents an unrecognized or missing role

/**
 * A const object to hold FrontendRole values.
 * This prevents "magic strings" and provides easy, consistent access to role names.
 * Using 'as const' ensures the values are treated as literal types.
 */
export const frontendRoles = {
  CLIENT_INDIVIDUAL: 'client_individual',
  CLIENT_CORPORATE: 'client_corporate',
  SOFTWARE_COMPANY: 'software_company',
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  UNKNOWN: 'unknown',
} as const;

// -----------------------------------------------------------------------------
// ROLE NORMALIZATION
// -----------------------------------------------------------------------------

/**
 * Maps raw backend role strings to our clean frontend role literals.
 * This is the core of the normalization layer. It's case-insensitive.
 * The key is the lowercase version of the backend role.
 */
const backendToFrontendRoleMap: Record<string, FrontendRole> = {
  client_person: frontendRoles.CLIENT_INDIVIDUAL,
  client_corporate: frontendRoles.CLIENT_CORPORATE,
  company: frontendRoles.SOFTWARE_COMPANY, // Original role
  software_company: frontendRoles.SOFTWARE_COMPANY, // Backend role from user
  admin: frontendRoles.ADMIN,
  project_manager: frontendRoles.PROJECT_MANAGER,
};

/**
 * Normalizes a raw role string from the backend into a type-safe FrontendRole.
 * If the role is not recognized, it safely defaults to 'unknown'.
 *
 * @param backendRole The raw role string from the backend (e.g., "SOFTWARE_COMPANY").
 * @returns A type-safe FrontendRole (e.g., "software_company").
 */
export const normalizeRole = (backendRole?: string | null): FrontendRole => {
  if (!backendRole) {
    return frontendRoles.UNKNOWN;
  }
  const lowercasedRole = backendRole.toLowerCase();
  return backendToFrontendRoleMap[lowercasedRole] || frontendRoles.UNKNOWN;
};

// -----------------------------------------------------------------------------
// ROLE GROUPS & PERMISSIONS
// -----------------------------------------------------------------------------

/**
 * Defines groups of roles for checking broader permissions (e.g., any client type).
 * Uses the type-safe frontendRoles constants.
 */
export const RoleGroups = {
  CLIENT: [frontendRoles.CLIENT_INDIVIDUAL, frontendRoles.CLIENT_CORPORATE],
  COMPANY: [frontendRoles.SOFTWARE_COMPANY],
  ADMIN: [frontendRoles.ADMIN],
  PROJECT_MANAGER: [frontendRoles.PROJECT_MANAGER],
} as const;

/**
 * Checks if a user's role is included in a list of allowed roles.
 * This function is now fully type-safe.
 *
 * @param userRole The user's FrontendRole.
 * @param allowedRoles An array of FrontendRole that are allowed.
 * @returns true if the user's role is in the allowed list.
 */
export const hasAnyRole = (userRole: FrontendRole, allowedRoles: readonly FrontendRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

// -----------------------------------------------------------------------------
// ROUTING
// -----------------------------------------------------------------------------

/**
 * Gets the default home route for a user based on their role.
 * Handles 'unknown' roles by redirecting to a safe default (e.g., login page).
 *
 * @param userRole The user's FrontendRole.
 * @returns The path to the user's default home page.
 */
export const getDefaultHomeRoute = (userRole: FrontendRole): string => {
  switch (userRole) {
    case frontendRoles.SOFTWARE_COMPANY:
      return '/CompanyHome';
    case frontendRoles.CLIENT_INDIVIDUAL:
    case frontendRoles.CLIENT_CORPORATE:
      return '/BrowseCompanies'; // To be implemented
    case frontendRoles.ADMIN:
      return '/AdminHome'; // To be implemented
    case frontendRoles.PROJECT_MANAGER:
      return '/ProjectManagerHome'; // To be implemented
    case frontendRoles.UNKNOWN:
    default:
      // A safe fallback for unknown roles is the login page.
      // This prevents redirect loops if auth state is broken.
      return '/auth';
  }
};