describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
    cy.waitForAngular();
  });

  describe('Login', () => {
    it('should display login form', () => {
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
    });

    it('should show error for invalid email format', () => {
      cy.get('[data-testid="email-input"]').type('invalid-email');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="email-error"]').should('contain', 'Please enter a valid email');
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          user: { id: '1', email: 'test@example.com', fullName: 'Test User' },
          token: 'mock-jwt-token'
        }
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/home');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: { error: { message: 'Invalid credentials' } }
      }).as('loginError');

      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginError');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    });
  });

  describe('Registration', () => {
    beforeEach(() => {
      cy.get('[data-testid="register-link"]').click();
      cy.url().should('include', '/auth/register');
    });

    it('should display registration form', () => {
      cy.get('[data-testid="register-form"]').should('be.visible');
      cy.get('[data-testid="fullname-input"]').should('be.visible');
      cy.get('[data-testid="username-input"]').should('be.visible');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="confirm-password-input"]').should('be.visible');
      cy.get('[data-testid="register-button"]').should('be.visible');
    });

    it('should validate password confirmation', () => {
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirm-password-input"]').type('password456');
      cy.get('[data-testid="register-button"]').click();
      cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match');
    });

    it('should register successfully with valid data', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          user: { id: '2', email: 'newuser@example.com', fullName: 'New User' },
          token: 'mock-jwt-token'
        }
      }).as('registerRequest');

      cy.get('[data-testid="fullname-input"]').type('New User');
      cy.get('[data-testid="username-input"]').type('newuser');
      cy.get('[data-testid="email-input"]').type('newuser@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="confirm-password-input"]').type('password123');
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@registerRequest');
      cy.url().should('include', '/home');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Mock login
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token');
        win.localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));
      });
      cy.visit('/home');
    });

    it('should logout successfully', () => {
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      cy.url().should('include', '/auth/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });
});
