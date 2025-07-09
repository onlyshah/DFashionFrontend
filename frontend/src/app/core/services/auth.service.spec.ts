import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user successfully', () => {
      const mockCredentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        success: true,
        user: { id: '1', email: 'test@example.com', fullName: 'Test User' },
        token: 'mock-jwt-token'
      };

      service.login(mockCredentials).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const mockCredentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockError = { error: { message: 'Invalid credentials' } };

      service.login(mockCredentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error.message).toBe('Invalid credentials');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register user successfully', () => {
      const mockUserData = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
        username: 'newuser'
      };
      const mockResponse = {
        success: true,
        user: { id: '2', email: 'newuser@example.com', fullName: 'New User' },
        token: 'mock-jwt-token'
      };

      service.register(mockUserData).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.user.email).toBe('newuser@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should logout user and clear storage', () => {
      spyOn(localStorage, 'removeItem');
      
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('token management', () => {
    it('should store and retrieve token', () => {
      const mockToken = 'mock-jwt-token';
      
      service.setToken(mockToken);
      expect(service.getToken()).toBe(mockToken);
    });

    it('should check if user is authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
      
      service.setToken('mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });
});
