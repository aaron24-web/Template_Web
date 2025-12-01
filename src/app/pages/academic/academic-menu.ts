import { NbMenuItem } from '@nebular/theme';

export const ACADEMIC_MENU: NbMenuItem[] = [
  {
    title: 'Gestión Académica',
    icon: 'briefcase-outline',
    children: [
      {
        title: 'Solicitudes',
        icon: 'inbox-outline',
        link: '/pages/academic/requests',
      },
      {
        title: 'Programas en Planificación',
        icon: 'edit-2-outline',
        link: '/pages/academic/enrollments/new',
      },
    ],
  },
];
