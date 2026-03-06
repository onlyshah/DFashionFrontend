import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-privacy-compliance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Privacy & Compliance</h1>
        <p>Manage privacy policies and compliance settings</p>
      </div>
      <div class="compliance-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Privacy Policies</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="privacyForm" class="compliance-form">
              <div class="compliance-item">
                <label>
                  <input type="checkbox" formControlName="gdprCompliant">
                  <span>GDPR Compliant</span>
                </label>
                <p class="help-text">General Data Protection Regulation (EU)</p>
              </div>
              <div class="compliance-item">
                <label>
                  <input type="checkbox" formControlName="ccpaCompliant">
                  <span>CCPA Compliant</span>
                </label>
                <p class="help-text">California Consumer Privacy Act</p>
              </div>
              <div class="compliance-item">
                <label>
                  <input type="checkbox" formControlName="dataEncryption">
                  <span>Data Encryption Required</span>
                </label>
                <p class="help-text">Encrypt sensitive user data at rest</p>
              </div>
              <div class="compliance-item">
                <label>
                  <input type="checkbox" formControlName="userConsent">
                  <span>Require User Consent</span>
                </label>
                <p class="help-text">Obtain explicit consent for data processing</p>
              </div>
              <button mat-raised-button color="primary" class="save-btn">Save Policies</button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Compliance Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-list">
              <div class="status-item">
                <mat-icon class="success">check_circle</mat-icon>
                <span>Privacy Policy</span>
              </div>
              <div class="status-item">
                <mat-icon class="success">check_circle</mat-icon>
                <span>Terms of Service</span>
              </div>
              <div class="status-item">
                <mat-icon class="warning">info</mat-icon>
                <span>Pending GDPR Review</span>
              </div>
              <div class="compliance-score">
                <p>Overall Compliance: <strong>85%</strong></p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .page-header p { margin: 0; color: #666; }
    .compliance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
    .compliance-form { display: flex; flex-direction: column; gap: 16px; }
    .compliance-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .compliance-item:last-child { border-bottom: none; }
    .compliance-item label { display: flex; align-items: center; cursor: pointer; font-weight: 500; }
    .compliance-item input[type="checkbox"] { margin-right: 12px; width: 18px; height: 18px; cursor: pointer; }
    .help-text { margin: 8px 0 0 30px; font-size: 12px; color: #999; }
    .save-btn { margin-top: 16px; }
    .status-list { display: flex; flex-direction: column; gap: 16px; }
    .status-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9f9f9; border-radius: 4px; }
    .status-item mat-icon { min-width: 24px; width: 24px; }
    .status-item mat-icon.success { color: #4caf50; }
    .status-item mat-icon.warning { color: #ff9800; }
    .compliance-score { margin-top: 12px; padding: 16px; background: #e3f2fd; border-radius: 4px; }
    .compliance-score p { margin: 0; font-size: 16px; color: #1976d2; }
  `]
})
export class PrivacyComplianceComponent implements OnInit {
  privacyForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.privacyForm = this.fb.group({
      gdprCompliant: [true],
      ccpaCompliant: [true],
      dataEncryption: [true],
      userConsent: [true]
    });
  }
}
