import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
  growth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private chartsSubject = new BehaviorSubject<{[key: string]: ChartData}>({});

  stats$ = this.statsSubject.asObservable();
  charts$ = this.chartsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Dashboard Stats
  loadDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`).pipe(
      tap(stats => this.statsSubject.next(stats)),
      catchError(this.handleError)
    );
  }

  // Chart Data
  loadChartData(chartType: string): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.apiUrl}/charts/${chartType}`).pipe(
      tap(data => {
        const currentCharts = this.chartsSubject.value;
        this.chartsSubject.next({
          ...currentCharts,
          [chartType]: data
        });
      }),
      catchError(this.handleError)
    );
  }

  // Users Management
  getUsers(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Products Management
  getProducts(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(productId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${productId}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Orders Management
  getOrders(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${orderId}/status`, { status }).pipe(
      catchError(this.handleError)
    );
  }

  // Analytics
  getAnalytics(period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`, { params: { period } }).pipe(
      catchError(this.handleError)
    );
  }

  // Reports
  generateReport(type: string, params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/${type}`, { 
      params,
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error Handling
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}