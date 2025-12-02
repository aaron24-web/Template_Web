import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'home-outline',
    link: '/pages/dashboard',
    home: true,
  },
  {
    title: 'GESTIÓN ACADÉMICA',
    group: true,
  },
  {
    title: 'Solicitudes',
    icon: 'inbox-outline',
    link: '/pages/academic/requests',
  },
  {
    title: 'Inscripciones',
    icon: 'edit-2-outline',
    link: '/pages/academic/enrollments', // <-- Añadido
    pathMatch: 'prefix', // <-- Añadido
    children: [
      {
        title: 'Nueva Inscripción',
        link: '/pages/academic/enrollments/new',
      },
      {
        title: 'Ver Todas',
        link: '/pages/academic/enrollments/list',
      },
    ],
  },
  {
    title: 'Asesores',
    icon: 'people-outline',
    link: '/pages/academic/advisors',
  },
  {
    title: 'CLIENTE',
    group: true,
  },
  {
    title: 'Home',
    icon: 'person-outline',
    link: '/pages/client/home',
  },
  {
    title: 'Explorar Asesores',
    icon: 'search-outline',
    link: '/pages/client/browse',
  },
];
