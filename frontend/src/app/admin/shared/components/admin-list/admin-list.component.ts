import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../..//material.module';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() isLoading = false;
  @Input() total = 0;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() toggle = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  internalPageIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      // noop for now, placeholder for future enhancements
    }
  }

  // Columns that have custom templates defined in the HTML
  private predefinedColumns = ['fullName', 'email', 'role', 'department', 'status', 'lastLogin', 'actions'];

  get dynamicColumns(): string[] {
    return (this.displayedColumns || []).filter(c => this.predefinedColumns.indexOf(c) === -1);
  }

  // Provide a safe cell renderer with common fallbacks for generic columns
  displayCell(row: any, col: string): any {
    if (!row) return '';
    // Common mappings
    if (col === 'product') {
      return row.name || row.title || '';
    }
    if (col === 'category') {
      // category may be a string or an object
      return (row.category && (row.category.name || row.category)) || '';
    }
    if (col === 'price') {
      return row.price != null ? row.price : '';
    }
    // generic fallback
    return row[col] != null ? row[col] : '';
  }

  onPage($event: any) {
    this.internalPageIndex = $event.pageIndex;
    this.pageChange.emit({ pageIndex: $event.pageIndex, pageSize: $event.pageSize });
  }

  onSort($event: any) {
    this.sortChange.emit($event);
  }

  onEdit(row: any) { this.edit.emit(row); }
  onToggle(row: any) { this.toggle.emit(row); }
  onRemove(row: any) { this.remove.emit(row); }
}
