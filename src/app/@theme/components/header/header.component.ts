import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbActionsModule,
  NbContextMenuModule,
  NbIconModule,
  NbMenuModule,
  NbSelectModule,
  NbUserModule,
  NbThemeService,
  NbMenuService,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'ngx-header',
  standalone: true,
  imports: [
    CommonModule,
    NbActionsModule,
    NbContextMenuModule,
    NbIconModule,
    NbMenuModule,
    NbSelectModule,
    NbUserModule,
    NbEvaIconsModule,
  ],
  template: `
    <div class="header-container">
      <div class="logo-container">
        <a class="logo" href="#" (click)="toggleSidebar(); $event.preventDefault()">
          <nb-icon icon="menu-outline"></nb-icon>
        </a>
        <a class="logo" href="#" (click)="navigateHome($event)">
          <span class="brand-name">ngx-admin</span>
        </a>
      </div>
    </div>

    <div class="header-container">
      <nb-actions size="small">
        <nb-action class="control-item">
          <nb-select [selected]="currentTheme" (selectedChange)="changeTheme($event)" status="primary">
            <nb-option *ngFor="let theme of themes" [value]="theme.value">{{ theme.name }}</nb-option>
          </nb-select>
        </nb-action>
        <nb-action class="control-item" icon="email-outline"></nb-action>
        <nb-action class="control-item" icon="bell-outline"></nb-action>
        <nb-action class="user-action">
          <nb-user
            [nbContextMenu]="userMenu"
            [name]="user.name"
            [picture]="user.picture"
            nbContextMenuTag="user-context-menu">
          </nb-user>
        </nb-action>
      </nb-actions>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    .header-container {
      display: flex;
      align-items: center;
      width: auto;

      .logo-container {
        display: flex;
        align-items: center;
        width: auto;
      }

      .logo {
        font-size: 1.75rem;
        white-space: nowrap;
        text-decoration: none;
        display: flex;
        align-items: center;
        padding: 0 1rem;

        nb-icon {
          font-size: 2rem;
          cursor: pointer;
        }

        .brand-name {
          font-weight: 600;
          font-size: 1.5rem;
        }
      }
    }

    nb-select {
      margin-right: 1rem;
    }
  `]
})
export class HeaderComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  userMenu = [
    { title: 'Profile' },
    { title: 'Log out' },
  ];

  user = {
    name: 'Usuario Admin',
    picture: 'https://i.pravatar.cc/300',
  };

  themes = [
    { value: 'default', name: 'Light' },
    { value: 'dark', name: 'Dark' },
    { value: 'cosmic', name: 'Cosmic' },
    { value: 'corporate', name: 'Corporate' },
  ];

  currentTheme = 'default';

  constructor(
    private themeService: NbThemeService,
    private menuService: NbMenuService,
    private router: Router,
  ) {
    this.currentTheme = this.themeService.currentTheme;
  }

  ngOnInit() {
    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-context-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(async title => {
        if (title === 'Log out') {
          await this.supabaseService.client.auth.signOut();
          this.router.navigate(['/auth/login']);
        }
      });
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    // Toggle sidebar logic
    return false;
  }

  navigateHome(event: Event) {
    event.preventDefault();
    // Navigate to home
  }
}
