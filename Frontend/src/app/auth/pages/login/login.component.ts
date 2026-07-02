import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  errorMessage = '';

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  login() {
    if (this.form.invalid) {
      this.errorMessage = 'Escribe tu nombre de usuario y contraseña';
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.authService.login((username || '').trim(), password || '').subscribe({
      next: () => this.authService.redirectByRole(),
      error: () => {
        this.errorMessage = 'Usuario o contraseña incorrectos';
      },
    });
  }
}
