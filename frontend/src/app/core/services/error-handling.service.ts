import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ErrorHandlingService {
    private errorSubject = new BehaviorSubject<string | null>(null);
    error$: Observable<string | null> = this.errorSubject.asObservable();

    handleError(error: any): void {
        let errorMessage: string;
        
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else {
            errorMessage = 'An unexpected error occurred';
        }

        this.errorSubject.next(errorMessage);
    }

    clearError(): void {
        this.errorSubject.next(null);
    }
}