import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, {
        username: username.trim(),
        password,
      })
      .pipe(
        tap((response) => {
          this.saveSession(response);
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('bhre_admins');
    }

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }

    const storedUser = localStorage.getItem('current_user');

    if (!storedUser) {
      return null;
    }

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
      this.clearSession();
      return null;
    }
  }

  getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return Boolean(this.getToken() && this.getCurrentUser());
  }

  hasRole(expectedRole: UserRole | UserRole[]): boolean {
    const currentRole = this.getUserRole();

    if (!currentRole) {
      return false;
    }

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
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem('bhre_admins');
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }

  private clearSession(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('bhre_admins');
  }
}