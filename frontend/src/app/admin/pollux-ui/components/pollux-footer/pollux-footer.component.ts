import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pollux-footer',
  templateUrl: './pollux-footer.component.html',
  styleUrls: ['./pollux-footer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PolluxFooterComponent {
  currentYear = new Date().getFullYear();
}
