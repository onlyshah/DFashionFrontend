import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolluxNavbarComponent } from './pollux-navbar.component';
@NgModule({
  imports: [CommonModule, PolluxNavbarComponent],
  exports: [PolluxNavbarComponent]
})
export class PolluxNavbarModule {}
