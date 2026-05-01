import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContentCreationApi {
  constructor(private http: HttpClient) {}

  startLive(formData: FormData): Observable<any> {
    return this.http.post('/api/live/start', formData);
  }

  sendLiveChat(payload: any): Observable<any> {
    return this.http.post('/api/live/chat', payload);
  }

  endLive(): Observable<any> {
    return this.http.post('/api/live/end', {});
  }

  createStory(formData: FormData): Observable<any> {
    return this.http.post('/api/stories', formData);
  }

  searchProducts(query: string, limit: number = 10): Observable<any> {
    return this.http.get(`/api/products?search=${encodeURIComponent(query)}&limit=${limit}`);
  }

  createPost(formData: FormData): Observable<any> {
    return this.http.post('/api/posts', formData);
  }

  createReel(formData: FormData): Observable<any> {
    return this.http.post('/api/reels', formData);
  }
}

