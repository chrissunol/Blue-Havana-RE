import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Admin } from '../../../core/models/admin.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminNavbarComponent } from '../../../shared/components/admin-navbar/admin-navbar.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

type modalMode = 'create' | 'edit' | 'delete' | null;

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent ],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.css'
})
export class AdminsComponent {
  modalMode: modalMode = null;
  selectedAdmin: Admin | null = null;
  showPassword = false;


  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];

  adminDeleteModalOpen = false;

adminPendingDelete: Admin | null = null;

  form = this.fb.group({
    id: ['', Validators.required],
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  searchForm = this.fb.group({
    fullName: [''],
    username: [''],
    id: ['']
  });


  get isFormModal(): boolean {
    return this.modalMode === 'create' || this.modalMode === 'edit';
  }
get pendingAdminName(): string {
  const admin = this.adminPendingDelete;

  if (!admin) {
    return '';
  }

  const name = admin.id.trim();
  const email = admin.email?.trim();

  if (name && email) {
    return `${name} — ${email}`;
  }

  return name || email || 'Administrador';
}
  constructor(private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.loadAdmins();
  }

  openCreateModal() {
    this.modalMode = 'create';
    this.selectedAdmin = null;
    this.form.controls.id.enable();
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.form.reset({
      id: '',
      fullName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
    });
  }

  openEditModal(admin: Admin) {
    this.modalMode = 'edit';
    this.selectedAdmin = admin;
    this.form.controls.id.disable();
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.form.patchValue({ ...admin, password: '' });
  }

  openDeleteModal(admin: Admin) {
  this.modalMode = 'delete';
  this.selectedAdmin = admin;
}


  closeModal() {
    this.modalMode = null;
    this.selectedAdmin = null;
    this.showPassword = false;
  }

  saveAdmin() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Revisa los campos. La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    const rawValue = this.form.getRawValue();

    const value: Admin = {
      id: (rawValue.id || '').trim(),
      fullName: (rawValue.fullName || '').trim(),
      phone: (rawValue.phone || '').trim(),
      email: (rawValue.email || '').trim().toLowerCase(),
      username: (rawValue.username || '').trim(),
      password: rawValue.password || '',
    };

    const request = this.modalMode === 'edit' && this.selectedAdmin
      ? this.adminService.update({ ...value, id: this.selectedAdmin.id })
      : this.adminService.create(value);

    request.subscribe({
      next: () => {
        this.loadAdmins();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error guardando administrador', error);
        const detail = error?.error?.detail || 'No se pudo guardar el administrador. Revisa la consola y la API.';
        alert(detail);
      },
    });
  }

  isSuperadmin(admin: Admin): boolean {
    return admin.username === 'superadmin';
  }

  confirmDelete() {
  if (!this.selectedAdmin) return;

  if (this.selectedAdmin.id.trim().toLowerCase() === 'superadmin') {
    alert('El superadmin no se puede eliminar.');
    this.closeModal();
    return;
  }

  this.adminService.delete(this.selectedAdmin.id).subscribe({
    next: () => {
      this.loadAdmins();
      this.closeModal();
    },
    error: (error) => {
      console.error('Error eliminando administrador', error);
      alert(error?.error?.detail || 'No se pudo eliminar el administrador.');
    }
  });
}


  searchAdmins() {
  const filters = this.searchForm.getRawValue();

  this.filteredAdmins = this.admins.filter(admin => {
    const matchName =
      !filters.fullName ||
      admin.fullName.toLowerCase().includes(filters.fullName.toLowerCase());

    const matchUsername =
      !filters.username ||
      admin.username.toLowerCase().includes(filters.username.toLowerCase());

    const matchId =
      !filters.id ||
      admin.id.toLowerCase().includes(filters.id.toLowerCase());

    return matchName && matchUsername && matchId;
  });
}

resetSearch() {
  this.searchForm.reset({
    fullName: '',
    username: '',
    id: '',
  });

  this.filteredAdmins = this.admins;
  }

  loadAdmins() {
    this.adminService.getAll().subscribe(admins => {
      this.admins = admins;
      this.filteredAdmins = admins;
    });
  }
  requestDeleteAdmin(admin: Admin): void {
  this.adminPendingDelete = admin;
  this.adminDeleteModalOpen = true;
}

cancelDeleteAdmin(): void {
  this.adminDeleteModalOpen = false;
  this.adminPendingDelete = null;
}

confirmDeleteAdmin(): void {
  const admin = this.adminPendingDelete;

  if (!admin) {
    return;
  }

  this.adminDeleteModalOpen = false;
  this.adminPendingDelete = null;

  this.confirmDelete();
}
}

