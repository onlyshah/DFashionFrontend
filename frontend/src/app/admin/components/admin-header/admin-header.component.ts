import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  currentUser$ = this.authService.currentUser$;
  userName = 'Super Admin';
  notifications = 0;
  messages = 0;
  
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() mobileSidebarToggle = new EventEmitter<void>();
  private destroy$ = new Subject<void>();
  today: Date = new Date();
  lastLoginTime: string = '23 hours ago';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Bootstrap dropdowns are handled by NgbDropdownModule now
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSidebar(): void {
    document.body.classList.toggle('sidebar-icon-only');
    this.sidebarToggle.emit();
  }

  toggleMobileMenu(): void {
    document.body.classList.toggle('sidebar-open');
    this.mobileSidebarToggle.emit();
  }
}