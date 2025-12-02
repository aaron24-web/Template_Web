import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  standalone: true,
})
export class ClientComponent {
}
