export interface NavbarAnalyticsData {
  totalSales: number;
  todaysSales: number;
  activeUsers: number;
  averageOrderValue: number;
  conversionRate: number;
  monthlyGrowth: number;
  customerRetention: number;
  cartAbandonment: number;
  weeklyRevenue: number[];
  trafficSources: { [key: string]: number };
  topProducts: any[];
}

export interface QuickAction {
  icon: string;
  label: string;
  link: string;
}