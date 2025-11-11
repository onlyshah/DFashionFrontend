import { Component, OnInit, OnDestroy, Output, EventEmitter, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  currentUser$ = this.authService.currentUser$;
  userName = 'Super Admin';
  notifications = 0;
  messages = 0;
  apiUrl = environment.apiUrl;

  // Handle image loading errors
  handleImageError(event: any) {
    const img = event.target;
    // Replace with default image from backend
    img.src = this.apiUrl + '/assets/images/default/default-avatar.svg';
  }
  
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() mobileSidebarToggle = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  today: Date = new Date();
  lastLoginTime: string = '23 hours ago';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Restore sidebar state
    const savedState = localStorage.getItem('sidebarState');
    if (savedState === 'collapsed') {
      document.body.classList.add('sidebar-icon-only');
    }
  }

  ngAfterViewInit(): void {
    // Ensure page content is pushed below fixed header + sub-navbar to avoid overlap
    this.adjustPageOffset();
    // small timeout to allow other layout pieces to render
    setTimeout(() => this.adjustPageOffset(), 50);
    // extra guard for slow rendering/layout shifts (e.g. fonts/images)
    setTimeout(() => this.adjustPageOffset(), 250);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.adjustPageOffset();
  }

  private adjustPageOffset(): void {
    try {
      // Calculate the combined height of the top navbar and optional breadcrumb
      const mainNav = document.querySelector('nav.navbar') as HTMLElement | null;
      const breadcrumbNav = document.querySelector('nav.navbar-breadcrumb') as HTMLElement | null;
      const mainHeight = mainNav ? Math.round(mainNav.getBoundingClientRect().height) : 0;
      const breadcrumbHeight = breadcrumbNav ? Math.round(breadcrumbNav.getBoundingClientRect().height) : 0;

      // If heights can't be measured yet, fall back to a sensible default (64px)
      const total = (mainHeight + breadcrumbHeight) || 64;

      // Prefer applying padding to a page-specific container instead of the global scroller
      const candidateSelectors = [
        '.page-body-wrapper',
        '.main-panel',
        '.content-wrapper',
        '.page-body',
        '.page-wrapper',
        '#main',
        'app-root > .container',
        '.container-scroller'
      ];

      let applied = false;
      for (const sel of candidateSelectors) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          const current = parseInt(window.getComputedStyle(el).paddingTop || '0', 10) || 0;
          if (current !== total) {
            el.style.paddingTop = `${total}px`;
          }
          applied = true;
          break;
        }
      }

      // Fallback to body if no page container is found
      if (!applied) {
        const body = document.body as HTMLElement;
        const current = parseInt(window.getComputedStyle(body).paddingTop || '0', 10) || 0;
        if (current !== total) {
          body.style.paddingTop = `${total}px`;
        }
      }
    } catch (e) {
      // ignore errors silently
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    const body = document.body;
    const isCollapsed = body.classList.toggle('sidebar-icon-only');
    
    // Persist the sidebar state
    localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
    
    // Small delay to let transitions complete
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    this.sidebarToggle.emit();
  }

  toggleMobileMenu(): void {
    document.body.classList.toggle('sidebar-open');
    this.mobileSidebarToggle.emit();
  }
}