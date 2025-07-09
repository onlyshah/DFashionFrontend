describe('Admin RBAC E2E Tests', () => {
  const users = {
    superAdmin: {
      email: 'superadmin@dfashion.com',
      password: 'SuperAdmin123!',
      role: 'super_admin'
    },
    admin: {
      email: 'admin@dfashion.com',
      password: 'Admin123!',
      role: 'admin'
    },
    customer: {
      email: 'customer@dfashion.com',
      password: 'Customer123!',
      role: 'customer'
    }
  };

  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Authentication & Access Control', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/admin/dashboard');
      cy.url().should('include', '/admin/login');
      cy.get('[data-testid="admin-login-form"]').should('be.visible');
    });

    it('should prevent customer access to admin panel', () => {
      // Try to login as customer
      cy.visit('/admin/login');
      cy.get('[data-testid="email-input"]').type(users.customer.email);
      cy.get('[data-testid="password-input"]').type(users.customer.password);
      cy.get('[data-testid="login-button"]').click();

      // Should show error or redirect to customer area
      cy.url().should('not.include', '/admin/dashboard');
      cy.get('[data-testid="error-message"]').should('contain', 'Access denied');
    });

    it('should allow admin login and redirect to dashboard', () => {
      cy.visit('/admin/login');
      cy.get('[data-testid="email-input"]').type(users.admin.email);
      cy.get('[data-testid="password-input"]').type(users.admin.password);
      cy.get('[data-testid="login-button"]').click();

      cy.url().should('include', '/admin/dashboard');
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome back');
    });

    it('should allow super admin login with full access', () => {
      cy.visit('/admin/login');
      cy.get('[data-testid="email-input"]').type(users.superAdmin.email);
      cy.get('[data-testid="password-input"]').type(users.superAdmin.password);
      cy.get('[data-testid="login-button"]').click();

      cy.url().should('include', '/admin/dashboard');
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      
      // Super admin should see all menu items
      cy.get('[data-testid="sidebar-menu"]').within(() => {
        cy.get('[data-testid="menu-dashboard"]').should('be.visible');
        cy.get('[data-testid="menu-users"]').should('be.visible');
        cy.get('[data-testid="menu-products"]').should('be.visible');
        cy.get('[data-testid="menu-orders"]').should('be.visible');
        cy.get('[data-testid="menu-analytics"]').should('be.visible');
        cy.get('[data-testid="menu-settings"]').should('be.visible');
      });
    });
  });

  describe('Super Admin Permissions', () => {
    beforeEach(() => {
      cy.loginAsAdmin(users.superAdmin.email, users.superAdmin.password);
    });

    it('should access user management with full permissions', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-management"]').should('be.visible');
      
      // Should see all action buttons
      cy.get('[data-testid="add-user-button"]').should('be.visible');
      cy.get('[data-testid="export-users-button"]').should('be.visible');
      
      // Should see edit/delete actions for users
      cy.get('[data-testid="user-table"]').within(() => {
        cy.get('[data-testid="edit-user-button"]').should('exist');
        cy.get('[data-testid="delete-user-button"]').should('exist');
        cy.get('[data-testid="toggle-user-status-button"]').should('exist');
      });
    });

    it('should access system settings', () => {
      cy.visit('/admin/settings');
      cy.get('[data-testid="settings-page"]').should('be.visible');
      
      // Should see all settings sections
      cy.get('[data-testid="general-settings"]').should('be.visible');
      cy.get('[data-testid="security-settings"]').should('be.visible');
      cy.get('[data-testid="email-settings"]').should('be.visible');
      cy.get('[data-testid="payment-settings"]').should('be.visible');
    });

    it('should manage roles and permissions', () => {
      cy.visit('/admin/users/roles');
      cy.get('[data-testid="roles-management"]').should('be.visible');
      
      // Should be able to create/edit roles
      cy.get('[data-testid="create-role-button"]').should('be.visible');
      cy.get('[data-testid="edit-role-button"]').should('exist');
      cy.get('[data-testid="delete-role-button"]').should('exist');
    });

    it('should access all analytics and reports', () => {
      cy.visit('/admin/analytics');
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      
      // Should see all analytics sections
      cy.get('[data-testid="sales-analytics"]').should('be.visible');
      cy.get('[data-testid="user-analytics"]').should('be.visible');
      cy.get('[data-testid="product-analytics"]').should('be.visible');
      cy.get('[data-testid="financial-reports"]').should('be.visible');
    });
  });

  describe('Admin Permissions (Limited)', () => {
    beforeEach(() => {
      cy.loginAsAdmin(users.admin.email, users.admin.password);
    });

    it('should access dashboard with limited features', () => {
      cy.visit('/admin/dashboard');
      cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      
      // Should see basic dashboard elements
      cy.get('[data-testid="stats-cards"]').should('be.visible');
      cy.get('[data-testid="recent-orders"]').should('be.visible');
      
      // Should not see super admin specific features
      cy.get('[data-testid="system-health"]').should('not.exist');
      cy.get('[data-testid="admin-activity-log"]').should('not.exist');
    });

    it('should access user management with limited permissions', () => {
      cy.visit('/admin/users');
      cy.get('[data-testid="user-management"]').should('be.visible');
      
      // Should see view and basic edit permissions
      cy.get('[data-testid="user-table"]').should('be.visible');
      cy.get('[data-testid="edit-user-button"]').should('exist');
      
      // Should not see delete buttons for admin users
      cy.get('[data-testid="user-table"]').within(() => {
        cy.get('[data-cy="user-row"]').each(($row) => {
          cy.wrap($row).within(() => {
            cy.get('[data-testid="user-role"]').then(($role) => {
              if ($role.text().includes('admin') || $role.text().includes('super_admin')) {
                cy.get('[data-testid="delete-user-button"]').should('not.exist');
              }
            });
          });
        });
      });
    });

    it('should NOT access system settings', () => {
      cy.visit('/admin/settings');
      
      // Should be redirected or show access denied
      cy.url().should('not.include', '/admin/settings');
      cy.get('[data-testid="access-denied"]').should('be.visible')
        .or(() => {
          cy.url().should('include', '/admin/dashboard');
        });
    });

    it('should NOT access roles management', () => {
      cy.visit('/admin/users/roles');
      
      // Should be redirected or show access denied
      cy.url().should('not.include', '/admin/users/roles');
      cy.get('[data-testid="access-denied"]').should('be.visible')
        .or(() => {
          cy.url().should('include', '/admin/dashboard');
        });
    });

    it('should access products with full permissions', () => {
      cy.visit('/admin/products');
      cy.get('[data-testid="product-management"]').should('be.visible');
      
      // Should have full product management access
      cy.get('[data-testid="add-product-button"]').should('be.visible');
      cy.get('[data-testid="edit-product-button"]').should('exist');
      cy.get('[data-testid="delete-product-button"]').should('exist');
    });

    it('should access orders with full permissions', () => {
      cy.visit('/admin/orders');
      cy.get('[data-testid="order-management"]').should('be.visible');
      
      // Should have full order management access
      cy.get('[data-testid="order-table"]').should('be.visible');
      cy.get('[data-testid="update-order-status"]').should('exist');
      cy.get('[data-testid="view-order-details"]').should('exist');
    });
  });

  describe('UI Role-Based Visibility', () => {
    it('should show different sidebar menus based on role', () => {
      // Test Super Admin sidebar
      cy.loginAsAdmin(users.superAdmin.email, users.superAdmin.password);
      cy.visit('/admin/dashboard');
      
      cy.get('[data-testid="sidebar-menu"]').within(() => {
        cy.get('[data-testid="menu-settings"]').should('be.visible');
        cy.get('[data-testid="menu-users"]').should('be.visible');
        cy.get('[data-testid="menu-analytics"]').should('be.visible');
      });

      // Logout and test Admin sidebar
      cy.get('[data-testid="logout-button"]').click();
      cy.loginAsAdmin(users.admin.email, users.admin.password);
      cy.visit('/admin/dashboard');
      
      cy.get('[data-testid="sidebar-menu"]').within(() => {
        cy.get('[data-testid="menu-settings"]').should('not.exist');
        cy.get('[data-testid="menu-users"]').should('be.visible');
        cy.get('[data-testid="menu-products"]').should('be.visible');
        cy.get('[data-testid="menu-orders"]').should('be.visible');
      });
    });

    it('should show/hide action buttons based on permissions', () => {
      cy.loginAsAdmin(users.admin.email, users.admin.password);
      cy.visit('/admin/users');
      
      // Check that certain actions are hidden for admin role
      cy.get('[data-testid="user-table"]').within(() => {
        // Should not see "Manage Roles" button
        cy.get('[data-testid="manage-roles-button"]').should('not.exist');
        
        // Should not see "System Settings" link
        cy.get('[data-testid="system-settings-link"]').should('not.exist');
      });
    });
  });

  describe('Session Management & Security', () => {
    it('should handle session timeout', () => {
      cy.loginAsAdmin(users.admin.email, users.admin.password);
      cy.visit('/admin/dashboard');
      
      // Mock session expiration
      cy.window().then((win) => {
        win.localStorage.removeItem('adminToken');
      });
      
      // Try to navigate to another admin page
      cy.visit('/admin/users');
      
      // Should be redirected to login
      cy.url().should('include', '/admin/login');
      cy.get('[data-testid="session-expired-message"]').should('be.visible');
    });

    it('should prevent concurrent admin sessions', () => {
      // This would require backend implementation
      cy.loginAsAdmin(users.admin.email, users.admin.password);
      cy.visit('/admin/dashboard');
      
      // Simulate another login from different browser/tab
      cy.request({
        method: 'POST',
        url: '/api/admin/auth/login',
        body: {
          email: users.admin.email,
          password: users.admin.password
        }
      });
      
      // Original session should be invalidated
      cy.reload();
      cy.url().should('include', '/admin/login');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle invalid tokens gracefully', () => {
      // Set invalid token
      cy.window().then((win) => {
        win.localStorage.setItem('adminToken', 'invalid-token');
      });
      
      cy.visit('/admin/dashboard');
      cy.url().should('include', '/admin/login');
      cy.get('[data-testid="invalid-session-message"]').should('be.visible');
    });

    it('should handle network errors during permission checks', () => {
      cy.loginAsAdmin(users.admin.email, users.admin.password);
      
      // Intercept and fail permission check
      cy.intercept('GET', '/api/admin/permissions', { forceNetworkError: true });
      
      cy.visit('/admin/users');
      cy.get('[data-testid="permission-error"]').should('be.visible');
    });

    it('should handle role changes during active session', () => {
      cy.loginAsAdmin(users.admin.email, users.admin.password);
      cy.visit('/admin/dashboard');
      
      // Simulate role change from backend
      cy.intercept('GET', '/api/admin/profile', {
        statusCode: 200,
        body: { user: { ...users.admin, role: 'customer' } }
      });
      
      // Try to access admin page
      cy.visit('/admin/users');
      cy.url().should('include', '/admin/login');
      cy.get('[data-testid="role-changed-message"]').should('be.visible');
    });
  });
});
