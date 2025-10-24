import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FileUploadComponent } from '../file-upload/file-upload.component';

export interface FileUploadDialogData {
    type: 'product' | 'content' | 'profile' | 'evidence';
    title: string;
    acceptedTypes?: string;
    maxFileSize?: number;
    multiple?: boolean;
}

@Component({
    selector: 'app-file-upload-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, FileUploadComponent],
    template: `
        <h2 mat-dialog-title>{{ data.title }}</h2>
        
        <mat-dialog-content>
            <app-file-upload
                [uploadType]="mapType(data.type)"
                [multiple]="data.multiple"
                (uploadComplete)="onUploadComplete($event)">
            </app-file-upload>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button [mat-dialog-close]="null">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="isUploading" (click)="completeUpload()">
                Done
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .upload-zone {
            border: 2px dashed #ccc;
            border-radius: 4px;
            padding: 20px;
            text-align: center;
            background: #fafafa;
            transition: all 0.3s ease;
            margin-bottom: 16px;

            &.dragover {
                border-color: #2196f3;
                background: #e3f2fd;
            }
        }

        .upload-prompt {
            p {
                margin: 8px 0;
                color: #666;
            }
        }

        .file-info {
            margin-top: 8px;
            color: #666;
            font-size: 0.875rem;

            small {
                display: block;
                line-height: 1.4;
            }
        }

        .upload-list {
            max-height: 300px;
            overflow-y: auto;
        }
    `]
})
export class FileUploadDialogComponent {
    isDragging = false;
    isUploading = false;
    completedUrls: string[] = [];

    constructor(
        private dialogRef: MatDialogRef<FileUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FileUploadDialogData
    ) {}

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
        // Delegated to embedded <app-file-upload> component via template
    }

    onFileSelected(event: Event): void {
        // Delegated to embedded <app-file-upload> component
    }

    // Called by the embedded FileUploadComponent when uploads complete
    onUploadComplete(urls: string[]): void {
        this.completedUrls = urls;
        this.isUploading = false;
    }


    completeUpload(): void {
        this.dialogRef.close(this.completedUrls);
    }
}