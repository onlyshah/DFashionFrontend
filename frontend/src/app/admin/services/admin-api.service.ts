import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface DashboardMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  monthlyGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
  todaySales: number;
  salesGrowth: number;
  lowStockProducts: number;
  totalCustomers: number;
  newCustomers: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: Date;
    products: string;
    total: number;
  }>;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  // backend routes are mounted under /api/admin
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient, private adminAuth: AdminAuthService) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getProducts(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { params });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  createCategory(category: any): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: string, category: any): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/brands`);
  }

  getUsers(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  activateUser(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/activate`, {});     
  }

  getSuperAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/super-admin`);
  }

  getGeneralDashboardData(): Observable<DashboardMetrics> {
    const headers = this.getHeaders();
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard/metrics`, { headers });
  }
}
