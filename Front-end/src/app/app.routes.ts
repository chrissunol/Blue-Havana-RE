import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./auth/pages/login/login.component').then(m => m.LoginComponent),
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { role: ['admin', 'superadmin'] },
    children: [
      { path: '', redirectTo: 'propiedades', pathMatch: 'full' },
      {
        path: 'propiedades',
        loadComponent: () =>
          import('./admin/pages/properties/properties.component').then(m => m.PropertiesComponent),
      },
      {
        path: 'propiedades/crear',
        loadComponent: () =>
          import('./admin/pages/property-forms/property-forms.component').then(m => m.PropertyFormsComponent),
      },
      {
        path: 'propiedades/:id/editar',
        loadComponent: () =>
          import('./admin/pages/property-forms/property-forms.component').then(m => m.PropertyFormsComponent),
      },
      {
        path: 'informacion',
        loadComponent: () =>
          import('./admin/pages/information/information.component').then(m => m.InformationComponent),
      },
    ],
  },

  {
    path: 'superadmin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'superadmin' },
    children: [
      { path: '', redirectTo: 'admins', pathMatch: 'full' },
      {
        path: 'admins',
        loadComponent: () =>
          import('./superadmin/pages/admins/admins.component').then(m => m.AdminsComponent),
      },
      {
        path: 'propiedades',
        loadComponent: () =>
          import('./admin/pages/properties/properties.component').then(m => m.PropertiesComponent),
      },
      {
        path: 'informacion',
        loadComponent: () =>
          import('./admin/pages/information/information.component').then(m => m.InformationComponent),
      },
    ],
  },

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'quienes-somos',
        loadComponent: () =>
          import('./public/pages/about/about.component').then(m => m.AboutComponent),
      },
      {
        path: 'propiedades',
        loadComponent: () =>
          import('./public/pages/properties/properties.component').then(m => m.PropertiesComponent),
      },
      {
        path: 'propiedades/:id',
        loadComponent: () =>
          import('./public/pages/property-detail/property-detail.component').then(m => m.PropertyDetailComponent),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./public/pages/contact/contact.component').then(m => m.ContactComponent),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./public/pages/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];