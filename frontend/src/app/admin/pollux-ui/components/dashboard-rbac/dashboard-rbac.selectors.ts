export function selectDashboardComponent(role: string): string {
  switch (role) {
    case 'admin':
      return 'dashboard-admin';
    case 'vendor':
      return 'dashboard-vendor';
    case 'user':
      return 'dashboard-user';
    case 'influencer':
      return 'dashboard-influencer';
    default:
      return 'dashboard-rbac';
  }
}
