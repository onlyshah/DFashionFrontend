import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="bottom-nav" *ngIf="isMobile">
      <div class="nav-item" [class.active]="currentRoute === '/home'" (click)="navigate('/home')">
        <ion-icon name="home-outline"></ion-icon>
        <span>Home</span>
      </div>
      <div class="nav-item" [class.active]="currentRoute === '/search'" (click)="navigate('/search')">
        <ion-icon name="search-outline"></ion-icon>
        <span>Search</span>
      </div>
      <div class="nav-item" [class.active]="currentRoute === '/add'" (click)="navigate('/add')">
        <ion-icon name="add-outline"></ion-icon>
        <span>Add</span>
      </div>
      <div class="nav-item" [class.active]="currentRoute === '/activity'" (click)="navigate('/activity')">
        <ion-icon name="heart-outline"></ion-icon>
        <span>Activity</span>
      </div>
      <div class="nav-item" [class.active]="currentRoute === '/profile'" (click)="navigate('/profile')">
        <ion-icon name="person-outline"></ion-icon>
        <span>Profile</span>
      </div>
    </div>
  `,
  styleUrls: ['./mobile-bottom-nav.component.scss']
})
export class MobileBottomNavComponent {
  isMobile = window.innerWidth <= 1024;
  currentRoute = '/home';

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
  }

  navigate(route: string) {
    this.currentRoute = route;
    this.router.navigate([route]);
  }
}
