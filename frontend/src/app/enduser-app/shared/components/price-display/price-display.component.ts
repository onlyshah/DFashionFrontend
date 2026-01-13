import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-price-display',
    styleUrls: ['./price-display.component.scss'],
    templateUrl: './price-display.component.html'
})
export class PriceDisplayComponent {
    @Input() currentPrice: number = 0;
    @Input() originalPrice?: number;
    @Input() currency: string = '₹';
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Input() showSavings: boolean = false;
    @Input() currentPriceColor: string = '#2e7d32';
    @Input() discountColor: string = '#f44336';

    get discountPercentage(): number {
        if (!this.originalPrice || this.originalPrice <= this.currentPrice) {
            return 0;
        }
        return Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
    }

    get savings(): number {
        if (!this.originalPrice || this.originalPrice <= this.currentPrice) {
            return 0;
        }
        return this.originalPrice - this.currentPrice;
    }
}
