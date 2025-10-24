import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolluxSidebarComponent } from './pollux-sidebar.component';
@NgModule({
  imports: [CommonModule, PolluxSidebarComponent],
  exports: [PolluxSidebarComponent]
})
export class PolluxSidebarModule {}
