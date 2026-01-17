# Authentication Integration Guide

This document explains how the Spring Boot backend authentication is integrated with the React frontend.

## 📁 File Structure

```
src/
├── config/
│   └── api.config.ts          # API base URL configuration
├── services/
│   ├── api.ts                  # Axios instance with interceptors
│   └── auth.service.ts         # Authentication API calls
├── utils/
│   └── auth.utils.ts           # Token and user data management
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
└── components/
    └── Auth/
        ├── LoginForm.tsx       # Login form (updated)
        ├── SignupForm.tsx      # Registration form (updated)
        └── ProtectedRoute.tsx  # Route protection component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# For production, change to your production URL:
# VITE_API_BASE_URL=https://your-api-domain.com
```

**Note:** Vite requires the `VITE_` prefix for environment variables to be accessible in the frontend.

## 🚀 Features

### 1. API Configuration (`src/config/api.config.ts`)
- Centralized API base URL configuration
- Environment-based URLs (development/production)
- Easy to change for deployment

### 2. API Service (`src/services/api.ts`)
- Axios instance with automatic JWT token injection
- Request interceptor adds `Authorization: Bearer <token>` header
- Response interceptor handles 401 errors (token expiration)
- Automatically redirects to login on unauthorized access

### 3. Authentication Service (`src/services/auth.service.ts`)
- `register()` - User registration
- `login()` - User login (stores token and user data)
- `logout()` - User logout (clears token and user data)

### 4. Authentication Context (`src/contexts/AuthContext.tsx`)
- Global authentication state management
- Provides `useAuth()` hook for components
- Manages user login status and user data
- Auto-loads user data from localStorage on app start

### 5. Protected Routes (`src/components/Auth/ProtectedRoute.tsx`)
- Wraps routes that require authentication
- Redirects to login if not authenticated
- Shows loading state while checking authentication

### 6. Updated Components
- **LoginForm**: Integrated with backend, shows errors, loading states
- **SignupForm**: Integrated with backend, form validation, success messages
- **Sidebar**: Logout button integrated with auth context

## 📝 Usage Examples

### Using Authentication in Components

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Making Authenticated API Calls

```tsx
import api from '../services/api';

// The Authorization header is automatically added by the interceptor
const fetchData = async () => {
  try {
    const response = await api.get('/api/protected-endpoint');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

### Protecting Routes

```tsx
import ProtectedRoute from './components/Auth/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 🔐 Security Features

1. **Token Storage**: JWT tokens stored in localStorage with expiration tracking
2. **Token Expiration**: Automatic token expiration check (24 hours)
3. **Auto Logout**: Automatically clears token and redirects on 401 errors
4. **Protected Routes**: Routes require authentication to access
5. **Auth Redirect**: Authenticated users redirected away from login/register pages

## 🔄 Authentication Flow

1. **Registration**:
   - User fills registration form
   - Form submits to `/api/auth/register`
   - On success, user is redirected to login

2. **Login**:
   - User enters email and password
   - Form submits to `/api/auth/login`
   - On success:
     - Token saved to localStorage
     - User data saved to localStorage
     - User redirected to `/CompanyHome`

3. **Protected Routes**:
   - User tries to access protected route
   - `ProtectedRoute` checks authentication
   - If not authenticated, redirects to `/auth`
   - If authenticated, renders the protected component

4. **API Requests**:
   - All API requests automatically include `Authorization: Bearer <token>` header
   - If token is expired (401 response):
     - Token cleared from localStorage
     - User redirected to login page

5. **Logout**:
   - User clicks logout button
   - Token and user data cleared
   - User redirected to login page

## 🐛 Troubleshooting

### API Connection Issues

1. **Check API Base URL**: Ensure `VITE_API_BASE_URL` in `.env` matches your backend URL
2. **CORS Issues**: Ensure your Spring Boot backend has CORS configured to allow requests from your frontend
3. **Backend Running**: Verify your Spring Boot backend is running on the configured port

### Authentication Issues

1. **Token Not Saved**: Check browser console for errors during login
2. **401 Errors**: Token may be expired, try logging in again
3. **Redirect Loops**: Check that protected routes are properly wrapped with `ProtectedRoute`

### Environment Variables Not Working

1. **Restart Dev Server**: Vite requires restart after changing `.env` file
2. **Check Prefix**: Environment variables must start with `VITE_`
3. **Check File Location**: `.env` file must be in the project root

## 📚 Backend API Requirements

Your Spring Boot backend should implement:

1. **POST /api/auth/register**
   - Request: `{ email, password, role, clientType?, firstName, lastName, companyName?, description? }`
   - Response: `{ userId, role }`

2. **POST /api/auth/login**
   - Request: `{ email, password }`
   - Response: `{ token, type, userId, email, role }`
   - Error: `{ error: "Error message" }`

3. **Protected Endpoints**
   - Require `Authorization: Bearer <token>` header
   - Return 401 if token is invalid/expired

## 🎯 Next Steps

1. **Update `.env` file** with your backend URL
2. **Test registration** with a new user
3. **Test login** with registered user
4. **Verify protected routes** require authentication
5. **Test logout** functionality

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check network tab for API request/response details
3. Verify backend is running and accessible
4. Ensure CORS is properly configured on backend
