import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PolluxHeaderComponent } from '../components/pollux-header/pollux-header.component';
import { PolluxSidebarComponent } from '../components/pollux-sidebar/pollux-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, PolluxHeaderComponent, PolluxSidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {}
