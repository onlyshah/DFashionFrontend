import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-creators-management',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTooltipModule, MatChipsModule
  ],
  templateUrl: './creators.component.html',
  styleUrls: ['./creators.component.scss']
})
export class CreatorsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['username', 'email', 'followers', 'content', 'engagement', 'status', 'actions'];
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
    this.api.getCreators().subscribe({
      next: (res: any) => {
        console.log('Creators loaded:', res);
        this.dataSource.data = res?.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.dataSource.data = [];
        this.isLoading = false;
      }
    });
  }

  applyFilter(e: any): void {
    this.dataSource.filter = e.target.value.trim().toLowerCase();
  }

  deleteUser(id: string): void {
    if (confirm('Delete this creator?')) {
      this.api.delete(`/admin/users/${id}`).subscribe({
        next: () => this.load(),
        error: () => {}
      });
    }
  }

  toggleStatus(id: string, currentStatus: boolean): void {
    this.api.patch(`/admin/users/${id}`, { isActive: !currentStatus }).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }
}
