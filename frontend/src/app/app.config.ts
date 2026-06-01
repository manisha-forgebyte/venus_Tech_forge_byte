import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes, withPreloading, PreloadAllModules } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { securityInterceptor } from './core/interceptors/security.interceptor';
import { LoginComponent } from './features/auth/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminRedirectGuard } from './core/guards/admin-redirect.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  
  { path: 'company', loadComponent: () => import('./features/company/company-page.component').then(m => m.CompanyPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'account', loadComponent: () => import('./features/account/account-page.component').then(m => m.AccountPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'assets', loadComponent: () => import('./features/assets/assets-page.component').then(m => m.AssetsPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  
  { path: 'entities', redirectTo: 'entities/authorization', pathMatch: 'full' },
  { path: 'entities/authorization', loadComponent: () => import('./features/entities/pages/authorizations/authorizations.component').then(m => m.AuthorizationsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/category-status', loadComponent: () => import('./features/entities/pages/category-status/category-status.component').then(m => m.CategoryStatusComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/mitigations', loadComponent: () => import('./features/entities/pages/mitigations/mitigations.component').then(m => m.MitigationsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/self-limitations', loadComponent: () => import('./features/entities/pages/self-limitations/self-limitations.component').then(m => m.SelfLimitationsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/operating-reserves', loadComponent: () => import('./features/entities/pages/operating-reserves/operating-reserves.component').then(m => m.OperatingReservesComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/entities-to-entities', loadComponent: () => import('./features/entities/pages/entities-to-entities/entities-to-entities.component').then(m => m.EntitiesToEntitiesComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/entities-to-generator-assets', loadComponent: () => import('./features/entities/pages/entities-to-generator-assets/entities-to-generator-assets.component').then(m => m.EntitiesToGeneratorAssetsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/entities-to-ppas', loadComponent: () => import('./features/entities/pages/entities-to-ppas/entities-to-ppas.component').then(m => m.EntitiesToPpasComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/entities-to-vertical-assets', loadComponent: () => import('./features/entities/pages/entities-to-vertical-assets/entities-to-vertical-assets.component').then(m => m.EntitiesToVerticalAssetsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/indicative-pss', loadComponent: () => import('./features/entities/pages/indicative-pss/indicative-pss.component').then(m => m.IndicativePssComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'entities/indicative-mss', loadComponent: () => import('./features/entities/pages/indicative-mss/indicative-mss.component').then(m => m.IndicativeMssComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  
  { path: 'profile', loadComponent: () => import('./features/profile/profile-page.component').then(m => m.ProfilePageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'user', loadComponent: () => import('./features/users/user-list-page.component').then(m => m.UserListPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'filings', loadComponent: () => import('./features/filings/filings-page.component').then(m => m.FilingsPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },

  
  { path: 'admin/company', loadComponent: () => import('./features/company/admin-company.component').then(m => m.AdminCompanyComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/account', loadComponent: () => import('./features/account/admin-account.component').then(m => m.AdminAccountComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/assets', loadComponent: () => import('./features/assets/assets-page.component').then(m => m.AssetsPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities', redirectTo: 'admin/entities/authorization', pathMatch: 'full' },
  { path: 'admin/entities/authorization', loadComponent: () => import('./features/entities/pages/authorizations/authorizations.component').then(m => m.AuthorizationsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/category-status', loadComponent: () => import('./features/entities/pages/category-status/category-status.component').then(m => m.CategoryStatusComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/mitigations', loadComponent: () => import('./features/entities/pages/mitigations/mitigations.component').then(m => m.MitigationsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/self-limitations', loadComponent: () => import('./features/entities/pages/self-limitations/self-limitations.component').then(m => m.SelfLimitationsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/operating-reserves', loadComponent: () => import('./features/entities/pages/operating-reserves/operating-reserves.component').then(m => m.OperatingReservesComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/entities-to-entities', loadComponent: () => import('./features/entities/pages/entities-to-entities/entities-to-entities.component').then(m => m.EntitiesToEntitiesComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/entities-to-generator-assets', loadComponent: () => import('./features/entities/pages/entities-to-generator-assets/entities-to-generator-assets.component').then(m => m.EntitiesToGeneratorAssetsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/entities-to-ppas', loadComponent: () => import('./features/entities/pages/entities-to-ppas/entities-to-ppas.component').then(m => m.EntitiesToPpasComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/entities-to-vertical-assets', loadComponent: () => import('./features/entities/pages/entities-to-vertical-assets/entities-to-vertical-assets.component').then(m => m.EntitiesToVerticalAssetsComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/indicative-pss', loadComponent: () => import('./features/entities/pages/indicative-pss/indicative-pss.component').then(m => m.IndicativePssComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/entities/indicative-mss', loadComponent: () => import('./features/entities/pages/indicative-mss/indicative-mss.component').then(m => m.IndicativeMssComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/profile', loadComponent: () => import('./features/profile/profile-page.component').then(m => m.ProfilePageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/user', loadComponent: () => import('./features/users/user-list-page.component').then(m => m.UserListPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
  { path: 'admin/filings', loadComponent: () => import('./features/filings/filings-page.component').then(m => m.FilingsPageComponent), canActivate: [AuthGuard, AdminRedirectGuard] },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([securityInterceptor])
    )
  ]
};
