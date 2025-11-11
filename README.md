# Frontend Security Implementation Guide

## 🔐 Current Backend Security (Already Implemented)
- ✅ XSS Protection with `sanitizeInputWithXSS`
- ✅ NoSQL Injection Prevention
- ✅ Zod Schema Validation
- ✅ Authentication & Authorization

---

## 🛡️ Essential Frontend Security Measures

### 1. **Content Security Policy (CSP)**
**Why:** Prevents XSS attacks by controlling which resources can be loaded

```typescript
// In your index.html or Next.js config
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://your-api.com;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
      ">
```

**For React/Vite:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';"
    }
  }
});
```

---

### 2. **Input Validation & Sanitization (Client-Side)**
**Why:** First line of defense before data reaches backend

```typescript
// utils/validation.ts
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
};

/**
 * Validate and sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 1000); // Limit length
};

/**
 * Validate file upload
 */
export const validateFile = (file: File) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  return true;
};
```

**Install DOMPurify:**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

---

### 3. **Secure Token Management**
**Why:** Prevent token theft and unauthorized access

```typescript
// utils/auth.ts
import Cookies from 'js-cookie';

/**
 * Store token securely in httpOnly cookie (preferred)
 * Or use secure localStorage with encryption
 */
export const tokenManager = {
  // Option 1: Cookies (recommended)
  setToken: (token: string) => {
    Cookies.set('auth_token', token, {
      expires: 7, // 7 days
      secure: true, // HTTPS only
      sameSite: 'strict',
      path: '/'
    });
  },

  getToken: (): string | undefined => {
    return Cookies.get('auth_token');
  },

  removeToken: () => {
    Cookies.remove('auth_token');
  },

  // Option 2: Encrypted localStorage (if cookies not possible)
  setTokenEncrypted: (token: string) => {
    const encrypted = btoa(token); // Use proper encryption in production
    localStorage.setItem('_at', encrypted);
  },

  getTokenEncrypted: (): string | null => {
    const encrypted = localStorage.getItem('_at');
    return encrypted ? atob(encrypted) : null;
  }
};
```

**Install js-cookie:**
```bash
npm install js-cookie
npm install --save-dev @types/js-cookie
```

---

### 4. **HTTP Security Headers (via API Interceptor)**
**Why:** Add security headers to all requests

```typescript
// httpClient.ts
import axios from 'axios';
import { tokenManager } from './utils/auth';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  withCredentials: true // Send cookies with requests
});

// Request interceptor - Add auth token
httpClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
```

---

### 5. **Rate Limiting (Client-Side)**
**Why:** Prevent abuse and brute force attacks

```typescript
// utils/rateLimiter.ts
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Usage in login form
const handleLogin = async (email: string, password: string) => {
  if (!rateLimiter.canAttempt('login', 5, 60000)) { // 5 attempts per minute
    toast.error('Too many login attempts. Please try again later.');
    return;
  }

  try {
    await loginUser(email, password);
    rateLimiter.reset('login');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

### 6. **Secure File Upload**
**Why:** Prevent malicious file uploads

```typescript
// utils/fileUpload.ts
export const secureFileUpload = {
  /**
   * Validate file before upload
   */
  validateFile: (file: File) => {
    // Check file extension
    const allowedExtensions = ['pdf', 'docx', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error(`Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`);
    }

    // Check MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }

    // Check file size (5GB max)
    const maxSize = 5 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5GB limit');
    }

    // Check for double extensions (e.g., file.pdf.exe)
    const nameParts = file.name.split('.');
    if (nameParts.length > 2) {
      throw new Error('Invalid file name format');
    }

    return true;
  },

  /**
   * Sanitize filename
   */
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
      .replace(/\.+/g, '.') // Remove multiple dots
      .slice(0, 255); // Limit length
  }
};
```

---

### 7. **Environment Variable Protection**
**Why:** Keep sensitive data out of bundle

```typescript
// .env.example
VITE_API_URL=https://api.example.com
VITE_APP_NAME=MyApp
# Never commit actual .env file!

// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Usage
const apiUrl = import.meta.env.VITE_API_URL;

// .gitignore
.env
.env.local
.env.production
```

---

### 8. **Prevent Sensitive Data Exposure**
**Why:** Don't log or expose sensitive information

```typescript
// utils/logger.ts
export const logger = {
  error: (message: string, error?: any) => {
    // Don't log tokens, passwords, or sensitive data
    const sanitizedError = error ? {
      message: error.message,
      status: error.status,
      // Remove sensitive fields
    } : undefined;
    
    console.error(message, sanitizedError);
    
    // Send to monitoring service (not actual error object)
    if (import.meta.env.PROD) {
      // sendToMonitoring(message);
    }
  },

  info: (message: string) => {
    if (import.meta.env.DEV) {
      console.log(message);
    }
  }
};

// Never do this:
// console.log('User token:', token); ❌
// console.log('Password:', password); ❌
```

---

### 9. **Protected Routes & Authorization**
**Why:** Ensure only authenticated users access protected pages

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage in routes
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredRole={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

---

### 10. **CSRF Protection**
**Why:** Prevent Cross-Site Request Forgery attacks

```typescript
// Add CSRF token to requests (if backend supports it)
httpClient.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

---

### 11. **Dependency Security**
**Why:** Prevent vulnerabilities from third-party packages

```bash
# Regular security audits
npm audit
npm audit fix

# Use tools
npm install -g snyk
snyk test
snyk monitor

# Keep dependencies updated
npm outdated
npm update

# Check for known vulnerabilities
npx depcheck
```

---

### 12. **Secure Form Handling**
**Why:** Prevent form-based attacks

```typescript
// components/SecureForm.tsx
import { useState } from 'react';
import { sanitizeInput } from '../utils/validation';

export const SecureForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input on change
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Additional validation before submit
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('All fields are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      await submitForm(formData);
    } catch (error) {
      logger.error('Form submission failed', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        maxLength={255}
        required
        autoComplete="off"
      />
      {/* Add more fields */}
    </form>
  );
};
```

---

## 📦 Required NPM Packages

```bash
# Security packages
npm install dompurify js-cookie helmet

# TypeScript types
npm install --save-dev @types/dompurify @types/js-cookie
```

---

## 🎯 Security Checklist

- [ ] Implement Content Security Policy (CSP)
- [ ] Client-side input validation & sanitization
<!-- - [ ] Secure token storage (httpOnly cookies) -->
- [ ] Add security headers to HTTP client
- [ ] Implement rate limiting
- [ ] Validate file uploads
<!-- - [ ] Protect environment variables -->
- [ ] Remove sensitive data from logs
<!-- - [ ] Protected routes with authentication -->
<!-- - [ ] CSRF protection -->
- [ ] Regular dependency audits
- [ ] Secure form handling
<!-- - [ ] HTTPS only in production -->
- [ ] Disable browser autocomplete for sensitive fields
<!-- - [ ] Implement timeout for inactive sessions -->

---

## 🚀 Production Deployment Checklist

1. **Build optimizations:**
   ```bash
   npm run build
   ```

2. **Security headers in production server:**
   ```nginx
   # nginx.conf
   add_header X-Frame-Options "DENY";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

3. **Enable HTTPS only**
4. **Set secure cookies**
5. **Minify and obfuscate code**
6. **Remove console.logs**
7. **Enable error monitoring** (Sentry, LogRocket)

---

## 🔍 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Guide](https://content-security-policy.com/)
- [npm Security Best Practices](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)