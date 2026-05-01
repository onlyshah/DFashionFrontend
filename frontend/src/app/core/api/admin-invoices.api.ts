import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminInvoicesApi {
  constructor(private http: HttpClient) {}

  listInvoices(): Observable<any> {
    return this.http.get('/api/admin/invoices');
  }
}

