import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Menu, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css',
})
export class AdminNavbarComponent {
  isMenuOpen = false;
  readonly Menu = Menu;
  readonly LogOut = LogOut;

  constructor(private authService: AuthService) {}

  get isSuperadmin(): boolean {
    return this.authService.getUserRole() === 'superadmin';
  }

  get homeLink(): string {
    return this.isSuperadmin ? '/superadmin/propiedades' : '/admin/propiedades';
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
