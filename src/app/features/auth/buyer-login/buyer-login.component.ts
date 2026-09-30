import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonLoginComponent } from '../common-login/common-login.component';

@Component({
  selector: 'app-buyer-login',
  standalone: true,
  imports: [CommonModule, CommonLoginComponent],
  template: `<app-common-login [role]="'BUYER'"></app-common-login>`
})
export class BuyerLoginComponent {}
