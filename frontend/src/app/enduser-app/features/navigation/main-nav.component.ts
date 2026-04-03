import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
 
export class MainNavComponent implements OnInit {
  currentRoute = '';
  isMoreMenuOpen = false;
  isCollapsed = false;
  isMobile = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Track current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEnd = event as NavigationEnd;
        this.currentRoute = navigationEnd.url;
      });

    // Set initial route
    this.currentRoute = this.router.url;
    this.isMobile = window.innerWidth <= 768;

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) {
        this.isCollapsed = true;
      }
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Navigation methods
  navigateToHome() {
    console.log('Navigating to home/feed');
    this.router.navigate(['/feed']);
  }

  navigateToFeed() {
    console.log('Navigating to feed');
    this.router.navigate(['/feed']);
  }

  navigateToStories() {
    console.log('Navigating to stories');
    this.router.navigate(['/stories']);
  }

  navigateToShop() {
    console.log('Navigating to shop');
    this.router.navigate(['/shop']);
  }

  navigateToWishlist() {
    console.log('Navigating to wishlist');
    this.router.navigate(['/wishlist']);
  }

  navigateToCart() {
    console.log('Navigating to cart');
    this.router.navigate(['/cart']);
  }

  navigateToSearch() {
    console.log('Navigating to search');
    this.router.navigate(['/search']);
  }

  navigateToProfile() {
    console.log('Navigating to profile');
    this.router.navigate(['/profile']);
  }

  openMoreOptions() {
    console.log('Opening More panel');
    this.isMoreMenuOpen = true;
  }

  closeMoreOptions() {
    console.log('Closing More panel');
    this.isMoreMenuOpen = false;
  }

  onMoreItemClick(action: string) {
    console.log('More action selected:', action);
    this.closeMoreOptions();
    switch (action) {
      case 'settings':
        this.router.navigate(['/settings']);
        break;
      case 'help':
        this.router.navigate(['/help']);
        break;
      case 'logout':
        this.router.navigate(['/logout']);
        break;
      default:
        break;
    }
  }
}
