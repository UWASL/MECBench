import { Component } from '@angular/core';

@Component({
  selector: 'app-branding',
  template: `
    <a class="matero-branding" routerLink="/">
      <span class="matero-branding-name">MECBench</span>
    </a>
  `,
})
export class BrandingComponent {}
