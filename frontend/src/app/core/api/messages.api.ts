import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesApi {
  constructor(private http: HttpClient) {}

  listConversations(): Observable<any> {
    return this.http.get('/api/messages/conversations');
  }

  getConversation(conversationId: string): Observable<any> {
    return this.http.get(`/api/messages/conversations/${conversationId}`);
  }

  sendMessage(message: any): Observable<any> {
    return this.http.post('/api/messages/send', message);
  }
}

