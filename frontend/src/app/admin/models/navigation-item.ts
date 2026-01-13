export interface NavigationItem {
  id?: string;
  title: string;
  icon?: string;
  route?: string;
  badge?: string;
  children?: NavigationItem[];
  expanded?: boolean;
  [key: string]: any;
}
