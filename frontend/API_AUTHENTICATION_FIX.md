# 🔧 API Authentication & Authorization Fix

## 🚨 **ISSUES IDENTIFIED:**

Based on your error logs, you're experiencing:
- **401 (Unauthorized)** - Authentication token issues
- **403 (Forbidden)** - Role-based access control issues
- **Failing endpoints**: `cart-new`, `total-count`, `dashboard`

---

## 🔍 **ROOT CAUSE ANALYSIS:**

### **Issue 1: Role-Based Access Control**
The backend requires specific roles for different endpoints:

```javascript
// cart-new endpoints require 'customer' role
router.get('/total-count', auth, requireRole(['customer']), ...)

// admin dashboard requires 'super_admin' role
router.get('/dashboard', auth, isAdmin, ...)
```

### **Issue 2: Token Authentication**
- Frontend may not be sending proper Authorization headers
- Token might be expired or invalid
- User role might not match endpoint requirements

### **Issue 3: User Role Mismatch**
- User might be logged in with wrong role for the endpoint
- Admin trying to access customer endpoints or vice versa

---

## 🛠️ **IMMEDIATE FIXES:**

### **Fix 1: Check Current User Authentication**

Open browser console and run:
```javascript
// Check if user is logged in
console.log('Auth Token:', localStorage.getItem('token'));
console.log('Admin Token:', localStorage.getItem('admin_token'));
console.log('Current User:', JSON.parse(localStorage.getItem('user') || 'null'));
console.log('Admin User:', JSON.parse(localStorage.getItem('admin_user') || 'null'));
```

### **Fix 2: Verify API Endpoints**

Test these endpoints manually:
```bash
# Test authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/verify

# Test cart access (requires customer role)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/cart-new/total-count

# Test admin dashboard (requires super_admin role)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/dashboard
```

### **Fix 3: Role-Based Login**

Ensure you're logged in with the correct role:

**For Customer Features (cart, wishlist):**
- Login with role: `customer`
- Use regular login: `/auth/login`

**For Admin Features (dashboard, management):**
- Login with role: `super_admin`, `admin`, `sales`, etc.
- Use admin login: `/admin/login`

---

## 🔧 **TECHNICAL SOLUTIONS:**

### **Solution 1: Update Auth Interceptor**

The auth interceptor needs to handle both regular and admin tokens:

```typescript
// In auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const adminAuthService = inject(AdminAuthService);
  
  let token = null;
  
  // Check if this is an admin route
  if (req.url.includes('/admin/')) {
    token = adminAuthService.getToken();
  } else {
    token = authService.getToken();
  }

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};
```

### **Solution 2: Fix Role Requirements**

Update backend middleware to be more flexible:

```javascript
// In auth.js middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Add super_admin as universal access
    if (!allowedRoles.includes('super_admin')) {
      allowedRoles.push('super_admin');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
};
```

### **Solution 3: Add Error Handling**

Update API services to handle auth errors:

```typescript
// In api services
private handleError(error: any): Observable<never> {
  console.error('API Error:', error);
  
  if (error.status === 401) {
    // Token expired or invalid
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  } else if (error.status === 403) {
    // Insufficient permissions
    console.error('Access denied:', error.error.message);
    // Show user-friendly error message
  }
  
  return throwError(error);
}
```

---

## 🎯 **STEP-BY-STEP DEBUGGING:**

### **Step 1: Check Authentication Status**

```typescript
// Add to your component
ngOnInit() {
  console.log('=== AUTH DEBUG ===');
  console.log('Is Authenticated:', this.authService.isAuthenticated());
  console.log('Current User:', this.authService.getCurrentUser());
  console.log('User Role:', this.authService.getCurrentUser()?.role);
  console.log('Token:', this.authService.getToken());
  console.log('==================');
}
```

### **Step 2: Test API Endpoints**

```typescript
// Test specific endpoints
testEndpoints() {
  // Test cart endpoint
  this.http.get('http://localhost:3001/api/cart-new/total-count')
    .subscribe({
      next: (data) => console.log('Cart success:', data),
      error: (error) => console.error('Cart error:', error)
    });
    
  // Test dashboard endpoint
  this.http.get('http://localhost:3001/api/admin/dashboard')
    .subscribe({
      next: (data) => console.log('Dashboard success:', data),
      error: (error) => console.error('Dashboard error:', error)
    });
}
```

### **Step 3: Verify User Roles**

Check if your test users have correct roles:

```sql
-- In MongoDB
db.users.find({}, {username: 1, email: 1, role: 1})

-- Should show users with roles like:
-- { username: "customer1", role: "customer" }
-- { username: "admin1", role: "super_admin" }
```

---

## 🚀 **QUICK FIXES TO TRY:**

### **1. Clear and Re-login**
```javascript
// Clear all auth data
localStorage.clear();
sessionStorage.clear();

// Then login again with appropriate role
```

### **2. Check Backend Logs**
Look for these messages in backend console:
```
🔐 Auth middleware - User authenticated: user@email.com Role: customer
🔐 Role check - User role: customer Required roles: ['customer']
🔐 Role check - Access granted
```

### **3. Verify CORS Settings**
Ensure your frontend origin is allowed:
```javascript
// In basicSecurity.js
const allowedOrigins = [
  'http://localhost:4200',  // Your Angular app
  'http://127.0.0.1:4200'
];
```

### **4. Test with Postman**
Use Postman to test endpoints with proper headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

---

## 📋 **CHECKLIST:**

- [ ] User is logged in with correct role
- [ ] Token is being sent in Authorization header
- [ ] Backend is receiving and validating token
- [ ] User role matches endpoint requirements
- [ ] CORS is properly configured
- [ ] No token expiration issues

---

## 🎯 **EXPECTED BEHAVIOR:**

**For Customer Endpoints:**
- User must have role: `customer` or `super_admin`
- Endpoints: `/api/cart-new/*`, `/api/wishlist/*`

**For Admin Endpoints:**
- User must have role: `super_admin`, `admin`, `sales`, etc.
- Endpoints: `/api/admin/*`

**For Public Endpoints:**
- No authentication required
- Endpoints: `/api/products`, `/api/stories` (some)

---

**🔧 Try these fixes and let me know which specific error messages you're still seeing!**
