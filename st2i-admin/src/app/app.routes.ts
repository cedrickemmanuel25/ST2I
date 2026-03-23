import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  // Public landing page
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full'
  },
  // Auth routes (login)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // Protected admin sections
  {
    path: 'dashboard',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      }
    ]
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'utilisateurs',
        canActivate: [roleGuard],
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'presences',
        loadChildren: () => import('./features/presences/presences.routes').then(m => m.PRESENCES_ROUTES)
      },
      {
        path: 'horaires',
        loadChildren: () => import('./features/horaires/horaires.routes').then(m => m.HORAIRES_ROUTES)
      },
      {
        path: 'statistiques',
        loadChildren: () => import('./features/stats/stats.routes').then(m => m.STATS_ROUTES)
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      {
        path: 'parametres',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
