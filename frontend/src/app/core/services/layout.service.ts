import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface LayoutState {
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  layoutType: 'default' | 'dashboard' | 'admin' | 'mobile' | 'auth';
  zIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private layoutStateSubject = new BehaviorSubject<LayoutState>({
    showHeader: true,
    showFooter: false,
    showSidebar: false,
    layoutType: 'default',
    zIndex: 1
  });

  public layoutState$: Observable<LayoutState> = this.layoutStateSubject.asObservable();

  constructor(private router: Router) {
    this.initializeLayoutManagement();
  }

  private initializeLayoutManagement(): void {
    // Listen to route changes and update layout accordingly
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navigationEnd = event as NavigationEnd;
      this.updateLayoutForRoute(navigationEnd.url);
    });

    // Set initial layout based on current route
    this.updateLayoutForRoute(this.router.url);
  }

  private updateLayoutForRoute(url: string): void {
    const currentState = this.layoutStateSubject.value;
    let newState: LayoutState = { ...currentState };

    // Determine layout based on route
    if (url.includes('/auth') || url.includes('/login') || url.includes('/register')) {
      newState = {
        showHeader: false,
        showFooter: false,
        showSidebar: false,
        layoutType: 'auth',
        zIndex: 1
      };
    } else if (url.startsWith('/admin') || url.startsWith('/dashboard')) {
      newState = {
        showHeader: false,
        showFooter: false,
        showSidebar: true,
        layoutType: url.startsWith('/admin') ? 'admin' : 'dashboard',
        zIndex: 1000
      };
    } else if (url.startsWith('/vendor')) {
      newState = {
        showHeader: false,
        showFooter: false,
        showSidebar: true,
        layoutType: 'dashboard',
        zIndex: 1000
      };
    } else if (url.startsWith('/user-dashboard')) {
      newState = {
        showHeader: false,
        showFooter: false,
        showSidebar: false,
        layoutType: 'dashboard',
        zIndex: 1000
      };
    } else if (url.startsWith('/stories') || url.startsWith('/post/')) {
      newState = {
        showHeader: false,
        showFooter: false,
        showSidebar: false,
        layoutType: 'mobile',
        zIndex: 1
      };
    } else {
      // Default layout for home and other pages
      newState = {
        showHeader: true,
        showFooter: false,
        showSidebar: false,
        layoutType: 'default',
        zIndex: 1
      };
    }

    this.layoutStateSubject.next(newState);
  }

  // Public methods to control layout
  public setLayoutType(type: LayoutState['layoutType']): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      layoutType: type
    });
  }

  public setHeaderVisibility(show: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      showHeader: show
    });
  }

  public setSidebarVisibility(show: boolean): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      showSidebar: show
    });
  }

  public setZIndex(zIndex: number): void {
    const currentState = this.layoutStateSubject.value;
    this.layoutStateSubject.next({
      ...currentState,
      zIndex
    });
  }

  // Utility methods
  public getCurrentLayoutState(): LayoutState {
    return this.layoutStateSubject.value;
  }

  public isDashboardLayout(): boolean {
    const state = this.layoutStateSubject.value;
    return state.layoutType === 'dashboard' || state.layoutType === 'admin';
  }

  public isAuthLayout(): boolean {
    return this.layoutStateSubject.value.layoutType === 'auth';
  }

  public shouldShowHeader(): boolean {
    return this.layoutStateSubject.value.showHeader;
  }

  public shouldShowSidebar(): boolean {
    return this.layoutStateSubject.value.showSidebar;
  }

  // Method to prevent overlapping by ensuring proper z-index management
  public preventOverlapping(componentType: string): number {
    const zIndexMap: { [key: string]: number } = {
      'background': -1,
      'content': 1,
      'sidebar': 100,
      'header': 999,
      'mobile-nav': 998,
      'dashboard': 1000,
      'admin-dashboard': 1001,
      'modal': 1050,
      'tooltip': 1100,
      'notification': 1200
    };

    return zIndexMap[componentType] || 1;
  }

  // Method to force layout refresh (useful for fixing overlapping issues)
  public refreshLayout(): void {
    this.updateLayoutForRoute(this.router.url);
  }

  // Method to clear all overlapping issues
  public clearOverlapping(): void {
    // Force a layout refresh with a small delay
    setTimeout(() => {
      this.refreshLayout();
    }, 100);
  }
}
