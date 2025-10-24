import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FileUploadDialogComponent, FileUploadDialogData } from '../file-upload-dialog/file-upload-dialog.component';

@Component({
    selector: 'app-upload-button',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
    template: `
        <button
            mat-raised-button
            [color]="color"
            [disabled]="disabled"
            (click)="openUploadDialog()">
            <mat-icon *ngIf="icon">{{icon}}</mat-icon>
            {{label}}
        </button>
    `
})
export class UploadButtonComponent {
    @Input() type: FileUploadDialogData['type'] = 'content';
    @Input() title = 'Upload Files';
    @Input() acceptedTypes?: string;
    @Input() maxFileSize?: number;
    @Input() multiple = false;
    @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
    @Input() label = 'Upload';
    @Input() icon?: string;
    @Input() disabled = false;

    @Output() uploaded = new EventEmitter<string[]>();

    constructor(private dialog: MatDialog) {}

    openUploadDialog(): void {
        const dialogRef = this.dialog.open(FileUploadDialogComponent, {
            width: '500px',
            data: {
                type: this.type,
                title: this.title,
                acceptedTypes: this.acceptedTypes,
                maxFileSize: this.maxFileSize,
                multiple: this.multiple
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && Array.isArray(result)) {
                this.uploaded.emit(result);
            }
        });
    }
}