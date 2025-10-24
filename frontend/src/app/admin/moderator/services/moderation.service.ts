import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContentReport } from '../models/content-report.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ModerationService {
    private apiUrl = `${environment.apiUrl}/moderation`;
    private reportsSubject = new BehaviorSubject<ContentReport[]>([]);
    public reports$ = this.reportsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadReports();
    }

    loadReports(): void {
        this.http.get<ContentReport[]>(`${this.apiUrl}/reports`)
            .subscribe(reports => this.reportsSubject.next(reports));
    }

    getReport(id: string): Observable<ContentReport> {
        return this.http.get<ContentReport>(`${this.apiUrl}/reports/${id}`);
    }

    assignReport(reportId: string, moderatorId: string): Observable<ContentReport> {
        return this.http.patch<ContentReport>(`${this.apiUrl}/reports/${reportId}/assign`, { moderatorId })
            .pipe(map(report => {
                const reports = this.reportsSubject.value;
                const index = reports.findIndex(r => r.id === report.id);
                if (index !== -1) {
                    reports[index] = report;
                    this.reportsSubject.next([...reports]);
                }
                return report;
            }));
    }

    updateReportStatus(reportId: string, status: ContentReport['status'], resolution?: string): Observable<ContentReport> {
        return this.http.patch<ContentReport>(`${this.apiUrl}/reports/${reportId}/status`, { status, resolution })
            .pipe(map(report => {
                const reports = this.reportsSubject.value;
                const index = reports.findIndex(r => r.id === report.id);
                if (index !== -1) {
                    reports[index] = report;
                    this.reportsSubject.next([...reports]);
                }
                return report;
            }));
    }

    addEvidence(reportId: string, evidenceUrls: string[]): Observable<ContentReport> {
        return this.http.post<ContentReport>(`${this.apiUrl}/reports/${reportId}/evidence`, { evidenceUrls })
            .pipe(map(report => {
                const reports = this.reportsSubject.value;
                const index = reports.findIndex(r => r.id === report.id);
                if (index !== -1) {
                    reports[index] = report;
                    this.reportsSubject.next([...reports]);
                }
                return report;
            }));
    }

    deleteReport(reportId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}`)
            .pipe(map(() => {
                const reports = this.reportsSubject.value.filter(r => r.id !== reportId);
                this.reportsSubject.next(reports);
            }));
    }
}