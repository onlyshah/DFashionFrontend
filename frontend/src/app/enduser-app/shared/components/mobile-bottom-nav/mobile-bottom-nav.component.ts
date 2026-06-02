import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
    selector: 'app-mobile-bottom-nav',
    standalone: true,
    imports: [CommonModule, IonicModule],
    styleUrls: ['./mobile-bottom-nav.component.scss'],
    templateUrl: './mobile-bottom-nav.component.html'
})
export class MobileBottomNavComponent implements OnInit {
    @Output() onCreateClick = new EventEmitter<void>();
    
    isMobile = window.innerWidth <= 1024;
    currentRoute = '/home';

    constructor(private router: Router) {
        this.currentRoute = this.router.url;
    }

    ngOnInit(): void {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.currentRoute = event.url;
        });
    }

    navigate(route: string): void {
        this.currentRoute = route;
        this.router.navigate([route]);
    }

    onCreateClick_method(): void {
        this.onCreateClick.emit();
    }
}
