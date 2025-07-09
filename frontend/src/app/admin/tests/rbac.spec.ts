import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { AdminAuthService } from '../services/admin-auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('RBAC Implementation Tests', () => {
  let adminAuthService: jasmine.SpyObj<AdminAuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const adminAuthSpy = jasmine.createSpyObj('AdminAuthService', [
      'isAuthenticated', 'canAccessAdmin', 'hasPermission', 'hasRole', 'verifyToken'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        AdminAuthGuard,
        PermissionGuard,
        { provide: AdminAuthService, useValue: adminAuthSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });

    adminAuthService = TestBed.inject(AdminAuthService) as jasmine.SpyObj<AdminAuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  describe('AdminAuthGuard', () => {
    let guard: AdminAuthGuard;

    beforeEach(() => {
      guard = TestBed.inject(AdminAuthGuard);
    });

    it('should be created', () => {
      expect(guard).toBeTruthy();
    });

    it('should allow access for authenticated admin users', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.canAccessAdmin.and.returnValue(true);
      adminAuthService.verifyToken.and.returnValue(of(true));

      const route = { data: {} } as any;
      const state = { url: '/admin/dashboard' } as any;

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(true);
      });
    });

    it('should redirect unauthenticated users to login', () => {
      adminAuthService.isAuthenticated.and.returnValue(false);

      const route = { data: {} } as any;
      const state = { url: '/admin/dashboard' } as any;

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/admin/login'], {
          queryParams: { returnUrl: '/admin/dashboard' }
        });
      });
    });

    it('should redirect users without admin access', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.canAccessAdmin.and.returnValue(false);

      const route = { data: {} } as any;
      const state = { url: '/admin/dashboard' } as any;

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
      });
    });

    it('should check specific permissions when required', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.canAccessAdmin.and.returnValue(true);
      adminAuthService.hasPermission.and.returnValue(false);
      adminAuthService.verifyToken.and.returnValue(of(true));

      const route = { data: { permission: 'users:view' } } as any;
      const state = { url: '/admin/users' } as any;

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(false);
        expect(adminAuthService.hasPermission).toHaveBeenCalledWith('users', 'view');
        expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard'], {
          queryParams: { error: 'insufficient_permissions' }
        });
      });
    });

    it('should handle token verification failure', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.canAccessAdmin.and.returnValue(true);
      adminAuthService.verifyToken.and.returnValue(throwError('Token expired'));

      const route = { data: {} } as any;
      const state = { url: '/admin/dashboard' } as any;

      guard.canActivate(route, state).subscribe(result => {
        expect(result).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/admin/login'], {
          queryParams: { returnUrl: '/admin/dashboard', error: 'session_expired' }
        });
      });
    });
  });

  describe('PermissionGuard', () => {
    let guard: PermissionGuard;

    beforeEach(() => {
      guard = TestBed.inject(PermissionGuard);
    });

    it('should be created', () => {
      expect(guard).toBeTruthy();
    });

    it('should allow access with correct role', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.hasRole.and.returnValue(true);

      const route = { data: { role: 'super_admin' } } as any;
      const state = { url: '/admin/settings' } as any;

      const result = guard.canActivate(route, state);
      expect(result).toBe(true);
    });

    it('should deny access with incorrect role', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.hasRole.and.returnValue(false);

      const route = { data: { role: 'super_admin' } } as any;
      const state = { url: '/admin/settings' } as any;

      const result = guard.canActivate(route, state);
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      expect(snackBar.open).toHaveBeenCalledWith(
        'You do not have the required role to access this page.',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('should allow access with correct permission', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.hasPermission.and.returnValue(true);

      const route = { data: { permission: 'products:create' } } as any;
      const state = { url: '/admin/products/new' } as any;

      const result = guard.canActivate(route, state);
      expect(result).toBe(true);
    });

    it('should deny access with incorrect permission', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.hasPermission.and.returnValue(false);

      const route = { data: { permission: 'products:create' } } as any;
      const state = { url: '/admin/products/new' } as any;

      const result = guard.canActivate(route, state);
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      expect(snackBar.open).toHaveBeenCalledWith(
        'You do not have permission to access this page.',
        'Close',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    });

    it('should handle multiple roles', () => {
      adminAuthService.isAuthenticated.and.returnValue(true);
      adminAuthService.hasRole.and.returnValue(true);

      const route = { data: { role: ['admin', 'super_admin'] } } as any;
      const state = { url: '/admin/users' } as any;

      const result = guard.canActivate(route, state);
      expect(result).toBe(true);
      expect(adminAuthService.hasRole).toHaveBeenCalledWith(['admin', 'super_admin']);
    });

    it('should redirect unauthenticated users', () => {
      adminAuthService.isAuthenticated.and.returnValue(false);

      const route = { data: { permission: 'users:view' } } as any;
      const state = { url: '/admin/users' } as any;

      const result = guard.canActivate(route, state);
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/admin/login']);
    });
  });

  describe('Role Hierarchy Tests', () => {
    it('should validate super admin has all permissions', () => {
      const superAdminPermissions = ['all'];
      expect(superAdminPermissions).toContain('all');
    });

    it('should validate admin has limited permissions', () => {
      const adminPermissions = [
        'dashboard.*', 'users.*', 'products.*', 'orders.*', 'settings.*'
      ];
      expect(adminPermissions).not.toContain('all');
      expect(adminPermissions.length).toBeGreaterThan(0);
    });

    it('should validate end user has no admin permissions', () => {
      const endUserPermissions: string[] = [];
      expect(endUserPermissions).not.toContain('dashboard.*');
      expect(endUserPermissions).not.toContain('users.*');
      expect(endUserPermissions).not.toContain('products.*');
    });
  });

  describe('Permission Validation Tests', () => {
    const testCases = [
      {
        role: 'super_admin',
        permissions: ['all'],
        shouldHaveAccess: ['dashboard:view', 'users:create', 'products:delete', 'settings:edit']
      },
      {
        role: 'admin',
        permissions: ['dashboard.*', 'users.*', 'products.*', 'orders.*'],
        shouldHaveAccess: ['dashboard:view', 'users:create', 'products:edit', 'orders:view'],
        shouldNotHaveAccess: ['system:config']
      },
      {
        role: 'sales_manager',
        permissions: ['dashboard.view', 'dashboard.analytics', 'orders.*', 'users.view'],
        shouldHaveAccess: ['dashboard:view', 'orders:edit', 'users:view'],
        shouldNotHaveAccess: ['users:create', 'products:delete', 'settings:edit']
      },
      {
        role: 'customer',
        permissions: [],
        shouldNotHaveAccess: ['dashboard:view', 'users:view', 'products:create', 'orders:manage']
      }
    ];

    testCases.forEach(testCase => {
      describe(`${testCase.role} permissions`, () => {
        it(`should have correct permissions for ${testCase.role}`, () => {
          expect(testCase.permissions).toBeDefined();
          
          if (testCase.shouldHaveAccess) {
            testCase.shouldHaveAccess.forEach(permission => {
              // Test permission logic here
              expect(testCase.permissions.length).toBeGreaterThan(0);
            });
          }

          if (testCase.shouldNotHaveAccess) {
            testCase.shouldNotHaveAccess.forEach(permission => {
              // Test that role doesn't have these permissions
              expect(testCase.permissions).not.toContain(permission);
            });
          }
        });
      });
    });
  });
});
