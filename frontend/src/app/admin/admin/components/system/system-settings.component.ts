import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="settings-container">
      <header class="page-header">
        <h1>System Settings</h1>
        <button mat-raised-button color="primary" (click)="saveSettings()">
          <mat-icon>save</mat-icon>
          Save Changes
        </button>
      </header>

      <mat-tab-group>
        <mat-tab label="General">
          <form [formGroup]="generalForm" class="settings-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>General Settings</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-grid">
                  <mat-form-field>
                    <mat-label>Site Name</mat-label>
                    <input matInput formControlName="siteName">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Admin Email</mat-label>
                    <input matInput formControlName="adminEmail" type="email">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Default Language</mat-label>
                    <mat-select formControlName="defaultLanguage">
                      <mat-option value="en">English</mat-option>
                      <mat-option value="es">Spanish</mat-option>
                      <mat-option value="fr">French</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Timezone</mat-label>
                    <mat-select formControlName="timezone">
                      <mat-option value="UTC">UTC</mat-option>
                      <mat-option value="EST">EST</mat-option>
                      <mat-option value="PST">PST</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div class="toggle-options">
                  <mat-slide-toggle formControlName="maintenanceMode">
                    Maintenance Mode
                  </mat-slide-toggle>

                  <mat-slide-toggle formControlName="userRegistration">
                    Allow User Registration
                  </mat-slide-toggle>

                  <mat-slide-toggle formControlName="emailNotifications">
                    Enable Email Notifications
                  </mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
          </form>
        </mat-tab>

        <mat-tab label="Security">
          <form [formGroup]="securityForm" class="settings-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Security Settings</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-grid">
                  <mat-form-field>
                    <mat-label>Session Timeout (minutes)</mat-label>
                    <input matInput type="number" formControlName="sessionTimeout">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Password Policy</mat-label>
                    <mat-select formControlName="passwordPolicy">
                      <mat-option value="low">Low</mat-option>
                      <mat-option value="medium">Medium</mat-option>
                      <mat-option value="high">High</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Max Login Attempts</mat-label>
                    <input matInput type="number" formControlName="maxLoginAttempts">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Lockout Duration (minutes)</mat-label>
                    <input matInput type="number" formControlName="lockoutDuration">
                  </mat-form-field>
                </div>

                <div class="toggle-options">
                  <mat-slide-toggle formControlName="twoFactorAuth">
                    Require Two-Factor Authentication
                  </mat-slide-toggle>

                  <mat-slide-toggle formControlName="sslEnabled">
                    Force SSL
                  </mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
          </form>
        </mat-tab>

        <mat-tab label="Performance">
          <form [formGroup]="performanceForm" class="settings-form">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Performance Settings</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-grid">
                  <mat-form-field>
                    <mat-label>Cache Duration (minutes)</mat-label>
                    <input matInput type="number" formControlName="cacheDuration">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Maximum Upload Size (MB)</mat-label>
                    <input matInput type="number" formControlName="maxUploadSize">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Request Timeout (seconds)</mat-label>
                    <input matInput type="number" formControlName="requestTimeout">
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>Image Quality (%)</mat-label>
                    <input matInput type="number" formControlName="imageQuality">
                  </mat-form-field>
                </div>

                <div class="toggle-options">
                  <mat-slide-toggle formControlName="cacheEnabled">
                    Enable Caching
                  </mat-slide-toggle>

                  <mat-slide-toggle formControlName="minifyAssets">
                    Minify Assets
                  </mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
          </form>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 {
        margin: 0;
        font-size: 2rem;
        font-weight: 500;
      }
    }

    .settings-form {
      padding: 20px 0;

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }

      .toggle-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 600px) {
      .settings-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;

        button {
          width: 100%;
        }
      }

      .form-grid {
        grid-template-columns: 1fr !important;
      }

      .toggle-options {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  generalForm!: FormGroup;
  securityForm!: FormGroup;
  performanceForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForms();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private createForms(): void {
    this.generalForm = this.fb.group({
      siteName: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      defaultLanguage: ['en', Validators.required],
      timezone: ['UTC', Validators.required],
      maintenanceMode: [false],
      userRegistration: [true],
      emailNotifications: [true]
    });

    this.securityForm = this.fb.group({
      sessionTimeout: [30, [Validators.required, Validators.min(1)]],
      passwordPolicy: ['medium', Validators.required],
      maxLoginAttempts: [5, [Validators.required, Validators.min(1)]],
      lockoutDuration: [30, [Validators.required, Validators.min(1)]],
      twoFactorAuth: [false],
      sslEnabled: [true]
    });

    this.performanceForm = this.fb.group({
      cacheDuration: [60, [Validators.required, Validators.min(1)]],
      maxUploadSize: [10, [Validators.required, Validators.min(1)]],
      requestTimeout: [30, [Validators.required, Validators.min(1)]],
      imageQuality: [80, [Validators.required, Validators.min(1), Validators.max(100)]],
      cacheEnabled: [true],
      minifyAssets: [true]
    });
  }

  private loadSettings(): void {
    // TODO: Load settings from service
    console.log('Loading settings...');
  }

  saveSettings(): void {
    if (
      this.generalForm.valid &&
      this.securityForm.valid &&
      this.performanceForm.valid
    ) {
      const settings = {
        general: this.generalForm.value,
        security: this.securityForm.value,
        performance: this.performanceForm.value
      };
      
      // TODO: Save settings using service
      console.log('Saving settings:', settings);
    }
  }
}