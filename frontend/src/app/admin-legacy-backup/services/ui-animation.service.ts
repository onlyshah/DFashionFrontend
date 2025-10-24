import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiAnimationService {
  private renderer: Renderer2;
  private sidebarCollapsed = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsed.asObservable();

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeAnimations();
  }

  private initializeAnimations() {
    // Initialize sidebar state based on screen size
    if (typeof window !== 'undefined') {
      const isSmallScreen = window.innerWidth < 992;
      this.sidebarCollapsed.next(isSmallScreen);
      
      // Listen for window resize
      this.renderer.listen('window', 'resize', () => {
        const isSmall = window.innerWidth < 992;
        if (isSmall !== this.sidebarCollapsed.value) {
          this.sidebarCollapsed.next(isSmall);
          this.updateSidebarState();
        }
      });
    }
  }

  // Sidebar animations
  toggleSidebar() {
    const currentState = this.sidebarCollapsed.value;
    this.sidebarCollapsed.next(!currentState);
    this.updateSidebarState();
  }

  private updateSidebarState() {
    const body = document.body;
    const isCollapsed = this.sidebarCollapsed.value;
    
    if (isCollapsed) {
      this.renderer.addClass(body, 'sidebar-icon-only');
    } else {
      this.renderer.removeClass(body, 'sidebar-icon-only');
    }
    
    // Add animation class
    this.renderer.addClass(body, 'sidebar-transitioning');
    setTimeout(() => {
      this.renderer.removeClass(body, 'sidebar-transitioning');
    }, 300);
  }

  // Mobile sidebar toggle
  toggleMobileSidebar() {
    const body = document.body;
    const isActive = body.classList.contains('sidebar-offcanvas-active');
    
    if (isActive) {
      this.renderer.removeClass(body, 'sidebar-offcanvas-active');
    } else {
      this.renderer.addClass(body, 'sidebar-offcanvas-active');
    }
  }

  // Dropdown animations
  initializeDropdowns() {
    // Initialize Bootstrap dropdowns with custom animations
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
      dropdownElements.forEach(element => {
        element.addEventListener('show.bs.dropdown', (event) => {
          const dropdown = (event.target as Element).nextElementSibling;
          if (dropdown) {
            this.renderer.addClass(dropdown, 'fade-in');
          }
        });
        
        element.addEventListener('hide.bs.dropdown', (event) => {
          const dropdown = (event.target as Element).nextElementSibling;
          if (dropdown) {
            this.renderer.removeClass(dropdown, 'fade-in');
          }
        });
      });
    }
  }

  // Collapse animations
  initializeCollapses() {
    const collapseElements = document.querySelectorAll('[data-bs-toggle="collapse"]');
    collapseElements.forEach(element => {
      element.addEventListener('show.bs.collapse', (event) => {
        const target = document.querySelector((event.target as Element).getAttribute('href') || '');
        if (target) {
          this.renderer.addClass(target, 'slide-in');
        }
      });
      
      element.addEventListener('hide.bs.collapse', (event) => {
        const target = document.querySelector((event.target as Element).getAttribute('href') || '');
        if (target) {
          this.renderer.removeClass(target, 'slide-in');
        }
      });
    });
  }

  // Card hover animations
  initializeCardAnimations() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      this.renderer.listen(card, 'mouseenter', () => {
        this.renderer.addClass(card, 'card-hover');
      });
      
      this.renderer.listen(card, 'mouseleave', () => {
        this.renderer.removeClass(card, 'card-hover');
      });
    });
  }

  // Loading animations
  showLoading(element: Element, text: string = 'Loading...') {
    const loadingHtml = `
      <div class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <span class="loading-text">${text}</span>
        </div>
      </div>
    `;
    
    this.renderer.addClass(element, 'position-relative');
    const loadingElement = this.renderer.createElement('div');
    loadingElement.innerHTML = loadingHtml;
    this.renderer.appendChild(element, loadingElement.firstChild);
  }

  hideLoading(element: Element) {
    const loadingOverlay = element.querySelector('.loading-overlay');
    if (loadingOverlay) {
      this.renderer.removeChild(element, loadingOverlay);
    }
  }

  // Notification animations
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
    const notification = this.renderer.createElement('div');
    this.renderer.addClass(notification, 'notification');
    this.renderer.addClass(notification, `notification-${type}`);
    this.renderer.addClass(notification, 'fade-in');
    
    const iconMap = {
      success: 'typcn-tick',
      error: 'typcn-times',
      warning: 'typcn-warning',
      info: 'typcn-info'
    };
    
    notification.innerHTML = `
      <i class="typcn ${iconMap[type]}"></i>
      <span>${message}</span>
      <button class="notification-close" type="button">
        <i class="typcn typcn-times"></i>
      </button>
    `;
    
    // Position notification
    this.renderer.setStyle(notification, 'position', 'fixed');
    this.renderer.setStyle(notification, 'top', '20px');
    this.renderer.setStyle(notification, 'right', '20px');
    this.renderer.setStyle(notification, 'z-index', '9999');
    
    this.renderer.appendChild(document.body, notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      this.renderer.listen(closeBtn, 'click', () => {
        this.hideNotification(notification);
      });
    }
    
    // Auto hide
    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification(notification);
      }, duration);
    }
  }

  private hideNotification(notification: Element) {
    this.renderer.addClass(notification, 'fade-out');
    setTimeout(() => {
      if (notification.parentNode) {
        this.renderer.removeChild(document.body, notification);
      }
    }, 300);
  }

  // Page transition animations
  animatePageTransition(element: Element) {
    this.renderer.addClass(element, 'page-transition');
    setTimeout(() => {
      this.renderer.removeClass(element, 'page-transition');
    }, 500);
  }

  // Chart animation helpers
  animateChart(chartElement: Element) {
    this.renderer.addClass(chartElement, 'chart-animate');
    setTimeout(() => {
      this.renderer.removeClass(chartElement, 'chart-animate');
    }, 1000);
  }

  // Initialize all animations
  initializeAllAnimations() {
    setTimeout(() => {
      this.initializeDropdowns();
      this.initializeCollapses();
      this.initializeCardAnimations();
    }, 100);
  }

  // Cleanup method
  cleanup() {
    // Remove any active animations or listeners if needed
    const body = document.body;
    this.renderer.removeClass(body, 'sidebar-icon-only');
    this.renderer.removeClass(body, 'sidebar-offcanvas-active');
    this.renderer.removeClass(body, 'sidebar-transitioning');
  }
}
