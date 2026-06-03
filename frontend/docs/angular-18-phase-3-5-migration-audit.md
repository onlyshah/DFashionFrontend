# Angular 18 Phase 3-5 Migration Audit

Date: 2026-06-03
Scope: `src/app`
Mode: Audit only. No components, services, routes, or modules were converted or removed.

## Executive Summary

The application is already partially standalone: `main.ts` uses `bootstrapApplication(AppComponent, appConfig)`, `AppComponent` is standalone, many routed admin/end-user components are standalone, and route arrays are already used in several end-user features. However, the codebase still has important NgModule boundaries that own routing, Ionic setup, Material aggregation, admin providers, interceptors, declarations, pipes, and security wiring.

Do not perform a bulk module deletion. The safe path is route-by-route standalone migration, followed by provider relocation, followed by module removal only after route/provider/declaration checks pass.

High-risk findings:

- `AppModule` appears legacy because `main.ts` bootstraps standalone, but it still contains Ionic, storage, FontAwesome, Material, global services, and legacy admin declarations. REVIEW REQUIRED before deletion.
- `AdminModule` is still active through `/admin` lazy loading and registers admin services, guards, declarations, pipes, schemas, and an HTTP interceptor. DO NOT REMOVE.
- `SecurityModule` registers `HTTP_INTERCEPTORS` and security directives/pipes. DO NOT REMOVE unless its providers are moved to app-level config.
- Mobile is not purely duplicate. Some mobile modules are wrappers around end-user components, but many mobile pages are dedicated Ionic pages with different UX.
- Signals migration should be selective. Realtime sockets, upload progress, debounced search streams, HTTP streams, and event streams should remain RxJS-first.

## Phase 3: Standalone Migration Report

### NgModule Audit

