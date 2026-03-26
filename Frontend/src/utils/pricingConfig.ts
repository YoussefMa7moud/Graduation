// ============================================================
// Smart Pricing Configuration — Egyptian Market-Based (USD)
// ============================================================
// All pricing constants are centralized here for easy updates.
// Based on Egyptian junior-mid developer rates (~$5–$10/hour).
// ============================================================

// --- A. Project Type Base Costs ---
export const PROJECT_TYPE_COSTS: Record<string, number> = {
  'Web App': 1500,
  'Mobile App': 2500,
  'AI System': 4000,
  'API': 1500,
};

// --- B. Feature Keyword Map (with synonym normalization) ---
// Each key is the canonical feature name.
// `keywords` are the text patterns that map to this feature.
export interface FeatureDefinition {
  name: string;
  cost: number;
  keywords: string[];
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    name: 'Authentication',
    cost: 300,
    keywords: ['auth', 'login', 'sign-in', 'signin', 'signup', 'sign-up', 'register', 'registration', 'oauth', 'sso', 'jwt'],
  },
  {
    name: 'Payment Integration',
    cost: 1000,
    keywords: ['payment', 'pay', 'stripe', 'paypal', 'billing', 'checkout', 'invoice', 'subscription', 'e-commerce', 'ecommerce'],
  },
  {
    name: 'Admin Dashboard',
    cost: 700,
    keywords: ['dashboard', 'admin panel', 'admin', 'control panel', 'cms', 'backoffice', 'back-office'],
  },
  {
    name: 'Reporting & Analytics',
    cost: 1200,
    keywords: ['analytics', 'reporting', 'reports', 'statistics', 'stats', 'charts', 'graphs', 'data visualization', 'bi', 'insights'],
  },
  {
    name: 'Real-time Chat',
    cost: 800,
    keywords: ['chat', 'messaging', 'real-time', 'realtime', 'websocket', 'instant messaging'],
  },
  {
    name: 'Notifications',
    cost: 400,
    keywords: ['notification', 'notifications', 'push notification', 'email notification', 'alerts', 'sms'],
  },
  {
    name: 'File Upload & Storage',
    cost: 500,
    keywords: ['upload', 'file upload', 'storage', 'cloud storage', 's3', 'media', 'attachment'],
  },
  {
    name: 'Search & Filtering',
    cost: 400,
    keywords: ['search', 'filter', 'filtering', 'elasticsearch', 'full-text search', 'autocomplete'],
  },
  {
    name: 'User Management',
    cost: 500,
    keywords: ['user management', 'user roles', 'permissions', 'rbac', 'access control', 'profile'],
  },
  {
    name: 'API Integration',
    cost: 600,
    keywords: ['api', 'rest', 'graphql', 'third-party', 'integration', 'webhook', 'external api'],
  },
];

// Cost for any feature not matched by the keyword map
export const DEFAULT_FEATURE_COST = 400;

// --- C. User Roles Tier Costs ---
export const ROLE_COSTS = {
  single: 0,    // 1 role
  dual: 500,    // 2 roles
  multi: 1000,  // >2 roles
};

// --- D. Scalability Costs ---
export const SCALABILITY_COSTS: Record<string, number> = {
  'Small': 0,
  'Medium': 1500,
  'Large': 3000,
};

// --- E. Duration Multipliers (Time Pressure / Rush) ---
export const DURATION_TIERS = [
  { maxDays: 29,  multiplier: 1.40, label: 'Rush (+40%)' },
  { maxDays: 90,  multiplier: 1.10, label: 'Standard (+10%)' },
  { maxDays: Infinity, multiplier: 1.00, label: 'Relaxed (No surcharge)' },
];

// --- F. Extra Costs ---
export const NDA_COST = 200;

export const OWNERSHIP_COSTS: Record<string, number> = {
  'Client': 500,    // Full ownership
  'Company': 0,     // License
  'Shared': 0,      // Shared
};

export const MAINTENANCE_COSTS: Record<string, number> = {
  'None': 0,
  '1 Month': 0,
  '3 Months': 300,
  '6 Months': 700,
};

// --- G. Client Adjustment Range ---
export const ADJUSTMENT_RANGE = 10; // ±10%
