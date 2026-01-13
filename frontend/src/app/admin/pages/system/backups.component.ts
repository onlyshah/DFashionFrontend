import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './backups.component.html',
  styleUrls: ['./backups.component.scss']
})
export class BackupsComponent implements OnInit {
  items: any[] = [];
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.api.get('/system/backups').subscribe({ next: (r:any) => { this.items = r?.data || []; this.isLoading=false; }, error: ()=> { this.items=[]; this.isLoading=false; } });
  }
}
