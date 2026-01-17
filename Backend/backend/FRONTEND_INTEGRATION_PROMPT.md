# Frontend Integration Prompt

Use this prompt when you're ready to integrate the backend authentication with your frontend project.

---

## Prompt to Send:

```
I need to integrate my Spring Boot backend authentication system with my frontend application. 

**Backend Details:**
- Base URL: http://localhost:8080 (should be configurable for deployment)
- Registration endpoint: POST /api/auth/register (accepts JSON)
- Login endpoint: POST /api/auth/login (returns JWT token)
- All protected endpoints require: Authorization: Bearer <token>

**Requirements:**

1. **API Configuration:**
   - Create a global configuration file for API base URL
   - Support environment-based URLs (development, production)
   - Make it easy to change the API URL for deployment

2. **File Structure:**
   - Organize authentication-related files properly
   - Separate concerns (API calls, auth logic, components)
   - Follow best practices for the framework I'm using

3. **Authentication Features:**
   - Registration form/component that calls the backend
   - Login form/component that calls the backend
   - Store JWT token securely (localStorage or sessionStorage)
   - Store user information after login
   - Handle token expiration and logout
   - Redirect to login if token is invalid/expired

4. **API Integration:**
   - Create an API service/utility for authentication endpoints
   - Set up interceptors/middleware to automatically add Authorization header to requests
   - Handle 401 errors (unauthorized) by clearing token and redirecting to login
   - Handle errors gracefully with user-friendly messages

5. **State Management:**
   - Manage authentication state (logged in/out, user info)
   - Make authentication state available throughout the app
   - Provide methods to check if user is authenticated

6. **Components/Pages:**
   - Registration page/component with form validation
   - Login page/component with form validation
   - Protected route wrapper (redirect to login if not authenticated)
   - Optional: User profile display component

**Please:**
- Ask me what frontend framework I'm using (React, Vue, Angular, Next.js, etc.)
- Create a proper file structure
- Use TypeScript if applicable
- Include error handling
- Add comments explaining the code
- Make the code production-ready
- Ensure the API base URL is easily configurable for different environments
```

---

## Additional Context (Include if needed):

### Backend API Endpoints:

**Registration:**
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "role": "client",  // or "company"
  "clientType": "individual",  // or "corporate" (only if role is "client")
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Company Name",  // optional, for corporate clients
  "description": "Description"   // optional
}

Response:
{
  "userId": 1,
  "role": "CLIENT_PERSON"
}
```

**Login:**
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "role": "CLIENT_PERSON"
}
```

**Error Responses:**
```json
{
  "error": "Error message here"
}
```

### Token Usage:
- Store the token from login response
- Include in all protected API requests: `Authorization: Bearer <token>`
- Token expires after 24 hours (configurable in backend)
- Handle 401 responses by clearing token and redirecting to login

---

## Suggested File Structure Examples:

### React/Next.js:
```
src/
├── config/
│   └── api.config.js          # API base URL configuration
├── services/
│   └── auth.service.js        # Authentication API calls
├── utils/
│   └── api.client.js          # API client with interceptors
├── context/
│   └── AuthContext.js         # Auth state management (if using Context)
├── hooks/
│   └── useAuth.js             # Custom auth hook
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   └── common/
│       └── ErrorMessage.jsx
└── pages/
    ├── login.jsx
    └── register.jsx
```

### Vue.js:
```
src/
├── config/
│   └── api.config.js          # API base URL configuration
├── services/
│   └── auth.service.js        # Authentication API calls
├── utils/
│   └── api.client.js          # API client with interceptors
├── store/
│   └── auth.store.js          # Auth state (Vuex/Pinia)
├── components/
│   ├── auth/
│   │   ├── LoginForm.vue
│   │   ├── RegisterForm.vue
│   │   └── ProtectedRoute.vue
│   └── common/
│       └── ErrorMessage.vue
└── views/
    ├── LoginView.vue
    └── RegisterView.vue
```

### Angular:
```
src/
├── config/
│   └── api.config.ts          # API base URL configuration
├── services/
│   ├── auth.service.ts        # Authentication service
│   └── api.interceptor.ts     # HTTP interceptor
├── guards/
│   └── auth.guard.ts          # Route guard
├── components/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── shared/
└── models/
    └── user.model.ts
```

---

## Environment Configuration Example:

### .env.development
```
VITE_API_BASE_URL=http://localhost:8080
# or
REACT_APP_API_BASE_URL=http://localhost:8080
# or
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### .env.production
```
VITE_API_BASE_URL=https://api.yourdomain.com
# or
REACT_APP_API_BASE_URL=https://api.yourdomain.com
# or
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### api.config.js
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     process.env.REACT_APP_API_BASE_URL || 
                     process.env.NEXT_PUBLIC_API_BASE_URL || 
                     'http://localhost:8080';

export default {
  baseURL: API_BASE_URL,
  endpoints: {
    register: '/api/auth/register',
    login: '/api/auth/login',
  }
};
```

---

## Key Features to Implement:

1. **Token Storage:**
   - Store in localStorage (persists across tabs) or sessionStorage (more secure)
   - Clear on logout
   - Clear on 401 error

2. **Automatic Token Injection:**
   - Interceptor/middleware to add Authorization header
   - Only add if token exists

3. **Error Handling:**
   - Network errors
   - 401 Unauthorized (token expired/invalid)
   - 400 Bad Request (validation errors)
   - 500 Server errors
   - Display user-friendly messages

4. **Form Validation:**
   - Email format validation
   - Password strength (if needed)
   - Required field validation
   - Show validation errors

5. **Loading States:**
   - Show loading indicator during API calls
   - Disable form submission while processing

6. **Success Handling:**
   - Redirect after successful login
   - Redirect after successful registration
   - Show success messages

---

## Testing Checklist:

- [ ] Registration works with valid data
- [ ] Registration shows error for duplicate email
- [ ] Login works with correct credentials
- [ ] Login shows error for wrong credentials
- [ ] Token is stored after login
- [ ] Token is included in protected requests
- [ ] 401 errors clear token and redirect to login
- [ ] Logout clears token and redirects
- [ ] Protected routes redirect if not authenticated
- [ ] API URL can be changed via environment variables
- [ ] Works in development and production environments

---

Copy the prompt above and send it when you're ready to integrate your frontend!
