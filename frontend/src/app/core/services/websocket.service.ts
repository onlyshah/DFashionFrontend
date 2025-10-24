import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { retryWhen, tap, delay, takeUntil } from 'rxjs/operators';

export interface WebSocketMessage<T = any> {
    type: 'notification' | 'order_update' | 'content_update' | 'user_activity' | 'system_alert';
    data: T;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket$!: WebSocketSubject<WebSocketMessage>;
    private messagesSubject = new Subject<WebSocketMessage>();
    private reconnection$ = new Subject<void>();
    private destroy$ = new Subject<void>();
    private connectionStatus = new BehaviorSubject<boolean>(false);
    public connectionStatus$ = this.connectionStatus.asObservable();

    constructor() {
        this.initSocket();
    }

    private initSocket() {
        if (!this.socket$ || this.socket$.closed) {
            this.socket$ = webSocket({
                url: `${environment.socketUrl}`,
                openObserver: {
                    next: () => {
                        console.log('WebSocket connection established');
                        this.connectionStatus.next(true);
                    }
                },
                closeObserver: {
                    next: () => {
                        console.log('WebSocket connection closed');
                        this.connectionStatus.next(false);
                        this.reconnect();
                    }
                }
            });

            this.socket$.pipe(
                tap({
                    error: error => console.error('WebSocket error:', error)
                }),
                takeUntil(this.destroy$)
            ).subscribe(
                message => this.messagesSubject.next(message)
            );
        }
    }

    private reconnect(): void {
        this.reconnection$.next();
        timer(3000).pipe(
            tap(() => this.initSocket())
        ).subscribe();
    }

    public connect(): void {
        this.initSocket();
    }

    public disconnect(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.socket$) {
            this.socket$.complete();
        }
    }

    public send(message: WebSocketMessage): void {
        if (this.socket$ && !this.socket$.closed) {
            this.socket$.next(message);
        } else {
            console.error('WebSocket is not connected. Message not sent:', message);
        }
    }

    public onMessage(): Observable<WebSocketMessage> {
        return this.messagesSubject.asObservable();
    }

    public onNotification(): Observable<WebSocketMessage<{ message: string; type: string }>> {
        return this.messagesSubject.asObservable().pipe(
            tap(message => {
                if (message.type === 'notification') {
                    // Handle notification specific logic
                }
            })
        );
    }

    public onOrderUpdate(): Observable<WebSocketMessage<{ orderId: string; status: string }>> {
        return this.messagesSubject.asObservable().pipe(
            tap(message => {
                if (message.type === 'order_update') {
                    // Handle order update specific logic
                }
            })
        );
    }

    public onContentUpdate(): Observable<WebSocketMessage<{ contentId: string; action: string }>> {
        return this.messagesSubject.asObservable().pipe(
            tap(message => {
                if (message.type === 'content_update') {
                    // Handle content update specific logic
                }
            })
        );
    }
}