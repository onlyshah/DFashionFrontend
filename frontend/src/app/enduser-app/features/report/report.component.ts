import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <div class="report-container">
      <div class="report-header">
        <h1>Report a Problem</h1>
        <p>Help us improve by reporting issues</p>
      </div>

      <form class="report-form" (ngSubmit)="submitReport()">
        <div class="form-group">
          <label for="category">Issue Category</label>
          <select id="category" [(ngModel)]="formData.category" name="category" class="form-control">
            <option value="">Select a category</option>
            <option value="bug">Bug or Technical Issue</option>
            <option value="ui">User Interface Problem</option>
            <option value="performance">Performance Issue</option>
            <option value="feature">Feature Request</option>
            <option value="payment">Payment Issue</option>
            <option value="account">Account Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="subject">Subject</label>
          <input 
            type="text" 
            id="subject" 
            [(ngModel)]="formData.subject" 
            name="subject"
            class="form-control"
            placeholder="Brief description of the issue"
            required>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            [(ngModel)]="formData.description" 
            name="description"
            class="form-control"
            placeholder="Provide detailed information about the problem"
            rows="6"
            required></textarea>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            [(ngModel)]="formData.email" 
            name="email"
            class="form-control"
            placeholder="Your email for follow-up"
            required>
        </div>

        <div class="button-group">
          <button type="submit" class="submit-btn">Submit Report</button>
          <button type="button" class="cancel-btn" (click)="goBack()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .report-container {
      min-height: 100vh;
      background: #f0f0f0;
      padding: 20px;
    }

    .report-header {
      margin-bottom: 30px;
    }

    .report-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #111;
    }

    .report-header p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .report-form {
      background: #fff;
      padding: 24px;
      border-radius: 12px;
      max-width: 600px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 24px;
    }

    .submit-btn {
      flex: 1;
      padding: 12px 16px;
      background: #667eea;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .submit-btn:hover {
      background: #5568d3;
    }

    .cancel-btn {
      flex: 1;
      padding: 12px 16px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .cancel-btn:hover {
      background: #e9e9e9;
    }
  `]
})
export class ReportComponent implements OnInit, OnDestroy {
  formData = {
    category: '',
    subject: '',
    description: '',
    email: ''
  };

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check authentication
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
        } else {
          this.formData.email = user.email || '';
        }
      })
    );
  }

  submitReport(): void {
    if (!this.formData.category || !this.formData.subject || !this.formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    console.log('🚨 Report submitted:', this.formData);
    alert('Thank you for your report! We will review it soon.');
    this.router.navigate(['/home']);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