| Module | Purpose | Used By | Dependencies | Lazy Loaded | Can Convert To Standalone | Risk |
|---|---|---|---|---|---|---|
| `AppModule` | Legacy app bootstrap and global imports/providers | Possibly legacy tests/build artifacts; not current `main.ts` bootstrap | Browser, animations, HTTP, forms, Ionic, storage, FontAwesome, Material, `SharedModule`, global services, admin declarations | No | REVIEW REQUIRED. Migrate any remaining provider/test expectations first | High |
| `AppRoutingModule` | Root routes and preloading | `app.config` via `importProvidersFrom(AppRoutingModule)` | AuthGuard, lazy modules, standalone routes, redirects | Root | Convert to `provideRouter(routes, withPreloading(...))` | High |
| `MaterialModule` | Aggregates Angular Material modules | App/admin/components | Material imports/exports | No | Keep until standalone imports are localized | Medium |
| `SharedModule` | Wrapper for standalone shared UI | `AppComponent`, mobile home, Pollux UI | `HeaderComponent`, `NotificationComponent`, `MobileLayoutComponent`, Common/Forms | No | Convert consumers to direct standalone imports, then remove | Medium |
| `CoreModule` | Legacy provider module | Not seen imported in root during current bootstrap | `LoadingService`, `ErrorHandlingService` | No | REVIEW REQUIRED; services are `providedIn: root`, but module may be test/import artifact | Medium |
| `SecurityModule` | Security services, CSRF/CSP, interceptors, XSS directive/pipe | Not currently seen imported in root, but security-critical | `HTTP_INTERCEPTORS`, `CsrfGuard`, XSS directive/pipe | No | Only after moving interceptors/providers/directives explicitly | Critical |
| `AuthModule` | Auth child routes | `/auth` | Login/register/forgot/reset standalone components, ReactiveForms, Router child routes | Yes | Convert to `auth.routes.ts` | Medium |
| `AdminModule` | Admin feature shell and provider boundary | `/admin` | `AdminRoutingModule`, admin services, guards, Material, pipes, declarations, schemas, `authInterceptor` | Yes | Defer. Split into route providers and standalone route tree first | Critical |
| `AdminRoutingModule` | Admin route tree and permission metadata | `AdminModule` | `AdminAuthGuard`, `PermissionGuard`, `SuperAdminGuard`, many routed components | Child | Convert to `admin.routes.ts` after all declared components become standalone | Critical |
| `PolluxUiModule` | Legacy/experimental admin UI package | Not active in `AdminModule`; imports shared UI | Placeholder dashboards/product/category components, `UnifiedDashboardComponent` | No | REVIEW REQUIRED; likely legacy, but exported components may be referenced by tests or future admin UI | Medium |
| `DashboardRbacModule` | Wrapper around standalone RBAC dashboard | Internal dashboard-rbac feature | RBAC component, role-specific dashboard components | Route file exists but not active in admin root | Can remove only if no external imports | Medium |
| `mobile/tabs/TabsPageModule` | Ionic tab shell | `/tabs` | `TabsPageRoutingModule`, Ionic, tab page | Yes | Convert carefully; owns many child mobile routes | High |
| `mobile/home/HomePageModule` | Mobile route wrapper for end-user home | `/tabs/home` | Ionic, Swiper registration, `SharedModule`, `HomeComponent` | Yes | Convert route wrapper; preserve Swiper registration | Medium |
| `mobile/cart/CartPageModule` | Mobile route wrapper for end-user cart | `/mobile-cart`, `/tabs/cart` | Ionic, `CartComponent` | Yes | Low-risk wrapper conversion | Medium |
| `mobile/wishlist/WishlistPageModule` | Mobile route wrapper for end-user wishlist | `/mobile-wishlist`, `/tabs/wishlist` | Ionic, `WishlistComponent` | Yes | Low-risk wrapper conversion | Medium |
| `mobile/profile/ProfilePageModule` | Mobile route wrapper for end-user profile | `/mobile-profile`, `/tabs/profile` | Ionic, `ProfilePageRoutingModule`, `ProfileComponent` | Yes | Low-risk wrapper conversion | Medium |
| `mobile/categories/CategoriesPageModule` | Dedicated Ionic categories page | `/tabs/categories` | Ionic, categories page/routing | Yes | Convert page route, do not merge yet | Medium |
| `mobile/reels/ReelsPageModule` | Dedicated Ionic reels page | `/reels`, `/tabs/reels` | Ionic, custom schema, reels page | Yes | Convert carefully; social/video UX | High |
| `mobile/stories/StoriesPageModule` | Dedicated Ionic stories page | `/mobile-stories`, `/tabs/stories` | Ionic, stories page | Yes | Convert carefully; story UX | High |
| `mobile/posts/PostsPageModule` | Dedicated Ionic posts routes | `/mobile-posts`, `/tabs/posts` | Ionic posts list/detail pages | Yes | Convert route file, keep mobile UX | High |
| `mobile/orders/OrdersPageModule` | Dedicated Ionic orders page | `/mobile-orders`, `/tabs/orders` | Ionic orders page/routing | Yes | Convert route file, keep mobile UX | High |
| `mobile/search/SearchPageModule` | Dedicated/wrapper mobile search | `/mobile-search` | Ionic search route/page | Yes | REVIEW REQUIRED; compare with end-user search | Medium |
| `mobile/checkout/CheckoutPageModule` | Placeholder Ionic checkout page | `/tabs/checkout/:id` | Inline standalone component, Ionic | Yes | REVIEW REQUIRED; checkout is business-critical and current mobile page is placeholder | Critical |
| `mobile/vendor/VendorPageModule` | Dedicated Ionic vendor page | `/mobile-vendor`, `/tabs/vendor` | Vendor route/page; child vendor routes commented | Yes | REVIEW REQUIRED; vendor permissions and product/order flows | High |

### Module Removal Safety Checks

Before any module removal, verify:

