import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

interface Message {
  id: string;
  senderName: string;
  senderImage: string;
  content: string;
  time: string;
  unread: boolean;
}

@Component({
  selector: 'app-messages-dropdown',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="dropdown">
      <button class="dropdown-toggle" (click)="isOpen = !isOpen">
        <i class="typcn typcn-messages"></i>
        <span class="badge" *ngIf="unreadCount">{{ unreadCount }}</span>
      </button>
      
      <div class="dropdown-menu" [class.show]="isOpen">
        <div class="dropdown-header">
          <h6>Messages</h6>
          <a class="view-all">View All</a>
        </div>
        
        <div class="dropdown-body">
          <ng-container *ngIf="messages.length; else empty">
            <a *ngFor="let message of messages" 
               class="dropdown-item"
               [class.unread]="message.unread">
              <img [src]="message.senderImage" [alt]="message.senderName" class="sender-image">
              <div class="content">
                <div class="message-header">
                  <h6>{{ message.senderName }}</h6>
                  <small>{{ message.time }}</small>
                </div>
                <p>{{ message.content }}</p>
              </div>
            </a>
          </ng-container>
          
          <ng-template #empty>
            <div class="empty-state">
              <p>No new messages</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown { position: relative; }
    .dropdown-toggle {
      background: none;
      border: none;
      color: var(--dark-color);
      font-size: 1.25rem;
      padding: 0.5rem;
      position: relative;
      cursor: pointer;
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--primary-color);
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      min-width: 1.5rem;
      text-align: center;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-md);
      width: 320px;
      display: none;
      z-index: 1000;
    }
    .dropdown-menu.show { display: block; }
    .dropdown-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dropdown-header h6 { margin: 0; }
    .view-all {
      font-size: 0.875rem;
      color: var(--primary-color);
      text-decoration: none;
      cursor: pointer;
    }
    .dropdown-body {
      max-height: 400px;
      overflow-y: auto;
    }
    .dropdown-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;
    }
    .dropdown-item:hover { background-color: var(--content-bg); }
    .dropdown-item.unread { background-color: var(--light-primary); }
    .sender-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    .content { flex: 1; }
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.25rem;
    }
    .message-header h6 { margin: 0; }
    .message-header small { color: var(--text-muted); }
    .content p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.875rem;
      line-height: 1.4;
    }
    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class MessagesDropdownComponent {
  @Input() messages: Message[] = [];
  isOpen = false;

  get unreadCount(): number {
    return this.messages.filter(msg => msg.unread).length;
  }
}