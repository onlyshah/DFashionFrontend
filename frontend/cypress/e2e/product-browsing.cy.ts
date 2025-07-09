describe('Product Browsing', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Test Product 1',
      price: 99.99,
      images: [{ url: 'test1.jpg', alt: 'Test 1' }],
      category: 'clothing',
      brand: 'Test Brand',
      rating: 4.5
    },
    {
      _id: '2',
      name: 'Test Product 2',
      price: 149.99,
      images: [{ url: 'test2.jpg', alt: 'Test 2' }],
      category: 'electronics',
      brand: 'Another Brand',
      rating: 4.0
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '**/api/products**', {
      statusCode: 200,
      body: { success: true, products: mockProducts, total: 2 }
    }).as('getProducts');

    cy.visit('/products');
    cy.waitForAngular();
  });

  describe('Product Listing', () => {
    it('should display product grid', () => {
      cy.wait('@getProducts');
      cy.get('[data-testid="product-grid"]').should('be.visible');
      cy.get('[data-testid="product-card"]').should('have.length', 2);
    });

    it('should display product information correctly', () => {
      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="product-name"]').should('contain', 'Test Product 1');
        cy.get('[data-testid="product-price"]').should('contain', '$99.99');
        cy.get('[data-testid="product-image"]').should('be.visible');
        cy.get('[data-testid="product-rating"]').should('be.visible');
      });
    });

    it('should navigate to product details on click', () => {
      cy.intercept('GET', '**/api/products/1', {
        statusCode: 200,
        body: { success: true, product: mockProducts[0] }
      }).as('getProduct');

      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').first().click();
      
      cy.url().should('include', '/products/1');
      cy.wait('@getProduct');
    });
  });

  describe('Product Filtering', () => {
    it('should filter by category', () => {
      cy.intercept('GET', '**/api/products?category=clothing**', {
        statusCode: 200,
        body: { success: true, products: [mockProducts[0]], total: 1 }
      }).as('getFilteredProducts');

      cy.get('[data-testid="category-filter"]').select('clothing');
      cy.wait('@getFilteredProducts');
      cy.get('[data-testid="product-card"]').should('have.length', 1);
    });

    it('should filter by price range', () => {
      cy.intercept('GET', '**/api/products?minPrice=100&maxPrice=200**', {
        statusCode: 200,
        body: { success: true, products: [mockProducts[1]], total: 1 }
      }).as('getPriceFilteredProducts');

      cy.get('[data-testid="min-price-input"]').type('100');
      cy.get('[data-testid="max-price-input"]').type('200');
      cy.get('[data-testid="apply-filters-button"]').click();
      
      cy.wait('@getPriceFilteredProducts');
      cy.get('[data-testid="product-card"]').should('have.length', 1);
    });

    it('should filter by brand', () => {
      cy.intercept('GET', '**/api/products?brand=Test%20Brand**', {
        statusCode: 200,
        body: { success: true, products: [mockProducts[0]], total: 1 }
      }).as('getBrandFilteredProducts');

      cy.get('[data-testid="brand-filter"]').within(() => {
        cy.get('[data-testid="brand-test-brand"]').check();
      });
      
      cy.wait('@getBrandFilteredProducts');
      cy.get('[data-testid="product-card"]').should('have.length', 1);
    });

    it('should clear all filters', () => {
      cy.get('[data-testid="category-filter"]').select('clothing');
      cy.get('[data-testid="clear-filters-button"]').click();
      
      cy.wait('@getProducts');
      cy.get('[data-testid="product-card"]').should('have.length', 2);
    });
  });

  describe('Product Sorting', () => {
    it('should sort by price low to high', () => {
      cy.intercept('GET', '**/api/products?sortBy=price&sortOrder=asc**', {
        statusCode: 200,
        body: { success: true, products: [mockProducts[0], mockProducts[1]], total: 2 }
      }).as('getSortedProducts');

      cy.get('[data-testid="sort-select"]').select('price-asc');
      cy.wait('@getSortedProducts');
    });

    it('should sort by price high to low', () => {
      cy.intercept('GET', '**/api/products?sortBy=price&sortOrder=desc**', {
        statusCode: 200,
        body: { success: true, products: [mockProducts[1], mockProducts[0]], total: 2 }
      }).as('getSortedProducts');

      cy.get('[data-testid="sort-select"]').select('price-desc');
      cy.wait('@getSortedProducts');
    });

    it('should sort by rating', () => {
      cy.intercept('GET', '**/api/products?sortBy=rating&sortOrder=desc**', {
        statusCode: 200,
        body: { success: true, products: mockProducts, total: 2 }
      }).as('getSortedProducts');

      cy.get('[data-testid="sort-select"]').select('rating-desc');
      cy.wait('@getSortedProducts');
    });
  });

  describe('Search Functionality', () => {
    it('should search products by name', () => {
      cy.intercept('GET', '**/api/products/search?q=Test%20Product**', {
        statusCode: 200,
        body: { success: true, products: mockProducts, total: 2 }
      }).as('searchProducts');

      cy.get('[data-testid="search-input"]').type('Test Product');
      cy.get('[data-testid="search-button"]').click();
      
      cy.wait('@searchProducts');
      cy.get('[data-testid="product-card"]').should('have.length', 2);
    });

    it('should show no results message when search returns empty', () => {
      cy.intercept('GET', '**/api/products/search?q=nonexistent**', {
        statusCode: 200,
        body: { success: true, products: [], total: 0 }
      }).as('searchNoResults');

      cy.get('[data-testid="search-input"]').type('nonexistent');
      cy.get('[data-testid="search-button"]').click();
      
      cy.wait('@searchNoResults');
      cy.get('[data-testid="no-results-message"]').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', () => {
      cy.intercept('GET', '**/api/products?page=2**', {
        statusCode: 200,
        body: { success: true, products: mockProducts, total: 20 }
      }).as('getNextPage');

      cy.get('[data-testid="next-page-button"]').click();
      cy.wait('@getNextPage');
      cy.url().should('include', 'page=2');
    });

    it('should navigate to specific page', () => {
      cy.intercept('GET', '**/api/products?page=3**', {
        statusCode: 200,
        body: { success: true, products: mockProducts, total: 20 }
      }).as('getSpecificPage');

      cy.get('[data-testid="page-3-button"]').click();
      cy.wait('@getSpecificPage');
      cy.url().should('include', 'page=3');
    });
  });
});
