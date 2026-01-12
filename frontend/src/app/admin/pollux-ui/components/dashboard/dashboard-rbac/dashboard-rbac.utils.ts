export function canAccessDashboard(role: string, requiredRole: string): boolean {
  if (!role || !requiredRole) return false;
  if (role === requiredRole) return true;
  // Admins can access all dashboards
  if (role === 'admin') return true;
  return false;
}
