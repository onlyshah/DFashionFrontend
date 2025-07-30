import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RBACService } from '../services/rbac.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private permission: string | string[] = '';
  private requireAll = false;
  private subscription?: Subscription;

  @Input() set hasPermission(permission: string | string[]) {
    this.permission = permission;
    this.updateView();
  }

  @Input() set hasPermissionRequireAll(requireAll: boolean) {
    this.requireAll = requireAll;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (!this.permission) {
      this.viewContainer.clear();
      return;
    }

    const permissions = Array.isArray(this.permission) ? this.permission : [this.permission];
    
    const checkMethod = this.requireAll 
      ? this.rbacService.hasAllPermissions(permissions)
      : this.rbacService.hasAnyPermission(permissions);

    this.subscription = checkMethod.subscribe(hasAccess => {
      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

@Directive({
  selector: '[hasFeature]',
  standalone: true
})
export class HasFeatureDirective implements OnInit, OnDestroy {
  private feature = '';
  private subscription?: Subscription;

  @Input() set hasFeature(feature: string) {
    this.feature = feature;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (!this.feature) {
      this.viewContainer.clear();
      return;
    }

    this.subscription = this.rbacService.hasFeature(this.feature).subscribe(hasAccess => {
      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private role: string | string[] = '';
  private subscription?: Subscription;

  @Input() set hasRole(role: string | string[]) {
    this.role = role;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (!this.role) {
      this.viewContainer.clear();
      return;
    }

    const roles = Array.isArray(this.role) ? this.role : [this.role];
    
    this.subscription = this.rbacService.getCurrentRole().subscribe(currentRole => {
      const hasRole = currentRole && roles.includes(currentRole.id);
      
      if (hasRole) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

@Directive({
  selector: '[hasMinRoleLevel]',
  standalone: true
})
export class HasMinRoleLevelDirective implements OnInit, OnDestroy {
  private level = 999;
  private subscription?: Subscription;

  @Input() set hasMinRoleLevel(level: number) {
    this.level = level;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.rbacService.hasMinimumRoleLevel(this.level).subscribe(hasAccess => {
      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}

@Directive({
  selector: '[isAdmin]',
  standalone: true
})
export class IsAdminDirective implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.subscription = this.rbacService.isAdmin().subscribe(isAdmin => {
      if (isAdmin) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@Directive({
  selector: '[isSuperAdmin]',
  standalone: true
})
export class IsSuperAdminDirective implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.subscription = this.rbacService.isSuperAdmin().subscribe(isSuperAdmin => {
      if (isSuperAdmin) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@Directive({
  selector: '[isVendor]',
  standalone: true
})
export class IsVendorDirective implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.subscription = this.rbacService.isVendor().subscribe(isVendor => {
      if (isVendor) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@Directive({
  selector: '[isCustomer]',
  standalone: true
})
export class IsCustomerDirective implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private rbacService: RBACService
  ) {}

  ngOnInit() {
    this.subscription = this.rbacService.isCustomer().subscribe(isCustomer => {
      if (isCustomer) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
