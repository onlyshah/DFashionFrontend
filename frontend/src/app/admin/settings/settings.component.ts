import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-settings',
    styleUrls: ['./settings.component.scss'],
    standalone: false,
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    generalForm!: FormGroup;
    ecommerceForm!: FormGroup;
    notificationForm!: FormGroup;
    securityForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.createForms();
        this.loadSettings();
    }

    createForms(): void {
        this.generalForm = this.fb.group({
            appName: ['DFashion', Validators.required],
            companyName: ['DFashion Inc.', Validators.required],
            supportEmail: ['support@dfashion.com', [Validators.required, Validators.email]],
            defaultCurrency: ['INR', Validators.required],
            timezone: ['Asia/Kolkata', Validators.required]
        });

        this.ecommerceForm = this.fb.group({
            storeName: ['DFashion Store', Validators.required],
            storeDescription: ['Your one-stop fashion destination'],
            taxRate: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
            shippingFee: [99, [Validators.required, Validators.min(0)]],
            freeShippingThreshold: [999, [Validators.required, Validators.min(0)]],
            enableInventoryTracking: [true],
            enableReviews: [true],
            enableWishlist: [true]
        });

        this.notificationForm = this.fb.group({
            emailNewOrders: [true],
            emailLowStock: [true],
            emailNewUsers: [false],
            emailReviews: [false],
            pushNewOrders: [true],
            pushUrgentAlerts: [true],
            pushDailyReports: [false]
        });

        this.securityForm = this.fb.group({
            sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
            passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
            requireTwoFactor: [false],
            enableLoginAttempts: [true],
            enableAuditLog: [true]
        });
    }

    loadSettings(): void {
        // In a real app, load settings from the backend
        console.log('Loading settings...');
    }

    saveGeneralSettings(): void {
        if (this.generalForm.valid) {
            console.log('Saving general settings:', this.generalForm.value);
            this.showSuccessMessage('General settings saved successfully');
        }
    }

    saveEcommerceSettings(): void {
        if (this.ecommerceForm.valid) {
            console.log('Saving e-commerce settings:', this.ecommerceForm.value);
            this.showSuccessMessage('E-commerce settings saved successfully');
        }
    }

    saveNotificationSettings(): void {
        if (this.notificationForm.valid) {
            console.log('Saving notification settings:', this.notificationForm.value);
            this.showSuccessMessage('Notification settings saved successfully');
        }
    }

    saveSecuritySettings(): void {
        if (this.securityForm.valid) {
            console.log('Saving security settings:', this.securityForm.value);
            this.showSuccessMessage('Security settings saved successfully');
        }
    }

    private showSuccessMessage(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }
}
