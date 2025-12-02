import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NbCardModule, NbLayoutModule, NbThemeModule } from '@nebular/theme';

@Component({
  selector: 'app-auth',
  template: `
    <nb-layout>
      <nb-layout-column>
        <nb-card>
          <nb-card-body>
            <router-outlet></router-outlet>
          </nb-card-body>
        </nb-card>
      </nb-layout-column>
    </nb-layout>
  `,
  standalone: true,
  imports: [RouterOutlet, NbLayoutModule, NbCardModule, NbThemeModule],
  styles: [`
    nb-layout-column {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    nb-card {
      width: 400px;
    }
  `],
})
export class AuthComponent {}
