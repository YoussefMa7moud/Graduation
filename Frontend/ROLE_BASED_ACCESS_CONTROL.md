# Role-Based Access Control (RBAC) Guide

## Overview

The application now implements role-based access control, ensuring users can only access pages appropriate for their role.

## User Roles

The system supports the following roles (matching your Spring Boot backend):

1. **CLIENT_PERSON** - Individual client
2. **CLIENT_CORPORATE** - Corporate client
3. **COMPANY** - Software company
4. **ADMIN** - Administrator
5. **PROJECT_MANAGER** - Project Manager

## Access Control Rules

### Company Routes (Currently Implemented)
- **Allowed Roles**: `COMPANY`
- **Routes**:
  - `/CompanyHome`
  - `/PolicyConverter`
  - `/MyPolicyRepository`
  - `/ClientRequests`
  - `/CompanySettings`
  - `/ContractRepository`

### Client Routes (To Be Implemented)
- **Allowed Roles**: `CLIENT_PERSON`, `CLIENT_CORPORATE`
- **Routes**: 
  - `/ClientHome` (to be created)

### Admin Routes (To Be Implemented)
- **Allowed Roles**: `ADMIN`
- **Routes**:
  - `/AdminHome` (to be created)

### Project Manager Routes (To Be Implemented)
- **Allowed Roles**: `PROJECT_MANAGER`
- **Routes**:
  - `/ProjectManagerHome` (to be created)

## How It Works

### 1. Role Utilities (`src/utils/role.utils.ts`)

Contains helper functions for role checking:
- `hasRole(userRole, requiredRole)` - Check if user has specific role
- `hasAnyRole(userRole, allowedRoles)` - Check if user has any of the allowed roles
- `isClient(userRole)` - Check if user is a client
- `isCompany(userRole)` - Check if user is a company
- `isAdmin(userRole)` - Check if user is an admin
- `isProjectManager(userRole)` - Check if user is a project manager
- `getDefaultHomeRoute(userRole)` - Get the default home route for a role

### 2. RoleBasedRoute Component (`src/components/Auth/RoleBasedRoute.tsx`)

Wraps routes that require specific roles:
```tsx
<RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
  <YourComponent />
</RoleBasedRoute>
```

### 3. Route Protection

Routes are protected with two layers:
1. **ProtectedRoute** - Ensures user is authenticated
2. **RoleBasedRoute** - Ensures user has the required role

Example:
```tsx
<Route 
  path="/CompanyHome" 
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
        <DashboardLayout>
          <CompanyHome />
        </DashboardLayout>
      </RoleBasedRoute>
    </ProtectedRoute>
  } 
/>
```

## Adding New Routes

### For Company Users

```tsx
<Route 
  path="/NewCompanyPage" 
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={RoleGroups.COMPANY}>
        <DashboardLayout>
          <NewCompanyPage />
        </DashboardLayout>
      </RoleBasedRoute>
    </ProtectedRoute>
  } 
/>
```

### For Client Users

```tsx
<Route 
  path="/ClientHome" 
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
        <ClientDashboardLayout>
          <ClientHome />
        </ClientDashboardLayout>
      </RoleBasedRoute>
    </ProtectedRoute>
  } 
/>
```

### For Multiple Roles

To allow multiple roles to access a route:

```tsx
<RoleBasedRoute allowedRoles={[...RoleGroups.COMPANY, ...RoleGroups.ADMIN]}>
  <YourComponent />
</RoleBasedRoute>
```

## Updating Role Strings

If your backend returns different role strings, update `src/utils/role.utils.ts`:

```typescript
export const UserRoles = {
  CLIENT_INDIVIDUAL: 'YOUR_BACKEND_ROLE_STRING' as UserRole,
  CLIENT_CORPORATE: 'YOUR_BACKEND_ROLE_STRING' as UserRole,
  COMPANY: 'YOUR_BACKEND_ROLE_STRING' as UserRole,
  // ... etc
} as const;
```

## Behavior

1. **Unauthenticated users** trying to access protected routes → Redirected to `/auth`
2. **Authenticated users** without required role → Redirected to their default home page
3. **Authenticated users** with required role → Can access the route
4. **Login/Register** → Users are automatically redirected to their role-appropriate home page

## Testing

1. **Test as Company user**:
   - Login with a company account
   - Should access `/CompanyHome` and all company routes
   - Should NOT access client/admin/project manager routes

2. **Test as Client user**:
   - Login with a client account
   - Should be redirected to `/ClientHome` (when implemented)
   - Should NOT access company routes

3. **Test unauthorized access**:
   - Try accessing `/CompanyHome` as a client user
   - Should see "Access Denied" message and be redirected

## Future Implementation

When implementing client/admin/project manager pages:

1. Create the page components
2. Create appropriate layout components (if needed)
3. Uncomment and update the route definitions in `App.tsx`
4. Update the sidebar/navigation to show appropriate links based on role

## Example: Adding Client Pages

1. Create `src/pages/Client/ClientHome.tsx`
2. Create `src/components/Client/ClientDashboardLayout.tsx` (if needed)
3. Update `App.tsx`:

```tsx
import ClientHome from './pages/Client/ClientHome';
import ClientDashboardLayout from './components/Client/ClientDashboardLayout';

// In AppRoutes:
<Route 
  path="/ClientHome" 
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={RoleGroups.CLIENT}>
        <ClientDashboardLayout>
          <ClientHome />
        </ClientDashboardLayout>
      </RoleBasedRoute>
    </ProtectedRoute>
  } 
/>
```

4. Update sidebar to show client navigation for client users
