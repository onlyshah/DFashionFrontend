import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <div class="settings-grid">
        <!-- Site Settings -->
        <div class="settings-card">
          <h3>Site Settings</h3>
          <form [formGroup]="siteSettingsForm" (ngSubmit)="saveSiteSettings()">
            <div class="form-group">
              <label>Site Name</label>
              <input type="text" formControlName="siteName">
            </div>

            <div class="form-group">
              <label>Site Description</label>
              <textarea formControlName="siteDescription" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Contact Email</label>
              <input type="email" formControlName="contactEmail">
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" formControlName="phoneNumber">
            </div>

            <button type="submit" class="btn-save" [disabled]="siteSettingsForm.pristine">
              Save Changes
            </button>
          </form>
        </div>

        <!-- Email Settings -->
        <div class="settings-card">
          <h3>Email Settings</h3>
          <form [formGroup]="emailSettingsForm" (ngSubmit)="saveEmailSettings()">
            <div class="form-group">
              <label>SMTP Host</label>
              <input type="text" formControlName="smtpHost">
            </div>

            <div class="form-group">
              <label>SMTP Port</label>
              <input type="number" formControlName="smtpPort">
            </div>

            <div class="form-group">
              <label>Username</label>
              <input type="text" formControlName="smtpUsername">
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" formControlName="smtpPassword">
            </div>

            <div class="form-group checkbox">
              <label>
                <input type="checkbox" formControlName="enableSsl">
                Enable SSL
              </label>
            </div>

            <button type="submit" class="btn-save" [disabled]="emailSettingsForm.pristine">
              Save Changes
            </button>
          </form>
        </div>

        <!-- Payment Settings -->
        <div class="settings-card">
          <h3>Payment Settings</h3>
          <form [formGroup]="paymentSettingsForm" (ngSubmit)="savePaymentSettings()">
            <div class="form-group">
              <label>Stripe Public Key</label>
              <input type="text" formControlName="stripePublicKey">
            </div>

            <div class="form-group">
              <label>Stripe Secret Key</label>
              <input type="password" formControlName="stripeSecretKey">
            </div>

            <div class="form-group checkbox">
              <label>
                <input type="checkbox" formControlName="enableTestMode">
                Enable Test Mode
              </label>
            </div>

            <div class="form-group">
              <label>Currency</label>
              <select formControlName="currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <button type="submit" class="btn-save" [disabled]="paymentSettingsForm.pristine">
              Save Changes
            </button>
          </form>
        </div>

        <!-- Notification Settings -->
        <div class="settings-card">
          <h3>Notification Settings</h3>
          <form [formGroup]="notificationSettingsForm" (ngSubmit)="saveNotificationSettings()">
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" formControlName="orderNotifications">
                Order Notifications
              </label>
            </div>

            <div class="form-group checkbox">
              <label>
                <input type="checkbox" formControlName="customerNotifications">
                Customer Notifications
              </label>
            </div>

            <div class="form-group checkbox">
              <label>
                <input type="checkbox" formControlName="stockNotifications">
                Low Stock Notifications
              </label>
            </div>

            <div class="form-group">
              <label>Stock Alert Threshold</label>
              <input type="number" formControlName="stockThreshold">
            </div>

            <button type="submit" class="btn-save" [disabled]="notificationSettingsForm.pristine">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 1.5rem;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .settings-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-sm);
    }

    .settings-card h3 {
      margin: 0 0 1.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="tel"],
    .form-group input[type="number"],
    .form-group input[type="password"],
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-group.checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group.checkbox label {
      margin: 0;
      cursor: pointer;
    }

    .form-group.checkbox input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      margin: 0;
    }

    .btn-save {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: var(--border-radius);
      background: var(--primary-color);
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      background: var(--primary-dark);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  siteSettingsForm!: FormGroup;
  emailSettingsForm!: FormGroup;
  paymentSettingsForm!: FormGroup;
  notificationSettingsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminDataService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private initializeForms(): void {
    this.siteSettingsForm = this.fb.group({
      siteName: ['', Validators.required],
      siteDescription: [''],
      contactEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });

    this.emailSettingsForm = this.fb.group({
      smtpHost: ['', Validators.required],
      smtpPort: ['', [Validators.required, Validators.min(1)]],
      smtpUsername: ['', Validators.required],
      smtpPassword: ['', Validators.required],
      enableSsl: [true]
    });

    this.paymentSettingsForm = this.fb.group({
      stripePublicKey: ['', Validators.required],
      stripeSecretKey: ['', Validators.required],
      enableTestMode: [true],
      currency: ['USD', Validators.required]
    });

    this.notificationSettingsForm = this.fb.group({
      orderNotifications: [true],
      customerNotifications: [true],
      stockNotifications: [true],
      stockThreshold: [10, [Validators.required, Validators.min(1)]]
    });
  }

  private loadSettings(): void {
    // Here you would typically load settings from your backend
    // For now we'll just simulate it
    setTimeout(() => {
      this.siteSettingsForm.patchValue({
        siteName: 'Fashion Store',
        siteDescription: 'Your one-stop fashion destination',
        contactEmail: 'contact@fashionstore.com',
        phoneNumber: '+1 234 567 890'
      });

      this.emailSettingsForm.patchValue({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: 'noreply@fashionstore.com',
        enableSsl: true
      });

      this.paymentSettingsForm.patchValue({
        enableTestMode: true,
        currency: 'USD'
      });

      this.notificationSettingsForm.patchValue({
        orderNotifications: true,
        customerNotifications: true,
        stockNotifications: true,
        stockThreshold: 10
      });
    }, 1000);
  }

  saveSiteSettings(): void {
    if (this.siteSettingsForm.valid) {
      console.log('Saving site settings:', this.siteSettingsForm.value);
      // Implement save logic
    }
  }

  saveEmailSettings(): void {
    if (this.emailSettingsForm.valid) {
      console.log('Saving email settings:', this.emailSettingsForm.value);
      // Implement save logic
    }
  }

  savePaymentSettings(): void {
    if (this.paymentSettingsForm.valid) {
      console.log('Saving payment settings:', this.paymentSettingsForm.value);
      // Implement save logic
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationSettingsForm.valid) {
      console.log('Saving notification settings:', this.notificationSettingsForm.value);
      // Implement save logic
    }
  }
}