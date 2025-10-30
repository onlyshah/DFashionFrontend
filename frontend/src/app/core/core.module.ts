import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingService } from './services/loading.service';
import { ErrorHandlingService } from './services/error-handling.service';

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
        LoadingService,
        ErrorHandlingService
    ]
})
export class CoreModule { }