import { Component, signal, inject, computed } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingService } from '../../core/services/loading.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';
import { filter } from 'rxjs/operators';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly authService = inject(AuthService);

  // States using signals
  readonly sidebarOpened = signal(true);
  readonly sidebarCollapsed = signal(false);
  readonly currentUrl = signal(this.router.url);
  readonly isLoading = this.loadingService.loading;
  readonly currentUser = this.authService.currentUser;

  readonly navItems = computed<NavItem[]>(() => {
    const user = this.currentUser();
    if (!user) return [];

    const items: NavItem[] = [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['Admin', 'HR', 'Manager'] },
      { path: '/employees', label: 'Employees', icon: 'people', roles: ['Admin', 'HR', 'Manager'] },
      { path: '/departments', label: 'Departments', icon: 'domain', roles: ['Admin', 'HR'] },
      { path: '/attendance', label: 'Attendance', icon: 'schedule', roles: ['Admin', 'HR', 'Manager'] },
      { path: '/reports', label: 'Reports', icon: 'assessment', roles: ['Admin', 'Manager'] },
      { path: '/settings', label: 'Settings', icon: 'settings', roles: ['Admin'] },
    ];

    return items.filter((item) => item.roles.includes(user.role));
  });

  constructor() {
    // Listen to router events to update breadcrumb title
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  readonly activeRouteTitle = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/employees/new')) return 'New Employee';
    if (url.includes('/employees/')) return 'Employee Profile';
    if (url.includes('/employees')) return 'Employees';
    if (url.includes('/departments')) return 'Departments';
    if (url.includes('/attendance')) return 'Attendance';
    if (url.includes('/settings')) return 'Settings';
    if (url.includes('/reports')) return 'Reports & Analytics';
    return 'Not Found';
  });

  toggleSidebar(): void {
    this.sidebarOpened.update((opened) => !opened);
  }

  toggleCollapse(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
