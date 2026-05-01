import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressesApi {
  constructor(private http: HttpClient) {}

  listAddresses(): Observable<any> {
    return this.http.get('/api/addresses');
  }

  createAddress(addressData: any): Observable<any> {
    return this.http.post('/api/addresses', addressData);
  }
}

