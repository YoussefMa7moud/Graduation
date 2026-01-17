# JWT Authentication Guide

## What is JWT and How It Works

### Overview
JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information between parties. In our application, JWTs are used to authenticate users after they log in.

### JWT Structure
A JWT consists of three parts separated by dots (`.`):
1. **Header**: Contains token type and signing algorithm
2. **Payload**: Contains claims (user info, expiration, etc.)
3. **Signature**: Used to verify the token hasn't been tampered with

Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIn0.signature`

### How JWT Authentication Works in This Application

1. **User Registration/Login**:
   - User sends credentials (email/password) to `/api/auth/login`
   - Backend validates credentials
   - If valid, backend generates a JWT token containing:
     - User email (subject)
     - User role
     - Expiration time (24 hours by default)

2. **Token Storage**:
   - Frontend receives the token in the login response
   - Frontend stores the token (typically in localStorage or sessionStorage)

3. **Authenticated Requests**:
   - Frontend includes the token in the `Authorization` header:
     ```
     Authorization: Bearer <token>
     ```
   - Backend's `JwtAuthenticationFilter` intercepts the request
   - Filter validates the token and extracts user information
   - User is authenticated for the request

4. **Token Validation**:
   - Backend checks if token is expired
   - Backend verifies token signature
   - Backend extracts user info and sets authentication context

## Fixed Issues

### 403 Error Fix
The 403 error you were experiencing was because:
1. **Wrong HTTP Method**: You were using GET with query parameters, but the endpoint requires POST
2. **Wrong Content Type**: The endpoint expected `multipart/form-data` or `application/json`, not query parameters

**Solution**: 
- Added support for JSON requests to the registration endpoint
- Now you can use POST with JSON body OR form-data

## API Endpoints

### 1. Register (JSON)
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "role": "client",
  "clientType": "individual",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "userId": 1,
  "role": "CLIENT_PERSON"
}
```

### 2. Register (Form-Data - for file uploads)
```http
POST http://localhost:8080/api/auth/register
Content-Type: multipart/form-data

email: test@example.com
password: password123
role: client
clientType: individual
firstName: John
lastName: Doe
logo: [file]
```

### 3. Login
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "test@example.com",
  "role": "CLIENT_PERSON"
}
```

### 4. Protected Endpoints
After login, include the token in all protected requests:
```http
GET http://localhost:8080/api/protected-endpoint
Authorization: Bearer <your-token-here>
```

## Frontend Integration Guide

### Step 1: Login and Store Token

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      userId: data.userId,
      email: data.email,
      role: data.role
    }));
    return data;
  } else {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
}
```

### Step 2: Create Axios/Fetch Interceptor

#### Using Fetch API:
```javascript
// Helper function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  }
  
  return response;
}

// Usage
async function getProtectedData() {
  const response = await authenticatedFetch('http://localhost:8080/api/protected-endpoint');
  const data = await response.json();
  return data;
}
```

#### Using Axios:
```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(
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

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage
async function getProtectedData() {
  const response = await api.get('/api/protected-endpoint');
  return response.data;
}
```

### Step 3: React Example

```jsx
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

// Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      
      const { token: newToken, userId, email: userEmail, role } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify({ userId, email: userEmail, role }));
      
      setToken(newToken);
      setUser({ userId, email: userEmail, role });
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Configure axios to use token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Usage in component
function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Step 4: Vue.js Example

```vue
<template>
  <div>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          email: this.email,
          password: this.password
        });
        
        const { token, userId, email, role } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ userId, email, role }));
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Redirect to dashboard
        this.$router.push('/dashboard');
      } catch (error) {
        alert(error.response?.data?.error || 'Login failed');
      }
    }
  },
  mounted() {
    // Set token if exists
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};
</script>
```

## Security Best Practices

1. **Token Storage**: 
   - Use `localStorage` for convenience (persists across tabs)
   - Use `sessionStorage` for better security (cleared on tab close)
   - Consider httpOnly cookies for production (more secure)

2. **Token Expiration**: 
   - Tokens expire after 24 hours (configurable in `application.properties`)
   - Implement token refresh mechanism for production

3. **HTTPS**: 
   - Always use HTTPS in production to protect tokens in transit

4. **Secret Key**: 
   - Change the JWT secret in `application.properties` to a strong random string in production
   - Minimum 256 bits (32 characters) recommended

## Testing with Postman/Thunder Client

1. **Register**:
   - Method: POST
   - URL: `http://localhost:8080/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "role": "client",
       "clientType": "individual",
       "firstName": "John",
       "lastName": "Doe"
     }
     ```

2. **Login**:
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Copy the `token` from response

3. **Protected Endpoint**:
   - Method: GET/POST (as needed)
   - URL: `http://localhost:8080/api/your-endpoint`
   - Headers: 
     - `Content-Type: application/json`
     - `Authorization: Bearer <paste-token-here>`

## Configuration

JWT settings in `application.properties`:
```properties
jwt.secret=your-secret-key-change-this-to-a-long-random-string-in-production-minimum-256-bits
jwt.expiration=86400000  # 24 hours in milliseconds
```

## Troubleshooting

1. **401 Unauthorized**: Token expired or invalid. Login again to get a new token.

2. **403 Forbidden**: 
   - Make sure you're using POST (not GET) for registration/login
   - Check that `/api/auth/**` endpoints don't require authentication

3. **Token not working**: 
   - Verify token is included in `Authorization: Bearer <token>` header
   - Check token hasn't expired
   - Ensure JWT secret matches between token generation and validation
