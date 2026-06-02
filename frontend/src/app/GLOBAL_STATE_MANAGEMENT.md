# Global State Management Guide

## Overview

This guide explains how to use **WishlistService** and **CartService** consistently across all components to ensure:
- ✅ Real-time UI sync across the entire app
- ✅ No duplicate entries
- ✅ Proper error handling with error codes
- ✅ Consistent user feedback via notifications

---

## Architecture

### State Structure

Both services manage state using **RxJS BehaviorSubjects**:

```typescript
// WishlistService
wishlistItems$: Observable<WishlistItem[]>      // All wishlist items
wishlistCount$: Observable<number>               // Number of items in wishlist

// CartService
cartItems$: Observable<CartItem[]>               // All cart items
cartItemCount$: Observable<number>               // Number of distinct items
cartSummary$: Observable<CartSummary | null>    // Cart totals, discounts, tax
```

### Why BehaviorSubjects?

- Emit current value immediately when subscribed
- Allow multiple subscribers without duplicate API calls
- Enable reactive UI updates across all components
- Provide "Single Source of Truth" for state

---

## Usage Pattern

### 1. Import Services

```typescript
import { WishlistService } from '@core/services/wishlist.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';
```

### 2. Inject Into Constructor

```typescript
export class MyComponent {
  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}
}
```

### 3. Subscribe to State (In Component Class)

```typescript
export class ProductCardComponent implements OnInit, OnDestroy {
  wishlistItems$ = this.wishlistService.wishlistItems$;
  cartItems$ = this.cartService.cartItems$;
  wishlistCount$ = this.wishlistService.wishlistCount$;
  cartItemCount$ = this.cartService.cartItemCount$;
  
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Use in Template with async Pipe

```html
<!-- Show wishlist count -->
<span class="badge">{{ wishlistCount$ | async }}</span>

<!-- Show cart count -->
<span class="cart-badge">{{ cartItemCount$ | async }}</span>

<!-- Check if product is in cart -->
<button *ngIf="(cartItemCount$ | async) > 0">Edit Cart</button>
```

---

## API Methods

### Wishlist Operations

#### Add to Wishlist

**Without Duplicate Check** (Service checks automatically):
```typescript
this.wishlistService.addToWishlist(productId).subscribe({
  next: (response) => {
    // Auto-checks for duplicates, returns code: 'ALREADY_IN_WISHLIST'
    if (response.code === 'ALREADY_IN_WISHLIST') {
      this.notificationService.info('Already Saved', 'Item is already in your wishlist');
    } else {
      this.notificationService.success('Added!', 'Item saved to wishlist');
    }
  },
  error: (error) => {
    const msg = this.getErrorMessage(error?.code || 'UNKNOWN_ERROR');
    this.notificationService.error('Error', msg);
  }
});
```

#### Remove from Wishlist

```typescript
this.wishlistService.removeFromWishlist(productId).subscribe({
  next: () => {
    this.notificationService.success('Removed', 'Item removed from wishlist');
  },
  error: (error) => {
    this.notificationService.error('Error', error?.message || 'Failed to remove');
  }
});
```

#### Toggle Wishlist (Add or Remove)

**RECOMMENDED** - Handles both add and remove intelligently:
```typescript
this.wishlistService.toggleWishlist(productId).subscribe({
  next: (response) => {
    const isAdded = !this.wishlistService.isInWishlist(productId);
    const msg = isAdded ? 'Added to wishlist' : 'Removed from wishlist';
    this.notificationService.success('Success', msg);
  },
  error: (error) => {
    this.notificationService.error('Error', error?.message);
  }
});
```

---

### Cart Operations

#### Add to Cart

**Without Duplicate Check** (Service checks automatically):
```typescript
this.cartService.addToCart(productId, quantity).subscribe({
  next: (response) => {
    if (response.itemExists) {
      // Product already in cart
      const currentQty = response.currentQuantity || 1;
      if (confirm(`Item is in cart (qty: ${currentQty}). Increase quantity?`)) {
        this.cartService.updateCartItemQuantity(productId, currentQty + 1).subscribe({
          next: () => this.notificationService.success('Updated', `Quantity set to ${currentQty + 1}`),
          error: (err) => this.notificationService.error('Error', err.message)
        });
      }
    } else {
      this.notificationService.success('Added!', 'Item added to cart');
    }
  },
  error: (error) => {
    const msg = this.getErrorMessage(error?.code || 'UNKNOWN_ERROR');
    this.notificationService.error('Error', msg);
  }
});
```

#### Remove from Cart

```typescript
this.cartService.removeProductFromCart(productId).subscribe({
  next: () => {
    this.notificationService.success('Removed', 'Item removed from cart');
  },
  error: (error) => {
    this.notificationService.error('Error', error?.message || 'Failed to remove');
  }
});
```

#### Toggle Cart (Add or Remove)

**RECOMMENDED** - Handles both add and remove intelligently:
```typescript
this.cartService.toggleCart(productId, { quantity: 1 }).subscribe({
  next: (response) => {
    const isAdded = this.cartService.isInCart(productId);
    const msg = isAdded ? 'Added to cart' : 'Removed from cart';
    this.notificationService.success('Success', msg);
  },
  error: (error) => {
    this.notificationService.error('Error', error?.message);
  }
});
```

---

## Check If Item Exists

### Before Showing Icons

```typescript
export class ProductCardComponent {
  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }
}
```

Use in template:
```html
<!-- Wishlist button -->
<button 
  [class.active]="isInWishlist(product.id)"
  (click)="toggleWishlist(product.id)">
  <i class="fas" 
     [ngClass]="isInWishlist(product.id) ? 'fa-heart' : 'fa-heart-o'"></i>
