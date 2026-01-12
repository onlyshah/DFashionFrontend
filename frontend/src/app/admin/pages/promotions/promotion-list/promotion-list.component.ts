import { Component, OnInit } from '@angular/core';
import { PromotionService } from '../../../services/promotion.service';
import { Console } from 'console';

@Component({
  selector: 'app-promotion-list',
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.scss']
})
export class PromotionListComponent implements OnInit {
  promotions: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.error = null;
    this.promotionService.getPromotions().subscribe({
      next: (res) => { 
        console.log('Promotions loaded:', res);
        this.promotions = res || []; this.isLoading = false; },
      error: (err) => { this.error = 'Failed to load promotions from backend.'; console.error(err); this.isLoading = false; }
    });
  }
}
