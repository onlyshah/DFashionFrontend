import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatProgressSpinnerModule],
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.scss']
})
export class MediaLibraryComponent implements OnInit {
  items: any[] = [];
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.api.get('/cms/media').subscribe({ next: (r:any) => { this.items = r?.data || []; this.isLoading=false; }, error: ()=> { this.items = []; this.isLoading=false; } });
  }
}