- Routes: root `/auth`, `/admin`, `/tabs`, `mobile-*`, `/shop`, `/profile`, `/posts`, `/search`, `/dashboard`, `/vendor/dashboard`.
- Providers: admin services, `RouteReuseStrategy`, storage, Ionic controllers, security services, guards.
- Interceptors: `authInterceptor`, `apiRequestsInterceptor`, `SecurityInterceptor`, `CsrfInterceptor`.
- Guards: root `AuthGuard`, admin auth/permission/role/super-admin, dashboard RBAC guard.
- Declarations: admin `UserDialogComponent`, `ProductManagementComponent`, `ProductDialogComponent`, `OrderDetailsComponent`, `AnalyticsComponent`, admin pipes.
- Shared pipes/directives: admin pipes, enduser pipes, security XSS pipe/directive, image fallback directives.
- Global services: auth, cart, wishlist, product state, notification, layout, mobile optimization, storage.

Any module owning one of these dependencies is REVIEW REQUIRED and must not be removed directly.

## Component Analysis

### Active Component Categories

Active route components:

- Auth: login, register, forgot password, reset password.
- End-user: home, explore, shop, product detail, category, cart, checkout, wishlist, profile, settings, posts, search, activity, saved, report, threads, user dashboard, customer dashboard, vendor dashboard.
- Admin: general dashboard, super admin dashboard, users/customers/vendors/creators/admins, roles, products, categories, orders, analytics, settings, returns, marketing, CMS, inventory, social, payments, live commerce, reviews, reports, security, support, AI, alerts.
- Mobile: tabs, categories, reels, stories, posts, orders, checkout, notifications, messages, product detail, payment methods, returns, reviews, vendor profile, order history.

Shared components:

- `HeaderComponent`, `NotificationComponent`, `MobileLayoutComponent`, `MobileBottomNavComponent`, `AvatarComponent`, `UserAvatarComponent`, `LoadingSpinnerComponent`, `LoadingStateComponent`, `NotificationCenterComponent`, `ProductCardComponent`, `PriceDisplayComponent`, `FileUploadComponent`, `UploadProgressComponent`, `RealtimeNotificationsComponent`, `CreateModalComponent`, `CreateContentModalComponent`, `ShoppingActionsComponent`.

Admin only:

- Admin header/sidebar/loading, admin dashboards, admin CRUD pages, admin reports, admin pipes, admin guards/services.

Vendor only:

- `enduser-app/features/vendor/pages/*`, `mobile/vendor/*`, and admin vendor management dashboards are role-specific and not direct duplicates.

Mobile only:

- `mobile/**` Ionic pages and tab shell. Wrapper modules around end-user components can be migrated, but dedicated pages must be preserved until UX/API parity is proven.

Legacy/review candidates:

- `admin/models/pollux-ui.module.ts` and `admin/models/dashboard/pollux-dashboard.component.ts`: placeholder/legacy Pollux UI surface.
- `admin/components/unified-dashboard/unified-dashboard.component.ts`: placeholder, only seen imported by Pollux UI.
- `admin/pages/components/dashboard-switcher`: testing utility per source comment.
- Duplicate-looking admin model/page components: product/category management under `admin/models` vs `admin/pages`.

## Duplicate Component Report

