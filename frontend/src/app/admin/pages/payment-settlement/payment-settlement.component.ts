import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

interface Settlement {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  settlementPeriod: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalSales: number;
  totalCommission: number;
  totalDeductions: number;
  netAmount: number;
  createdAt: Date;
  processedAt: Date | null;
  paymentMethod: string | null;
  transactionId: string | null;
}

interface Transaction {
  id: string;
  vendorId: string;
  type: 'sale' | 'commission' | 'deduction' | 'refund' | 'adjustment';
  amount: number;
  currency: string;
  description: string;
  orderId: string | null;
  relatedSettlementId: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  totalSettled: number;
  pendingAmount: number;
  lastSettlement: Date;
}

interface SettlementSummary {
  totalSettlements: number;
  completedSettlements: number;
  pendingSettlements: number;
  totalSettledAmount: number;
  totalPendingAmount: number;
  averageSettlementTime: number;
}

@Component({
  selector: 'app-payment-settlement',
  templateUrl: './payment-settlement.component.html',
  styleUrls: ['./payment-settlement.component.scss']
})
export class PaymentSettlementComponent implements OnInit, OnDestroy {
  settlements: Settlement[] = [];
  transactions: Transaction[] = [];
  vendors: Vendor[] = [];
  filteredSettlements: Settlement[] = [];
  summary!: SettlementSummary;
  Math = Math;

  isLoading = false;
  showSettlementForm = false;
  showDetailView = false;
  showTransactionHistory = false;
  selectedSettlement!: Settlement | null;
  selectedTab: 'settlements' | 'transactions' | 'vendors' = 'settlements';

  settlementForm!: FormGroup;
  filterForm!: FormGroup;

  pageSize = 10;
  currentPage = 1;
  totalSettlements = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSettlements();
    this.loadTransactions();
    this.loadVendors();
    this.loadSummary();
    this.setupFilterListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.settlementForm = this.fb.group({
      vendorId: ['', Validators.required],
      settlementPeriod: ['', Validators.required],
      processNow: [false]
    });

