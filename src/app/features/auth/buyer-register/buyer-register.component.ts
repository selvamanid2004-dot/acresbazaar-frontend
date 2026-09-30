import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonRegisterComponent } from '../common-register/common-register.component';

@Component({
  selector: 'app-buyer-register',
  standalone: true,
  imports: [CommonModule, CommonRegisterComponent],
  template: `<app-common-register [role]="'BUYER'"></app-common-register>`
})
export class BuyerRegisterComponent {}
