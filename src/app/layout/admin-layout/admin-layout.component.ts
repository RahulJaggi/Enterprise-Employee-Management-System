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
import { filter } from 'rxjs/operators';

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

  // States using signals
  readonly sidebarOpened = signal(true);
  readonly sidebarCollapsed = signal(false);
  readonly currentUrl = signal(this.router.url);
  readonly isLoading = this.loadingService.loading;

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
    // Basic mock logout
    alert('Mock Logout Action Triggered.');
  }
}
