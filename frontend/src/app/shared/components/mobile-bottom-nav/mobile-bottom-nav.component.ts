import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-mobile-bottom-nav',
    standalone: true,
    imports: [CommonModule, IonicModule],
    styleUrls: ['./mobile-bottom-nav.component.scss'],
    templateUrl: './mobile-bottom-nav.component.html'
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
