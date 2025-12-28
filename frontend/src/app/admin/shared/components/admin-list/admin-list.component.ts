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
