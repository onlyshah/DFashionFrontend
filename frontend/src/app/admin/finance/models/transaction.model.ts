export interface Transaction {
    id: string;
    type: 'sale' | 'refund' | 'payout' | 'commission';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'disputed';
    sourceId: string;
    sourceType: 'order' | 'vendor' | 'creator' | 'platform';
    destinationId: string;
    destinationtype: 'user' | 'vendor' | 'platform';
    paymentMethod?: string;
    reference?: string;
    description?: string;
    createdAt: Date;
    processedAt?: Date;
    metadata?: Record<string, any>;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalPayouts: number;
    totalRefunds: number;
    totalCommissions: number;
    pendingTransactions: number;
    disputedTransactions: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
}