import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { ValidationService } from '../services/validation.service';
import { XssProtectionService } from '../services/xss-protection.service';
import { CsrfService } from '../services/csrf.service';
import { ContentSecurityPolicyService } from '../services/csp.service';
import { ApiSecurityService } from '../services/api-security.service';

// Interceptors
import { SecurityInterceptor } from '../interceptors/security.interceptor';
import { CsrfInterceptor } from '../services/csrf.service';

// Guards
import { CsrfGuard } from '../services/csrf.service';

// Directives
import { XssProtectionDirective } from '../services/xss-protection.service';

// Pipes
import { SafeHtmlPipe } from '../services/xss-protection.service';

@NgModule({
  declarations: [
    XssProtectionDirective,
    SafeHtmlPipe
  ],
  imports: [
    CommonModule
  ],
  providers: [
    // Security Services
    ValidationService,
    XssProtectionService,
    CsrfService,
    ContentSecurityPolicyService,
    ApiSecurityService,
    
    // Guards
    CsrfGuard,
    
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SecurityInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true
    }
  ],
  exports: [
    XssProtectionDirective,
    SafeHtmlPipe
  ]
})
export class SecurityModule {
  constructor(private cspService: ContentSecurityPolicyService) {
    // Initialize CSP on module load
    this.cspService.cleanupNonces();
  }
}
