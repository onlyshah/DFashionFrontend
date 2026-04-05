import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-view-stories',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './view-stories.component.html',
  styleUrls: ['./view-stories.component.scss']
})
export class ViewStoriesComponent {
  @Input() visible = false;
  @Input() stories: any[] = [];
  @Input() currentIndex = 0;
  @Output() close = new EventEmitter<void>();
  @Output() changeIndex = new EventEmitter<number>();

  get currentStory() {
    return this.stories?.[this.currentIndex] || null;
  }

  get hasPrevious() {
    return this.currentIndex > 0;
  }

  get hasNext() {
    return this.currentIndex < (this.stories?.length || 0) - 1;
  }

  onClose(): void {
    this.close.emit();
  }

  goPrevious(): void {
    if (this.hasPrevious) {
      this.changeIndex.emit(this.currentIndex - 1);
    }
  }

  goNext(): void {
    if (this.hasNext) {
      this.changeIndex.emit(this.currentIndex + 1);
    }
  }
}
