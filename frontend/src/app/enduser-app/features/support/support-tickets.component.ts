import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportService } from '../../../core/services/support.service';
import { ToastrService } from 'ngx-toastr';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting-for-customer' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  replies?: TicketReply[];
  sla?: SLAInfo;
  attachments?: string[];
}

interface TicketReply {
  id: string;
  author: string;
  authorName: string;
  message: string;
  createdAt: Date;
  attachments?: string[];
  isFromSupport: boolean;
}

interface SLAInfo {
  responseTime: Date;
  resolutionTime: Date;
  responseTimeBreached: boolean;
  resolutionTimeBreached: boolean;
}

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.scss']
})
export class SupportTicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  displayedColumns: string[] = ['ticketNumber', 'subject', 'priority', 'status', 'assignedToName', 'createdAt', 'actions'];
  
  isLoading = false;
  showCreateForm = false;
  showDetailView = false;
  showReplyForm = false;
  
  createTicketForm!: FormGroup;
  replyForm!: FormGroup;
  
  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25];
  totalTickets = 0;
  currentPage = 1;
  
  // Filters
  selectedStatus: string = 'all';
  selectedPriority: string = 'all';
  selectedCategory: string = 'all';
  searchQuery: string = '';
  
  statusFilters = [
    { value: 'all', label: 'All Tickets' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'waiting-for-customer', label: 'Waiting for You' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  priorityFilters = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'shipping', label: 'Shipping & Delivery' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'product', label: 'Product Quality' },
    { value: 'account', label: 'Account & Profile' },
    { value: 'other', label: 'Other' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private supportService: SupportService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadTickets();
  }

  initializeForm(): void {
    this.createTicketForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', [Validators.required]],
      priority: ['medium', [Validators.required]],
      attachments: [[]]
    });

    this.replyForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(5)]],
      attachments: [[]]
    });
  }

  loadTickets(): void {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      status: this.selectedStatus !== 'all' ? this.selectedStatus : undefined,
      priority: this.selectedPriority !== 'all' ? this.selectedPriority : undefined,
      category: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      search: this.searchQuery || undefined
    };

    this.supportService.getTickets(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.tickets = response.tickets || [];
          this.totalTickets = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load support tickets');
          this.isLoading = false;
        }
      });
  }

  openCreateTicket(): void {
    this.showCreateForm = true;
    this.selectedTicket = null;
    this.showDetailView = false;
  }

  submitCreateTicket(): void {
    if (!this.createTicketForm.valid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    const ticketData = this.createTicketForm.value;

    this.supportService.createTicket(ticketData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Support ticket created successfully');
          this.showCreateForm = false;
          this.createTicketForm.reset();
          this.loadTickets();
        },
        error: (error: any) => {
          this.toastr.error(error?.error?.message || 'Failed to create ticket');
          this.isLoading = false;
        }
      });
  }

  viewTicketDetails(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.showDetailView = true;
    this.showCreateForm = false;
    this.showReplyForm = false;
  }

  openReplyForm(): void {
    this.showReplyForm = true;
  }

  submitReply(): void {
    if (!this.replyForm.valid || !this.selectedTicket) {
      this.toastr.error('Please enter a valid reply');
      return;
    }

    this.isLoading = true;
    const replyData = this.replyForm.value;

    this.supportService.replyToTicket(this.selectedTicket.id, replyData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Reply sent successfully');
          this.replyForm.reset();
          this.showReplyForm = false;
          // Reload ticket details
          if (this.selectedTicket) {
            this.loadTicketDetails(this.selectedTicket.id);
          }
        },
        error: (error: any) => {
          this.toastr.error('Failed to send reply');
          this.isLoading = false;
        }
      });
  }

  loadTicketDetails(ticketId: string): void {
    this.supportService.getTicket(ticketId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticket: any) => {
          this.selectedTicket = ticket;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load ticket details');
          this.isLoading = false;
        }
      });
  }

  closeTicket(): void {
    if (!this.selectedTicket) return;

    if (!confirm('Are you sure you want to close this ticket? You can reopen it later if needed.')) {
      return;
    }

    this.isLoading = true;
    this.supportService.updateTicketStatus(this.selectedTicket.id, 'closed')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Ticket closed successfully');
          this.showDetailView = false;
          this.selectedTicket = null;
          this.loadTickets();
        },
        error: (error: any) => {
          this.toastr.error('Failed to close ticket');
          this.isLoading = false;
        }
      });
  }

  reopenTicket(): void {
    if (!this.selectedTicket) return;

    this.isLoading = true;
    this.supportService.updateTicketStatus(this.selectedTicket.id, 'open')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Ticket reopened successfully');
          this.loadTicketDetails(this.selectedTicket!.id);
        },
        error: (error: any) => {
          this.toastr.error('Failed to reopen ticket');
          this.isLoading = false;
        }
      });
  }

  exportTickets(): void {
    const fileName = `support-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    this.supportService.getTickets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.downloadFile(JSON.stringify(data.tickets || [], null, 2), fileName);
          this.toastr.success('Tickets exported successfully');
        },
        error: (error: any) => {
          this.toastr.error('Failed to export tickets');
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTickets();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadTickets();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTickets();
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedTicket = null;
    this.showReplyForm = false;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createTicketForm.reset();
  }

  closeReplyForm(): void {
    this.showReplyForm = false;
    this.replyForm.reset();
  }

  getPriorityClass(priority: string): string {
    const priorityClasses = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return priorityClasses[priority as keyof typeof priorityClasses] || 'priority-medium';
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'open': 'status-open',
      'in-progress': 'status-in-progress',
      'waiting-for-customer': 'status-waiting',
      'resolved': 'status-resolved',
      'closed': 'status-closed'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-open';
  }

  isSLABreached(ticket: Ticket): boolean {
    if (!ticket.sla) return false;
    return ticket.sla.responseTimeBreached || ticket.sla.resolutionTimeBreached;
  }

  private downloadFile(data: BlobPart, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