</button>

<!-- Cart button -->
<button 
  [class.active]="isInCart(product.id)"
  (click)="toggleCart(product.id)">
  <i class="fas fa-shopping-cart"></i>
</button>
```

---

## Error Handling with Error Codes

### Error Codes Reference

**Wishlist Error Codes:**
- `MISSING_PRODUCT_ID` - Product ID not provided
- `PRODUCT_NOT_FOUND` - Product doesn't exist
- `PRODUCT_INACTIVE` - Product is disabled/archived
- `ALREADY_IN_WISHLIST` - Product already in wishlist
- `UNAUTHORIZED` - User not authenticated
- `WISHLIST_ADD_FAILED` - Server error adding item
- `WISHLIST_REMOVE_FAILED` - Server error removing item

**Cart Error Codes:**
- `MISSING_PRODUCT_ID` - Product ID not provided
- `ALREADY_IN_CART` - Product already in cart (with currentQuantity)
- `OUT_OF_STOCK` - Product stock is 0
- `INSUFFICIENT_STOCK` - Requested quantity exceeds available stock
- `PRODUCT_NOT_FOUND` - Product doesn't exist
- `UNAUTHORIZED` - User not authenticated
- `CART_ADD_FAILED` - Server error adding item
- `CART_REMOVE_FAILED` - Server error removing item

### Error Message Mapping

```typescript
export class MyComponent {
  getErrorMessage(errorCode: string, defaultMessage?: string): string {
    const errorMap: { [key: string]: string } = {
      'MISSING_PRODUCT_ID': 'Product ID is missing or invalid.',
      'PRODUCT_NOT_FOUND': 'Product not found. It may have been deleted.',
      'PRODUCT_INACTIVE': 'This product is no longer available.',
      'OUT_OF_STOCK': 'This product is currently out of stock.',
      'INSUFFICIENT_STOCK': 'Not enough items in stock for your request.',
      'ALREADY_IN_WISHLIST': 'Product is already in your wishlist.',
      'ALREADY_IN_CART': 'Product is already in your cart.',
      'UNAUTHORIZED': 'Please log in to continue.',
      'WISHLIST_ADD_FAILED': 'Failed to add to wishlist. Please try again.',
      'WISHLIST_REMOVE_FAILED': 'Failed to remove from wishlist. Please try again.',
      'CART_ADD_FAILED': 'Failed to add to cart. Please try again.',
      'CART_REMOVE_FAILED': 'Failed to remove from cart. Please try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    return errorMap[errorCode] || defaultMessage || 'An error occurred.';
  }
}
```

### Using Error Codes in Components

```typescript
toggleWishlist(productId: string): void {
  this.wishlistService.toggleWishlist(productId).subscribe({
    next: (response) => {
      // Handle success based on code
      if (response.code === 'ALREADY_IN_WISHLIST') {
        this.notificationService.info('Info', 'Already in your wishlist');
      } else if (response.code === 'WISHLIST_ITEM_REMOVED') {
        this.notificationService.success('Success', 'Removed from wishlist');
      } else {
        this.notificationService.success('Success', 'Added to wishlist');
      }
    },
    error: (error) => {
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      const msg = this.getErrorMessage(errorCode, error?.message);
      this.notificationService.error('Error', msg);
    }
  });
}
```

---

## Complete Component Example

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WishlistService } from '@core/services/wishlist.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-product-card',
  template: `
    <div class="product-card">
      <img [src]="product.image" alt="{{ product.name }}">
      <h3>{{ product.name }}</h3>
      <p>{{ product.price | currency }}</p>
      
      <div class="actions">
        <button 
          (click)="toggleCart(product.id)"
          [class.active]="isInCart(product.id)">
          <i class="fas fa-shopping-cart"></i>
        </button>
        
        <button 
          (click)="toggleWishlist(product.id)"
          [class.active]="isInWishlist(product.id)">
          <i class="fas" 
             [ngClass]="isInWishlist(product.id) ? 'fa-heart' : 'fa-heart-o'"></i>
        </button>
      </div>

