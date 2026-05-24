import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    phone?: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private superAdmin = {
    id: '000000',
    username: 'superadmin',
    password: '123456',
    email: 'superadmin@gmail.com',
    full_name: 'Super Administrador',
    role: 'superadmin' as UserRole,
    is_active: true,
  };

  login(username: string, password: string): Observable<LoginResponse> {
    const localLogin = this.loginLocal(username, password);

    if (localLogin) {
      return of(localLogin).pipe(
        tap((response) => {
          this.saveSession(response);
        })
      );
    }

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap((response) => {
          this.saveSession(response);
        })
      );
  }

  private loginLocal(username: string, password: string): LoginResponse | null {
    if (!this.isBrowser) return null;

    if (
      username === this.superAdmin.username &&
      password === this.superAdmin.password
    ) {
      return {
        access_token: 'local-superadmin-token',
        token_type: 'Bearer',
        user: this.superAdmin,
      };
    }

    const admins = JSON.parse(localStorage.getItem('bhre_admins') || '[]');

    const admin = admins.find(
      (item: any) => item.username === username && item.password === password
    );

    if (!admin) return null;

    return {
      access_token: `local-admin-token-${admin.id}`,
      token_type: 'Bearer',
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        phone: admin.phone,
        full_name: admin.fullName,
        role: 'admin',
        is_active: true,
      },
    };
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('access_token') : null;
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) return null;

    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) return null;

    try {
      const user = JSON.parse(storedUser);

      return {
        id: user.id,
        username: user.username || user.email,
        password: '',
        role: user.role,
        fullName: user.full_name,
      };
    } catch {
      this.logout();
      return null;
    }
  }

  getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(expectedRole: UserRole | UserRole[]): boolean {
    const currentRole = this.getUserRole();

    if (!currentRole) return false;

    const allowedRoles = Array.isArray(expectedRole)
      ? expectedRole
      : [expectedRole];

    return allowedRoles.includes(currentRole);
  }

  redirectByRole(): void {
    const role = this.getUserRole();

    if (role === 'superadmin') {
      this.router.navigate(['/superadmin']);
      return;
    }

    if (role === 'admin') {
      this.router.navigate(['/admin']);
      return;
    }

    this.router.navigate(['/login']);
  }

  private saveSession(response: LoginResponse): void {
    if (!this.isBrowser) return;

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }
}
