import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    images: [{ url: 'test.jpg', alt: 'Test' }],
    category: 'clothing',
    brand: 'Test Brand',
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Blue'],
    stock: 10,
    rating: 4.5,
    reviews: []
  };

  const mockProducts = [mockProduct];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', () => {
      const mockResponse = { success: true, products: mockProducts, total: 1 };

      service.getProducts().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.products.length).toBe(1);
        expect(response.products[0].name).toBe('Test Product');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch products with filters', () => {
      const filters = {
        category: 'clothing',
        minPrice: 50,
        maxPrice: 150,
        brand: 'Test Brand'
      };

      service.getProducts(filters).subscribe();

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/api/products` &&
        req.params.get('category') === 'clothing' &&
        req.params.get('minPrice') === '50' &&
        req.params.get('maxPrice') === '150' &&
        req.params.get('brand') === 'Test Brand'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, products: mockProducts, total: 1 });
    });

    it('should fetch products with pagination', () => {
      service.getProducts({}, 2, 10).subscribe();

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/api/products` &&
        req.params.get('page') === '2' &&
        req.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, products: mockProducts, total: 1 });
    });
  });

  describe('getProductById', () => {
    it('should fetch single product successfully', () => {
      const productId = '1';
      const mockResponse = { success: true, product: mockProduct };

      service.getProductById(productId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.product._id).toBe(productId);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/products/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle product not found error', () => {
      const productId = 'invalid-id';
      const mockError = { error: { message: 'Product not found' } };

      service.getProductById(productId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error.message).toBe('Product not found');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/products/${productId}`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', () => {
      const searchQuery = 'test product';
      const mockResponse = { success: true, products: mockProducts, total: 1 };

      service.searchProducts(searchQuery).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.products.length).toBe(1);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/api/products/search` &&
        req.params.get('q') === searchQuery
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should search with filters and sorting', () => {
      const searchQuery = 'test';
      const filters = { category: 'clothing' };
      const sortBy = 'price';
      const sortOrder = 'asc';

      service.searchProducts(searchQuery, filters, sortBy, sortOrder).subscribe();

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/api/products/search` &&
        req.params.get('q') === searchQuery &&
        req.params.get('category') === 'clothing' &&
        req.params.get('sortBy') === 'price' &&
        req.params.get('sortOrder') === 'asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, products: mockProducts, total: 1 });
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', () => {
      const mockCategories = ['clothing', 'electronics', 'books'];
      const mockResponse = { success: true, categories: mockCategories };

      service.getCategories().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.categories.length).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/products/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getBrands', () => {
    it('should fetch brands successfully', () => {
      const mockBrands = ['Brand A', 'Brand B', 'Brand C'];
      const mockResponse = { success: true, brands: mockBrands };

      service.getBrands().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.brands.length).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/products/brands`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
