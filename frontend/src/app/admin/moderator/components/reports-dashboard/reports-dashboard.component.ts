import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModerationService } from '../../services/moderation.service';
import { ContentReport } from '../../models/content-report.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
    selector: 'app-reports-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="reports-dashboard">
            <header class="dashboard-header">
                <h1>Content Moderation Dashboard</h1>
                <div class="actions">
                    <button class="btn btn-primary" (click)="filterReports('pending')">Pending</button>
                    <button class="btn btn-secondary" (click)="filterReports('reviewing')">Reviewing</button>
                    <button class="btn btn-success" (click)="filterReports('resolved')">Resolved</button>
                </div>
            </header>

            <div class="reports-grid" *ngIf="reports$ | async as reports">
                <div class="report-card" *ngFor="let report of reports">
                    <div class="report-header">
                        <span class="report-type">{{report.contentType}}</span>
                        <span class="report-status" [class]="report.status">{{report.status}}</span>
                    </div>
                    <div class="report-body">
                        <p class="report-reason">{{report.reason}}</p>
                        <p class="report-description" *ngIf="report.description">{{report.description}}</p>
                    </div>
                    <div class="report-footer">
                        <button class="btn btn-sm" (click)="assignReport(report)">
                            {{report.assignedTo ? 'Reassign' : 'Assign'}}
                        </button>
                        <button class="btn btn-sm" (click)="reviewReport(report)">Review</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .reports-dashboard {
            padding: 20px;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }

        .report-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
        }

        .report-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .report-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .report-status.pending { background: #fff3cd; }
        .report-status.reviewing { background: #cfe2ff; }
        .report-status.resolved { background: #d1e7dd; }
        .report-status.rejected { background: #f8d7da; }
    `]
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
    reports$: Observable<ContentReport[]>;
    private destroy$ = new Subject<void>();

    constructor(
        private moderationService: ModerationService,
        private webSocketService: WebSocketService
    ) {
        this.reports$ = this.moderationService.reports$;
    }

    ngOnInit(): void {
        this.moderationService.loadReports();
        this.setupWebSocket();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupWebSocket(): void {
        this.webSocketService.onContentUpdate()
            .pipe(takeUntil(this.destroy$))
            .subscribe(message => {
                if (message.data.action === 'new_report' || message.data.action === 'report_updated') {
                    this.moderationService.loadReports();
                }
            });
    }

    filterReports(status: ContentReport['status']): void {
        // TODO: Implement filtering logic
    }

    assignReport(report: ContentReport): void {
        this.moderationService.assignReport(report.id, 'currentModeratorId')
            .subscribe(() => {
                // Notification handled by error interceptor
            });
    }

    reviewReport(report: ContentReport): void {
        // TODO: Implement review dialog
    }
}