| Component Group | Can Merge | Reason | Potential Impact / What Will Break | Migration Strategy |
|---|---|---|---|---|
| `admin/pages/vendor/dashboard/vendor-dashboard` vs `enduser-app/features/vendor/pages/dashboard/vendor-dashboard` | No | Admin vendor dashboard is admin-scoped; end-user vendor dashboard calls `VendorService.getDashboardStats()` and is routed by `/vendor/dashboard` with `AuthGuard` | Vendor self-service metrics, admin/vendor role separation | Keep separate; rename for clarity if needed |
| `customer-dashboard` vs `user-dashboard` | Partial | `UserDashboardComponent` wraps customer dashboard for desktop and has mobile-specific dashboard UI | `/dashboard`, mobile customer UX | Keep `UserDashboardComponent` as role/device shell; consolidate only duplicated display widgets |
| `dashboard-admin`, `dashboard-vendor`, `dashboard-user`, `dashboard-influencer`, `dashboard-rbac` | No immediate merge | RBAC-selected role dashboards, some placeholder/simple, connected through RBAC component/routes/services | Role-based dashboard access and tests | Keep until RBAC route strategy is decided; replace placeholders with real role widgets later |
| `general-dashboard` vs `super-admin-dashboard` | No | Different route permissions; `dashboard/super` guarded by super-admin guard | Super-admin access, admin landing | Keep separate; share metric widgets/services only |
| `admin/pages/products/product-management` vs `admin/models/products/product-management` | REVIEW REQUIRED | Same name, different selector; page version is routed/imported by admin module; model/Pollux version appears legacy/exported by Pollux module | Product management/admin UI | Keep routed page; quarantine Pollux candidate after reference/test scan |
| `admin/pages/categories/category-management` vs `admin/categories/category-management` | REVIEW REQUIRED | Same purpose/name, different path/selector; routed page is active | Category management | Keep routed page; evaluate admin/categories as legacy |
| `post-detail.component` in `features/posts` vs `features/posts/pages/post-detail` | REVIEW REQUIRED | Root `/post/:id` uses top-level component; `posts.routes` may use pages version | Social post detail route breakage | Preserve both until route mapping is unified |
| `order-confirmation` end-user vs mobile | No direct merge | End-user checkout confirmation and mobile Ionic confirmation route differ | Checkout/order UX | Keep separate until mobile checkout is rebuilt against same order contract |
| `settings` admin vs profile settings | No | Admin platform settings vs user profile settings | Settings permissions and UI | Keep separate |
| `product-detail` admin vs customer product detail | No | Admin product management vs customer shopping detail | Product management/customer browsing | Keep separate |
| `payment-methods` admin vs customer payment methods | No | Admin payment config vs checkout payment selection | Payments | Keep separate |
| `support-tickets` admin vs end-user support | No | Admin support queue vs customer ticket surface | Support workflows | Keep separate |

## Shared Component Consolidation Report

| Area | Status | Keep | Merge | Delete | Reason |
|---|---|---|---|---|---|
| `avatar.component` vs `user-avatar.component` | Partial overlap | Both for now | Merge only after input/output/API comparison | No | Generic avatar vs user-specific backend fallback behavior |
| `loading.component` admin vs `loading-spinner`/`loading-state` end-user | Partial overlap | Admin loading and end-user states | Shared primitive spinner may be extracted | No | Admin loading supports admin-specific progress/message surface |
| `notification.component` vs `notification-center` vs `realtime-notifications` | Unique/partial overlap | All | Do not merge realtime stream into toast notification | No | Toast UI, notification center, and socket-driven realtime are different concerns |
| `header.component` vs `main-nav.component` | Partial overlap | Both | Review navigation roles/routes | No | Header used by root app; main nav is end-user feature navigation |
| `mobile-bottom-nav.component` | Unique | Yes | No | No | Mobile route/nav behavior; must preserve mobile experience |
| `image-fallback.directive` in `shared` and `enduser-app/shared` | Likely duplication | One canonical directive | Yes, after selector/API check | Maybe one copy | Same name and purpose in two shared trees |
| Currency/role pipes in admin and enduser shared | Partial overlap | Both until formatting/role labels compared | Possible shared pipe library | No | Admin role display may differ from customer-facing labels |

## Phase 4: Feature Architecture Report

### Target Structure

Recommended target:

```text
src/app/
  app.routes.ts
  app.config.ts
  core/
    auth/
    http/
    guards/
    security/
    services/
    state/
  shared/
    components/
    directives/
    pipes/
    ui/
  layouts/
    app-shell/
    admin-shell/
    mobile-shell/
  features/
    auth/
    home/
    explore/
    reels/
    stories/
    posts/
    products/
    cart/
    checkout/
    wishlist/
    profile/
    messages/
    notifications/
    orders/
    support/
    search/
    vendor/
    dashboard/
  admin/
    routes/
    dashboard/
    users/
    products/
    orders/
    payments/
    marketing/
    cms/
    inventory/
    social/
    live-commerce/
    reports/
    security/
    support/
    settings/
  mobile/
    routes/
    tabs/
    pages/
```

