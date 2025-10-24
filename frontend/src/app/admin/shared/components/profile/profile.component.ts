import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadComponent } from '../../../../shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    FileUploadComponent
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Profile Settings</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <mat-tab-group>
            <!-- Personal Information -->
            <mat-tab label="Personal Information">
              <form [formGroup]="personalForm" class="form-container" (ngSubmit)="onPersonalSubmit()">
                <div class="avatar-container">
                  <img [src]="avatarUrl || 'assets/images/default-avatar.png'" alt="Profile picture" class="avatar">
                  <app-file-upload
                    uploadType="profile"
                    [multiple]="false"
                    (uploadComplete)="onAvatarUploaded($event)">
                  </app-file-upload>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="fullName" placeholder="Enter your full name">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" placeholder="Enter your email" type="email">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" placeholder="Enter your phone number">
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" [disabled]="personalForm.invalid">
                  Save Changes
                </button>
              </form>
            </mat-tab>

            <!-- Security -->
            <mat-tab label="Security">
              <form [formGroup]="securityForm" class="form-container" (ngSubmit)="onSecuritySubmit()">
                <mat-form-field appearance="outline">
                  <mat-label>Current Password</mat-label>
                  <input matInput formControlName="currentPassword" type="password">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <input matInput formControlName="newPassword" type="password">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Confirm Password</mat-label>
                  <input matInput formControlName="confirmPassword" type="password">
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" [disabled]="securityForm.invalid">
                  Update Password
                </button>
              </form>
            </mat-tab>

            <!-- Notifications -->
            <mat-tab label="Notifications">
              <form [formGroup]="notificationForm" class="form-container" (ngSubmit)="onNotificationSubmit()">
                <!-- Add notification preferences here -->
              </form>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-card {
      margin-bottom: 20px;
    }

    .form-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .avatar-container {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;

      .avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    @media (max-width: 600px) {
      .profile-container {
        padding: 10px;
      }

      .form-container {
        padding: 10px;
      }

      .avatar-container {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  personalForm!: FormGroup;
  securityForm!: FormGroup;
  notificationForm!: FormGroup;
  avatarUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // TODO: Load user data
  }

  private initializeForms(): void {
    this.personalForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      marketingEmails: [false]
    });
  }

  onAvatarUploaded(urls: string[]): void {
    if (urls && urls.length > 0) {
      this.avatarUrl = urls[0];
    }
  }

  onPersonalSubmit(): void {
    if (this.personalForm.valid) {
      // TODO: Submit personal info changes
      console.log('Personal form:', this.personalForm.value);
    }
  }

  onSecuritySubmit(): void {
    if (this.securityForm.valid) {
      // TODO: Submit security changes
      console.log('Security form:', this.securityForm.value);
    }
  }

  onNotificationSubmit(): void {
    if (this.notificationForm.valid) {
      // TODO: Submit notification preferences
      console.log('Notification form:', this.notificationForm.value);
    }
  }
}