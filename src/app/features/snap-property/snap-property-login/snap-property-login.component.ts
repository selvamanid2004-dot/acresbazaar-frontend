import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonLoginComponent } from '../../auth/common-login/common-login.component';

@Component({
  selector: 'app-snap-property-login',
  standalone: true,
  imports: [CommonModule, CommonLoginComponent],
  template: `<app-common-login [role]="'SPOTTER'"></app-common-login>`
})
export class SnapPropertyLoginComponent {}
