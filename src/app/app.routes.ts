import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () =>
      import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./tabs/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'clasificar',
        loadComponent: () =>
          import('./tabs/clasificar/clasificar.page').then(
            (m) => m.ClasificarPage,
          ),
      },
      {
        path: 'especies',
        loadComponent: () =>
          import('./tabs/especies/especies.page').then((m) => m.EspeciesPage),
      },
      {
        path: 'mapa',
        loadComponent: () =>
          import('./tabs/mapa/mapa.page').then((m) => m.MapaPage),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./tabs/reportes/reportes.page').then((m) => m.ReportesPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'tabs/inicio',
  },
];
