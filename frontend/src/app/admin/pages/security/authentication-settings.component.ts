import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-authentication-settings',
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
        <h1>Authentication Settings</h1>
        <p>Configure authentication and security policies</p>
      </div>
      <div class="settings-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Security Policies</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="authForm" class="settings-form">
              <div class="setting-item">
                <label>
                  <input type="checkbox" formControlName="twoFactorAuth">
                  <span>Two-Factor Authentication (2FA)</span>
                </label>
                <p class="help-text">Require users to verify their identity with an additional step</p>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" formControlName="sessionTimeout">
                  <span>Auto Session Timeout</span>
                </label>
                <p class="help-text">Automatically log out inactive users</p>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" formControlName="passwordPolicy">
                  <span>Enforce Strong Passwords</span>
                </label>
                <p class="help-text">Require minimum complexity and length</p>
              </div>
              <div class="setting-item">
                <label>
                  <input type="checkbox" formControlName="loginAttempts">
                  <span>Login Attempt Limits</span>
                </label>
                <p class="help-text">Lock account after failed attempts</p>
              </div>
              <button mat-raised-button color="primary" class="save-btn">Save Settings</button>
            </form>
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
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
    .settings-form { display: flex; flex-direction: column; gap: 16px; }
    .setting-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .setting-item:last-child { border-bottom: none; }
    .setting-item label { display: flex; align-items: center; cursor: pointer; font-weight: 500; }
    .setting-item input[type="checkbox"] { margin-right: 12px; width: 18px; height: 18px; cursor: pointer; }
    .help-text { margin: 8px 0 0 30px; font-size: 12px; color: #999; }
    .save-btn { margin-top: 16px; }
  `]
})
export class AuthenticationSettingsComponent implements OnInit {
  authForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.authForm = this.fb.group({
      twoFactorAuth: [false],
      sessionTimeout: [true],
      passwordPolicy: [true],
      loginAttempts: [true]
    });
  }
}
