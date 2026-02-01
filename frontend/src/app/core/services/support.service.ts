import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string;
  category: 'order' | 'product' | 'payment' | 'delivery' | 'account' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting-customer' | 'resolved' | 'closed';
  attachments?: string[];
  createdDate: Date;
  updatedDate: Date;
  closedDate?: Date;
  estimatedResolutionDate?: Date;
  responses: Array<{
    id: string;
    sender: 'user' | 'support';
    senderName: string;
    message: string;
    attachments?: string[];
    date: Date;
  }>;
  assignedTo?: string;
  resolution?: string;
  rating?: number;
  feedback?: string;
}

export interface TicketsResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: string;
  priority: string;
  attachments?: string[];
}

export interface ReplyToTicketRequest {
  message: string;
  attachments?: string[];
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private readonly API_URL = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /**
   * Get all support tickets for the current user
   */
  getTickets(filters: TicketFilters = {}): Observable<TicketsResponse> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log('[SupportService] Fetching tickets with filters:', filters);
    return this.http.get<TicketsResponse>(`${this.API_URL}/support/tickets`, { params })
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (getTickets):', response);
          console.log('[SupportService] Total tickets:', response.total);
        })
      );
  }

  /**
   * Get a specific support ticket by ID
   */
  getTicket(ticketId: string): Observable<{ ticket: SupportTicket }> {
    console.log('[SupportService] Fetching ticket by ID:', ticketId);
    return this.http.get<{ ticket: SupportTicket }>(`${this.API_URL}/support/tickets/${ticketId}`)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (getTicket):', response);
          console.log('[SupportService] Ticket loaded:', response.ticket?._id);
        })
      );
  }

  /**
   * Create a new support ticket
   */
  createTicket(data: CreateTicketRequest): Observable<{ message: string; ticket: SupportTicket }> {
    console.log('[SupportService] Creating ticket:', data);
    return this.http.post<{ message: string; ticket: SupportTicket }>(`${this.API_URL}/support/tickets`, data)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (createTicket):', response);
          console.log('[SupportService] Ticket created:', response.ticket?.ticketNumber);
        })
      );
  }

  /**
   * Reply to a support ticket
   */
  replyToTicket(ticketId: string, data: ReplyToTicketRequest): Observable<{ message: string; response: any }> {
    console.log('[SupportService] Replying to ticket:', ticketId);
    return this.http.post<{ message: string; response: any }>(`${this.API_URL}/support/tickets/${ticketId}/reply`, data)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (replyToTicket):', response);
          console.log('[SupportService] Reply added to ticket');
        })
      );
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(ticketId: string, status: string): Observable<{ message: string; ticket: SupportTicket }> {
    console.log('[SupportService] Updating ticket status:', ticketId, 'to:', status);
    return this.http.put<{ message: string; ticket: SupportTicket }>(`${this.API_URL}/support/tickets/${ticketId}/status`, { status })
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (updateTicketStatus):', response);
          console.log('[SupportService] Ticket status updated to:', response.ticket?.status);
        })
      );
  }

  /**
   * Close a ticket and optionally provide rating/feedback
   */
  closeTicket(ticketId: string, rating?: number, feedback?: string): Observable<{ message: string; ticket: SupportTicket }> {
    console.log('[SupportService] Closing ticket:', ticketId);
    return this.http.post<{ message: string; ticket: SupportTicket }>(`${this.API_URL}/support/tickets/${ticketId}/close`, { rating, feedback })
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (closeTicket):', response);
          console.log('[SupportService] Ticket closed');
        })
      );
  }

  /**
   * Get ticket categories (dropdown options)
   */
  getCategories(): Observable<{ categories: string[] }> {
    console.log('[SupportService] Fetching support categories');
    return this.http.get<{ categories: string[] }>(`${this.API_URL}/support/categories`)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (getCategories):', response);
        })
      );
  }

  /**
   * Get ticket status options
   */
  getStatusOptions(): Observable<{ statuses: string[] }> {
    console.log('[SupportService] Fetching status options');
    return this.http.get<{ statuses: string[] }>(`${this.API_URL}/support/statuses`)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (getStatusOptions):', response);
        })
      );
  }

  /**
   * Upload attachments for a ticket
   */
  uploadAttachments(ticketId: string, files: File[]): Observable<{ message: string; attachments: string[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('attachments', file);
    });

    console.log('[SupportService] Uploading attachments for ticket:', ticketId);
    return this.http.post<{ message: string; attachments: string[] }>(`${this.API_URL}/support/tickets/${ticketId}/upload`, formData)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (uploadAttachments):', response);
          console.log('[SupportService] Attachments uploaded:', response.attachments?.length);
        })
      );
  }

  /**
   * Get ticket SLA information
   */
  getSLA(ticketId: string): Observable<{ sla: any }> {
    console.log('[SupportService] Fetching SLA for ticket:', ticketId);
    return this.http.get<{ sla: any }>(`${this.API_URL}/support/tickets/${ticketId}/sla`)
      .pipe(
        tap(response => {
          console.log('[SupportService] API Response (getSLA):', response);
        })
      );
  }

  /**
   * Search tickets by keyword
   */
  searchTickets(query: string, filters: TicketFilters = {}): Observable<TicketsResponse> {
    console.log('[SupportService] Searching tickets with query:', query);
    const searchFilters = { ...filters, search: query };
    return this.getTickets(searchFilters);
  }
}
