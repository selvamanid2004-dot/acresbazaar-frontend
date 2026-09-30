import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonRegisterComponent } from '../../auth/common-register/common-register.component';

@Component({
  selector: 'app-dealer-register',
  standalone: true,
  imports: [CommonModule, CommonRegisterComponent],
  template: `<app-common-register [role]="'DEALER'"></app-common-register>`
})
export class DealerRegisterComponent {}
