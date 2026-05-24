import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'] as UserRole | UserRole[] | undefined;

  if (expectedRole && !authService.hasRole(expectedRole)) {
    router.navigate([authService.getUserRole() === 'superadmin' ? '/superadmin' : '/admin']);
    return false;
  }

  return true;
};
