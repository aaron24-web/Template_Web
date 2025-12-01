import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NbMenuModule, NbMenuItem } from '@nebular/theme';
import { OneColumnLayoutComponent } from '../@theme/layouts/one-column.layout';
import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [
    RouterOutlet,
    NbMenuModule,
    OneColumnLayoutComponent,
  ],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  menu: NbMenuItem[] = MENU_ITEMS;
}
