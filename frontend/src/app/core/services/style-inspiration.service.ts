import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface StyleInspiration {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class StyleInspirationService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;
  getStyleInspirations(): Observable<{ inspirations: StyleInspiration[] }> {
    //return this.http.get<{ inspirations: StyleInspiration[] }>('/api/style-inspiration');
 
  return this.http.get<any>(`${this.apiUrl}/api/style-inspiration`);

 
  }
}
