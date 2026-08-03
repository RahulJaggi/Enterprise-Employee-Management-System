import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
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
            loadComponent: () =>
              import('./features/employees/employee-form/employee-form.component').then(
                (m) => m.EmployeeFormComponent
              ),
          },
        ],
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./features/departments/departments.component').then((m) => m.DepartmentsComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
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
