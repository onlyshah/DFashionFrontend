import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LoginImageService } from './login-image.service';

@Component({
  selector: 'app-image-card-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-card-slider.component.html',
  styleUrls: ['./image-card-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageCardSliderComponent implements OnInit, OnDestroy {
  images$: Observable<string[]>;
  currentIndex = 0;
  private displayCount = 1;
  private readonly cardLimit = 10;
  private subscription = new Subscription();
  private intervalId: any;

  constructor(
    private loginImageService: LoginImageService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
  ) {
    this.images$ = this.loginImageService.images$;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.images$.subscribe(images => {
        this.displayCount = Math.min(images.length, this.cardLimit);
        if (this.currentIndex >= this.displayCount) {
          this.currentIndex = 0;
        }
      })
    );

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => this.nextSlide());
      }, 3200);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    clearInterval(this.intervalId);
  }

  trackByUrl(index: number, url: string): string | number {
    return url || index;
  }

  nextSlide(): void {
    if (!this.displayCount) {
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.displayCount;
    this.cd.markForCheck();
  }

  getPosition(index: number): string {
    if (this.displayCount === 0) {
      return 'hidden';
    }

    const relative = (index - this.currentIndex + this.displayCount) % this.displayCount;
    if (relative === 0) {
      return 'top';
    }
    if (relative === 1) {
      return 'next';
    }
    if (relative === 2) {
      return 'stack-2';
    }
    if (relative === 3) {
      return 'stack-3';
    }
    if (relative === 4) {
      return 'stack-4';
    }
    return 'hidden';
  }
}
