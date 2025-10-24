import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FinanceService } from '../../services/finance.service';
import { Transaction, FinancialSummary } from '../../models/transaction.model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
    selector: 'app-finance-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTabsModule,
        MatProgressBarModule,
        MatChipsModule,
        MatButtonToggleModule
    ],
    template: `
        <div class="finance-dashboard">
            <header class="dashboard-header">
                <div class="header-content">
                    <h1>Financial Dashboard</h1>
                    <div class="period-selector">
                        <mat-button-toggle-group [value]="currentPeriod">
                            <mat-button-toggle value="daily" (click)="changePeriod('daily')">
                                <mat-icon>today</mat-icon>
                                Daily
                            </mat-button-toggle>
                            <mat-button-toggle value="weekly" (click)="changePeriod('weekly')">
                                <mat-icon>view_week</mat-icon>
                                Weekly
                            </mat-button-toggle>
                            <mat-button-toggle value="monthly" (click)="changePeriod('monthly')">
                                <mat-icon>calendar_today</mat-icon>
                                Monthly
                            </mat-button-toggle>
                        </mat-button-toggle-group>
                    </div>
                </div>
                <div class="header-actions">
                    <button mat-raised-button color="primary">
                        <mat-icon>download</mat-icon>
                        Export Report
                    </button>
                </div>
            </header>

            <div class="summary-cards" *ngIf="summary$ | async as summary">
                <mat-card class="summary-card revenue">
                    <mat-card-content>
                        <div class="metric-content">
                            <div class="metric-info">
                                <h3>Total Revenue</h3>
                                <p class="amount">{{summary.totalRevenue | currency}}</p>
                                <mat-progress-bar mode="determinate" [value]="getProgressValue(summary.totalRevenue)">
                                </mat-progress-bar>
                            </div>
                            <mat-icon class="metric-icon" color="primary">payments</mat-icon>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="summary-card payouts">
                    <mat-card-content>
                        <div class="metric-content">
                            <div class="metric-info">
                                <h3>Total Payouts</h3>
                                <p class="amount">{{summary.totalPayouts | currency}}</p>
                                <mat-progress-bar mode="determinate" [value]="getProgressValue(summary.totalPayouts)">
                                </mat-progress-bar>
                            </div>
                            <mat-icon class="metric-icon" color="accent">account_balance_wallet</mat-icon>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="summary-card refunds">
                    <mat-card-content>
                        <div class="metric-info">
                            <div class="metric-content">
                                <h3>Total Refunds</h3>
                                <p class="amount negative">{{summary.totalRefunds | currency}}</p>
                                <mat-progress-bar mode="determinate" [value]="getProgressValue(summary.totalRefunds)" color="warn">
                                </mat-progress-bar>
                            </div>
                            <mat-icon class="metric-icon" color="warn">receipt_long</mat-icon>
                        </div>
                    </mat-card-content>
                </mat-card>

                <mat-card class="summary-card commissions">
                    <mat-card-content>
                        <div class="metric-content">
                            <div class="metric-info">
                                <h3>Total Commissions</h3>
                                <p class="amount">{{summary.totalCommissions | currency}}</p>
                                <mat-progress-bar mode="determinate" [value]="getProgressValue(summary.totalCommissions)">
                                </mat-progress-bar>
                            </div>
                            <mat-icon class="metric-icon" color="primary">account_balance</mat-icon>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>

            <mat-card class="transactions-section">
                <mat-card-header>
                    <mat-card-title>Recent Transactions</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                    <table mat-table [dataSource]="transactions$ | async" class="transactions-table">
                        <!-- Type Column -->
                        <ng-container matColumnDef="type">
                            <th mat-header-cell *matHeaderCellDef>Type</th>
                            <td mat-cell *matCellDef="let transaction">
                                <mat-chip-list>
                                    <mat-chip [color]="getTransactionColor(transaction.type)" selected>
                                        {{transaction.type}}
                                    </mat-chip>
                                </mat-chip-list>
                            </td>
                        </ng-container>

                        <!-- Amount Column -->
                        <ng-container matColumnDef="amount">
                            <th mat-header-cell *matHeaderCellDef>Amount</th>
                            <td mat-cell *matCellDef="let transaction" [class.negative]="transaction.type === 'refund'">
                                {{transaction.amount | currency:transaction.currency}}
                            </td>
                        </ng-container>

                        <!-- Date Column -->
                        <ng-container matColumnDef="date">
                            <th mat-header-cell *matHeaderCellDef>Date</th>
                            <td mat-cell *matCellDef="let transaction">
                                {{transaction.createdAt | date:'medium'}}
                            </td>
                        </ng-container>

                        <!-- Status Column -->
                        <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Status</th>
                            <td mat-cell *matCellDef="let transaction">
                                <mat-chip [color]="getStatusColor(transaction.status)" selected>
                                    {{transaction.status}}
                                </mat-chip>
                            </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                    </table>
                </mat-card-content>
            </mat-card>
        </div>
    `,
    styles: [`
        .finance-dashboard {
            padding: 20px;
            max-width: 1600px;
            margin: 0 auto;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .header-content {
            h1 {
                margin: 0 0 16px 0;
                font-size: 2rem;
                font-weight: 500;
            }
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .metric-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
        }

        .metric-info {
            flex: 1;

            h3 {
                margin: 0;
                color: rgba(0, 0, 0, 0.6);
                font-size: 1rem;
                font-weight: normal;
            }
        }

        .amount {
            font-size: 2rem;
            font-weight: 500;
            margin: 8px 0;
        }

        .metric-icon {
            font-size: 36px;
            width: 36px;
            height: 36px;
        }

        .transactions-section {
            margin-top: 24px;
        }

        .transactions-table {
            width: 100%;
        }

        .negative {
            color: #f44336;
        }

        // Responsive Design
        @media screen and (max-width: 768px) {
            .finance-dashboard {
                padding: 16px;
            }

            .dashboard-header {
                flex-direction: column;
                align-items: stretch;
            }

            .header-actions {
                width: 100%;

                button {
                    width: 100%;
                }
            }

            .summary-cards {
                grid-template-columns: 1fr;
            }

            .amount {
                font-size: 1.5rem;
            }
        }
    `]
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {
    transactions$: Observable<Transaction[]>;
    summary$!: Observable<FinancialSummary>;
    displayedColumns = ['type', 'amount', 'date', 'status'];
    private destroy$ = new Subject<void>();
    currentPeriod: FinancialSummary['period'] = 'daily';

    constructor(
        private financeService: FinanceService,
        private webSocketService: WebSocketService
    ) {
        this.transactions$ = this.financeService.transactions$;
    }

    ngOnInit(): void {
        this.financeService.loadTransactions();
        this.loadSummary(this.currentPeriod);
        this.setupWebSocket();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupWebSocket(): void {
        this.webSocketService.onMessage()
            .pipe(takeUntil(this.destroy$))
            .subscribe(message => {
                if (message.type === 'order_update' || message.type === 'system_alert') {
                    this.financeService.loadTransactions();
                    this.loadSummary(this.currentPeriod);
                }
            });
    }

    changePeriod(period: FinancialSummary['period']): void {
        this.currentPeriod = period;
        this.loadSummary(period);
    }

    private loadSummary(period: FinancialSummary['period']): void {
        this.summary$ = this.financeService.getFinancialSummary(period);
    }

    getProgressValue(amount: number): number {
        // Calculate progress value based on the maximum value in the current period
        const maxValue = 100000; // TODO: Get this from the service
        return (amount / maxValue) * 100;
    }

    getTransactionColor(type: string): 'primary' | 'accent' | 'warn' {
        switch (type.toLowerCase()) {
            case 'sale':
                return 'primary';
            case 'payout':
                return 'accent';
            case 'refund':
                return 'warn';
            default:
                return 'primary';
        }
    }

    getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'primary';
            case 'pending':
                return 'accent';
            case 'failed':
            case 'disputed':
                return 'warn';
            default:
                return 'primary';
        }
    }
}