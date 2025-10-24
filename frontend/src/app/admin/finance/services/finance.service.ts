import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Transaction, FinancialSummary } from '../models/transaction.model';

@Injectable({
    providedIn: 'root'
})
export class FinanceService {
    private apiUrl = `${environment.apiUrl}/finance`;
    private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
    public transactions$ = this.transactionsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadTransactions();
    }

    loadTransactions(): void {
        this.http.get<Transaction[]>(`${this.apiUrl}/transactions`)
            .subscribe(transactions => this.transactionsSubject.next(transactions));
    }

    getTransaction(id: string): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
    }

    processTransaction(transactionId: string): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.apiUrl}/transactions/${transactionId}/process`, {})
            .pipe(map(transaction => {
                this.updateTransactionInState(transaction);
                return transaction;
            }));
    }

    createPayout(vendorId: string, amount: number, currency: string): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.apiUrl}/payouts`, { vendorId, amount, currency })
            .pipe(map(transaction => {
                const transactions = this.transactionsSubject.value;
                this.transactionsSubject.next([transaction, ...transactions]);
                return transaction;
            }));
    }

    processRefund(orderId: string, amount: number, reason: string): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.apiUrl}/refunds`, { orderId, amount, reason })
            .pipe(map(transaction => {
                const transactions = this.transactionsSubject.value;
                this.transactionsSubject.next([transaction, ...transactions]);
                return transaction;
            }));
    }

    getFinancialSummary(period: FinancialSummary['period']): Observable<FinancialSummary> {
        return this.http.get<FinancialSummary>(`${this.apiUrl}/summary`, { params: { period } });
    }

    private updateTransactionInState(transaction: Transaction): void {
        const transactions = this.transactionsSubject.value;
        const index = transactions.findIndex(t => t.id === transaction.id);
        if (index !== -1) {
            transactions[index] = transaction;
            this.transactionsSubject.next([...transactions]);
        }
    }
}