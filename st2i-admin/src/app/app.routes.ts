import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { animation: 'dashboard' }
      },
      {
        path: 'utilisateurs',
        canActivate: [roleGuard],
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
        data: { animation: 'users' }
      },
      {
        path: 'presences',
        loadChildren: () => import('./features/presences/presences.routes').then(m => m.PRESENCES_ROUTES),
        data: { animation: 'presences' }
      },
      {
        path: 'horaires',
        loadChildren: () => import('./features/horaires/horaires.routes').then(m => m.HORAIRES_ROUTES),
        data: { animation: 'horaires' }
      },
      {
        path: 'statistiques',
        loadChildren: () => import('./features/stats/stats.routes').then(m => m.STATS_ROUTES),
        data: { animation: 'stats' }
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
        data: { animation: 'reports' }
      },
      {
        path: 'parametres',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        data: { animation: 'settings' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth' }
];