### Migration Map

| Source Path | Target Path | Reason | Risk |
|---|---|---|---|
| `auth/*` | `features/auth/*` | Auth is a business feature and already standalone-ready | Medium |
| `enduser-app/features/home` | `features/home` | Canonical customer home | Medium |
| `enduser-app/features/explore` | `features/explore` | Social discovery feature | Medium |
| `enduser-app/features/posts` | `features/posts` | Social posts feature | High |
| `enduser-app/features/shop/pages/cart` | `features/cart` | Cart is business-critical and should own route/state UI | Critical |
| `enduser-app/features/shop/pages/checkout` | `features/checkout` | Checkout needs isolated ownership | Critical |
| `enduser-app/features/shop/pages/product-detail` and `shop.component` | `features/products` | Product browsing/details | High |
| `enduser-app/features/wishlist` | `features/wishlist` | Wishlist state/UI feature | High |
| `enduser-app/features/profile` | `features/profile` | User profile/settings | High |
| `enduser-app/features/notifications` | `features/notifications` | User notification screens | High |
| `enduser-app/features/vendor` | `features/vendor` | Vendor self-service, not admin | Critical |
| `enduser-app/features/customer-dashboard`, `user-dashboard` | `features/dashboard/customer` | Customer dashboard route/device shell | High |
| `admin/pages/*` | `admin/<domain>/*` | Admin domain organization | Critical |
| `admin/pages/components/*` | `layouts/admin-shell` plus `admin/dashboard` | Header/sidebar shell and dashboards should be separated | High |
| `mobile/*` wrappers | `mobile/routes` or direct route arrays | Preserve mobile URLs while reducing wrapper modules | Medium |
| `mobile/*` dedicated pages | `mobile/pages/<feature>` | Dedicated mobile UX | High |
| `enduser-app/shared/*` and root `shared/*` | `shared/*` | Single shared component/directive/pipe library | High |
| `core/services/*` | `core/services` + `core/state` + feature services | Split global services from feature state | High |

### Mobile Refactor Analysis

Classification:

- Duplicate/wrapper pages: mobile `cart`, `wishlist`, `profile`, `home` mostly route to end-user components. Keep route compatibility, convert modules to route arrays later.
- Dedicated mobile experience: `tabs`, `categories`, `reels`, `stories`, `posts`, `orders`, `notifications`, `messages`, `product`, `payment`, `returns`, `reviews`, `vendor`, `order-confirmation`, `checkout`.
- Critical warning: mobile checkout is currently a placeholder page while end-user checkout has real feature code. Do not delete either; rebuild mobile checkout deliberately against the real checkout/order/payment contract.

Mobile merge decision:

- Merge: only route-wrapper modules after direct route conversion and mobile regression tests.
- Keep separate: dedicated Ionic pages, social media pages, orders, checkout, product detail, notifications/messages, vendor.
- Reason: mobile has different navigation shell, Ionic controls, likely performance/gesture expectations, and separate route URLs.

## Phase 5: Signals Migration Report

### Service State Pattern Audit

