import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ViewAddStoriesComponent } from '../../components/view-add-stories/view-add-stories.component';
import { FeedComponent } from '../../components/feed/feed.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ViewAddStoriesComponent,
    FeedComponent,
    SidebarComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isMobile = false;
  isSidebarOpen = false;
  hasNotifications = true; // Example notification state

  constructor() {}

  ngOnInit() {
    this.checkScreenSize();
    // Prevent body scroll when sidebar is open
    document.addEventListener('touchmove', this.preventScroll, { passive: false });
  }

  ngOnDestroy() {
    document.removeEventListener('touchmove', this.preventScroll);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    if (!this.isMobile && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.toggleBodyScroll();
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    this.toggleBodyScroll();
  }

  private toggleBodyScroll() {
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  private preventScroll = (e: TouchEvent) => {
    if (this.isSidebarOpen) {
      e.preventDefault();
    }
  }
}
