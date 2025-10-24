import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolluxFooterComponent } from './pollux-footer.component';
@NgModule({
  imports: [CommonModule, PolluxFooterComponent],
  exports: [PolluxFooterComponent]
})
export class PolluxFooterModule {}
