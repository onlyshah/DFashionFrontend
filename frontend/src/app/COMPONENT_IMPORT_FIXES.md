# Component Import Fixes Required

## Service Import Paths
Update all component imports to use correct service paths based on your project structure:

### For Admin Components:
Replace:
```typescript
import { AdminUserService } from '@app/core/services/admin-user.service';
import { AuditLogService } from '@app/core/services/audit-log.service';
import { FeatureFlagService } from '@app/core/services/feature-flag.service';
import { DataGovernanceService } from '@app/core/services/data-governance.service';
```

With correct path (e.g., if services are in src/app/services):
```typescript
import { AdminUserService } from '../../services/admin-user.service';
import { AuditLogService } from '../../services/audit-log.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { DataGovernanceService } from '../../services/data-governance.service';
```

### For Enduser App Components:
Replace:
```typescript
import { ReturnsService } from '@app/core/services/returns.service';
import { SupportService } from '@app/core/services/support.service';
```

With:
```typescript
import { ReturnsService } from '../../services/returns.service';
import { SupportService } from '../../services/support.service';
```

## ngx-toastr Installation
Ensure ngx-toastr is installed:
```bash
npm install ngx-toastr --save
npm install @types/ngx-toastr --save-dev
```

And imported in your app.module.ts:
```typescript
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    // ...
    ToastrModule.forRoot()
  ]
})
export class AppModule { }
```

## Module Integration Steps

### 1. Admin Module Setup
In `src/app/admin/admin.module.ts`, add these declarations:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
import { FeatureFlagsComponent } from './pages/feature-flags/feature-flags.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { DataGovernanceComponent } from './pages/data-governance/data-governance.component';
import { PaymentSettlementComponent } from './pages/payment-settlement/payment-settlement.component';

// Services
import { AuditLogService } from '../../services/audit-log.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { AdminUserService } from '../../services/admin-user.service';
import { DataGovernanceService } from '../../services/data-governance.service';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [
    AuditLogsComponent,
    FeatureFlagsComponent,
    AdminUsersComponent,
    DataGovernanceComponent,
    PaymentSettlementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AdminRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatChipsModule,
    MatStepperModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule
  ],
  providers: [
    AuditLogService,
    FeatureFlagService,
    AdminUserService,
    DataGovernanceService
  ]
})
export class AdminModule { }
```

### 2. Admin Routing Module
In `src/app/admin/admin-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
import { FeatureFlagsComponent } from './pages/feature-flags/feature-flags.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { DataGovernanceComponent } from './pages/data-governance/data-governance.component';
import { PaymentSettlementComponent } from './pages/payment-settlement/payment-settlement.component';

const routes: Routes = [
  {
    path: 'audit-logs',
    component: AuditLogsComponent,
    data: { breadcrumb: 'Audit Logs' }
  },
  {
    path: 'feature-flags',
    component: FeatureFlagsComponent,
    data: { breadcrumb: 'Feature Flags' }
  },
  {
    path: 'admin-users',
    component: AdminUsersComponent,
    data: { breadcrumb: 'Admin Users' }
  },
  {
    path: 'data-governance',
    component: DataGovernanceComponent,
    data: { breadcrumb: 'Data Governance' }
  },
  {
    path: 'payment-settlement',
    component: PaymentSettlementComponent,
    data: { breadcrumb: 'Payment Settlement' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
```

### 3. Enduser App Module Setup
In `src/app/enduser-app/enduser-app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Material imports
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';

// Components
import { ReturnsComponent } from './features/returns/returns.component';
import { SupportTicketsComponent } from './features/support/support-tickets.component';

// Services
import { ReturnsService } from '../../services/returns.service';
import { SupportService } from '../../services/support.service';

// Routing
import { EnduserAppRoutingModule } from './enduser-app-routing.module';

@NgModule({
  declarations: [
    ReturnsComponent,
    SupportTicketsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    EnduserAppRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatStepperModule,
    MatTabsModule
  ],
  providers: [
    ReturnsService,
    SupportService
  ]
})
export class EnduserAppModule { }
```

### 4. Enduser App Routing Module
In `src/app/enduser-app/enduser-app-routing.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReturnsComponent } from './features/returns/returns.component';
import { SupportTicketsComponent } from './features/support/support-tickets.component';

const routes: Routes = [
  {
    path: 'returns',
    component: ReturnsComponent,
    data: { breadcrumb: 'Returns & Refunds' }
  },
  {
    path: 'support',
    component: SupportTicketsComponent,
    data: { breadcrumb: 'Support Tickets' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnduserAppRoutingModule { }
```

### 5. App Routing Module
In `src/app/app-routing.module.ts`, add lazy load routes:

```typescript
const routes: Routes = [
  // ... existing routes ...
  
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard] // Use your auth guard
  },
  
  {
    path: 'app',
    loadChildren: () => import('./enduser-app/enduser-app.module').then(m => m.EnduserAppModule),
    canActivate: [AuthGuard]
  },
  
  // ... rest of routes ...
];
```

This enables routes:
- `/admin/audit-logs`
- `/admin/feature-flags`
- `/admin/admin-users`
- `/admin/data-governance`
- `/admin/payment-settlement`
- `/app/returns`
- `/app/support`
