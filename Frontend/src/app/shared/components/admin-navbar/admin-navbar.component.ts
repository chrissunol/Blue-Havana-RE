import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import {
  LucideAngularModule,
  LogOut,
  Menu,
  FileText,
  X
} from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
  isMenuOpen = false;

  readonly Menu = Menu;
  readonly LogOut = LogOut;
  readonly BlogIcon = FileText;
  readonly XIcon = X;


  constructor(
    private readonly authService: AuthService
  ) {}

  get isSuperadmin(): boolean {
    return this.authService.getUserRole() === 'superadmin';
  }

  get homeLink(): string {
    return this.isSuperadmin
      ? '/superadmin/dashboard'
      : '/admin/propiedades';
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}