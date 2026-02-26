import { Component } from '@angular/core';
import { DirectorPageComponent } from './director/director-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DirectorPageComponent],
  template: `<app-director-page />`
})
export class AppComponent {}
