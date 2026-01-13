import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './system-logs.component.html',
  styleUrls: ['./system-logs.component.scss']
})
export class SystemLogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns = ['message', 'level', 'timestamp'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.isLoading = true;
    this.api.get('/system/logs').subscribe({ next: (r:any) => { this.dataSource.data = r?.data || []; this.isLoading=false; }, error: ()=> { this.dataSource.data = []; this.isLoading=false; } });
  }

  applyFilter(e:any): void { this.dataSource.filter = e.target.value.trim().toLowerCase(); }
}
