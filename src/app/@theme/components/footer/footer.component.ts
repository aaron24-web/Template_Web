import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="created-by">
      Created with ♥ by <b><a href="https://akveo.page.link/8V2f" target="_blank">Akveo</a></b> 2019
    </span>
    <div class="socials">
      <a href="https://github.com/akveo/ngx-admin" target="_blank" class="ion ion-social-github"></a>
      <a href="https://www.facebook.com/akveo/" target="_blank" class="ion ion-social-facebook"></a>
      <a href="https://twitter.com/akveo_inc" target="_blank" class="ion ion-social-twitter"></a>
      <a href="https://www.linkedin.com/company/akveo/" target="_blank" class="ion ion-social-linkedin"></a>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: space-between;
      padding: 1.5rem;
    }

    .created-by {
      font-size: 0.875rem;
    }

    .socials a {
      margin: 0 0.5rem;
      font-size: 1.25rem;
      color: var(--text-hint-color);
      text-decoration: none;

      &:hover {
        color: var(--text-basic-color);
      }
    }
  `]
})
export class FooterComponent {
}
