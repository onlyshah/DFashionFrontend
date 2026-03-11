import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-chatbot-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Chatbot Settings</h1>
        <p>Configure AI chatbot and automation rules</p>
      </div>
      <div class="settings-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Chatbot Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-row">
              <label>Enable Chatbot</label>
              <mat-slide-toggle [formControl]="chatbotStatus" color="primary"></mat-slide-toggle>
            </div>
            <div class="status-info">
              <p><strong>Status:</strong> {{ chatbotStatus.value ? 'Active' : 'Inactive' }}</p>
              <p><strong>Response Time:</strong> ~2 seconds</p>
              <p><strong>Current Users:</strong> 1,240 active conversations</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Automation Rules</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="automationForm" class="automation-form">
              <mat-form-field appearance="outline">
                <mat-label>Auto-Response for Common Questions</mat-label>
                <input matInput formControlName="autoResponses" [disabled]="true">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Response Timeout (seconds)</mat-label>
                <input matInput type="number" formControlName="timeout" min="1" max="60">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Escalation Keywords</mat-label>
                <textarea matInput formControlName="escalationKeywords" rows="3" placeholder="Enter comma-separated keywords"></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary">Save Settings</button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Chatbot Performance</mat-card-title>
          <mat-card-subtitle>Last 7 days</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="performance-grid">
            <div class="perf-item">
              <div class="perf-label">Conversations Handled</div>
              <div class="perf-value">8,450</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">Customer Satisfaction</div>
              <div class="perf-value">94%</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">Resolution Rate</div>
              <div class="perf-value">87%</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">Avg Response Time</div>
              <div class="perf-value">2.1s</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 500; }
    .page-header p { margin: 0; color: #666; }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; margin-bottom: 24px; }
    .status-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .status-row label { font-weight: 600; margin: 0; }
    .status-info { padding: 16px 0; }
    .status-info p { margin: 8px 0; font-size: 14px; color: #666; }
    .automation-form { display: flex; flex-direction: column; gap: 16px; }
    .automation-form mat-form-field { width: 100%; }
    .performance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
    .perf-item { padding: 16px; background: #f9f9f9; border-radius: 4px; text-align: center; }
    .perf-label { font-size: 12px; color: #999; margin-bottom: 8px; }
    .perf-value { font-size: 24px; font-weight: bold; color: #1976d2; }
  `]
})
export class ChatbotSettingsComponent implements OnInit {
  chatbotStatus: FormControl<boolean> = new FormControl<boolean>(true, { nonNullable: true });
  automationForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.automationForm = this.fb.group({
      autoResponses: ['Enabled', Validators.required],
      timeout: [30, [Validators.required, Validators.min(1), Validators.max(60)]],
      escalationKeywords: ['urgent, help, emergency, complaint, refund']
    });
  }
}
