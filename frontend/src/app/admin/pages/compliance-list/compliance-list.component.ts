import { Component, OnInit } from '@angular/core';
import { ComplianceService } from '../../services/compliance.service';

@Component({
  selector: 'app-compliance-list',
  templateUrl: './compliance-list.component.html',
  styleUrls: ['./compliance-list.component.scss']
})
export class ComplianceListComponent implements OnInit {
  items: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private complianceService: ComplianceService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.error = null;
    this.complianceService.getItems().subscribe({
      next: (res) => { 
        console.log('Compliance items loaded:', res);
        this.items = res || []; this.isLoading = false; },
    
      error: (err) => { this.error = 'Failed to load compliance items from backend.'; console.error(err); this.isLoading = false; }
    });
  }
}
