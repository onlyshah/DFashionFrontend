import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-newsletters',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.scss']
})
export class NewslettersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns = ['subject', 'recipient', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.isLoading = true;
    this.api.get('/marketing/newsletters').subscribe({
      next: (res: any) => { this.dataSource.data = res?.data || []; this.isLoading = false; },
      error: () => { this.dataSource.data = []; this.isLoading = false; }
    });
  }

  applyFilter(e: any): void {
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }

  delete(id: string): void {
    if (confirm('Delete this newsletter?')) {
      this.api.delete(`/marketing/newsletters/${id}`).subscribe({ next: () => this.load(), error: () => {} });
    }
  }
}
