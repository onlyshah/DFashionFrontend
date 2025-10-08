import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-pollux-sidebar',
  templateUrl: './pollux-sidebar.component.html',
  styleUrls: ['./pollux-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PolluxSidebarComponent {
  navigationItems = [
    { title: 'Dashboard', route: '/dashboard', icon: 'typcn-device-desktop', badge: 'new' },
    { title: 'UI Elements', icon: 'typcn-document-text', id: 'ui-basic', expanded: false, children: [
      { title: 'Buttons', route: '/ui/buttons' },
      { title: 'Dropdowns', route: '/ui/dropdowns' },
      { title: 'Typography', route: '/ui/typography' }
    ] },
    { title: 'Form Elements', icon: 'typcn-film', id: 'form-elements', expanded: false, children: [
      { title: 'Basic Elements', route: '/forms/basic-elements' }
    ] },
    { title: 'Charts', icon: 'typcn-chart-pie-outline', id: 'charts', expanded: false, children: [
      { title: 'ChartJs', route: '/charts/chartjs' }
    ] },
    { title: 'Tables', icon: 'typcn-th-small-outline', id: 'tables', expanded: false, children: [
      { title: 'Basic Table', route: '/tables/basic-table' }
    ] }
  ];
  onMenuItemClick(item: any) { /* navigation logic */ }
  toggleSubmenu(item: any) { item.expanded = !item.expanded; }
}
