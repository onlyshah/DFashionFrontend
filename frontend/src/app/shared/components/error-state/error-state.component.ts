import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.scss']
})
export class ErrorStateComponent {
  @Input() icon: string = 'alert-circle';
  @Input() title: string = 'Something went wrong';
  @Input() message: string = 'An unexpected error occurred. Please try again.';
  @Input() details: string = '';
  @Input() retryText: string = 'Try Again';
  @Input() secondaryText: string = '';
  @Input() secondaryIcon: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showAnimation: boolean = true;
  @Input() showDetails: boolean = false;
  @Input() customClass: string = '';

  @Output() retry = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();

  showDetailsExpanded = false;

  get containerClasses(): string {
    const classes = ['error-state'];
    if (this.size) classes.push(`size-${this.size}`);
    if (this.showAnimation) classes.push('animated');
    if (this.customClass) classes.push(this.customClass);
    return classes.join(' ');
  }

  onRetry(): void {
    this.retry.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  toggleDetails(): void {
    this.showDetailsExpanded = !this.showDetailsExpanded;
  }
}
