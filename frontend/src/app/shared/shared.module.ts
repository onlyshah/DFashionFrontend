import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Standalone shared components
import { HeaderComponent } from '../enduser-app/shared/components/header/header.component';
import { NotificationComponent } from '../enduser-app/shared/components/notification/notification.component';
import { MobileLayoutComponent } from '../enduser-app/shared/components/mobile-layout/mobile-layout.component';

@NgModule({
  imports: [CommonModule, FormsModule, HeaderComponent, NotificationComponent, MobileLayoutComponent],
  exports: [CommonModule, FormsModule, HeaderComponent, NotificationComponent, MobileLayoutComponent]
})
export class SharedModule {}
