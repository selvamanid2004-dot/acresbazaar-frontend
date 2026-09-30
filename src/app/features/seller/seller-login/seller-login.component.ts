import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonLoginComponent } from '../../auth/common-login/common-login.component';

@Component({
  selector: 'app-seller-login',
  standalone: true,
  imports: [CommonModule, CommonLoginComponent],
  template: `<app-common-login [role]="'SELLER'"></app-common-login>`
})
export class SellerLoginComponent {}
