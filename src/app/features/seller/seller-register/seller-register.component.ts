import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonRegisterComponent } from '../../auth/common-register/common-register.component';

@Component({
  selector: 'app-seller-register',
  standalone: true,
  imports: [CommonModule, CommonRegisterComponent],
  template: `<app-common-register [role]="'SELLER'"></app-common-register>`
})
export class SellerRegisterComponent {}
