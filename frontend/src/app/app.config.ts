import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { apiRequestsInterceptor } from './core/interceptors/APIrequests.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor, apiRequestsInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      MatSnackBarModule,
      MatDialogModule,
      IonicModule.forRoot({
        mode: 'ios',
        rippleEffect: true,
        animated: true
      }),
      IonicStorageModule.forRoot()
    )
  ]
};