      <!-- Show counts -->
      <span class="wishlist-count">{{ wishlistCount$ | async }}</span>
      <span class="cart-count">{{ cartItemCount$ | async }}</span>
    </div>
  `,
  styles: [`
    .product-card { /* styles */ }
    .actions { display: flex; gap: 10px; }
    button.active { color: red; }
  `]
})
export class ProductCardComponent implements OnInit, OnDestroy {
  product: any;
  
  wishlistCount$ = this.wishlistService.wishlistCount$;
  cartItemCount$ = this.cartService.cartItemCount$;
  
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // State updates automatically via async pipe
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  toggleWishlist(productId: string): void {
    this.wishlistService.toggleWishlist(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const msg = this.wishlistService.isInWishlist(productId) 
            ? 'Added to wishlist' 
            : 'Removed from wishlist';
          this.notificationService.success('Success', msg);
        },
        error: (error) => {
          const msg = this.getErrorMessage(error?.code, error?.message);
          this.notificationService.error('Error', msg);
        }
      });
  }

  toggleCart(productId: string): void {
    this.cartService.toggleCart(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const msg = this.cartService.isInCart(productId)
            ? 'Added to cart'
            : 'Removed from cart';
          this.notificationService.success('Success', msg);
        },
        error: (error) => {
          const msg = this.getErrorMessage(error?.code, error?.message);
          this.notificationService.error('Error', msg);
        }
      });
  }

  private getErrorMessage(errorCode: string | undefined, defaultMsg?: string): string {
    const map: { [key: string]: string } = {
      'ALREADY_IN_WISHLIST': 'Already in your wishlist',
      'ALREADY_IN_CART': 'Already in your cart',
      'PRODUCT_NOT_FOUND': 'Product not found',
      'OUT_OF_STOCK': 'Out of stock',
      'UNAUTHORIZED': 'Please log in',
      'UNKNOWN_ERROR': 'An error occurred'
    };
    return map[errorCode || ''] || defaultMsg || 'An error occurred';
  }
}
```

---

## Best Practices

### ✅ DO

- ✅ Use `toggleWishlist()` and `toggleCart()` for simpler code
- ✅ Check with `isInWishlist()` before showing UI
- ✅ Subscribe with error handling in all components
- ✅ Use `takeUntil()` to unsubscribe on destroy
- ✅ Provide user feedback with NotificationService
- ✅ Extract error codes and map to user-friendly messages
- ✅ Show optimistic updates immediately
- ✅ Use async pipe for counts and items in templates

### ❌ DON'T

- ❌ Don't add duplicate API calls for the same operation
- ❌ Don't ignore error responses
- ❌ Don't manually manage wishlist/cart state in components
- ❌ Don't call services directly in templates
- ❌ Don't forget to unsubscribe (use takeUntil)
- ❌ Don't show generic "error occurred" messages
- ❌ Don't mix local state with service state

---

## Testing Checklist

- [ ] Product can be added to wishlist
- [ ] Product can be removed from wishlist
- [ ] Icon updates immediately after add/remove
- [ ] Wishlist count updates in header
- [ ] Duplicate products show proper message
- [ ] Deleted products show proper error
- [ ] Out of stock items show error
- [ ] Cart works identically to wishlist
- [ ] Logout clears wishlist and cart
- [ ] Re-login reloads wishlist and cart
- [ ] Notifications display correct messages
- [ ] Errors show user-friendly text

---

## Troubleshooting

### Wishlist/Cart Not Updating Across Components

**Problem**: Added in one component, not showing in another

**Solution**: Ensure component is subscribed to state:
```typescript
// ✅ Correct
wishlistCount$ = this.wishlistService.wishlistCount$;

// ❌ Wrong - creates local copy, doesn't auto-update
wishlistCount: number;
```

### Duplicate Entries in Wishlist

**Problem**: Same product added multiple times

**Solution**: Service checks before adding, but verify backend duplicate prevention

### Notifications Not Showing

**Problem**: Toasts don't appear

**Solution**: 
1. Verify NotificationService is injected
2. Check that NotificationService is provided in module
3. Verify error vs success vs info calls

### State Not Persisting After Reload

**Problem**: Wishlist clears after page refresh

**Solution**: Service reloads from API on init, verify:
1. User is authenticated
2. Backend API is responding
3. CORS headers are correct

---

## Migration Checklist

When updating an existing component to use global state:

- [ ] Remove local wishlist/cart properties
- [ ] Inject WishlistService and CartService
- [ ] Create `$ = service.subject$` properties
- [ ] Replace template logic with `$ | async`
- [ ] Replace method calls with service calls
- [ ] Add error handling with error codes
- [ ] Add notifications for user feedback
- [ ] Test real-time sync with other components
- [ ] Verify unsubscribe on destroy

---

## Performance Tips

1. **Use async pipe** instead of manual subscriptions when possible
2. **Use trackBy** for `*ngFor` with large lists:
   ```typescript
   trackByProductId(index, item) {
     return item.productId;
   }
   ```
3. **Avoid unnecessary reloads** - service handles state
4. **Use OnPush detection** for components:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```
5. **Unsubscribe** to prevent memory leaks:
   ```typescript
   private destroy$ = new Subject();
   this.wishlistService.wishlistItems$
     .pipe(takeUntil(this.destroy$))
     .subscribe(...);
   ```