| Service | Current Pattern | Signal Candidate | Complexity |
|---|---|---|---|
| `AuthService` | BehaviorSubject for user/auth, timers, HTTP refresh | Partial: expose user/session as signals, keep HTTP/timers RxJS | High |
| `CartService` | BehaviorSubject state + HTTP + optimistic/local storage | Yes for cart items/count/summary UI state; keep HTTP observables | High |
| `WishlistService` | BehaviorSubject state + optimistic mutations + HTTP | Yes for items/count; keep mutation observables | High |
| `ProductStateService` | Map of BehaviorSubjects + Subject events | Good signal-store candidate | Medium |
| `SearchService` | BehaviorSubjects + debounced Subject + HTTP/cache | Partial: query/filter/loading signals; keep debounce stream and HTTP RxJS | High |
| `NotificationService` | BehaviorSubject toast list + timers | Good signal candidate | Low |
| `RealtimeNotificationService` | Socket.IO + BehaviorSubjects | KEEP RXJS for socket stream; optional read-only signals for UI | Critical |
| `FileUploadService` | HTTP events + BehaviorSubject progress | KEEP RXJS for upload stream; optional progress signal wrapper | Critical |
| `UploadService` | Upload/progress/realtime patterns | KEEP RXJS | Critical |
| `LayoutService` | BehaviorSubject route-derived layout | Good signal candidate using router subscription/effect bridge | Medium |
| `LoadingService` | BehaviorSubject + Ionic async controller | Partial signal for `isLoading`; keep async controller | Medium |
| `MobileOptimizationService` | BehaviorSubjects from resize/event streams | Partial: expose signals; keep `fromEvent` RxJS | Medium |
| `PaymentService` | BehaviorSubject/Subject + HTTP | Partial; keep payment HTTP/event streams | High |
| `RBAC/Permission services` | BehaviorSubject/HTTP/role state | Good signal candidate for current role/permissions | Medium |
| `CategoryService` | BehaviorSubject/cache/HTTP | Partial; keep HTTP/cache streams | Medium |
| `FollowService` | HTTP + cached BehaviorSubject | Partial | Medium |
| `VendorService` | Dashboard stats BehaviorSubject + HTTP | Partial | Medium |
| `DataFlowService` | App-wide BehaviorSubjects and combined streams | Signal store candidate, but high blast radius | Critical |
| `Social* services` | BehaviorSubject/Subject/realtime/social events | KEEP RXJS for events; convert only selected UI state | High |
| Admin API/domain services | Mostly HTTP observables; some BehaviorSubject caches | Keep HTTP RxJS; use signals only for local view state | Medium |

### RxJS To Signals Safety Check

KEEP RXJS:

- WebSocket/Socket.IO: `RealtimeNotificationService`, social realtime services, analytics realtime candidates.
- SSE/streaming/event APIs.
- Upload progress: `FileUploadService`, upload/media/content creation flows.
- HTTP request APIs and mutation returns.
- Debounced search input and autocomplete pipelines.
- Infinite scroll/page streams.
- Chat, live commerce, notifications, presence, and event streams.

CONVERT TO SIGNAL:

- UI-only state: loading flags, selected tabs/views, local filters, layout flags.
- Cart count/summary as derived signals after preserving HTTP observables.
- Wishlist count/items view state.
- User session/current role as read-only signal facade.
- Selected product/product state map.
- Theme/navigation state.
- Toast notification list.

## Impact Analysis For Deletion Candidates

No deletion is production-safe in this audit pass. Candidates below require additional reference/test scans.

| File/Area | Purpose | Used By | If Deleted | Risk | Alternative |
|---|---|---|---|---|---|
| `AppModule` | Legacy bootstrap/provider module | Legacy build/test possible | Ionic/storage/FontAwesome/provider assumptions may break | High | Keep until app bootstrap audit complete |
| `CoreModule` | Legacy provider module | Unknown imports/tests | Loading/error provider assumptions may break | Medium | Keep or remove only after reference scan |
| `SecurityModule` | Security interceptors/directives/pipes | Security integration | CSRF/security headers/XSS protections break | Critical | Move providers to `app.config` first |
| `AdminModule` | Admin route/provider/declaration boundary | `/admin` | Admin app, permissions, routes break | Critical | Convert admin routes/providers incrementally |
| `PolluxUiModule` and `admin/models/*` | Legacy/placeholder admin UI | Pollux module exports | Possible test/future UI breakage | Medium | Quarantine, then remove after no refs/tests |
| `DashboardSwitcherComponent` | Dashboard testing utility | Unknown | Test/debug route utility loss | Low/Medium | Move to dev-only area |
| `UnifiedDashboardComponent` | Placeholder | Pollux module | Placeholder only, but import break possible | Medium | Remove after Pollux removal |
| Mobile modules | Mobile route wrappers/pages | `/tabs`, `mobile-*` | Mobile navigation/checkout/orders/social break | High/Critical | Convert to routes; preserve URLs |
| Duplicate shared directives/pipes | Shared UI utilities | Templates/imports | Template compile errors | Medium | Merge only after selector/import migration |

