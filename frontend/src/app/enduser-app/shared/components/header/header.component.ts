import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { WishlistNewService } from '../../../../core/services/wishlist-new.service';
import { User } from '../../../../core/models/user.model';

@Component({
    selector: 'app-header',
     standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
   })
export class HeaderComponent implements OnInit {
  @Input() isMobile = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: User | null = null;
  searchQuery = '';
  showUserMenu = false;
  cartItemCount = 0;
  wishlistItemCount = 0;
  totalItemCount = 0;
  cartTotalAmount = 0;
  showCartTotalPrice = false;

  backendDefaultAvatar = environment.apiUrl + '/uploads/avatars/';

  // Search functionality
  showSuggestions = false;
  searchSuggestions: any[] = [];
  searchTimeout: any;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistNewService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user changes and refresh counts on login
    this.authService.currentUser$.subscribe((user: User | null) => {
      const wasLoggedOut = !this.currentUser;
      this.currentUser = user;

      // If user just logged in, refresh total count
      if (user && wasLoggedOut) {
        console.log('🔄 User logged in, refreshing total count...');
        setTimeout(() => {
          this.cartService.refreshTotalCount();
        }, 100);
      } else if (!user && !wasLoggedOut) {
        // User logged out, reset total count
        console.log('🔄 User logged out, resetting total count...');
        this.totalItemCount = 0;
      }
    });

    // Subscribe to individual cart count
    this.cartService.cartItemCount$.subscribe((count: number) => {
      this.cartItemCount = count;
      console.log('🛒 Header cart count updated:', count);
    });

    // Subscribe to individual wishlist count
    this.wishlistService.wishlistItemCount$.subscribe((count: number) => {
      this.wishlistItemCount = count;
      console.log('💝 Header wishlist count updated:', count);
    });

    // Subscribe to total count (cart + wishlist)
    this.cartService.totalItemCount$.subscribe((count: number) => {
      this.totalItemCount = count;
      console.log('🔢 Header total count updated:', count);
    });

    // Subscribe to cart total amount
    this.cartService.cartTotalAmount$.subscribe((amount: number) => {
      this.cartTotalAmount = amount;
      console.log('💰 Header cart total amount updated:', amount);
    });

    // Subscribe to cart price display flag
    this.cartService.showCartTotalPrice$.subscribe((showPrice: boolean) => {
      this.showCartTotalPrice = showPrice;
      console.log('💲 Header show cart total price updated:', showPrice);
    });

    // Refresh counts when user logs in
    if (this.currentUser) {
      this.cartService.refreshTotalCount();
      this.wishlistService.refreshWishlistOnLogin();
    }

    // Load cart and wishlist on init
    this.cartService.loadCart();
    this.wishlistService.loadWishlist();

  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const isClickOnButton = target.closest('.user-menu-wrapper');
    const isClickOnMenu = target.closest('.dropdown-menu');
    
    if (!isClickOnButton && !isClickOnMenu) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showUserMenu = !this.showUserMenu;
  }

  openSearch() {
    this.router.navigate(['/search']);
  }

  // Get total count for display (cart + wishlist items for logged-in user)
  getTotalItemCount(): number {
    if (!this.currentUser) {
      return 0; // Return 0 if user is not logged in
    }
    return this.totalItemCount || 0;
  }

  // Get formatted cart total amount
  getFormattedCartTotal(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(this.cartTotalAmount || 0);
  }

  // Check if cart total price should be displayed
  shouldShowCartTotalPrice(): boolean {
    return this.currentUser !== null && this.showCartTotalPrice;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery }
      });
      this.hideSuggestions();
    } else {
      this.router.navigate(['/search']);
    }
  }

  onSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      if (this.searchQuery.trim().length > 2) {
        this.loadSearchSuggestions();
      } else {
        this.hideSuggestions();
      }
    }, 300);
  }

  onSearchFocus() {
    if (this.searchQuery.trim().length > 2) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur() {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      this.hideSuggestions();
    }, 200);
  }

  loadSearchSuggestions() {
    // Simulate API call for search suggestions
    const query = this.searchQuery.toLowerCase();

    // Generate suggestions based on query
    // These are generic search suggestions - actual product searches use the search API
    this.searchSuggestions = [
      { text: `Search Products for "${this.searchQuery}"`, type: 'product', icon: 'fa-shopping-bag' },
      { text: `Search Brands for "${this.searchQuery}"`, type: 'brand', icon: 'fa-tags' },
      { text: `Search Categories for "${this.searchQuery}"`, type: 'category', icon: 'fa-list' }
    ];

    this.showSuggestions = true;
  }

  selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.text;
    this.router.navigate(['/search'], {
      queryParams: {
        q: this.searchQuery,
        type: suggestion.type
      }
    });
    this.hideSuggestions();
  }

  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'product': return 'fa-shopping-bag';
      case 'brand': return 'fa-tags';
      case 'category': return 'fa-list';
      default: return 'fa-search';
    }
  }

  hideSuggestions() {
    this.showSuggestions = false;
    this.searchSuggestions = [];
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onAvatarError(event: any) {
    // Fallback to backend-served default avatar if the current one fails to load
    event.target.src = this.backendDefaultAvatar + 'default-avatar.svg';
    
  }
}
