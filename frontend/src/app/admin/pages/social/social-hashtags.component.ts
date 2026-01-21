import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-social-hashtags',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Hashtags</h1>
        <p>Monitor and manage trending hashtags</p>
      </div>
      <mat-card>
        <mat-card-content>
          <div class="empty-state">
            <mat-icon>tag</mat-icon>
            <p>Hashtags</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page-container { padding: 24px; } .page-header { margin-bottom: 24px; } .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; } .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; }`]
})
export class SocialHashtagsComponent {}
