/**
 * 💬 Direct Messages Component
 * Unified messaging for chat between users
 */

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'product';
  mediaUrl?: string;
  productData?: any;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Messages</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="onNewMessage()">
            <ion-icon name="create" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <!-- Search -->
      <ion-toolbar>
        <ion-searchbar
          placeholder="Search conversations..."
          [(ngModel)]="searchQuery"
          (ionChange)="applySearch()"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Conversations List -->
      <ion-list *ngIf="!selectedConversation">
        <ion-item
          *ngFor="let conversation of filteredConversations"
          button
          (click)="selectConversation(conversation)"
          class="conversation-item"
          [class.unread]="conversation.unreadCount > 0"
        >
          <!-- Avatar with Online Status -->
          <ion-avatar slot="start">
            <img [src]="conversation.userAvatar" />
            <span *ngIf="conversation.isOnline" class="online-status"></span>
          </ion-avatar>

          <!-- Conversation Info -->
          <ion-label>
            <h2>{{ conversation.userName }}</h2>
            <p class="last-message">{{ conversation.lastMessage }}</p>
          </ion-label>

          <!-- Time & Unread Badge -->
          <div slot="end" class="conversation-meta">
            <p class="time">{{ formatTime(conversation.lastMessageTime) }}</p>
            <ion-badge
              *ngIf="conversation.unreadCount > 0"
              color="primary"
            >
              {{ conversation.unreadCount }}
            </ion-badge>
          </div>
        </ion-item>

        <!-- Empty State -->
        <div *ngIf="conversations.length === 0" class="empty-state">
          <ion-icon name="mail"></ion-icon>
          <h2>No Messages</h2>
          <p>Start a conversation to message someone</p>
        </div>
      </ion-list>

      <!-- Chat View -->
      <div *ngIf="selectedConversation" class="chat-view">
        <!-- Chat Header -->
        <ion-header class="chat-header">
          <ion-toolbar>
            <ion-buttons slot="start">
              <ion-button (click)="backToList()">
                <ion-icon name="arrow-back" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>

            <ion-label class="chat-title">
              <h2>{{ selectedConversation.userName }}</h2>
              <p *ngIf="selectedConversation.isOnline" class="online-text">Active now</p>
            </ion-label>

            <ion-buttons slot="end">
              <ion-button>
                <ion-icon name="call" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button>
                <ion-icon name="videocam" slot="icon-only"></ion-icon>
              </ion-button>
              <ion-button>
                <ion-icon name="ellipsis-vertical" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <!-- Messages -->
        <ion-content #chatContent class="chat-content">
          <div class="messages-container">
            <div
              *ngFor="let message of messages"
              class="message"
              [class.sent]="isSentByMe(message)"
              [class.received]="!isSentByMe(message)"
            >
              <!-- Received Message -->
              <div *ngIf="!isSentByMe(message)" class="message-content received">
                <img [src]="message.senderAvatar" class="sender-avatar" />
                <div class="bubble">
                  <!-- Text Message -->
                  <p *ngIf="message.type === 'text'">{{ message.content }}</p>

                  <!-- Image Message -->
                  <img
                    *ngIf="message.type === 'image'"
                    [src]="message.mediaUrl"
                    class="message-media"
                  />

                  <!-- Video Message -->
                  <video
                    *ngIf="message.type === 'video'"
                    [src]="message.mediaUrl"
                    class="message-media"
                    controls
                  ></video>

                  <!-- Product Message -->
                  <div *ngIf="message.type === 'product'" class="product-message">
                    <img
                      [src]="message.productData?.image"
                      class="product-thumb"
                    />
                    <div class="product-info">
                      <h4>{{ message.productData?.name }}</h4>
                      <p>₹{{ message.productData?.price }}</p>
                      <a (click)="viewProduct(message.productData)">View Product</a>
                    </div>
                  </div>
                </div>
                <p class="message-time">{{ formatMessageTime(message.timestamp) }}</p>
              </div>

              <!-- Sent Message -->
              <div *ngIf="isSentByMe(message)" class="message-content sent">
                <div class="bubble">
                  <p *ngIf="message.type === 'text'">{{ message.content }}</p>
                  <img
                    *ngIf="message.type === 'image'"
                    [src]="message.mediaUrl"
                    class="message-media"
                  />
                </div>
                <p class="message-time">{{ formatMessageTime(message.timestamp) }}</p>
              </div>
            </div>
          </div>
        </ion-content>

        <!-- Message Input -->
        <ion-footer class="message-input-footer">
          <ion-toolbar>
            <div class="input-container">
              <!-- Attachment Button -->
              <ion-button fill="clear" size="small">
                <ion-icon name="add-circle" slot="icon-only"></ion-icon>
              </ion-button>

              <!-- Message Input -->
              <input
                type="text"
                placeholder="Aa"
                [(ngModel)]="messageInput"
                (keyup.enter)="sendMessage()"
                class="message-input"
              />

              <!-- Send Button -->
              <ion-button
                fill="clear"
                size="small"
                (click)="sendMessage()"
                [disabled]="!messageInput.trim()"
              >
                <ion-icon name="send" slot="icon-only"></ion-icon>
              </ion-button>
            </div>
          </ion-toolbar>
        </ion-footer>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: white;
    }

    .conversation-item {
      --padding-start: 8px;
      --padding-end: 8px;
      min-height: 80px;
      position: relative;
    }

    .conversation-item.unread {
      --background: rgba(0, 0, 0, 0.02);
      font-weight: 500;
    }

    ion-avatar {
      position: relative;
    }

    .online-status {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #31a24c;
      border-radius: 50%;
      border: 2px solid white;
      bottom: 0;
      right: 0;
    }

    ion-label h2 {
      font-size: 14px;
      margin-bottom: 4px;
    }

    .last-message {
      font-size: 13px;
      color: #999;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .conversation-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }

    .time {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    ion-badge {
      padding: 4px 8px;
      font-size: 10px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      text-align: center;
      color: #999;
    }

    .empty-state ion-icon {
      font-size: 64px;
      opacity: 0.3;
      margin-bottom: 16px;
    }

    .chat-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      --background: white;
      border-bottom: 1px solid #eee;
    }

    .chat-title {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .chat-title h2 {
      margin: 0;
      font-size: 14px;
    }

    .online-text {
      font-size: 12px;
      color: #31a24c;
      margin: 0;
    }

    .chat-content {
      flex: 1;
      --background: #f5f5f5;
      overflow-y: auto;
    }

    .messages-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .message {
      display: flex;
      gap: 8px;
    }

    .message.sent {
      justify-content: flex-end;
    }

    .message-content {
      display: flex;
      gap: 6px;
    }

    .message-content.received {
      align-items: flex-end;
    }

    .message-content.sent {
      flex-direction: row-reverse;
      align-items: flex-end;
    }

    .sender-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .bubble {
      background: white;
      border-radius: 16px;
      padding: 12px 16px;
      max-width: 70%;
      word-wrap: break-word;
    }

    .message.sent .bubble {
      background: var(--ion-color-primary);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.received .bubble {
      border-bottom-left-radius: 4px;
    }

    .message-media {
      width: 100%;
      height: auto;
      max-height: 300px;
      border-radius: 12px;
      object-fit: cover;
    }

    .product-message {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .product-thumb {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }

    .product-info h4 {
      font-size: 12px;
      margin: 0;
    }

    .product-info p {
      font-size: 11px;
      color: #666;
      margin: 2px 0;
    }

    .product-info a {
      font-size: 11px;
      color: var(--ion-color-primary);
      cursor: pointer;
      text-decoration: none;
    }

    .message-time {
      font-size: 11px;
      color: #999;
      margin: 4px 0 0 0;
    }

    .message-input-footer {
      --background: white;
      border-top: 1px solid #eee;
    }

    .message-input-footer ion-toolbar {
      --padding-start: 0;
      --padding-end: 0;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 100%;
    }

    .message-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      outline: none;
    }

    .message-input:focus {
      border-color: var(--ion-color-primary);
    }

    ion-button {
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesPageComponent implements OnInit, OnDestroy {
  @ViewChild('chatContent', { read: IonContent }) chatContent!: IonContent;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];

  searchQuery: string = '';
  messageInput: string = '';
  isLoading: boolean = true;
  currentUserId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadConversations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversations() {
    this.http.get('/api/messages/conversations')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.conversations = response.data || [];
          this.filteredConversations = this.conversations;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load conversations:', error);
          this.isLoading = false;
        }
      });
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  loadMessages(conversationId: string) {
    this.http.get(`/api/messages/conversations/${conversationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.messages = response.data || [];
          setTimeout(() => this.chatContent.scrollToBottom(300), 100);
        },
        error: (error) => console.error('Failed to load messages:', error)
      });
  }

  sendMessage() {
    if (!this.messageInput.trim() || !this.selectedConversation) return;

    const message = {
      conversationId: this.selectedConversation.id,
      content: this.messageInput,
      type: 'text'
    };

    this.http.post('/api/messages/send', message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.messages.push(response.data);
          this.messageInput = '';
          this.chatContent.scrollToBottom(300);
        },
        error: (error) => console.error('Failed to send message:', error)
      });
  }

  isSentByMe(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  backToList() {
    this.selectedConversation = null;
    this.messages = [];
  }

  onNewMessage() {
    console.log('💬 Start new message');
    // Open new conversation modal
  }

  applySearch() {
    if (!this.searchQuery.trim()) {
      this.filteredConversations = this.conversations;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredConversations = this.conversations.filter(c =>
        c.userName.toLowerCase().includes(query) ||
        c.lastMessage.toLowerCase().includes(query)
      );
    }
  }

  viewProduct(product: any) {
    console.log('🛍️ View product:', product.id);
    this.router.navigate(['/product', product.id]);
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString();
  }

  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
