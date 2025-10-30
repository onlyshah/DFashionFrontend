# Dashboard Template
Replace the content of unified-dashboard.component.html with:

```html
<div class="admin-dashboard">
  <!-- Loading Spinner -->
  <div *ngIf="isLoading" class="loading-spinner">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- Main Content -->
  <ng-container *ngIf="!isLoading">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center">
          <div class="dashboard-title">
            <h4 class="card-title mb-0">Super Admin Dashboard</h4>
            <div class="d-flex align-items-center">
              <p class="text-muted mb-0">Welcome back,</p>
              <p class="text-primary mb-0 ms-2">{{ currentUser?.fullName }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline-primary d-flex align-items-center" (click)="loadDashboardData()">
              <i class="typcn typcn-refresh me-2"></i>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="dashboard-content">
      <div class="container-fluid mt-4">
        <!-- Stats Row -->
        <div class="row">
          <!-- Users Card -->
          <div class="col-md-3 grid-margin stretch-card">
            <div class="card stats-card purple-gradient">
              <div class="card-body">
                <div class="stats-icon">
                  <i class="typcn typcn-user-outline"></i>
                </div>
                <h3 class="stats-title">Total Users</h3>
                <h2 class="stats-number">{{ dashboardMetrics.totalUsers }}</h2>
                <p class="stats-growth">
                  <i class="typcn" [class.typcn-arrow-up-thick]="dashboardMetrics.userGrowth >= 0" 
                     [class.typcn-arrow-down-thick]="dashboardMetrics.userGrowth < 0"></i>
                  {{ dashboardMetrics.userGrowth }}%
                  <span class="period">vs last month</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Orders Card -->
          <div class="col-md-3 grid-margin stretch-card">
            <div class="card stats-card success-card">
              <div class="card-body">
                <div class="stats-icon">
                  <i class="typcn typcn-shopping-cart"></i>
                </div>
                <h3 class="stats-title">Total Orders</h3>
                <h2 class="stats-number">{{ dashboardMetrics.totalOrders }}</h2>
                <p class="stats-growth">
                  <i class="typcn" [class.typcn-arrow-up-thick]="dashboardMetrics.orderGrowth >= 0" 
                     [class.typcn-arrow-down-thick]="dashboardMetrics.orderGrowth < 0"></i>
                  {{ dashboardMetrics.orderGrowth }}%
                  <span class="period">vs last month</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Revenue Card -->
          <div class="col-md-3 grid-margin stretch-card">
            <div class="card stats-card warning-card">
              <div class="card-body">
                <div class="stats-icon">
                  <i class="typcn typcn-chart-bar"></i>
                </div>
                <h3 class="stats-title">Total Revenue</h3>
                <h2 class="stats-number">${{ dashboardMetrics.totalRevenue.toLocaleString() }}</h2>
                <p class="stats-growth">
                  <i class="typcn" [class.typcn-arrow-up-thick]="dashboardMetrics.revenueGrowth >= 0" 
                     [class.typcn-arrow-down-thick]="dashboardMetrics.revenueGrowth < 0"></i>
                  {{ dashboardMetrics.revenueGrowth }}%
                  <span class="period">vs last month</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Products Card -->
          <div class="col-md-3 grid-margin stretch-card">
            <div class="card stats-card info-card">
              <div class="card-body">
                <div class="stats-icon">
                  <i class="typcn typcn-tag"></i>
                </div>
                <h3 class="stats-title">Total Products</h3>
                <h2 class="stats-number">{{ dashboardMetrics.totalProducts }}</h2>
                <p class="stats-text">
                  <i class="typcn typcn-chart-line"></i>
                  Active inventory
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row">
          <!-- Sales Chart -->
          <div class="col-lg-8 grid-margin stretch-card">
            <div class="card chart-card">
              <div class="card-header">
                <h4 class="card-title">Sales Analytics</h4>
                <div class="card-tools">
                  <button class="btn btn-tool">
                    <i class="typcn typcn-export"></i>
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div class="chart-wrapper">
                  <canvas #salesChart></canvas>
                </div>
                <div class="chart-legend">
                  <div class="legend-item purple">
                    <span class="legend-color"></span>
                    <span>Sales</span>
                  </div>
                  <div class="legend-item teal">
                    <span class="legend-color"></span>
                    <span>Revenue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Orders Overview -->
          <div class="col-lg-4 grid-margin stretch-card">
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">Orders Overview</h4>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let order of recentOrders">
                        <td>{{ order.id }}</td>
                        <td>
                          <span class="status" [class]="order.statusClass">
                            {{ order.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ng-container>
</div>
```