import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Admin } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private toBackendCreate(user: Admin) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      username: user.username,
      phone: user.phone,
      password: user.password,
      role: 'admin',
      is_active: true,
    };
  }

  private toBackendUpdate(user: Admin) {
    const payload: Record<string, unknown> = {
      email: user.email,
      full_name: user.fullName,
      username: user.username,
      phone: user.phone,
    };

    if (user.password) {
      payload['password'] = user.password;
    }

    return payload;
  }

  private fromBackendUser(user: any): Admin {
    return {
      id: user.id,
      fullName: user.full_name || '',
      phone: user.phone || '',
      email: user.email,
      username: user.username || user.email || '',
      password: '',
    };
  }

  private toBackendDelete(user: Admin) {
    return {
      is_active: false,
    };
  }

  getUsers(): Observable<Admin[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.map(user => this.fromBackendUser(user)))
    );
  }

  createUser(user: Admin): Observable<Admin> {
    return this.http.post<any>(`${this.apiUrl}/users`, this.toBackendCreate(user)).pipe(
      map(created => this.fromBackendUser(created))
    );
  }

  updateUser(id: string, user: Admin): Observable<Admin> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}`, this.toBackendUpdate(user)).pipe(
      map(updated => this.fromBackendUser(updated))
    );
  }

  deactivateUser(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  getAll(): Observable<Admin[]> {
    return this.getUsers();
  }

  create(user: Admin): Observable<Admin> {
    return this.createUser(user);
  }

  update(user: Admin): Observable<Admin> {
    return this.updateUser(user.id, user);
  }

  delete(id: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
}
}