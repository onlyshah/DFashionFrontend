import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-not-found',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './admin-not-found.component.html',
  styleUrls: ['./admin-not-found.component.scss']
})
export class AdminNotFoundComponent {}
