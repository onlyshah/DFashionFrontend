import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsApi {
  constructor(private http: HttpClient) {}

  getPost(postId: string): Observable<any> {
    return this.http.get(`/api/posts/${postId}`);
  }

  getComments(postId: string): Observable<any> {
    return this.http.get(`/api/posts/${postId}/comments`);
  }

  likePost(postId: string): Observable<any> {
    return this.http.post(`/api/post-likes/${postId}`, {});
  }

  savePost(postId: string): Observable<any> {
    return this.http.post(`/api/posts/${postId}/save`, {});
  }

  addComment(postId: string, commentPayload: any): Observable<any> {
    return this.http.post(`/api/posts/${postId}/comments`, commentPayload);
  }
}

