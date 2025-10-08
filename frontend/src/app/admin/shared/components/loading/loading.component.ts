import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-loading',
    imports: [CommonModule],
    styleUrls: ['./loading.component.scss'],
    templateUrl: './loading.component.html'
})
export class AdminLoadingComponent {
    @Input() title: string = 'Loading';
    @Input() message: string = 'Please wait while we prepare your content...';
    @Input() fullscreen: boolean = false;
    @Input() progress?: number;
}
