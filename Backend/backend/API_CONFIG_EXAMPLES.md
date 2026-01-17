# API Configuration Examples for Different Frameworks

This file contains ready-to-use API configuration examples for different frontend frameworks.

---

## React (Create React App / Vite)

### 1. Create `.env.development`
```env
REACT_APP_API_BASE_URL=http://localhost:8080
# or for Vite:
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Create `.env.production`
```env
REACT_APP_API_BASE_URL=https://api.yourdomain.com
# or for Vite:
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3. Create `src/config/api.config.js`
```javascript
// For Create React App
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// For Vite
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
    }
  }
};

export default API_CONFIG;
```

### 4. Usage in components:
```javascript
import API_CONFIG from './config/api.config';

const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## Next.js

### 1. Create `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. Create `.env.production`
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### 3. Create `src/config/api.config.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
    }
  }
} as const;

export default API_CONFIG;
```

### 4. Usage:
```typescript
import API_CONFIG from '@/config/api.config';

const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## Vue.js (Vite)

### 1. Create `.env.development`
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Create `.env.production`
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3. Create `src/config/api.config.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
    }
  }
};

export default API_CONFIG;
```

### 4. Usage:
```javascript
import API_CONFIG from '@/config/api.config';

const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## Angular

### 1. Create `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080'
};
```

### 2. Create `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com'
};
```

### 3. Create `src/config/api.config.ts`
```typescript
import { environment } from '../environments/environment';

export const API_CONFIG = {
  baseURL: environment.apiBaseUrl,
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
    }
  }
} as const;
```

### 4. Usage in service:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.login}`,
      { email, password }
    );
  }
}
```

---

## Axios Configuration Example (Works with any framework)

### Create `src/utils/api.client.js` (or `.ts`)
```javascript
import axios from 'axios';

// Get base URL from environment or config
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                     import.meta.env.VITE_API_BASE_URL || 
                     process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'http://localhost:8080';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Usage:
```javascript
import apiClient from './utils/api.client';

// Login
const login = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', {
    email,
    password
  });
  return response.data;
};

// Protected endpoint
const getProtectedData = async () => {
  const response = await apiClient.get('/api/protected-endpoint');
  return response.data;
};
```

---

## Fetch API Wrapper Example

### Create `src/utils/api.client.js`
```javascript
// Get base URL from environment
const getBaseURL = () => {
  return process.env.REACT_APP_API_BASE_URL || 
         import.meta.env.VITE_API_BASE_URL || 
         process.env.NEXT_PUBLIC_API_BASE_URL || 
         'http://localhost:8080';
};

// Get token from storage
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// API client function
export const apiClient = async (endpoint, options = {}) => {
  const baseURL = getBaseURL();
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Convenience methods
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data, options) => apiClient(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};
```

### Usage:
```javascript
import { api } from './utils/api.client';

// Login
const login = async (email, password) => {
  return await api.post('/api/auth/login', { email, password });
};

// Get protected data
const getData = async () => {
  return await api.get('/api/protected-endpoint');
};
```

---

## Quick Setup Checklist

1. ✅ Create environment files (`.env.development`, `.env.production`)
2. ✅ Create API config file (`src/config/api.config.js`)
3. ✅ Set base URL from environment variable
4. ✅ Create API client utility (with interceptors if using Axios)
5. ✅ Add token to Authorization header automatically
6. ✅ Handle 401 errors (clear token, redirect to login)
7. ✅ Test with different environment URLs

---

## Deployment Notes

- **Development**: Use `http://localhost:8080`
- **Staging**: Use your staging server URL
- **Production**: Use your production API URL
- Never commit `.env` files with sensitive data
- Use `.env.example` to document required environment variables
