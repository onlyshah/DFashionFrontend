import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
  tasks: any[] = [];
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.api.get('/system/maintenance').subscribe({ next: (r:any) => { this.tasks = r?.data || []; this.isLoading=false; }, error: ()=> { this.tasks=[]; this.isLoading=false; } });
  }
}