    this.filterForm = this.fb.group({
      status: [''],
      vendorId: [''],
      dateRange: [''],
      search: ['']
    });
  }

  private setupFilterListener(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  loadSettlements(): void {
    this.isLoading = true;
    // Replace with actual service call
    setTimeout(() => {
      this.settlements = [
        {
          id: 'SETTLE-001',
          vendorId: 'VENDOR-001',
          vendorName: 'Acme Fashion Co.',
          vendorEmail: 'vendor@acme.com',
          settlementPeriod: 'Dec 1 - Dec 31, 2024',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-31'),
          status: 'completed',
          totalSales: 45000,
          totalCommission: 4500,
          totalDeductions: 500,
          netAmount: 40000,
          createdAt: new Date('2025-01-02'),
          processedAt: new Date('2025-01-05'),
          paymentMethod: 'bank_transfer',
          transactionId: 'TXN-2024-45000'
        },
        {
          id: 'SETTLE-002',
          vendorId: 'VENDOR-002',
          vendorName: 'Premium Styles Ltd',
          vendorEmail: 'accounts@premiumstyles.com',
          settlementPeriod: 'Dec 1 - Dec 31, 2024',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-31'),
          status: 'processing',
          totalSales: 32000,
          totalCommission: 3200,
          totalDeductions: 200,
          netAmount: 28600,
          createdAt: new Date('2025-01-02'),
          processedAt: null,
          paymentMethod: 'bank_transfer',
          transactionId: null
        },
        {
          id: 'SETTLE-003',
          vendorId: 'VENDOR-003',
          vendorName: 'Urban Wear Inc',
          vendorEmail: 'payments@urbanwear.com',
          settlementPeriod: 'Dec 1 - Dec 31, 2024',
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-31'),
          status: 'pending',
          totalSales: 18500,
          totalCommission: 1850,
          totalDeductions: 100,
          netAmount: 16550,
          createdAt: new Date('2025-01-02'),
          processedAt: null,
          paymentMethod: null,
          transactionId: null
        }
      ];
      this.totalSettlements = this.settlements.length;
      this.filteredSettlements = [...this.settlements];
      this.isLoading = false;
    }, 500);
  }

  loadTransactions(): void {
    // Replace with actual service call
    this.transactions = [
      {
        id: 'TXN-001',
        vendorId: 'VENDOR-001',
        type: 'sale',
        amount: 45000,
        currency: 'USD',
        description: 'Monthly sales',
        orderId: 'ORD-2024-12-001',
        relatedSettlementId: 'SETTLE-001',
        createdAt: new Date('2024-12-31'),
        status: 'completed'
      },
      {
        id: 'TXN-002',
        vendorId: 'VENDOR-001',
        type: 'commission',
        amount: -4500,
        currency: 'USD',
        description: 'Platform commission (10%)',
        orderId: null,
        relatedSettlementId: 'SETTLE-001',
        createdAt: new Date('2025-01-01'),
        status: 'completed'
      },
      {
        id: 'TXN-003',
        vendorId: 'VENDOR-001',
        type: 'deduction',
        amount: -500,
        currency: 'USD',
        description: 'Chargeback resolution',
        orderId: 'ORD-2024-12-095',
        relatedSettlementId: 'SETTLE-001',
        createdAt: new Date('2025-01-01'),
        status: 'completed'
      }
    ];
  }

  loadVendors(): void {
    // Replace with actual service call
    this.vendors = [
      {
        id: 'VENDOR-001',
        name: 'Acme Fashion Co.',
        email: 'vendor@acme.com',
        status: 'active',
        totalSettled: 240000,
        pendingAmount: 12500,
        lastSettlement: new Date('2025-01-05')
      },
      {
        id: 'VENDOR-002',
        name: 'Premium Styles Ltd',
        email: 'accounts@premiumstyles.com',
        status: 'active',
        totalSettled: 185000,
        pendingAmount: 28600,
        lastSettlement: new Date('2024-12-28')
      },
      {
        id: 'VENDOR-003',
        name: 'Urban Wear Inc',
        email: 'payments@urbanwear.com',
        status: 'active',
        totalSettled: 92000,
        pendingAmount: 16550,
        lastSettlement: new Date('2024-11-30')
      }
    ];
  }

  loadSummary(): void {
    // Replace with actual service call
    this.summary = {
      totalSettlements: 45,
      completedSettlements: 42,
      pendingSettlements: 3,
      totalSettledAmount: 517000,
      totalPendingAmount: 57650,
      averageSettlementTime: 4
    };
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.filteredSettlements = this.settlements.filter(settlement => {
      const statusMatch = !filters.status || settlement.status === filters.status;
      const vendorMatch = !filters.vendorId || settlement.vendorId === filters.vendorId;
      const searchMatch = !filters.search || 
        settlement.vendorName.toLowerCase().includes(filters.search.toLowerCase()) ||
        settlement.id.toLowerCase().includes(filters.search.toLowerCase());
      
      return statusMatch && vendorMatch && searchMatch;
    });
  }

  openSettlementForm(): void {
    this.settlementForm.reset();
    this.showSettlementForm = true;
  }

  closeSettlementForm(): void {
    this.showSettlementForm = false;
    this.settlementForm.reset();
  }

  createSettlement(): void {
    if (this.settlementForm.invalid) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    const formValue = this.settlementForm.value;
    const newSettlement: Settlement = {
      id: `SETTLE-${Date.now()}`,
      vendorId: formValue.vendorId,
      vendorName: this.vendors.find(v => v.id === formValue.vendorId)?.name || 'Unknown',
      vendorEmail: this.vendors.find(v => v.id === formValue.vendorId)?.email || 'unknown@example.com',
      settlementPeriod: formValue.settlementPeriod,
      startDate: new Date(),
      endDate: new Date(),
      status: formValue.processNow ? 'processing' : 'pending',
      totalSales: 0,
      totalCommission: 0,
      totalDeductions: 0,
      netAmount: 0,
      createdAt: new Date(),
      processedAt: null,
      paymentMethod: null,
      transactionId: null
    };

    this.settlements.push(newSettlement);
    this.filteredSettlements.push(newSettlement);
    this.totalSettlements++;
    this.toastr.success('Settlement created successfully');
    this.closeSettlementForm();
  }

  viewSettlementDetails(settlement: Settlement): void {
    this.selectedSettlement = settlement;
    this.showDetailView = true;
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedSettlement = null!;
  }

  processSettlement(settlement: Settlement): void {
    settlement.status = 'processing';
    this.toastr.info('Processing settlement...');
    
    setTimeout(() => {
      settlement.status = 'completed';
      settlement.processedAt = new Date();
      settlement.transactionId = `TXN-${Date.now()}`;
      this.toastr.success('Settlement processed successfully');
    }, 2000);
  }

  retryFailedSettlement(settlement: Settlement): void {
    settlement.status = 'processing';
    this.toastr.info('Retrying settlement...');
    
    setTimeout(() => {
      settlement.status = 'completed';
      settlement.processedAt = new Date();
      settlement.transactionId = `TXN-${Date.now()}`;
      this.toastr.success('Settlement completed successfully');
    }, 2000);
  }

  viewTransactionHistory(): void {
    if (this.selectedSettlement) {
      this.showTransactionHistory = true;
    }
  }

  closeTransactionHistory(): void {
    this.showTransactionHistory = false;
  }

  getSettlementTransactions(settlementId: string): Transaction[] {
    return this.transactions.filter(t => t.relatedSettlementId === settlementId);
  }

  downloadSettlementReport(settlement: Settlement): void {
    this.toastr.success('Downloading settlement report...');
    // Replace with actual download logic
  }

  exportAllSettlements(): void {
    this.toastr.success('Exporting settlements as CSV...');
    // Replace with actual export logic
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getTransactionTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'sale': 'trending_up',
      'commission': 'account_balance_wallet',
      'deduction': 'trending_down',
      'refund': 'undo',
      'adjustment': 'tune'
    };
    return iconMap[type] || 'business_center';
  }
}
