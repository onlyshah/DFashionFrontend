import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeApi {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getSuggestedUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/suggested`);
  }

  getStoryPreview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stories/preview`);
  }

  togglePostNotification(postId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}/notification`, {});
  }
}
