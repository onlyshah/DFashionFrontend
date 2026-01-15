import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() spinnerType: string = 'crescent';
  @Input() color: string = 'primary';
  @Input() overlay: boolean = false;
}
