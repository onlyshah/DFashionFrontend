import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-footer',
  templateUrl: './admin-footer.component.html',
  styleUrls: ['./admin-footer.component.scss']
})
export class AdminFooterComponent {
  currentYear = new Date().getFullYear();
  version = '1.0.0';
}
