import { Routes } from '@angular/router';

import {
  PublicLayoutComponent
} from './layouts/public-layout/public-layout.component';

import {
  AdminLayoutComponent
} from './layouts/admin-layout/admin-layout.component';

import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import(
        './auth/pages/login/login.component'
      ).then(module => module.LoginComponent)
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: {
      role: ['admin', 'superadmin']
    },
    children: [
      {
        path: '',
        redirectTo: 'propiedades',
        pathMatch: 'full'
      },
      {
        path: 'propiedades',
        loadComponent: () =>
          import(
            './admin/pages/properties/properties.component'
          ).then(module => module.PropertiesComponent)
      },
      {
        path: 'propiedades/crear',
        loadComponent: () =>
          import(
            './admin/pages/property-forms/property-forms.component'
          ).then(module => module.PropertyFormsComponent)
      },
      {
        path: 'propiedades/:id/editar',
        loadComponent: () =>
          import(
            './admin/pages/property-forms/property-forms.component'
          ).then(module => module.PropertyFormsComponent)
      },
      {
        path: 'informacion',
        loadComponent: () =>
          import(
            './admin/pages/information/information.component'
          ).then(module => module.InformationComponent)
      },
      {
  path: 'blog',
  loadComponent: () =>
    import(
      './admin/pages/blog-management/blog-management.component'
    ).then(
      component =>
        component.BlogManagementComponent
    )
},
{
  path: 'blog/crear',
  loadComponent: () =>
    import(
      './admin/pages/blog-form/blog-form.component'
    ).then(
      component =>
        component.BlogFormComponent
    )
},
{
  path: 'blog/:id/editar',
  loadComponent: () =>
    import(
      './admin/pages/blog-form/blog-form.component'
    ).then(
      component =>
        component.BlogFormComponent
    )
}
    ]
  },

  {
    path: 'superadmin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: {
      role: 'superadmin'
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './admin/pages/dashboard/dashboard.component'
          ).then(
            module => module.AdminDashboardComponent
          )
      },
      {
        path: 'admins',
        loadComponent: () =>
          import(
            './superadmin/pages/admins/admins.component'
          ).then(module => module.AdminsComponent)
      },
      {
        path: 'propiedades',
        loadComponent: () =>
          import(
            './admin/pages/properties/properties.component'
          ).then(module => module.PropertiesComponent)
      },
      {
        path: 'informacion',
        loadComponent: () =>
          import(
            './admin/pages/information/information.component'
          ).then(module => module.InformationComponent)
      }
    ]
  },

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import(
            './public/pages/home/home.component'
          ).then(module => module.HomeComponent)
      },
      {
        path: 'quienes-somos',
        loadComponent: () =>
          import(
            './public/pages/about/about.component'
          ).then(module => module.AboutComponent)
      },
      {
        path: 'propiedades',
        loadComponent: () =>
          import(
            './public/pages/properties/properties.component'
          ).then(module => module.PropertiesComponent)
      },
      {
        path: 'propiedades/:id',
        loadComponent: () =>
          import(
            './public/pages/property-detail/property-detail.component'
          ).then(module => module.PropertyDetailComponent)
      },
      {
        path: 'diseno-renovacion',
        loadComponent: () =>
          import(
            './public/pages/design-renovation/design-renovation.component'
          ).then(
            module => module.DesignRenovationComponent
          )
      },
      {
        path: 'blog',
        loadComponent: () =>
          import(
            './public/pages/blog/blog.component'
          ).then(module => module.BlogComponent)
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import(
            './public/pages/blog-detail/blog-detail.component'
          ).then(module => module.BlogDetailComponent)
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];