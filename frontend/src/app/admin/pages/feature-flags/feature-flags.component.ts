import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeatureFlagService } from '../../../core/services/feature-flag.service';
import { ToastrService } from 'ngx-toastr';

interface FeatureFlag {
  id: string;
  _id?: string;
  name: string;
  description: string;
  key: string;
  enabled: boolean;
  type: 'boolean' | 'percentage' | 'multivariate' | 'scheduled' | 'user-list' | 'segment' | 'json';
  rolloutPercentage?: number;
  rollout?: {
    percentage: number;
    targeting?: any;
  };
  variants?: Variant[];
  schedule?: {
    startDate: Date;
    endDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  analytics?: {
    views: number;
    conversions: number;
    conversionRate: number;
  };
  tags?: string[];
}

interface Variant {
  id: string;
  name: string;
  weight: number;
  config?: any;
}

@Component({
  selector: 'app-feature-flags',
  templateUrl: './feature-flags.component.html',
  styleUrls: ['./feature-flags.component.scss']
})
export class FeatureFlagsComponent implements OnInit, OnDestroy {
  flags: FeatureFlag[] = [];
  selectedFlag: FeatureFlag | null = null;
  displayedColumns: string[] = ['name', 'key', 'enabled', 'type', 'rollout', 'updatedAt', 'actions'];
  
  isLoading = false;
  showCreateForm = false;
  showDetailView = false;
  showAnalytics = false;
  
  createFlagForm!: FormGroup;
  updateRolloutForm!: FormGroup;
  
  // Pagination
  pageSize = 15;
  pageSizeOptions = [10, 15, 25];
  totalFlags = 0;
  currentPage = 1;
  
  // Filters
  selectedType: string = 'all';
  enabledFilter: string = 'all';
  searchQuery: string = '';
  
  typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'percentage', label: 'Percentage Rollout' },
    { value: 'multivariate', label: 'Multivariate' },
    { value: 'scheduled', label: 'Scheduled' }
  ];

  enabledOptions = [
    { value: 'all', label: 'All Flags' },
    { value: 'true', label: 'Enabled Only' },
    { value: 'false', label: 'Disabled Only' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private featureFlagService: FeatureFlagService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadFlags();
  }

  initializeForm(): void {
    this.createFlagForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      description: ['', [Validators.required]],
      type: ['boolean', [Validators.required]],
      enabled: [true],
      tags: [[]]
    });

    this.updateRolloutForm = this.fb.group({
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      targeting: [null]
    });
  }

  loadFlags(): void {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.pageSize,
      type: this.selectedType !== 'all' ? this.selectedType : undefined,
      enabled: this.enabledFilter !== 'all' ? this.enabledFilter === 'true' : undefined,
      search: this.searchQuery || undefined
    };

    this.featureFlagService.getFlags(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.flags = response.flags || [];
          this.totalFlags = response.total || 0;
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to load feature flags');
          this.isLoading = false;
        }
      });
  }

  openCreateFlag(): void {
    this.showCreateForm = true;
    this.selectedFlag = null;
    this.showDetailView = false;
  }

  submitCreateFlag(): void {
    if (!this.createFlagForm.valid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    const flagData = this.createFlagForm.value;

    this.featureFlagService.createFlag(flagData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Feature flag created successfully');
          this.showCreateForm = false;
          this.createFlagForm.reset({ type: 'boolean', enabled: true });
          this.loadFlags();
        },
        error: (error: any) => {
          this.toastr.error(error?.error?.message || 'Failed to create flag');
          this.isLoading = false;
        }
      });
  }

  viewFlagDetails(flag: FeatureFlag): void {
    this.selectedFlag = flag;
    this.showDetailView = true;
    this.showCreateForm = false;
    this.showAnalytics = false;
    
    // Initialize rollout form with current values
    if (flag.rollout) {
      this.updateRolloutForm.patchValue({
        percentage: flag.rollout.percentage
      });
    }
  }

  toggleFlagEnabled(flag: FeatureFlag): void {
    this.isLoading = true;
    const newState = !flag.enabled;

    this.featureFlagService.updateFlag(flag.id, { enabled: newState })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          flag.enabled = updated.enabled;
          this.toastr.success(`Flag ${newState ? 'enabled' : 'disabled'} successfully`);
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to update flag');
          this.isLoading = false;
        }
      });
  }

  updateRolloutPercentage(flag: FeatureFlag): void {
    if (!this.updateRolloutForm.valid) {
      this.toastr.error('Please enter a valid percentage (0-100)');
      return;
    }

    this.isLoading = true;
    const { percentage } = this.updateRolloutForm.value;

    this.featureFlagService.updateRolloutPercentage(flag.id, percentage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated: any) => {
          flag.rolloutPercentage = updated.flag.rolloutPercentage;
          this.toastr.success('Rollout updated successfully');
          this.isLoading = false;
        },
        error: (error: any) => {
          this.toastr.error('Failed to update rollout');
          this.isLoading = false;
        }
      });
  }

  viewAnalytics(flag: FeatureFlag): void {
    this.showAnalytics = true;
  }

  deleteFlag(flag: FeatureFlag): void {
    if (!confirm(`Are you sure you want to delete the flag "${flag.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.featureFlagService.deleteFlag(flag.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success('Flag deleted successfully');
          this.showDetailView = false;
          this.selectedFlag = null;
          this.loadFlags();
        },
        error: (error: any) => {
          this.toastr.error('Failed to delete flag');
          this.isLoading = false;
        }
      });
  }

  cloneFlag(flag: FeatureFlag): void {
    const newName = prompt(`Clone flag as:`, `${flag.name} (Copy)`);
    if (!newName) return;
    
    this.isLoading = true;
    this.featureFlagService.cloneFlag(flag.id, newName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.toastr.success(`Flag cloned as "${response.flag.name}"`);
          this.loadFlags();
        },
        error: (error: any) => {
          this.toastr.error('Failed to clone flag');
          this.isLoading = false;
        }
      });
  }

  exportFlags(): void {
    const fileName = `feature-flags-${new Date().toISOString().split('T')[0]}.json`;
    this.featureFlagService.getFlags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.downloadFile(JSON.stringify(data.flags, null, 2), fileName);
          this.toastr.success('Flags exported successfully');
        },
        error: (error: any) => {
          this.toastr.error('Failed to export flags');
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFlags();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadFlags();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadFlags();
  }

  closeDetailView(): void {
    this.showDetailView = false;
    this.selectedFlag = null;
    this.showAnalytics = false;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createFlagForm.reset({ type: 'boolean', enabled: true });
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'boolean': 'toggle_on',
      'percentage': 'analytics',
      'multivariate': 'tune',
      'scheduled': 'schedule'
    };
    return icons[type] || 'flag';
  }

  private downloadFile(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
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
