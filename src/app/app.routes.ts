import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/employees/employee-list/employee-list.component').then(
                (m) => m.EmployeeListComponent
              ),
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { expectedRoles: ['Admin', 'HR'] },
            loadComponent: () =>
              import('./features/employees/employee-form/employee-form.component').then(
                (m) => m.EmployeeFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/employees/employee-detail/employee-detail.component').then(
                (m) => m.EmployeeDetailComponent
              ),
          },
          {
            path: ':id/edit',
            canActivate: [roleGuard],
            data: { expectedRoles: ['Admin', 'HR'] },
            loadComponent: () =>
              import('./features/employees/employee-form/employee-form.component').then(
                (m) => m.EmployeeFormComponent
              ),
          },
        ],
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin', 'HR'] },
        loadComponent: () =>
          import('./features/departments/departments.component').then((m) => m.DepartmentsComponent),
      },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin', 'Manager'] },
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] },
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
