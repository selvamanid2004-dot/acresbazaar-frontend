import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterForm } from '../../../core/models/buyer.model';

@Component({
  selector: 'app-buyer-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buyer-register.component.html',
  styleUrl: './buyer-register.component.css'
})
export class BuyerRegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formData: RegisterForm = {
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER'
  };

  isCommonPeople = false;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '';

  constructor() {
    this.route.data.subscribe(data => {
      if (data && data['role'] === 'COMMON_PEOPLE') {
        this.isCommonPeople = true;
        this.formData.role = 'COMMON_PEOPLE';
      }
    });

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      if (params['role'] === 'COMMON_PEOPLE' || params['role'] === 'common') {
        this.isCommonPeople = true;
        this.formData.role = 'COMMON_PEOPLE';
      }
    });
  }

  goBack() {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formData.fullName || !this.formData.mobile || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.isSubmitting = true;
    try {
      const res = await this.authService.register(this.formData);
      if (res.success) {
        this.successMessage = this.isCommonPeople 
          ? 'Common People account created successfully! Redirecting...' 
          : 'Buyer account created successfully! Redirecting...';
        setTimeout(() => {
          const target = this.returnUrl || '/';
          this.router.navigateByUrl(target);
        }, 800);
      } else {
        this.errorMessage = res.message;
      }
    } catch {
      this.errorMessage = 'An error occurred during registration. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
