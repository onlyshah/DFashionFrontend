import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsApi {
  constructor(private http: HttpClient) {}

  list(): Observable<any> {
    return this.http.get('/api/payment-methods');
  }

  setDefault(methodId: string): Observable<any> {
    return this.http.patch(`/api/payment-methods/${methodId}/set-default`, {});
  }

  delete(methodId: string): Observable<any> {
    return this.http.delete(`/api/payment-methods/${methodId}`);
  }
}

