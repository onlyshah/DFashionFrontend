import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReturnsApi {
  constructor(private http: HttpClient) {}

  listReturns(): Observable<any> {
    return this.http.get('/api/returns');
  }

  cancelReturn(returnId: string): Observable<any> {
    return this.http.post(`/api/returns/${returnId}/cancel`, {});
  }
}

