import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const currentUser = authService.currentUser();
  const expectedRoles: UserRole[] = route.data['expectedRoles'] || [];

  if (currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }

  notification.warn('Access denied. You do not have permissions for this page.');
  router.navigate(['/dashboard']);
  return false;
};
