import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonRegisterComponent } from '../../auth/common-register/common-register.component';

@Component({
  selector: 'app-snap-property-register',
  standalone: true,
  imports: [CommonModule, CommonRegisterComponent],
  template: `<app-common-register [role]="'SPOTTER'"></app-common-register>`
})
export class SnapPropertyRegisterComponent {}
