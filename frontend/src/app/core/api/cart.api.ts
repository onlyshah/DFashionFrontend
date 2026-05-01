import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartApi {
  constructor(private http: HttpClient) {}

  bulkAdd(items: any[]): Observable<any> {
    return this.http.post('/api/cart/bulk-add', { items });
  }
}