## Components That Must NOT Be Deleted

- `AppComponent`, `HeaderComponent`, `NotificationComponent`, `MobileLayoutComponent`, `MobileBottomNavComponent`.
- Auth route components: login, register, forgot password, reset password.
- Checkout/cart/payment/order components and mobile equivalents.
- `CartComponent`, `CheckoutComponent`, `OrderConfirmationPageComponent`, `PaymentMethodsPageComponent`, `OrderTrackingPageComponent`.
- Admin route components under `admin/pages` that are referenced by `admin-routing.module.ts`.
- Admin guards and permission-related components/services.
- `GeneralDashboardComponent`, `SuperAdminDashboardComponent`, `UserDashboardComponent`, `CustomerDashboardComponent`, end-user `VendorDashboardComponent`.
- Realtime notification components/services.
- Product management/detail components in both admin and end-user contexts.
- Mobile tab shell and dedicated mobile pages until route parity is proven.

## Risk Assessment

Critical:

- Admin module/routing/guards/interceptors.
- Checkout/cart/orders/payments.
- Auth/session/token refresh/interceptors.
- Security module/interceptors.
- Realtime notification/live commerce/chat/socket services.
- Vendor dashboards/product/order management.

High:

- Mobile architecture.
- Dashboard consolidation.
- Product/wishlist/search/social feature consolidation.
- App routing migration.

Medium:

- Shared component consolidation.
- Material module decomposition.
- Auth module route conversion.
- Layout/loading state signal conversion.

Low:

- Pure placeholder components after reference checks.
- Toast notification service signal conversion.
- Thin mobile route-wrapper conversion.

## Safe Migration Roadmap

1. Inventory and freeze routes.
   - Generate route manifest from `AppRoutingModule`, `AdminRoutingModule`, mobile routing modules, and feature route arrays.
   - Add smoke tests for auth, admin dashboard, checkout, cart, wishlist, orders, mobile tabs, vendor dashboard.

2. Normalize bootstrap.
   - Keep `bootstrapApplication`.
   - Convert `AppRoutingModule` to `app.routes.ts` with `provideRouter`.
   - Reconcile `AppModule` providers with `app.config`.

3. Move providers explicitly.
   - Move admin route providers only inside admin route config after confirming singleton expectations.
   - Move security interceptors to `app.config` or feature provider config before touching `SecurityModule`.

4. Convert low-risk route wrappers.
   - Auth module to `auth.routes.ts`.
   - Mobile cart/wishlist/profile/home wrappers to route arrays while preserving URLs.

5. Convert admin declarations.
   - Convert remaining declared admin components/pipes one at a time.
   - Do not remove `AdminModule` until declarations are empty and providers/routes are moved.

6. Feature architecture migration.
   - Move end-user features to `features/*` behind path aliases or barrel exports.
   - Keep route compatibility with redirects.
   - Do not merge mobile dedicated pages until UX/API parity is proven.

7. Shared consolidation.
   - Merge duplicate image fallback directives first.
   - Then evaluate avatar/loading/notification/header components.

8. Signals migration.
   - Add signal facades to services first; keep existing observables.
   - Convert UI consumers gradually.
   - Keep RxJS for socket/upload/debounce/HTTP/event streams.

9. Dashboard consolidation.
   - Separate routed dashboards, role dashboards, placeholder dashboards, and testing utilities.
   - Share widgets/services, not whole dashboards, until permission differences are encoded.

10. Delete only after proof.
   - Required proof: no route refs, no imports, no selectors in templates, no providers/interceptors/guards, no tests depending on file, and passing smoke tests.

