import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { environment } from '../../../environments/environment';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 99.99,
    images: [{ url: 'test.jpg', alt: 'Test' }],
    category: 'clothing',
    brand: 'Test Brand'
  };

  const mockCartItem = {
    product: mockProduct,
    quantity: 2,
    selectedSize: 'M',
    selectedColor: 'Blue'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService]
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', () => {
      const mockResponse = { success: true, cart: [mockCartItem] };

      service.addToCart(mockProduct._id, 2, 'M', 'Blue').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.cart.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cart/add`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        productId: mockProduct._id,
        quantity: 2,
        selectedSize: 'M',
        selectedColor: 'Blue'
      });
      req.flush(mockResponse);
    });

    it('should handle add to cart error', () => {
      const mockError = { error: { message: 'Product not found' } };

      service.addToCart('invalid-id', 1).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error.message).toBe('Product not found');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cart/add`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', () => {
      const mockResponse = { success: true, cart: [] };

      service.removeFromCart(mockProduct._id).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.cart.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cart/remove/${mockProduct._id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity successfully', () => {
      const newQuantity = 3;
      const updatedCartItem = { ...mockCartItem, quantity: newQuantity };
      const mockResponse = { success: true, cart: [updatedCartItem] };

      service.updateQuantity(mockProduct._id, newQuantity).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.cart[0].quantity).toBe(newQuantity);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cart/update`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        productId: mockProduct._id,
        quantity: newQuantity
      });
      req.flush(mockResponse);
    });
  });

  describe('getCart', () => {
    it('should fetch cart items successfully', () => {
      const mockResponse = { success: true, cart: [mockCartItem] };

      service.getCart().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.cart.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cart`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', () => {
      const mockResponse = { success: true, cart: [] };

      service.clearCart().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.cart.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/cart/clear`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('cart calculations', () => {
    it('should calculate total price correctly', () => {
      const cartItems = [
        { ...mockCartItem, quantity: 2 }, // 99.99 * 2 = 199.98
        { ...mockCartItem, product: { ...mockProduct, price: 50.00 }, quantity: 1 } // 50.00 * 1 = 50.00
      ];

      const total = service.calculateTotal(cartItems);
      expect(total).toBe(249.98);
    });

    it('should calculate total items correctly', () => {
      const cartItems = [
        { ...mockCartItem, quantity: 2 },
        { ...mockCartItem, quantity: 3 }
      ];

      const totalItems = service.calculateTotalItems(cartItems);
      expect(totalItems).toBe(5);
    });
  });
});
